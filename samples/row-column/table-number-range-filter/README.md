## 一、Demo 概述

本示例演示了如何使用 SpreadJS 的表格筛选功能实现数字区间筛选。通过组合多个条件表达式（ConditionType），可以筛选出指定数值区间内的数据行。示例中实现了一个"筛选 age 为 25 到 40 的数据"功能，展示了如何使用逻辑运算符组合大于和小于两个条件，实现区间筛选效果。

该示例适用于需要对表格数据进行复杂条件筛选的场景，例如财务报表中筛选特定金额范围的交易记录、人事管理中筛选特定年龄段的员工等业务需求。

## 二、解决的问题

在实际业务中，常常需要对表格数据进行区间筛选，例如：

* 筛选销售额在 10000-50000 之间的订单
* 筛选年龄在 25-40 岁之间的员工
* 筛选成绩在 60-90 分之间的学生

传统的单一条件筛选无法满足这种需求，本示例通过组合多个条件（大于某值且小于某值），实现了灵活的数字区间筛选功能。

## 三、实现思路

### 3.1 创建表格并设置数据源

使用 SpreadJS 的 Tables API 创建表格对象，并填充示例数据：

```javascript
let tableStyle = GC.Spread.Sheets.Tables.TableThemes.light1;
let table = sheet.tables.add('table1', 0, 0, 4, 4, tableStyle);
// set value to the table
sheet.setArray(0, 0, [
    ['Id', 'Name', 'Age', 'Grade'],
    [1000, 'Tom', 23, 98],
    [1001, 'Bob', 29, 80],
    [1002, 'Tony', 53, 99]
])
```

此处创建了一个包含 Id、Name、Age、Grade 四列的表格，并设置了 light1 主题样式。

### 3.2 构建复合条件表达式

核心技术点在于使用 `ConditionType.relationCondition` 将两个数字条件通过逻辑运算符组合：

```javascript
// 创建"大于 25"条件
let c1 = new GC.Spread.Sheets.ConditionalFormatting.Condition(
    GC.Spread.Sheets.ConditionalFormatting.ConditionType.numberCondition,
    {
        compareType: GC.Spread.Sheets.ConditionalFormatting.GeneralComparisonOperators.greaterThan,
        expected: 25
    });

// 创建"小于 40"条件
let c2 = new GC.Spread.Sheets.ConditionalFormatting.Condition(
    GC.Spread.Sheets.ConditionalFormatting.ConditionType.numberCondition,
    {
        compareType: GC.Spread.Sheets.ConditionalFormatting.GeneralComparisonOperators.lessThan,
        expected: 40
    });

// 使用 AND 逻辑运算符组合两个条件
let c3 = new GC.Spread.Sheets.ConditionalFormatting.Condition(
    GC.Spread.Sheets.ConditionalFormatting.ConditionType.relationCondition,
    {
        compareType: GC.Spread.Sheets.ConditionalFormatting.LogicalOperators.and,
        item1: c1,
        item2: c2
    });
```

关键在于 `relationCondition` 类型的条件对象，它可以接受 `item1` 和 `item2` 两个子条件，并通过 `LogicalOperators.and` 实现逻辑与运算。

### 3.3 应用筛选条件

将构建好的复合条件添加到表格筛选器，并对指定列执行筛选：

```javascript
let tableFilter = table.rowFilter()
// 将条件添加到第 2 列（Age 列，索引从 0 开始）
tableFilter.addFilterItem(2, c3);
// 执行筛选
tableFilter.filter(2);
```

### 3.4 技术栈

* `@grapecity/spread-sheets` 17.0.8：SpreadJS 核心库
* `systemjs` ^0.19.22：模块加载器
* `systemjs-plugin-babel` 0.0.25：ES6 转译插件

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 直接在浏览器中打开 index.html 即可运行
```

由于使用 SystemJS 加载模块，需要确保依赖已正确安装在 `node_modules` 目录下。

### 4.2 操作步骤

1. 打开 `index.html`，页面会显示一个包含 4 行数据的表格
2. 观察表格中 Age 列的数据：Tom(23)、Bob(29)、Tony(53)
3. 点击页面顶部的"筛选 age 为 25 到 40 的数据"按钮
4. 表格会自动筛选，只显示 Age 在 25-40 之间的数据行（即 Bob，29 岁）
5. Tom(23) 和 Tony(53) 的数据行会被隐藏

## 五、功能特点

### 5.1 优点

* **灵活的条件组合**：通过 `relationCondition` 和逻辑运算符，可以构建任意复杂的筛选条件
* **代码简洁清晰**：API 设计符合直觉，条件嵌套结构清晰易懂
* **易于扩展**：可以进一步组合更多条件（如 OR 关系、多层嵌套等）

### 5.2 局限性与扩展建议

* **UI 交互限制**：当前示例通过按钮触发固定的筛选条件，实际应用中可以结合输入框，让用户自定义区间范围
* **扩展方向**：
    * 添加输入框，支持动态设置筛选区间的上下限
    * 支持多列组合筛选（例如同时筛选 Age 和 Grade）
    * 添加"清除筛选"按钮，恢复表格原始状态
    * 支持 OR 逻辑，例如"Age < 25 或 Age > 40"

## 六、关键代码片段

### 隐藏筛选按钮

代码中还演示了如何隐藏特定列的筛选按钮：

```javascript
let tableFilter = table.rowFilter()
// 控制表格第一列（Id 列）筛选按钮不显示
tableFilter.filterButtonVisible(0, false)
```

这在某些场景下很有用，例如 Id 列通常不需要筛选功能。

### 格式化数值显示

示例中对 Age 列设置了百分比格式（虽然对于年龄数据不太合适，但展示了格式化功能）：

```javascript
sheet.getRange(1, 2, 3, 1).formatter("0.000%")
sheet.setColumnWidth(2, 400)
```

## 七、总结

本示例展示了 SpreadJS 表格筛选功能中的核心知识点：

1. **复合条件构建**：如何使用 `numberCondition` 和 `relationCondition` 构建复杂筛选逻辑
2. **逻辑运算符应用**：掌握 `LogicalOperators.and` 的使用方法
3. **表格筛选器操作**：`addFilterItem` 和 `filter` 方法的配合使用

该方案适用于所有需要数字区间筛选的业务场景。开发者可以基于此示例扩展出更丰富的筛选功能，例如支持日期区间、文本模糊匹配、多条件组合等。通过合理组合 SpreadJS 提供的条件类型和逻辑运算符，可以实现几乎任意复杂度的数据筛选需求。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
