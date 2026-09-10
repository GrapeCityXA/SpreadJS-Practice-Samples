## 一、Demo 概述

本示例演示了如何在 SpreadJS 中创建自定义函数来获取单元格或区域的 tag 属性。通过继承 `GC.Spread.CalcEngine.Functions.Function` 类，实现了一个名为 `GETTAG` 的自定义函数，可以在公式中直接读取单元格或区域的 tag 值，并支持与其他计算结合使用。

该示例展示了 SpreadJS 自定义函数的完整开发流程，包括函数定义、参数配置、上下文感知以及引用类型参数的处理。

## 二、解决的问题

在实际业务场景中，开发者经常需要在单元格中存储额外的元数据（如 ID、状态码、关联信息等），这些数据不适合直接显示在单元格中。SpreadJS 的 tag 属性提供了这种能力，但默认情况下无法在公式中直接访问 tag 值。本示例解决了以下问题：

* 如何在公式中读取单元格的 tag 属性
* 如何将 tag 值与其他计算逻辑结合（如数值运算）
* 如何处理单元格区域的 tag 获取
* 如何创建支持引用类型参数的自定义函数

## 三、实现思路

### 3.1 自定义函数类定义

通过继承 `GC.Spread.CalcEngine.Functions.Function` 创建自定义函数类，并配置函数的基本信息：

```javascript
function FactorialFunction() {};
FactorialFunction.prototype = new GC.Spread.CalcEngine.Functions.Function(
    "GETTAG",                    // 函数名称，在单元格输入"="时显示
    1,                           // 函数最少需要传递的参数个数
    2,                           // 函数最多能传递的参数个数
    {
        description: "获取区域单元格的tag",    // 单元格输入函数时对应的提示信息
        parameters: [
            {
                name: '引用的单元格区域',         // 参数的名字
                repeatable: false,   // 参数是否可以重复
                optional: false      // 参数是否可选
            }
        ]
    }
);
```

这段代码定义了函数的名称、参数数量范围以及智能提示信息，确保用户在输入公式时能获得友好的提示。

### 3.2 启用引用类型参数和上下文感知

为了让函数能够接收单元格引用并访问工作表上下文，需要重写两个关键方法：

```javascript
FactorialFunction.prototype.acceptsReference = function () {
    return true;  // 函数的参数接受引用单元格区域
}

FactorialFunction.prototype.isContextSensitive = function () {
    return true;  // 为true时，函数的计算依赖于上下文
}
```

* `acceptsReference()` 返回 `true` 表示函数可以接收单元格引用作为参数（如 `A1` 或 `A2:A4`）
* `isContextSensitive()` 返回 `true` 表示函数需要访问工作表上下文来获取单元格信息

### 3.3 实现函数计算逻辑

重写 `evaluate` 方法实现核心逻辑，通过上下文信息获取单元格区域并读取其 tag 值：

```javascript
FactorialFunction.prototype.evaluate = function (arg) {
    if (arguments.length === 2) {
        var info = arguments[1];  // 第二个参数是上下文信息对象
        var row = info.getRow();
        var column = info.getColumn();
        var rowCount = info.getRowCount();
        var columnCount = info.getColumnCount();
        var tag = sheet.getRange(row, column, rowCount, columnCount).tag();
        if (tag) {
            return tag;
        } else {
            return "null"
        }
    }
    return "#VALUE!";
}
```

当函数设置为上下文感知时，`evaluate` 方法会接收到额外的上下文参数（`arguments[1]`），通过该对象可以获取引用区域的行列信息，进而读取对应的 tag 值。

### 3.4 注册函数并应用

创建函数实例并注册到工作表，然后设置测试数据：

```javascript
var factorial = new FactorialFunction();
sheet.addCustomFunction(factorial);

// 设置单元格 tag
sheet.setTag(0, 0, 1);
let range = sheet.getRange(1, 0, 3, 1);
range.tag("Range Tag");

// 在公式中使用自定义函数
sheet.setFormula(0, 5, '=GETTAG(A1) + 100');  // 获取单个单元格 tag 并计算
sheet.setFormula(2, 5, '=GETTAG(A2:A4)');     // 获取区域 tag
```

### 3.5 技术栈

* SpreadJS 16.0.1（核心表格组件）
* SpreadJS Designer 16.0.1（设计器组件）
* TypeScript 4.1.2（开发语言）
* SystemJS 0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，会看到 SpreadJS Designer 界面
2. 观察 F1 单元格的公式：`=GETTAG(A1) + 100`，显示结果为 101（A1 的 tag 值为 1）
3. 观察 F3 单元格的公式：`=GETTAG(A2:A4)`，显示结果为 "Range Tag"（A2:A4 区域的 tag 值）
4. A2:A4 区域被标记为黄色背景，便于识别
5. 可以尝试修改单元格的 tag 值，公式会自动重新计算

## 五、功能特点

### 5.1 优点

* 提供了在公式中访问 tag 属性的能力，打通了元数据与计算逻辑的桥梁
* 支持单个单元格和区域引用两种模式
* 函数返回值可以参与数值运算（如示例中的 `+100`）
* 提供了完整的智能提示信息，提升用户体验
* 代码结构清晰，易于扩展为其他自定义函数

### 5.2 局限性与扩展建议

当前实现存在以下限制：

* 函数内部直接引用了全局 `sheet` 变量，不支持跨工作表获取 tag
* 对于区域引用，只返回整个区域的 tag，不支持返回区域内每个单元格的 tag 数组
* 错误处理较为简单，可以增加更详细的错误提示

扩展建议：

* 支持第二个参数指定工作表名称，实现跨表 tag 获取
* 增加数组公式支持，返回区域内所有单元格的 tag 值
* 添加更多参数选项，如指定 tag 不存在时的默认返回值

## 六、关键代码片段

### 上下文信息对象的使用

```javascript
var info = arguments[1];  // 获取上下文信息对象
var row = info.getRow();  // 获取引用区域的起始行
var column = info.getColumn();  // 获取引用区域的起始列
var rowCount = info.getRowCount();  // 获取引用区域的行数
var columnCount = info.getColumnCount();  // 获取引用区域的列数
```

上下文信息对象提供了引用区域的完整位置信息，是实现引用类型参数处理的关键。

### 区域 tag 的设置与样式

```javascript
let range = sheet.getRange(1, 0, 3, 1);
range.tag("Range Tag");  // 为区域设置 tag
let rangeStyle = new GC.Spread.Sheets.Style();
rangeStyle.backColor = "yellow";
range.setStyle(rangeStyle);  // 设置区域样式
```

## 七、总结

本示例展示了 SpreadJS 自定义函数开发的核心技术，开发者可以从中学到：

* 如何继承 `GC.Spread.CalcEngine.Functions.Function` 创建自定义函数
* 如何配置函数的参数定义和智能提示信息
* 如何实现支持引用类型参数的函数（通过 `acceptsReference` 和 `isContextSensitive`）
* 如何在函数中访问工作表上下文并读取单元格属性
* 如何将自定义函数注册到工作表并在公式中使用

该方案适用于需要在公式中访问单元格元数据的场景，如数据关联、状态判断、条件计算等。通过类似的方式，开发者可以扩展实现更多自定义函数，如获取单元格样式、批注、数据验证规则等属性，极大地增强 SpreadJS 的公式计算能力。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
