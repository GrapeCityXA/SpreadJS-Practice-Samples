## 一、Demo 概述

本示例展示了如何在 SpreadJS 中使用区域模板单元格类型（RangeTemplate CellType）来实现复杂的数据展示布局。通过将一个完整的工作表作为模板，可以在单个单元格中渲染包含图片、文本、样式等多种元素的复杂内容区域。该功能特别适用于需要在表格中展示卡片式信息的场景，如用户信息列表、产品目录等。 

## 二、解决的问题

* 在单个单元格中展示复杂的多字段数据结构，避免传统表格布局的局限性
* 实现类似卡片式的数据展示效果，提升数据可读性和视觉效果
* 支持在表格中批量渲染结构化数据，同时保持每条记录的独立编辑能力
* 通过双击单元格弹出编辑对话框，实现对复杂数据的可视化编辑

## 三、实现思路

### 3.1 创建模板工作表

首先需要定义一个模板工作表，该工作表包含了数据展示的完整布局、样式和数据绑定路径。

```javascript
let templateSheet = new GC.Spread.Sheets.Worksheet();
templateSheet.fromJSON(templatesheetjson);
templateSheet.setFormatter(2, 2, "=IMAGE(@)");
```

模板工作表通过 JSON 配置定义了：

* 单元格样式（背景色、字体、边框等）
* 数据绑定路径（如 `bindingPath: "image"`, `bindingPath: "fullName"` 等）
* 单元格合并和布局
* 图片单元格类型配置

### 3.2 创建区域模板单元格类型

使用模板工作表创建 RangeTemplate 单元格类型，并应用到目标单元格。

```javascript
let celltype = new GC.Spread.Sheets.CellTypes.RangeTemplate(templateSheet);
renderSheet.getRange(2, 0).cellType(celltype);
```

### 3.3 数据绑定与表格集成

通过表格（Table）和数据绑定源（CellBindingSource）实现数据的批量渲染。

```javascript
let dataSource = new GC.Spread.Sheets.Bindings.CellBindingSource({
    list: [{ "detail": data[0] }, { "detail": data[1] }, { "detail": data[2] }]
});

let table = renderSheet.tables.add("tableRecordds", 1, 0, 4, 1);
table.autoGenerateColumns(false);

let tableColumn1 = new GC.Spread.Sheets.Tables.TableColumn();
tableColumn1.name("Detail");
tableColumn1.dataField("detail");
table.bindColumns([tableColumn1]);
table.bindingPath("list");

renderSheet.setDataSource(dataSource);
```

### 3.4 样式复制与行高设置

为了保持表格中每行的一致性，需要复制第一行的样式、公式和合并单元格设置到其他行。

```javascript
function copyTableStyle(sheet, table) {
    let range = table.dataRange();
    let rowHeight = sheet.getRowHeight(range.row);
    for (let i = 1; i < range.rowCount; i++) {
        sheet.copyTo(range.row + i - 1, range.col, range.row + i, range.col, 1, range.colCount, 
                     GC.Spread.Sheets.CopyToOptions.style);
        sheet.copyTo(range.row + i - 1, range.col, range.row + i, range.col, 1, range.colCount, 
                     GC.Spread.Sheets.CopyToOptions.formula);
        sheet.copyTo(range.row + i - 1, range.col, range.row + i, range.col, 1, range.colCount, 
                     GC.Spread.Sheets.CopyToOptions.span);
        sheet.setRowHeight(range.row + i, rowHeight);
    }
}
```

### 3.5 双击编辑功能

监听单元格双击事件，当双击区域模板单元格时，弹出编辑对话框。

```javascript
spread.bind(GC.Spread.Sheets.Events.CellDoubleClick, function (s, e) {
    let sheet = e.sheet, row = e.row, col = e.col;
    let cellType = sheet.getCellType(row, col);
    if (cellType && cellType instanceof GC.Spread.Sheets.CellTypes.RangeTemplate) {
        editRangeCell(sheet, row, col);
    }
});
```

编辑对话框中创建独立的 Spread 实例，加载相同的模板并绑定当前单元格的数据：

```javascript
function setEditorValue(sheet, row, col) {
    let editorSheet = dialogSS.getActiveSheet();
    editorSheet.fromJSON(templatesheetjson);
    let value = JSON.parse(JSON.stringify(sheet.getValue(row, col)));
    let dataSource = new GC.Spread.Sheets.Bindings.CellBindingSource(value);
    editorSheet.setDataSource(dataSource);
    editorSheet.recalcAll(true);
}
```

确认编辑后，将修改后的数据写回原单元格：

```javascript
dialogOK.onclick = function () {
    let editorSheet = dialogSS.getActiveSheet();
    let cellValue = editorSheet.getDataSource().getSource();
    let renderSheet = spread.getActiveSheet();
    renderSheet.setValue(renderSheet.getActiveRowIndex(), renderSheet.getActiveColumnIndex(), cellValue);
    closeDialog();
};
```

### 3.6 技术栈

* SpreadJS 17.0.8：核心表格控件库
* SystemJS 0.19.22：模块加载器
* 原生 JavaScript（ES6）：业务逻辑实现

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，可以看到表格中显示了多条用户信息记录
2. 每条记录以卡片形式展示，包含头像、姓名、注册日期、邮箱、电话等信息
3. 双击任意用户信息卡片，弹出编辑对话框
4. 在对话框中修改用户信息（如姓名、邮箱、电话等可编辑字段）
5. 点击"确定"按钮保存修改，点击"取消"按钮放弃修改

## 五、功能特点

### 5.1 优点

* 突破传统表格布局限制，在单个单元格中实现复杂的多字段数据展示
* 通过模板工作表定义布局，实现高度可定制的数据展示效果
* 支持数据绑定机制，自动将数据对象映射到模板中的对应位置
* 提供可视化编辑界面，用户无需直接操作 JSON 数据结构

### 5.2 局限性与扩展建议

* 模板工作表的布局需要预先设计，动态调整布局较为复杂
* 大量数据渲染时性能可能受到影响，建议结合虚拟滚动或分页加载
* 可扩展方向：支持模板的动态切换、添加数据验证规则、集成更多交互组件

## 六、关键代码片段

### 区域模板单元格类型的创建与应用

```javascript
// 创建模板工作表
let templateSheet = new GC.Spread.Sheets.Worksheet();
templateSheet.fromJSON(templatesheetjson);

// 创建区域模板单元格类型
let celltype = new GC.Spread.Sheets.CellTypes.RangeTemplate(templateSheet);

// 应用到表格列
renderSheet.getRange(2, 0).cellType(celltype);
```

### 数据绑定结构

```javascript
// 数据源结构：每个 list 项包含一个 detail 对象
let dataSource = new GC.Spread.Sheets.Bindings.CellBindingSource({
    list: [
        { "detail": { "image": "...", "fullName": "...", "email": "...", "phone": "..." } },
        { "detail": { "image": "...", "fullName": "...", "email": "...", "phone": "..." } }
    ]
});

// 表格列绑定到 detail 字段
let tableColumn1 = new GC.Spread.Sheets.Tables.TableColumn();
tableColumn1.dataField("detail");
```

## 七、总结

本示例展示了 SpreadJS 区域模板单元格类型的强大功能，通过将工作表作为模板，实现了在单个单元格中展示复杂数据结构的能力。开发者可以从中学习到：

* RangeTemplate 单元格类型的创建和使用方法
* 模板工作表的设计与数据绑定机制
* 表格与数据绑定源的集成方式
* 自定义编辑对话框的实现思路

该方案特别适用于需要在表格中展示卡片式信息、产品目录、用户档案等场景，能够显著提升数据展示的灵活性和用户体验。通过合理的模板设计和数据绑定配置，可以快速构建出专业的数据展示界面。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
