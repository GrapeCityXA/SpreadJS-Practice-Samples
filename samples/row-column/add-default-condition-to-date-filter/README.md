## 一、Demo 概述

本示例演示了如何在 SpreadJS 表格中为日期列添加行筛选器，并在初始化时自动应用默认的日期筛选条件。通过使用 `HideRowFilter` 和 `ConditionalFormatting.Condition`，实现了对特定日期数据的自动过滤显示，无需用户手动操作筛选器即可呈现预设的数据视图。

该功能适用于需要在表格加载时就展示特定日期范围数据的场景，例如默认显示今日数据、本周数据或特定时间段的记录。

## 二、解决的问题

* **自动化数据视图**：在表格初始化时自动应用筛选条件，避免用户每次打开表格都需要手动设置筛选器
* **日期数据快速定位**：通过预设的日期筛选条件，快速定位到关键时间点的数据记录
* **提升用户体验**：减少用户操作步骤，直接呈现最相关的数据内容

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 初始化日期数据并设置格式

首先在工作表中填充日期数据，并为整列设置统一的日期格式化显示：

```javascript
// 初始化表单
sheet.setArray(1, 0, [[new Date('2021-09-09')], [new Date('2021-09-07')], [new Date('2021-09-05')]])
sheet.setFormatter(-1, 0, 'YYYY-MM-DD')
sheet.getCell(-1, 0).width(200)
```

* `setArray()` 从第 2 行第 1 列开始填充日期对象数组
* `setFormatter(-1, 0, 'YYYY-MM-DD')` 对第 1 列所有行（-1 表示整列）应用日期格式
* `getCell(-1, 0).width(200)` 设置列宽以完整显示日期内容

#### 3.1.2 添加行筛选器

为数据区域添加 `HideRowFilter` 筛选器，使列头显示筛选按钮：

```javascript
// 第一列添加时间筛选器
sheet.rowFilter(new GC.Spread.Sheets.Filter.HideRowFilter(new GC.Spread.Sheets.Range(1, 0, sheet.getRowCount() - 1, 3)))
```

* `HideRowFilter` 通过隐藏行的方式实现筛选效果
* `Range(1, 0, sheet.getRowCount() - 1, 3)` 定义筛选范围：从第 2 行开始，包含 4 列数据

#### 3.1.3 创建并应用默认日期筛选条件

使用条件格式化的日期条件类型创建筛选规则，并自动应用到指定列：

```javascript
// 添加默认筛选条件
let condition = new GC.Spread.Sheets.ConditionalFormatting.Condition(
    GC.Spread.Sheets.ConditionalFormatting.ConditionType.dateCondition,
    {
        compareType: GC.Spread.Sheets.ConditionalFormatting.DateCompareType.equalsTo,
        // 默认筛选条件为"2021-09-05"
        expected: new Date('2021-09-05')
    }
)

let rowFilter = sheet.rowFilter()
rowFilter.addFilterItem(0, condition)
rowFilter.filter(0)
```

* `ConditionType.dateCondition` 指定为日期类型条件
* `DateCompareType.equalsTo` 设置比较类型为"等于"
* `expected` 参数指定要筛选的目标日期
* `addFilterItem(0, condition)` 将条件添加到第 1 列（索引 0）
* `filter(0)` 执行筛选操作，应用到第 1 列

### 3.2 技术栈

* **@grapecity/spread-sheets**: 15.0.0 - SpreadJS 核心库
* **SystemJS**: 0.19.22 - 模块加载器
* **TypeScript**: 4.1.2 - 类型支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，表格会自动加载并显示日期数据
2. 第 1 列会自动应用筛选器，只显示日期为 "2021-09-05" 的行
3. 点击列头的筛选按钮可以查看或修改筛选条件
4. 可以手动调整筛选条件，选择其他日期或日期范围

## 五、功能特点

### 5.1 优点

* **即开即用**：页面加载完成后自动应用筛选，无需额外操作
* **灵活配置**：支持多种日期比较类型（等于、大于、小于、介于等）
* **代码简洁**：通过条件对象封装筛选逻辑，易于维护和扩展

### 5.2 局限性与扩展建议

* **单一条件限制**：当前示例仅演示单个日期条件，实际应用中可能需要组合多个条件（如日期范围）
* **扩展建议**：
    * 可以使用 `DateCompareType.between` 实现日期区间筛选
    * 结合 `LogicalOperators` 实现多条件组合（AND/OR）
    * 可以根据当前日期动态计算筛选条件（如最近 7 天）

## 六、关键代码片段

完整的筛选器初始化流程：

```javascript
// 1. 准备数据
sheet.setArray(1, 0, [[new Date('2021-09-09')], [new Date('2021-09-07')], [new Date('2021-09-05')]])
sheet.setFormatter(-1, 0, 'YYYY-MM-DD')

// 2. 添加筛选器
sheet.rowFilter(new GC.Spread.Sheets.Filter.HideRowFilter(new GC.Spread.Sheets.Range(1, 0, sheet.getRowCount() - 1, 3)))

// 3. 创建日期条件
let condition = new GC.Spread.Sheets.ConditionalFormatting.Condition(
    GC.Spread.Sheets.ConditionalFormatting.ConditionType.dateCondition,
    {
        compareType: GC.Spread.Sheets.ConditionalFormatting.DateCompareType.equalsTo,
        expected: new Date('2021-09-05')
    }
)

// 4. 应用筛选
let rowFilter = sheet.rowFilter()
rowFilter.addFilterItem(0, condition)
rowFilter.filter(0)
```

## 七、总结

本示例展示了 SpreadJS 中日期筛选器的编程式配置方法，通过预设筛选条件实现了数据视图的自动化管理。开发者可以从中学到：

* 如何使用 `HideRowFilter` 为表格添加行筛选功能
* 如何创建和配置日期类型的筛选条件
* 如何在表格初始化时自动应用筛选规则
* 日期格式化与筛选器的配合使用

该方案适用于需要默认展示特定时间段数据的报表系统、数据监控面板等场景，通过减少用户操作提升了应用的易用性和效率。开发者可以根据实际需求扩展为更复杂的日期范围筛选或多条件组合筛选。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
