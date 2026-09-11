## 一、Demo 概述

本示例展示了如何在 SpreadJS 打印时对工作表进行动态处理，包括在分页边界添加红色边框、插入"以下空白"提示行，以及动态调整最后一页的行高以充满整页。该功能特别适用于需要打印规范化报表的场景，如检验报告、财务报表等，能够让打印输出更加美观和专业。 

## 二、解决的问题

* **分页边界不清晰**：默认打印时，跨页内容没有明显的视觉分隔，用户难以区分页面边界
* **最后一页留白过多**：当最后一页内容较少时，会出现大量空白区域，影响打印美观度
* **缺少页面结束标识**：非最后一页结束时，没有明确的提示信息告知用户后续内容在下一页

## 三、实现思路

### 3.1 创建临时工作簿进行打印处理

为了不影响原始数据，示例通过创建临时工作簿的方式进行打印前的数据处理：

```javascript
var tempSpread = new GC.Spread.Sheets.Workbook();
tempSpread.suspendPaint();
tempSpread.fromJSON(JSON.parse(JSON.stringify(spread.toJSON())));
```

使用 `suspendPaint()` 暂停渲染可以提高处理性能，避免中间状态的闪烁。通过深拷贝 JSON 数据确保原始工作簿不受影响。

### 3.2 获取分页信息并遍历处理

利用 `pageInfo()` API 获取工作表的分页详情，然后逐页进行边框和行高调整：

```javascript
var pageInfo = tempSpread.pageInfo();
var pages = pageInfo[index].pages;

for (var i = 0; i < pages.length; i++) {
    var page = pages[i];
    var topRowIndex = page.row;
    var bottomRowIndex = page.row + page.rowCount - 1;
    var colIndex = page.column;
    var colCount = page.columnCount;
    // ... 处理逻辑
}
```

`pageInfo()` 返回的数据结构包含每页的起始行、列索引以及行列数量，为后续精确操作提供了基础。

### 3.3 为非首页添加上边框

对于第二页及之后的页面，在顶部添加红色边框作为分页标识：

```javascript
var lineStyle = GC.Spread.Sheets.LineStyle.thin;
var lineBorder = new GC.Spread.Sheets.LineBorder('red', lineStyle);

if (i != 0) {
    sheet.getRange(topRowIndex, colIndex, 1, colCount).borderTop(lineBorder);
}
```

### 3.4 为非末页插入"以下空白"提示行

在非最后一页的底部插入一行，合并单元格并添加提示文字和边框：

```javascript
if (i != pages.length - 1) {
    sheet.addRows(bottomRowIndex, 1);
    sheet.addSpan(bottomRowIndex, colIndex, 1, colCount);
    sheet.getCell(bottomRowIndex, colIndex)
        .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
        .value("----------以下空白-----------");
    sheet.setRowHeight(bottomRowIndex, 30);
    sheet.getRange(bottomRowIndex, colIndex, 1, colCount)
        .borderBottom(lineBorder)
        .borderRight(lineBorder)
        .borderLeft(lineBorder);
}
```

### 3.5 动态调整最后一页行高

通过计算当前页面内容的总高度，动态调整"以下空白"行的高度，使其填满整页：

```javascript
if (i == pages.length - 1) {
    var paperSizeHeight = 840; // 预估的纸张高度（像素）
    var rowsHeight = 0;
    var blankRowIndex;
    
    for (var n = page.row; n < page.row + page.rowCount + 1; n++) {
        rowsHeight = rowsHeight + sheet.getRowHeight(n);
        if (sheet.getValue(n, colIndex) === "----------以下空白-----------") {
            blankRowIndex = n;
        }
    }
    
    var newBlankHeight = paperSizeHeight - rowsHeight + sheet.getRowHeight(blankRowIndex);
    sheet.setRowHeight(blankRowIndex, newBlankHeight);
}
```

这里的 `paperSizeHeight` 是根据打印设置预估的单页高度，实际使用时可能需要根据纸张大小和页边距进行调整。

### 3.6 设置重复打印区域

通过 `printInfo()` 设置标题行重复打印，确保每页都显示表头：

```javascript
var printInfo = sheet.printInfo();
printInfo.repeatRowStart(1);
printInfo.repeatRowEnd(4);
```

### 3.7 技术栈

* @grapecity/spread-sheets: 17.0.8（核心表格组件）
* @grapecity/spread-sheets-print: 17.0.8（打印功能扩展）
* SystemJS: 0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

安装完成后，使用浏览器打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，可以看到两个按钮："原本的打印" 和 "添加边框、调整行高后的打印"
2. 点击"原本的打印"按钮，查看默认打印效果
3. 点击"添加边框、调整行高后的打印"按钮，查看优化后的打印效果
4. 在打印预览中对比第二页的差异，观察边框、提示行和行高调整的效果

## 五、功能特点

### 5.1 优点

* **不影响原始数据**：通过临时工作簿处理，原始数据保持不变
* **视觉效果专业**：红色边框和提示文字让分页边界清晰可见
* **充分利用纸张空间**：动态行高调整避免了最后一页的大量留白
* **可扩展性强**：可以根据实际需求调整边框样式、提示文字和行高计算逻辑

### 5.2 局限性与扩展建议

* **纸张高度硬编码**：当前 `paperSizeHeight` 设置为固定值 840，实际应根据 `printInfo` 的纸张大小和页边距动态计算
* **仅处理特定工作表**：代码中硬编码了"检验报告"工作表名称，可以改为遍历所有工作表或通过参数指定
* **扩展建议**：
    * 可以将打印处理逻辑封装为独立函数，支持配置化参数（边框颜色、提示文字等）
    * 可以通过 `BeforePrint` 事件监听实现自动化处理，无需手动创建临时工作簿
    * 可以添加页码、打印日期等额外信息

## 六、关键代码片段

### 6.1 获取分页信息

```javascript
var pageInfo = tempSpread.pageInfo();
var pages = pageInfo[index].pages;
```

`pageInfo()` 是 SpreadJS 提供的核心 API，返回当前工作簿所有工作表的分页详情，包括每页的起始行列、行列数量等信息。

### 6.2 动态行高计算

```javascript
var rowsHeight = 0;
for (var n = page.row; n < page.row + page.rowCount + 1; n++) {
    rowsHeight = rowsHeight + sheet.getRowHeight(n);
}
var newBlankHeight = paperSizeHeight - rowsHeight + sheet.getRowHeight(blankRowIndex);
sheet.setRowHeight(blankRowIndex, newBlankHeight);
```

通过累加当前页所有行的高度，计算出剩余空间，然后将"以下空白"行的高度设置为剩余空间加上原有高度，实现填满整页的效果。

## 七、总结

本示例展示了 SpreadJS 在打印场景下的高级应用技巧，通过临时工作簿、分页信息获取、动态边框和行高调整等技术手段，实现了专业化的打印输出效果。开发者可以从中学到：

* 如何使用 `pageInfo()` API 获取分页详情
* 如何在不影响原始数据的情况下进行打印前处理
* 如何动态添加边框、合并单元格和调整行高
* 如何设置重复打印区域

该方案特别适用于需要规范化打印输出的业务场景，如报表系统、检验报告、财务单据等，通过简单的代码调整即可应用到实际项目中。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
