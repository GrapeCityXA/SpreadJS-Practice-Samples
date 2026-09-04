## 一、Demo 概述

本示例演示了在 SpreadJS 中进行数据绑定时，如何自动扩展表格区域并保持表格外部单元格的样式一致性。当通过 CellBindingSource 绑定数据到工作表时，表格会根据数据源自动扩展行数，同时将表格外部区域的样式逐行复制，确保整个工作表的视觉效果保持统一。

该示例适用于需要动态绑定数据并保持工作表整体样式一致的场景，特别是当表格区域扩展后，需要确保表格外的单元格样式不会出现断层或不一致的情况。

## 二、解决的问题

在实际业务中，使用 SpreadJS 进行数据绑定时常常会遇到以下问题：

- 当表格通过数据绑定自动扩展行数时，新增的行可能会破坏原有的工作表样式布局
- 表格外部区域的单元格样式无法自动跟随表格扩展而复制，导致样式不连续
- 需要手动维护表格扩展后的样式一致性，增加了开发和维护成本

本示例通过启用表格的自动扩展功能，并在数据绑定后自动复制表格外部区域的样式，完美解决了这些问题。

## 三、实现思路

### 3.1 核心技术点

#### 启用表格自动扩展

通过调用表格对象的 `expandBoundRows(true)` 方法，允许表格在数据绑定时根据数据源的行数自动扩展。

```javascript
let table1 = sheet.tables.findByName('gcTable0')
//允许自动扩展
table1.expandBoundRows(true)
```

这个 API 是实现动态表格扩展的关键，设置为 `true` 后，表格会根据绑定的数据源自动增加或减少行数。

#### 数据绑定

使用 `CellBindingSource` 创建数据源，并通过 `setDataSource` 方法将数据绑定到工作表。

```javascript
let data = {
    test: [
        { one: 1, two: 2, three: 3, four: 4 },
        { one: 1, two: 2, three: 3, four: 4 },
        { one: 1, two: 2, three: 3, four: 4 },
        { one: 1, two: 2, three: 3, four: 4 },
        { one: 1, two: 2, three: 3, four: 4 },
    ]
}
let source = new GC.Spread.Sheets.Bindings.CellBindingSource(data);
sheet.setDataSource(source);
```

数据源对象的 `test` 属性对应表格的 `bindingPath`，SpreadJS 会自动将数组中的每个对象映射到表格的一行。

#### 样式复制逻辑

在数据绑定完成后，调用自定义的 `copyTableStyle` 函数，逐行复制表格外部区域的样式。

```javascript
function copyTableStyle(sheet, table) {
    let range = table.dataRange()
    let tableCols = isTableArea(range)
    sheet.suspendPaint()
    for (let i = 0; i < range.rowCount - 1; i++) {
        for (let j = 0; j < sheet.getColumnCount(); j++) {
            //判断是否在表格内
            if (tableCols.indexOf(j) == -1) {
                sheet.copyTo(range.row + i, range.row + i + 1, j, j, 1, 1, GC.Spread.Sheets.CopyToOptions.style)
            }
        }
    }
    sheet.resumePaint()
}
```

该函数的核心逻辑：
- 获取表格的数据区域范围
- 使用 `suspendPaint()` 暂停绘制以提高性能
- 遍历表格扩展的每一行，对于不在表格列范围内的单元格，将上一行的样式复制到当前行
- 使用 `resumePaint()` 恢复绘制

#### 表格列范围判断

通过 `isTableArea` 函数生成表格所占列的索引数组，用于判断某个列是否在表格内部。

```javascript
function isTableArea(range) {
    let cols = []
    for (let i = 0; i < range.colCount; i++) {
        cols.push(range.col + i)
    }
    return cols
}
```

这个辅助函数返回一个包含表格所有列索引的数组，在样式复制时用于排除表格内部的列。

### 3.2 UI 交互流程

用户点击"绑定数据"按钮 → 触发数据绑定逻辑 → 表格自动扩展行数 → 自动复制表格外部区域的样式 → 工作表样式保持一致

### 3.3 技术栈

- @grapecity/spread-sheets: 15.0.0（核心表格组件）
- SystemJS: 0.19.22（模块加载器）
- TypeScript: 4.1.2（类型支持）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 在浏览器中打开 `index.html` 文件
2. 页面加载后会显示一个包含预定义表格的工作表
3. 点击页面顶部的"绑定数据"按钮
4. 观察表格自动扩展并填充数据，同时表格外部区域的样式保持一致

## 五、功能特点

### 5.1 优点

- 自动化处理：无需手动调整表格大小和样式，数据绑定和样式复制全自动完成
- 性能优化：使用 `suspendPaint()` 和 `resumePaint()` 减少重绘次数，提高渲染性能
- 样式一致性：确保表格扩展后整个工作表的视觉效果保持统一
- 灵活性强：可以轻松适配不同的表格位置和数据源结构

### 5.2 局限性与扩展建议

- 当前实现假设样式复制是从上一行到下一行的简单复制，如果需要更复杂的样式规则（如隔行变色），需要扩展 `copyTableStyle` 函数
- 如果工作表中有多个表格，需要为每个表格单独调用样式复制逻辑
- 可以考虑将样式复制逻辑封装为 SpreadJS 的自定义插件，以便在多个项目中复用

## 六、总结

本示例展示了如何在 SpreadJS 中实现表格数据绑定时的自动扩展和样式保持功能。开发者可以从中学到：

- 如何使用 `expandBoundRows` 方法实现表格的动态扩展
- 如何使用 `CellBindingSource` 进行数据绑定
- 如何使用 `copyTo` 方法批量复制单元格样式
- 如何通过 `suspendPaint` 和 `resumePaint` 优化渲染性能

该方案适用于需要动态展示数据并保持工作表整体样式一致的场景，具有良好的可扩展性和实用价值。

[操作视频](DOCUMENT_SITE_VIDEO_BUTTON_PREFIX:https://videos.grapecity.com.cn/SpreadJS/CodeLibrary/Table%20Binding%20Copy%20Unbound%20Region%20Style.mp4)

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/F3QA6Pb_HEWEq5sndjuSfQ/)）
