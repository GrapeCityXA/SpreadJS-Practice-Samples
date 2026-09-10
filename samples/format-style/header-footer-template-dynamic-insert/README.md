## 一、Demo 概述

本示例演示了如何在 SpreadJS 中动态插入预定义的头部和尾部模板。通过加载外部 .sjs 文件中的模板工作表，将其内容（包括样式、合并单元格、行高等）插入到当前工作表的指定位置，实现报表头尾的快速复用。该功能适用于需要统一报表格式、批量生成带有固定头尾的文档等场景。

## 二、解决的问题

* **模板复用**：避免每次手动创建报表头尾，提高文档生成效率
* **格式统一**：确保所有报表使用相同的头尾样式和布局
* **动态列宽适配**：当中间数据区域列数超过模板列数时，自动插入列并保持样式一致性

## 三、实现思路

### 3.1 核心技术点

#### 加载外部模板文件

使用 XMLHttpRequest 加载 .sjs 格式的模板文件，并通过 SpreadJS 的 `open` 方法解析为临时工作簿：

```javascript
let xhr = new XMLHttpRequest()
xhr.open("get", "./header-footer.sjs")
xhr.responseType = "blob"
xhr.onloadend = function () {
    let tempSpread = new GC.Spread.Sheets.Workbook()
    tempSpread.open(this.response, function () {
        // 在回调中处理模板插入逻辑
    })
}
xhr.send()
```

#### 模板插入函数

`insertTemplate` 函数负责将模板工作表的内容复制到目标工作表的指定行位置：

```javascript
function insertTemplate(tempSpread, targetSheet, templateType, fromRow) {
    let t_sheet = tempSpread.getSheetFromName(templateType)
    let usedRange = t_sheet.getUsedRange(GC.Spread.Sheets.UsedRangeType.style)
    
    // 插入足够的行
    targetSheet.addRows(fromRow, usedRange.rowCount)
    
    // 复制单元格值、样式和行高
    for (let r = usedRange.row; r < usedRange.row + usedRange.rowCount; r++) {
        targetSheet.setRowHeight(fromRow + r, t_sheet.getRowHeight(r))
        for (let c = usedRange.col; c < usedRange.col + usedRange.colCount; c++) {
            targetSheet.setValue(fromRow + r, c, t_sheet.getValue(r, c))
            targetSheet.setStyle(fromRow + r, c, t_sheet.getActualStyle(r, c))
        }
    }
    
    // 处理合并单元格
    let spans = t_sheet.getSpans()
    if (spans && spans.length) {
        spans.forEach(span => {
            targetSheet.addSpan(span.row + fromRow, span.col, span.rowCount, span.colCount)
        })
    }
    
    return usedRange
}
```

#### 列宽自适应处理

当数据区域列数超过模板列数时，动态插入列并复制样式：

```javascript
let diff = usedRange.col + usedRange.colCount - headerRange.colCount
if (diff > 0) {
    let insertFromColumn = 5
    sheet.addColumns(insertFromColumn, diff)
    
    // 为新插入的列应用样式
    for (let r = usedRange.row; r < usedRange.row + headerRange.rowCount; r++) {
        let style = sheet.getActualStyle(r, insertFromColumn + diff)
        for (let c = insertFromColumn + diff - 1; c >= insertFromColumn; c--) {
            sheet.setStyle(r, c, style)
        }
    }
    
    // 使用 moveTo 方法调整数据位置
    sheet.moveTo(
        usedRange.row + headerRange.row + headerRange.rowCount,
        insertFromColumn + diff,
        usedRange.row + headerRange.row + headerRange.rowCount,
        insertFromColumn,
        usedRange.rowCount,
        usedRange.colCount - insertFromColumn,
        GC.Spread.Sheets.CopyToOptions.all
    )
}
```

### 3.2 技术栈

* SpreadJS 17.0.8（核心表格控件）
* SpreadJS Designer 17.0.8（设计器组件）
* SystemJS 0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 使用本地服务器打开 index.html（如 Live Server）
```

### 4.2 操作步骤

1. 打开页面后，设计器会自动加载并显示一个 5x20 的测试数据区域
2. 在设计器中编辑中间区域的数据（可选）
3. 点击"复制头尾模板"按钮
4. 系统会自动在数据区域上方插入 header 模板，下方插入 footer 模板
5. 如果数据列数超过模板列数，会自动扩展列并保持样式一致

## 五、功能特点

### 5.1 优点

* **完整性**：不仅复制单元格值，还包括样式、行高、合并单元格等所有格式信息
* **灵活性**：支持任意位置插入模板，可根据数据区域动态调整
* **性能优化**：使用 `suspendPaint` 和 `resumePaint` 避免频繁重绘

### 5.2 局限性与扩展建议

* **列宽处理**：当前仅处理列数差异，未处理列宽自适应，可扩展为根据数据内容自动调整列宽
* **模板管理**：模板文件路径硬编码，可改为配置化管理多套模板
* **错误处理**：缺少对模板文件加载失败的处理，建议添加错误提示

## 六、关键代码片段

### 暂停和恢复绘制

在批量操作前后使用暂停/恢复绘制，提升性能：

```javascript
sheet.suspendPaint()
// 执行大量单元格操作
let headerRange = insertTemplate(tempSpread, sheet, "header", usedRange.row)
let usedRange2 = sheet.getUsedRange(GC.Spread.Sheets.UsedRangeType.all)
let footerRange = insertTemplate(tempSpread, sheet, "footer", usedRange2.row + usedRange2.rowCount)
sheet.resumePaint()
```

### 获取使用区域

使用 `getUsedRange` 获取工作表的实际使用范围，支持不同类型（数据、样式、全部）：

```javascript
let usedRange = sheet.getUsedRange(GC.Spread.Sheets.UsedRangeType.all)
let usedRange = t_sheet.getUsedRange(GC.Spread.Sheets.UsedRangeType.style)
```

## 七、总结

本示例展示了 SpreadJS 中模板复用的实用技巧，开发者可以学到：

* 如何加载和解析外部 .sjs 文件
* 如何批量复制单元格的值、样式和格式
* 如何处理合并单元格的复制
* 如何动态调整工作表结构（插入行列）
* 如何使用 `moveTo` 方法重新排列单元格区域

该方案适用于报表生成、文档模板管理等场景，通过预定义模板可显著提高开发效率和文档一致性。对于需要更复杂模板逻辑的场景，可结合数据绑定和公式功能进一步扩展。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
