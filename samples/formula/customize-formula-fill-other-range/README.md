## 一、Demo 概述

本示例展示了如何在 SpreadJS 中创建自定义公式函数，并在公式执行时动态填充其他单元格的值。通过自定义公式 `test()`，当用户点击按钮触发公式计算时，该公式不仅返回自身的计算结果，还会在当前单元格右侧填充一个 2x4 的数据数组。这种技术适用于需要通过公式触发批量数据填充的场景，例如从外部数据源获取数据后自动填充到表格中。

## 二、解决的问题

* **公式驱动的数据填充**：传统公式只能返回单个值到当前单元格，本示例实现了通过公式触发多单元格数据填充的能力
* **异步数据处理**：通过 `setTimeout` 模拟异步操作，展示如何在公式计算过程中处理异步数据获取和填充
* **上下文感知的公式**：利用公式的上下文信息（当前行列位置）动态确定数据填充的目标区域

## 三、实现思路

### 3.1 自定义公式函数的定义

通过继承 `GC.Spread.CalcEngine.Functions.Function` 创建自定义公式函数 `FactorialFunction`：

```javascript
function FactorialFunction() {
    this.name = 'test';
    this.maxArgs = 0;
    this.minArgs = 0;
    this.typeName = "FactorialFunction";
}

FactorialFunction.prototype = new GC.Spread.CalcEngine.Functions.Function();
```

关键配置：

* `name: 'test'`：公式在单元格中的调用名称
* `maxArgs` 和 `minArgs` 均为 0：该公式不接受任何参数
* 继承自 `Function` 基类以获得公式引擎的完整功能

### 3.2 上下文感知的公式实现

通过 `isContextSensitive()` 方法启用上下文感知，使公式能够获取当前单元格的位置信息：

```javascript
FactorialFunction.prototype.isContextSensitive = function() {
    return true;
}

FactorialFunction.prototype.evaluate = function() {
    var context = arguments[0];
    var curRow = context.row;
    var curCol = context.column;
    // 使用 curRow 和 curCol 确定数据填充位置
}
```

`context` 对象提供了当前公式所在单元格的行列索引，用于计算数据填充的目标区域。

### 3.3 异步数据填充机制

使用 `setTimeout` 实现异步数据填充，并通过暂停/恢复计算服务避免循环计算：

```javascript
FactorialFunction.prototype.evaluate = function() {
    var context = arguments[0];
    var curRow = context.row;
    var curCol = context.column;
    
    setTimeout(function() {
        var spread = GC.Spread.Sheets.findControl(document.getElementById('ss'));
        var sheet = spread.getActiveSheet();
        sheet.suspendCalcService(true); // 暂停计算服务
        
        var data = [
            ["value1", "value2", "value3", "value4"],
            ["value5", "value6", "value7", "value8"]
        ];
        
        context.source.getSheet().setArray(curRow, curCol + 1, data);
        sheet.resumeCalcService(false); // 恢复计算服务
    }, 0);
    
    return 1; // 公式本身返回值
}
```

关键技术点：

* `suspendCalcService(true)`：暂停计算服务，防止数据填充触发新的公式计算
* `setArray()`：批量设置单元格数据，从当前列的下一列（`curCol + 1`）开始填充
* `resumeCalcService(false)`：恢复计算服务，参数 `false` 表示不立即重新计算

### 3.4 公式注册与触发

在工作表中注册自定义公式，并通过按钮点击事件触发公式设置：

```javascript
$(document).ready(function() {
    var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
    var sheet = spread.getActiveSheet();
    var factorial = new FactorialFunction();
    sheet.addCustomFunction(factorial); // 注册自定义公式
    
    document.getElementById("btn").addEventListener("click", function() {
        sheet.setFormula(1, 0, "=test()"); // 在 A2 单元格设置公式
    })
});
```

### 3.5 技术栈

* SpreadJS 15.0.0：核心表格控件
* jQuery 3.6.1：DOM 操作和事件处理
* SystemJS 0.19.22：模块加载器
* TypeScript 4.1.2：开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 使用本地服务器打开 index.html（如 Live Server）
```

### 4.2 操作步骤

1. 打开页面后，SpreadJS 表格会自动初始化
2. 点击页面顶部的"向A2设置自定义公式"按钮
3. 观察 A2 单元格显示公式计算结果（值为 1）
4. 同时 B2:E3 区域会自动填充 2x4 的数据数组（value1 到 value8）

## 五、功能特点

### 5.1 优点

* **公式与数据填充解耦**：公式返回值与数据填充操作分离，灵活性高
* **位置自适应**：基于公式所在单元格位置动态计算填充区域，可复用性强
* **计算服务控制**：通过暂停/恢复计算服务机制，避免循环计算和性能问题
* **异步操作支持**：使用 `setTimeout` 模拟异步场景，可扩展为真实的异步数据获取

### 5.2 局限性与扩展建议

* **当前限制**：数据填充的范围和内容是硬编码的，实际应用中可能需要根据参数动态调整
* **扩展建议**：
    * 为公式添加参数支持，允许指定填充的数据源或范围
    * 集成真实的异步数据获取（如 AJAX 请求）
    * 添加错误处理机制，处理数据填充失败的情况
    * 考虑添加数据验证，确保填充的数据符合业务规则

## 六、关键代码片段

### 错误处理配置

```javascript
FactorialFunction.prototype.acceptsError = function() {
    return true;
}
```

该方法返回 `true` 表示公式可以接受错误值作为输入，增强了公式的容错性。

### 数据填充的两种方式对比

```javascript
// 方式1：直接设置单个值（正常）
context.source.getSheet().setValue(0, 1, 1);

// 方式2：批量设置数组（需要暂停计算服务）
context.source.getSheet().setArray(curRow, curCol + 1, data);
```

代码注释中标注了两种数据填充方式的差异，`setArray` 方法需要配合计算服务的暂停/恢复机制使用。

## 七、总结

本示例展示了 SpreadJS 自定义公式的高级用法，特别是如何在公式计算过程中动态填充其他单元格的数据。开发者可以从中学到：

1. 自定义公式函数的完整实现流程（定义、注册、使用）
2. 上下文感知公式的实现方法，获取当前单元格位置信息
3. 计算服务的暂停/恢复机制，避免循环计算问题
4. 异步操作在公式中的应用模式

该方案适用于需要通过公式触发批量数据操作的场景，例如数据导入、模板填充、动态报表生成等。通过扩展该示例，可以实现更复杂的数据处理和填充逻辑。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
