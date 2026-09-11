## 一、Demo 概述

本示例演示了如何在 SpreadJS 中导出包含筛选条件的工作簿时，保留筛选前的原始数据。在实际应用中，用户可能对表格数据应用了筛选条件，但在导出 Excel 文件时希望导出完整的原始数据而非筛选后的结果。该示例通过创建工作簿副本并重置筛选条件的方式，实现了导出原始数据的功能。 

## 二、解决的问题

在使用 SpreadJS 进行数据展示和导出时，经常会遇到以下场景：

* 用户在界面上对数据应用了行筛选，只显示符合条件的数据行
* 导出 Excel 文件时，希望导出完整的原始数据，而不是筛选后的部分数据
* 需要保持界面上的筛选状态不变，同时导出未筛选的完整数据

该示例提供了一种优雅的解决方案，通过副本机制避免影响当前界面状态，确保导出的文件包含所有原始数据。

## 三、实现思路

### 3.1 创建工作簿副本

核心思路是通过 `toJSON()` 和 `fromJSON()` 方法创建当前工作簿的完整副本，在副本上进行筛选重置操作，避免影响原始工作簿的显示状态。

```javascript
// 创建一个副本Workbook
let tempSpread = new GC.Spread.Sheets.Workbook();
tempSpread.fromJSON(spread.toJSON());
```

这种方式可以完整复制工作簿的所有数据、样式、筛选条件等信息，为后续操作提供独立的数据副本。

### 3.2 重置所有工作表的筛选条件

遍历副本工作簿中的所有工作表，检查并重置每个工作表的行筛选条件。

```javascript
let count = tempSpread.getSheetCount();
// 循环去除工作表中的筛选条件
for (let i = 0; i < count; i++) {
    let tempSheet = tempSpread.getSheet(i);
    var rowFilter = tempSheet.rowFilter();
    if (rowFilter != null) {
        rowFilter.reset();
    }
}
```

`rowFilter.reset()` 方法会清除所有筛选条件，使所有被隐藏的行重新显示，从而确保导出的数据是完整的。

### 3.3 导出副本工作簿

使用 SpreadJS 的 `export()` 方法将重置筛选后的副本工作簿导出为 Excel 文件，配合 FileSaver.js 库实现文件下载。

```javascript
// 保存副本文件
tempSpread.export(function (blob) {
    saveAs(blob, "export.xlsx");
}, function (e) {
    // process error
    console.log(e);
});
```

### 3.4 技术栈

* SpreadJS 16.2.0：核心表格组件
* @grapecity/spread-sheets-io 16.2.0：提供 Excel 导入导出功能
* @grapecity/spread-sheets-resources-zh 16.2.0：中文资源包
* FileSaver.js 2.0.0：实现浏览器端文件下载
* SystemJS 0.19.22：模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，可以看到表格中显示了 1-7 的数字数据，并且已经应用了行筛选
2. 在界面上可以通过筛选器调整显示的数据行
3. 点击"导出筛选原文件"按钮
4. 系统会自动下载名为 `export.xlsx` 的 Excel 文件
5. 打开下载的文件，可以看到所有原始数据（1-7 的完整数据），而不是筛选后的结果

## 五、功能特点

### 5.1 优点

* 不影响界面状态：通过副本机制，导出操作不会改变用户当前的筛选视图
* 数据完整性：确保导出的 Excel 文件包含所有原始数据
* 实现简洁：代码逻辑清晰，易于理解和维护
* 通用性强：适用于包含多个工作表的复杂工作簿场景

### 5.2 扩展建议

* 可以添加导出选项，让用户选择导出筛选后的数据还是原始数据
* 可以在导出前添加确认对话框，提示用户导出的是完整数据
* 可以扩展为导出其他格式（如 CSV、PDF）的功能

## 六、关键代码片段

### 初始化数据和筛选器

```javascript
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let sheet = spread.getActiveSheet();

// 填充测试数据
sheet.setValue(1, 0, 1);
sheet.setValue(2, 0, 2);
// ... 更多数据

// 创建行筛选器
let range = new GC.Spread.Sheets.Range(1, 0, 7, 1);
let rowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(range);
sheet.rowFilter(rowFilter);
```

### 导出处理逻辑

```javascript
document.getElementById("exportFile").onclick = function(){
    // 创建副本并重置筛选
    let tempSpread = new GC.Spread.Sheets.Workbook();
    tempSpread.fromJSON(spread.toJSON());
    
    let count = tempSpread.getSheetCount();
    for (let i = 0; i < count; i++) {
        let tempSheet = tempSpread.getSheet(i);
        var rowFilter = tempSheet.rowFilter();
        if (rowFilter != null) {
            rowFilter.reset();
        }
    }
    
    // 导出文件
    tempSpread.export(function (blob) {
        saveAs(blob, "export.xlsx");
    }, function (e) {
        console.log(e);
    });
}
```

## 七、总结

本示例展示了一种优雅的解决方案，用于在 SpreadJS 中导出包含筛选条件的工作簿时保留原始数据。通过工作簿副本机制和筛选重置技术，开发者可以实现用户友好的导出功能。

开发者可以从中学到：

* 使用 `toJSON()` 和 `fromJSON()` 创建工作簿副本的技巧
* 如何遍历和操作多个工作表
* 行筛选器的重置方法 `rowFilter.reset()`
* SpreadJS 的导出 API 使用方式
* 副本机制在保持界面状态不变的场景中的应用

该方案适用于需要在保持用户界面筛选状态的同时导出完整数据的场景，具有良好的扩展性，可以根据实际需求添加更多导出选项和格式支持。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
