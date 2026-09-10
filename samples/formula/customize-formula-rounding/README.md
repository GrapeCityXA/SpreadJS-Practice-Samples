## 一、Demo 概述

本示例演示了如何在 SpreadJS 中创建自定义函数，实现"四舍六入五留双"的数值修约规则。该规则是一种科学的数值修约方法，广泛应用于统计学和数据处理领域，能够有效减少累积误差。

示例通过扩展 SpreadJS 的计算引擎，实现了一个名为 `FDA` 的自定义函数，用户可以在单元格公式中直接调用该函数对数值进行修约处理。

## 二、解决的问题

在数据处理和统计分析中，常规的"四舍五入"规则存在系统性偏差问题。当大量数据需要修约时，"五入"的情况会导致结果整体偏大。"四舍六入五留双"规则通过特殊处理"5"的情况，使修约后的数据更加均衡，减少累积误差，符合国家标准 GB/T 8170-2008 的要求。

## 三、实现思路

### 3.1 自定义函数类定义

通过继承 `GC.Spread.CalcEngine.Functions.Function` 基类创建自定义函数类，定义函数名称和参数范围：

```javascript
var FdaFunction = function () {
    this.name = "FDA";
    this.minArgs = 1;
    this.maxArgs = 2;
};
FdaFunction.prototype = new GC.Spread.CalcEngine.Functions.Function();
```

### 3.2 函数描述和参数定义

实现 `description` 方法，为函数提供说明和参数信息：

```javascript
FdaFunction.prototype.description = function () {
    return {
        description: "对value进行四舍六入五留双修约，保留小数点后指定位数",
        parameters: [{
            name: "value",
            repeatable: false,
            optional: false
        }, {
            name: "places",
            repeatable: false,
            optional: false
        }]
    }
}
```

### 3.3 核心修约逻辑实现

在 `evaluate` 方法中实现"四舍六入五留双"的核心算法：

```javascript
FdaFunction.prototype.evaluate = function (context, value, places) {
    // 参数验证
    if (!isNaN(parseInt(value)) && !isNaN(parseInt(places))) {
        // 处理负数
        var num = value < 0 ? -value : value;
        
        if (places < 0) return value;
        
        var v = Number(num);
        var s = v + "";
        var result = "";
        
        // 检查是否需要特殊处理"5"的情况
        if (s.indexOf(".") != -1) {
            var s_1 = s.substring(s.indexOf(".") + 1);
            if (s_1.length == parseInt(places) + 1) {
                if (s_1.endsWith("5")) {
                    // 五留双：检查前一位是否为偶数
                    var s_2 = s.substr(0, s.length - 1);
                    var n = Number(s_2);
                    var s_n = n.toFixed(places);
                    var x = s_n.substring(s_n.length - 1);
                    if (Number(x) % 2 == 0) {
                        result = s_n;
                    }
                }
            }
        }
        
        // 默认使用标准四舍五入
        if (result == "") {
            result = v.toFixed(places);
        }
        
        // 恢复负号
        if (value < 0) {
            result = "-" + result;
            if (result.startsWith("-0") && Number(result) == 0) {
                result = result.substring(1);
            }
        }
        
        return result;
    } else {
        return "#VALUE!";
    }
}
```

### 3.4 函数注册和使用

将自定义函数添加到工作表中，并在单元格公式中使用：

```javascript
var fda = new FdaFunction();
sheet.addCustomFunction(fda);

// 在单元格中使用公式
sheet.setFormula(2, 2, "=fda(B3,2)");
```

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行示例。

### 4.2 操作步骤

1. 打开示例页面，查看工作表中的初始数据
2. 在 B3 单元格中输入需要修约的数值（如 1.432）
3. C3 单元格会自动显示修约结果（使用公式 `=fda(B3,2)`）
4. 修改 B3 单元格的值，观察不同数值的修约效果
5. 可以在其他单元格中使用 `=fda(value, places)` 公式进行测试

## 五、功能特点

### 5.1 优点

* 符合国家标准的科学修约方法，减少累积误差
* 函数接口简洁，使用方式与内置函数一致
* 支持正负数处理和边界情况处理
* 可在任意单元格公式中重复使用

### 5.2 局限性与扩展建议

当前实现仅处理了末位为"5"且后续无其他数字的情况。根据完整的"四舍六入五留双"规则，如果"5"后面还有非零数字，应该直接进位。建议扩展代码以支持这种情况：

```javascript
// 扩展建议：检查5后面是否还有非零数字
if (s_1.endsWith("5")) {
    // 检查5后面是否还有数字
    var afterFive = s_1.substring(places + 1);
    if (afterFive && Number(afterFive) > 0) {
        // 5后面有非零数字，直接进位
        result = (n + Math.pow(10, -places)).toFixed(places);
    } else {
        // 5后面无数字或全为0，执行五留双规则
        // ... 现有逻辑
    }
}
```

## 六、总结

本示例展示了 SpreadJS 自定义函数的完整开发流程，开发者可以学习到：

1. 如何继承 `GC.Spread.CalcEngine.Functions.Function` 创建自定义函数
2. 如何定义函数的参数和描述信息
3. 如何实现复杂的数值处理逻辑
4. 如何将自定义函数注册到工作表中使用

该方案适用于需要在 SpreadJS 中实现特定业务规则的场景，通过自定义函数可以将复杂的计算逻辑封装为可重用的公式，提高开发效率和代码可维护性。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
