## 一、Demo 概述

本示例演示了如何在 SpreadJS 中实现多规则组合的数据验证功能。通过使用条件格式化（ConditionalFormatting）和数据验证（DataValidation）API，实现了对日期范围的复杂校验逻辑。具体功能是限制用户只能在指定列中输入 2024 年 12 月 31 日至 2025 年 12 月 31 日之间的日期，超出范围的数据会被高亮显示为无效数据。

## 二、解决的问题

在实际业务场景中，经常需要对用户输入的数据进行复杂的验证，例如：

* 限制日期必须在特定的时间范围内（如项目周期、活动有效期等）
* 需要同时满足多个条件的组合验证（如既要大于某个值，又要小于另一个值）
* 实时高亮显示不符合规则的数据，提升用户体验

传统的单一条件验证无法满足这类需求，本示例展示了如何通过逻辑运算符（AND）组合多个验证规则，实现更灵活的数据校验。

## 三、实现思路

### 3.1 创建基础日期条件

首先创建两个独立的日期条件：一个用于限制日期下限，一个用于限制日期上限。

```javascript
// 数据校验规则：2024年12月31日之后的日期
var condition1 = new GC.Spread.Sheets.ConditionalFormatting.Condition(
    GC.Spread.Sheets.ConditionalFormatting.ConditionType.dateCondition, 
    {
        compareType: GC.Spread.Sheets.ConditionalFormatting.DateCompareType.afterEqualsTo,
        expected: new Date(2024, 11, 31)
    }
);

// 数据校验规则：2025年12月31日之前的日期
var condition2 = new GC.Spread.Sheets.ConditionalFormatting.Condition(
    GC.Spread.Sheets.ConditionalFormatting.ConditionType.dateCondition, 
    {
        compareType: GC.Spread.Sheets.ConditionalFormatting.DateCompareType.beforeEqualsTo,
        expected: new Date(2025, 11, 31)
    }
);
```

这里使用了 `dateCondition` 类型的条件，通过 `afterEqualsTo` 和 `beforeEqualsTo` 比较类型分别定义了日期的上下边界。

### 3.2 使用逻辑运算符组合条件

通过 `relationCondition` 类型和 `LogicalOperators.and` 运算符，将两个基础条件组合成一个复合条件。

```javascript
// 数据校验规则：2024年12月31日至2025年12月31日之间的日期
var nCondition = new GC.Spread.Sheets.ConditionalFormatting.Condition(
    GC.Spread.Sheets.ConditionalFormatting.ConditionType.relationCondition, 
    {
        compareType: GC.Spread.Sheets.ConditionalFormatting.LogicalOperators.and,
        item1: condition1,
        item2: condition2
    }
);
```

这种方式实现了"既要满足条件 1，又要满足条件 2"的逻辑，即日期必须同时大于等于 2024/12/31 且小于等于 2025/12/31。

### 3.3 应用数据验证器

将组合条件应用到数据验证器，并设置到指定的单元格区域。

```javascript
var validator = new GC.Spread.Sheets.DataValidation.DefaultDataValidator(nCondition);
validator.type(GC.Spread.Sheets.DataValidation.CriteriaType.custom);
sheet.getRange(-1, 0, -1, 1, GC.Spread.Sheets.SheetArea.viewport).validator(validator);
spread.options.highlightInvalidData = true;
```

* `getRange(-1, 0, -1, 1)` 表示选择第一列（索引 0）的所有行
* `highlightInvalidData` 选项启用后，不符合验证规则的数据会自动高亮显示

### 3.4 技术栈

* SpreadJS v17.0.8：核心表格控件库
* SystemJS v0.19.22：模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，可以看到第一列已经预填充了两个日期数据
2. 第一行的日期（2025/10/31）符合验证规则，显示正常
3. 第三行的日期（2026/1/31）超出范围，会被高亮显示为无效数据
4. 尝试在第一列的其他单元格中输入日期：
    * 输入 2025 年内的日期，数据正常显示
    * 输入 2024 年 12 月 31 日之前或 2025 年 12 月 31 日之后的日期，会被高亮标记

## 五、功能特点

### 5.1 优点

* **灵活的规则组合**：支持通过逻辑运算符（AND/OR）组合多个验证条件，满足复杂业务需求
* **实时视觉反馈**：通过 `highlightInvalidData` 选项，用户可以立即看到哪些数据不符合规则
* **可扩展性强**：可以轻松扩展为更多条件的组合，或应用到不同的数据类型（数字、文本等）

### 5.2 局限性与扩展建议

* **当前实现仅针对日期类型**：如需验证其他数据类型，需要使用相应的条件类型（如 `numberCondition`、`textCondition`）
* **扩展建议**：
    * 可以添加自定义错误提示信息，通过 `validator.errorMessage()` 方法告知用户具体的验证规则
    * 可以结合 `inputMessage()` 方法，在用户选中单元格时显示输入提示
    * 支持 OR 逻辑运算符，实现"满足条件 1 或条件 2"的验证场景

## 六、关键代码片段

### 完整的验证器配置流程

```javascript
// 1. 创建基础条件
var condition1 = new GC.Spread.Sheets.ConditionalFormatting.Condition(
    GC.Spread.Sheets.ConditionalFormatting.ConditionType.dateCondition, 
    {
        compareType: GC.Spread.Sheets.ConditionalFormatting.DateCompareType.afterEqualsTo,
        expected: new Date(2024, 11, 31)
    }
);

var condition2 = new GC.Spread.Sheets.ConditionalFormatting.Condition(
    GC.Spread.Sheets.ConditionalFormatting.ConditionType.dateCondition, 
    {
        compareType: GC.Spread.Sheets.ConditionalFormatting.DateCompareType.beforeEqualsTo,
        expected: new Date(2025, 11, 31)
    }
);

// 2. 组合条件
var nCondition = new GC.Spread.Sheets.ConditionalFormatting.Condition(
    GC.Spread.Sheets.ConditionalFormatting.ConditionType.relationCondition, 
    {
        compareType: GC.Spread.Sheets.ConditionalFormatting.LogicalOperators.and,
        item1: condition1,
        item2: condition2
    }
);

// 3. 创建并应用验证器
var validator = new GC.Spread.Sheets.DataValidation.DefaultDataValidator(nCondition);
validator.type(GC.Spread.Sheets.DataValidation.CriteriaType.custom);
sheet.getRange(-1, 0, -1, 1, GC.Spread.Sheets.SheetArea.viewport).validator(validator);

// 4. 启用无效数据高亮
spread.options.highlightInvalidData = true;
```

## 七、总结

本示例展示了 SpreadJS 中多规则组合数据验证的实现方法，通过条件格式化 API 和逻辑运算符，可以灵活构建复杂的验证逻辑。开发者可以从中学到：

* 如何使用 `ConditionalFormatting.Condition` 创建各种类型的验证条件
* 如何通过 `relationCondition` 和逻辑运算符组合多个条件
* 如何将验证器应用到指定的单元格区域
* 如何启用无效数据的视觉高亮功能

该方案适用于需要对用户输入进行严格校验的场景，如表单填写、数据导入、报表编辑等，具有良好的扩展性和实用性。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
