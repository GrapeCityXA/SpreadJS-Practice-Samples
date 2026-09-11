## 一、Demo 概述

本示例展示了如何通过扩展 SpreadJS 的格式化器（Formatter）来实现字符串类型数字的格式化行为与 Excel 保持一致。在 Excel 中，当单元格的值为字符串类型（如 "1.23456789"）时，即使设置了数字格式（如 "0.00"），也不会对字符串进行格式化处理，而是保持原样显示。本示例通过重写 `GeneralFormatter.prototype.format` 方法，使 SpreadJS 实现相同的行为。

## 二、解决的问题

在默认情况下，SpreadJS 对字符串类型的数字值应用数字格式时，可能会尝试进行格式化处理，这与 Excel 的行为不一致。本示例解决了以下问题：

- 确保字符串类型的数字值在设置数字格式后保持原样显示，不进行小数位数截断或其他格式化操作
- 保持 SpreadJS 与 Excel 以及 GcExcel 的行为一致性，提升用户体验
- 避免因格式化行为差异导致的数据展示问题

## 三、实现思路

### 3.1 核心技术点

#### 重写 GeneralFormatter 的 format 方法

通过 JavaScript 原型链机制，重写 `GC.Spread.Formatter.GeneralFormatter.prototype.format` 方法，在格式化之前检查值的类型。如果值为字符串类型且格式字符串包含数字格式符号（"0" 或 "#"），则直接返回原始字符串，不进行格式化处理。

```javascript
// 保存原始的 format 方法
let formatFn = GC.Spread.Formatter.GeneralFormatter.prototype.format;

// 重写 format 方法
GC.Spread.Formatter.GeneralFormatter.prototype.format = function (val) {
    let formatter = this.formatString();
    // 如果值是字符串类型，且格式字符串包含数字格式符号，直接返回原值
    if (typeof val === 'string' && (formatter.indexOf("0") || formatter.indexOf("#"))) {
        return val;
    }
    // 否则调用原始的格式化方法
    return formatFn.apply(this, arguments);
}
```

这段代码的关键在于：
- 使用 `typeof val === 'string'` 判断值是否为字符串类型
- 通过 `this.formatString()` 获取当前格式化器的格式字符串
- 检查格式字符串是否包含数字格式符号（"0" 或 "#"）
- 如果满足条件，直接返回原始字符串，否则调用原始的 `format` 方法

### 3.2 技术栈

- SpreadJS v17.0.8：核心电子表格组件
- SpreadJS Designer v17.0.8：设计器组件，提供可视化编辑界面
- SystemJS：模块加载器，用于动态加载 ES6 模块

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开 `index.html` 文件，页面会加载 SpreadJS Designer
2. 观察 B2 单元格（第 2 行第 2 列），该单元格的值为字符串 "1.23456789"，并设置了 "0.00" 的数字格式
3. 注意到字符串值保持原样显示为 "1.23456789"，而不是被格式化为 "1.23"
4. 可以尝试注释掉 `app.js` 中的核心代码（第 24-31 行），重新加载页面，观察格式化行为的差异

## 五、功能特点

### 5.1 优点

- 与 Excel 行为完全一致，确保用户体验的统一性
- 实现简单，通过原型链扩展即可完成功能定制
- 不影响数字类型值的正常格式化处理
- 与 GcExcel 保持一致，便于跨平台数据处理

### 5.2 局限性与扩展建议

当前实现使用 `indexOf` 方法检查格式字符串，这种方式可能存在误判的情况。例如，如果格式字符串中包含 "0" 或 "#" 但不是作为数字格式符号使用（如在文本格式中），也会被判定为数字格式。建议使用更精确的正则表达式或格式解析逻辑来判断格式类型。

扩展建议：
- 使用正则表达式精确匹配数字格式模式
- 支持更多格式类型的自定义处理逻辑
- 提供配置选项，允许用户选择是否启用此行为

## 六、总结

本示例展示了如何通过扩展 SpreadJS 的内置格式化器来实现与 Excel 一致的字符串数字格式化行为。开发者可以从中学到：

- 如何通过原型链机制扩展 SpreadJS 的内置功能
- 格式化器（Formatter）的工作原理和自定义方法
- 如何保持 SpreadJS 与 Excel 的行为一致性

该方案适用于需要严格遵循 Excel 格式化规则的应用场景，特别是在数据导入导出、跨平台数据处理等场景中具有重要价值。通过简单的代码扩展，即可实现复杂的格式化行为定制，体现了 SpreadJS 良好的可扩展性。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
