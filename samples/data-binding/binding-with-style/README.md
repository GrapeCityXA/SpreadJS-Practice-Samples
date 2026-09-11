## 一、Demo 概述

本示例演示了在 SpreadJS 中使用数据绑定功能时，如何保留表格的预设样式、公式和行高等格式属性。当通过 `setDataSource()` 方法绑定数据源到工作表时，表格会自动填充数据，但默认情况下新增的数据行不会继承模板行的样式。该示例通过自定义的 `copyTableStyle()` 函数，在数据绑定后自动将模板行的样式、公式、合并单元格和行高复制到所有新增的数据行，确保表格外观的一致性。

## 二、解决的问题

在实际业务场景中，开发者通常会预先设计好表格的样式模板（包括字体、颜色、边框、公式等），然后通过数据绑定动态填充数据。但 SpreadJS 的默认数据绑定机制只会填充数据内容，不会自动复制模板行的格式设置，导致新增行与模板行样式不一致。本示例解决了以下问题： 

* 数据绑定后新增行缺少预设样式（字体、颜色、对齐方式等）
* 模板行中的公式无法自动应用到新增行
* 合并单元格（span）配置丢失
* 行高设置不统一

## 三、实现思路

### 3.1 核心技术点

#### 数据绑定机制

使用 SpreadJS 的 `CellBindingSource` 实现数据与单元格的双向绑定：

```javascript
var source = new GC.Spread.Sheets.Bindings.CellBindingSource(data);
sheet.setDataSource(source);
```

数据源 `data` 包含 `Title`（标题）、`B_Table` 和 `C_Table` 两个表格数组，通过 `bindingPath` 属性与模板中的单元格和表格关联。

#### 样式复制函数

核心函数 `copyTableStyle()` 负责将模板行的格式复制到所有数据行：

```javascript
function copyTableStyle(sheet, table) {
    var range = table.dataRange();
    var rowHeight = sheet.getRowHeight(range.row);
    for (var i = 1; i < range.rowCount; i++) {
        // 复制样式
        sheet.copyTo(range.row + i - 1, range.col, range.row + i, range.col, 1, range.colCount, GC.Spread.Sheets.CopyToOptions.style);
        // 复制公式
        sheet.copyTo(range.row + i - 1, range.col, range.row + i, range.col, 1, range.colCount, GC.Spread.Sheets.CopyToOptions.formula);
        // 复制合并单元格
        sheet.copyTo(range.row + i - 1, range.col, range.row + i, range.col, 1, range.colCount, GC.Spread.Sheets.CopyToOptions.span);
        // 设置行高
        sheet.setRowHeight(range.row + i, rowHeight);
        
        // 复制表格左侧的行头样式和值
        sheet.copyTo(range.row + i - 1, 0, range.row + i, 0, 1, range.col, GC.Spread.Sheets.CopyToOptions.style);
        sheet.copyTo(range.row + i - 1, 0, range.row + i, 0, 1, range.col, GC.Spread.Sheets.CopyToOptions.value);
    }
}
```

该函数通过 `copyTo()` 方法分别复制样式、公式、合并单元格配置，并使用 `setRowHeight()` 统一行高。

#### 批量处理表格

在绑定数据后，遍历工作表中的所有表格并应用样式复制：

```javascript
var tables = sheet.tables.all();
if (tables) {
    for (var i = 0; i < tables.length; i++) {
        copyTableStyle(sheet, tables[i])
    }
}
```

#### 性能优化

使用 `suspendPaint()` 和 `resumePaint()` 暂停和恢复渲染，避免频繁重绘：

```javascript
spread.suspendPaint();
// 数据绑定和样式复制操作
spread.resumePaint();
```

### 3.2 技术栈

* @grapecity/spread-sheets: 15.0.0（核心表格组件）
* @grapecity/spread-sheets-designer: 15.0.0（设计器组件）
* @grapecity/spread-sheets-resources-zh: 15.0.0（中文资源包）
* SystemJS（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件。

### 4.2 操作步骤

1. 打开页面后，可以看到预设的表格模板，包含两个表格（B\_Table 和 C\_Table）
2. 点击"绑定数据"按钮
3. 数据会自动填充到表格中，新增的数据行会保留模板行的样式、公式和行高
4. 观察表格中的公式列（如 Total2 和 Age2）会自动计算

## 五、功能特点

### 5.1 优点

* 完整保留模板样式：自动复制字体、颜色、对齐方式、边框等所有样式属性
* 公式自动应用：模板行中的公式会自动复制到新增行并调整引用
* 支持复杂格式：包括合并单元格、行高、数字格式等
* 性能优化：通过暂停渲染机制提升批量操作效率

### 5.2 局限性与扩展建议

* 当前实现仅在点击按钮时触发样式复制，如需实时响应数据变化，可监听 `DataSourceChanged` 事件
* 如果表格结构复杂（如嵌套表格），可能需要递归处理子表格的样式
* 可扩展为通用工具函数，支持更多自定义配置选项（如选择性复制特定样式）

## 六、关键代码片段

### 模板 JSON 结构

模板通过 `template.js` 定义，包含表格结构、样式和数据绑定路径：

```javascript
"tables": [{
    "name": "gcTable0",
    "row": 7,
    "col": 2,
    "rowCount": 2,
    "colCount": 4,
    "style": {
        "buildInName": "Medium2"
    },
    "autoGenerateColumns": false,
    "bindingPath": "B_Table",
    "columns": [{
        "id": 1,
        "name": "Quantity",
        "dataField": "Quantity"
    }, {
        "id": 2,
        "name": "Price",
        "dataField": "Price"
    }, {
        "id": 3,
        "name": "Total2"
    }]
}]
```

### 数据源定义

```javascript
var data = {
    Title: "表格绑定样式",
    B_Table: [{
        Quantity: 2,
        Price: 30.3,
        Date: "2017/8/5"
    }, {
        Quantity: 3,
        Price: 30.31,
        Date: "2013/8/5"
    }],
    C_Table: [{
        Person: "Super Man",
        Birthday: "2011/3/3"
    }]
}
```

## 七、总结

本示例展示了如何在 SpreadJS 数据绑定场景中保留表格的预设样式和格式，通过自定义的样式复制逻辑解决了默认绑定机制的不足。开发者可以学到：

* SpreadJS 数据绑定的基本用法（CellBindingSource）
* 使用 `copyTo()` 方法复制单元格样式、公式和合并单元格
* 通过 `suspendPaint()` 和 `resumePaint()` 优化批量操作性能
* 表格对象的遍历和操作方法

该方案适用于需要动态填充数据但又要保持统一视觉风格的报表系统、数据展示面板等场景，具有良好的扩展性和实用性。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
