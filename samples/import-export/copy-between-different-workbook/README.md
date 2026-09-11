## 一、Demo 概述

本示例演示了如何在两个独立的 SpreadJS 工作簿之间复制选中区域的数据、格式和样式。用户可以上传 Excel 文件到第一个工作簿，然后将选中的单元格区域（包括值、格式化器和样式）完整复制到第二个工作簿的对应位置。 

该示例适用于需要在多个工作簿之间进行数据迁移、模板复制或数据对比的场景。

## 二、解决的问题

* **跨工作簿数据传输**：在同一页面中的两个独立工作簿实例之间传输数据，而不是简单的剪贴板复制
* **完整样式保留**：复制时不仅传输单元格值，还保留原始的格式化器（Formatter）和样式（Style），确保数据呈现的一致性
* **Excel 文件导入**：支持从本地上传 Excel 文件并初始化工作簿，为后续的跨工作簿操作提供数据源

## 三、实现思路

### 3.1 双工作簿实例创建

在页面中创建两个独立的 SpreadJS 工作簿实例，分别绑定到不同的 DOM 容器：

```javascript
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"), {
    sheetCount: 2
});
let spread1 = new GC.Spread.Sheets.Workbook(document.getElementById("ss1"), {
    sheetCount: 2
});
```

两个工作簿各自包含 2 个工作表，完全独立运行，互不干扰。

### 3.2 Excel 文件导入

使用 SpreadJS 的 `import` 方法加载本地 Excel 文件到第一个工作簿：

```javascript
function loadExcel() {
    let excelFile = document.getElementById("fileDemo").files[0];
    spread.import(excelFile, function() {}, function(e){
        console.log(e)
    }, {
        fileType: GC.Spread.Sheets.FileType.excel
    })
}
```

通过 HTML5 File API 获取用户选择的文件，然后调用 `spread.import()` 方法解析并加载 Excel 数据。

### 3.3 跨工作簿复制核心逻辑

复制功能的核心是遍历选中区域的每个单元格，逐一复制其格式化器、值和样式：

```javascript
function copy() {
    let sheet = spread.getActiveSheet();
    let sheet1 = spread1.getActiveSheet();
    let fromSelections = sheet.getSelections()[0];
    
    // 暂停绘制以提升性能
    sheet1.suspendPaint();
    
    for (let i = fromSelections.row; i < fromSelections.row + fromSelections.rowCount; i++) {
        for (let j = fromSelections.col; j < fromSelections.col + fromSelections.colCount; j++) {
            sheet1.setFormatter(i, j, sheet.getFormatter(i, j));
            sheet1.setValue(i, j, sheet.getValue(i, j));
            sheet1.setStyle(i, j, sheet.getActualStyle(i, j));
        }
    }
    
    // 恢复绘制
    sheet1.resumePaint();
}
```

关键技术点：

* `getSelections()[0]` 获取第一个选中区域的范围信息（行、列、行数、列数）
* `suspendPaint()` 和 `resumePaint()` 用于批量更新时暂停和恢复页面渲染，避免频繁重绘导致的性能问题
* 逐单元格复制三个属性：
    * `setFormatter()` 复制数字格式化器（如日期格式、货币格式等）
    * `setValue()` 复制单元格值
    * `setStyle()` 复制样式（字体、颜色、边框等）

### 3.4 技术栈

* SpreadJS 16.2.0：核心表格控件
* SpreadJS IO 16.2.0：提供 Excel 文件导入导出功能
* TypeScript 4.1.2：开发语言
* SystemJS 0.19.22：模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

然后在浏览器中打开 `index.html` 文件。

### 4.2 操作步骤

1. 点击"选择文件"按钮，从本地选择一个 Excel 文件
2. 点击"上传至上方工作簿"按钮，将文件内容加载到第一个工作簿
3. 在第一个工作簿中选中需要复制的单元格区域（可以是单个单元格或多个单元格）
4. 点击"选中区域复制到下方工作簿"按钮
5. 查看第二个工作簿，选中区域的内容（包括格式和样式）已被完整复制

## 五、功能特点

### 5.1 优点

* **完整性**：不仅复制单元格值，还保留格式化器和样式，确保数据呈现的一致性
* **性能优化**：使用 `suspendPaint()` 和 `resumePaint()` 机制，批量更新时避免频繁重绘
* **灵活性**：支持任意大小的选中区域复制，从单个单元格到大范围区域均可处理

### 5.2 局限性与扩展建议

* **单选区限制**：当前实现仅支持复制第一个选中区域（`getSelections()[0]`），如果用户选择了多个不连续区域，只会复制第一个
* **目标位置固定**：复制到目标工作簿时，位置与源区域相同（相同的行列索引），无法指定不同的目标位置
* **扩展建议**：
    * 支持多选区复制（遍历 `getSelections()` 数组）
    * 添加目标位置选择功能（允许用户指定粘贴起始位置）
    * 增加复制选项（如仅复制值、仅复制格式等）

## 六、关键代码片段

### 单元格属性完整复制

```javascript
// 复制格式化器（如日期格式 "yyyy-MM-dd"）
sheet1.setFormatter(i, j, sheet.getFormatter(i, j));

// 复制单元格值
sheet1.setValue(i, j, sheet.getValue(i, j));

// 复制样式（使用 getActualStyle 获取计算后的最终样式）
sheet1.setStyle(i, j, sheet.getActualStyle(i, j));
```

使用 `getActualStyle()` 而非 `getStyle()` 可以获取单元格的最终样式（包括继承的行列样式和默认样式），确保复制的完整性。

## 七、总结

本示例展示了 SpreadJS 跨工作簿数据操作的基本方法，开发者可以从中学到：

1. 如何在同一页面创建和管理多个独立的工作簿实例
2. 使用 SpreadJS IO 模块导入 Excel 文件的标准流程
3. 通过 `getSelections()` API 获取用户选中区域的范围信息
4. 使用 `suspendPaint()` 和 `resumePaint()` 优化批量更新性能
5. 完整复制单元格属性（值、格式化器、样式）的最佳实践

该方案适用于需要在多个工作簿之间进行数据迁移、模板复制或数据对比的场景，具有良好的扩展性，可以根据实际需求添加更多复制选项和目标位置选择功能。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
