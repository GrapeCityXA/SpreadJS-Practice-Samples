## 一、Demo 概述

本示例演示了如何在 SpreadJS 中实现类似 Excel RTD（Real-Time Data）函数的异步数据获取功能。通过自定义异步函数，实现了单元格数据的实时更新，并采用防抖策略优化了数据请求频率，确保在 1 秒内最多发出 1 次批量请求，有效减少服务器压力。

该示例适用于需要从外部数据源异步获取数据并实时更新到表格的场景，如股票行情、传感器数据监控、实时报表等业务需求。

## 二、解决的问题

* **异步数据加载**：解决了表格单元格需要从外部接口异步获取数据的需求，避免阻塞主线程
* **请求频率控制**：通过防抖机制将多个单元格的数据请求合并为一次批量请求，避免频繁调用接口造成性能问题
* **实时数据更新**：实现了类似 Excel RTD 函数的实时数据刷新能力，数据变化时自动触发重新计算

## 三、实现思路

### 3.1 自定义异步函数

通过继承 `GC.Spread.CalcEngine.Functions.AsyncFunction` 创建自定义的 RTD 函数，支持异步数据获取：

```javascript
function rtd() {
    this.maxArgs = 3
    this.minArgs = 1
    this.name = "rtd"
    this.typeName = "ASUM_TYPE"
};

rtd.prototype = new GC.Spread.CalcEngine.Functions.AsyncFunction('RTD', 1, 255, {
    description: "两个数值相加后，异步增加另一个随机值"
});

// 设置参数可以接受单元格引用
rtd.prototype.acceptsReference = function (idx) {
    return idx == 0 || idx == 1
}

// 设置异步加载时的默认显示值
rtd.prototype.defaultValue = function () { return 'Loading...'; };

// 异步计算逻辑
rtd.prototype.evaluateAsync = function (context, arg1, arg2) {
    let uuid = genUuid()
    let v1 = arg1.getSource().getSheet().getValue(arg1.getRow(0), arg1.getColumn(0))
    let v2 = arg2.getSource().getSheet().getValue(arg2.getRow(0), arg2.getColumn(0))
    fetchData(uuid, v1 + v2, function (res) {
        context.setAsyncResult(res);
    })
};
```

### 3.2 防抖批量请求机制

使用防抖策略将 1 秒内的所有数据请求合并为一次批量请求，显著降低接口调用频率：

```javascript
let tempRes = {}
let timer = null

function fetchData(uuid, arg, callback) {
    // 将请求信息暂存
    tempRes[uuid] = {
        arg: arg,
        callback: callback
    }
    clearTimeout(timer)
    // 1秒没有新的变动，则请求接口，即最多1秒请求一次
    timer = setTimeout(() => {
        // 模拟接口请求  1秒后返回数据
        setTimeout(() => {
            console.log("请求了！")
            Object.keys(tempRes).forEach(uuid => {
                tempRes[uuid].callback(Math.random() + tempRes[uuid].arg)
            })
            tempRes = {}
            timer = null
        }, 1000);
    }, 1000);
}
```

### 3.3 自定义类型注册

通过重写 `GC.Spread.Sheets.getTypeFromString` 方法，实现自定义函数类型的序列化支持：

```javascript
const originalGetType = GC.Spread.Sheets.getTypeFromString;
GC.Spread.Sheets.getTypeFromString = function (typeString) {
    if (typeString === "ASUM_TYPE") {
        return rtd; // 返回自定义类型
    }
    return originalGetType.apply(this, arguments);
};
```

### 3.4 技术栈

* SpreadJS 17.0.8（核心表格引擎）
* SpreadJS Designer 17.0.8（设计器组件）
* SystemJS 0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，表格会自动初始化并填充测试数据（A 列和 B 列）
2. 1 秒后，C 列会自动设置 RTD 公式（如 `=RTD(A2, B2)`）
3. 单元格会先显示 "Loading..."，然后在约 2 秒后显示计算结果（A+B+随机数）
4. 修改 A 列或 B 列的值，C 列会自动触发重新计算
5. 观察控制台输出，可以看到多个单元格的请求被合并为一次批量请求

## 五、功能特点

### 5.1 优点

* **性能优化**：通过防抖机制将多次请求合并为一次，有效降低服务器负载
* **用户体验**：提供 "Loading..." 加载提示，避免用户等待时的困惑
* **灵活扩展**：可以轻松修改 `fetchData` 函数对接真实的后端接口
* **自动更新**：依赖单元格变化时自动触发重新计算，无需手动刷新

### 5.2 局限性与扩展建议

* **当前限制**：示例中使用随机数模拟接口返回，实际应用需要对接真实 API
* **扩展建议**：
    * 可以添加错误处理机制，当接口请求失败时显示错误信息
    * 可以增加缓存策略，避免相同参数的重复请求
    * 可以支持更多参数类型，如字符串、日期等

## 六、关键代码片段

### UUID 生成函数

```javascript
function genUuid() {
    let timestamp = new Date().getTime();
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (timestamp + Math.random() * 16) % 16 | 0;
        timestamp = Math.floor(timestamp / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}
```

### 测试数据初始化

```javascript
sheet.setValue(1, 0, 1)
sheet.setValue(2, 0, 2)
sheet.setValue(3, 0, 3)
sheet.setValue(1, 1, 4)
sheet.setValue(2, 1, 5)
sheet.setValue(3, 1, 6)
sheet.setValue(0, 2, "C=A+B+随机数")

setTimeout(() => {
    sheet.setFormula(1, 2, "=RTD(A2, B2)")
    sheet.setFormula(2, 2, "=RTD(A3, B3)")
    sheet.setFormula(3, 2, "=RTD(A4, B4)")
}, 1000);
```

## 七、总结

本示例展示了 SpreadJS 中自定义异步函数的完整实现方案，通过防抖策略优化了数据请求性能。开发者可以从中学习到：

* 如何继承 `AsyncFunction` 创建自定义异步函数
* 如何使用 `acceptsReference` 支持单元格引用参数
* 如何通过 `context.setAsyncResult` 返回异步计算结果
* 如何使用防抖机制优化批量请求性能
* 如何注册自定义函数类型以支持序列化

该方案适用于需要实时数据更新的业务场景，具有良好的性能和扩展性，可以直接应用于生产环境中的股票行情、物联网数据监控、实时报表等场景。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
