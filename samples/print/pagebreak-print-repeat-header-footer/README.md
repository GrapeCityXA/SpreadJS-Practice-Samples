## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现打印分页时同时重复表头和表尾的功能。通过动态计算每页的高度和行数,在适当位置插入固定行尾,确保每一页打印时都能显示完整的表头和表尾信息,适用于合同、报表等需要在每页保持统一格式的文档打印场景。 

## 二、解决的问题

在实际业务中,打印多页文档时常常需要在每页重复显示表头和表尾信息,例如:

* 合同文档需要在每页底部显示签名栏和日期栏
* 财务报表需要在每页显示页眉和页脚的统计信息
* 法律文件需要在每页保持统一的格式规范

SpreadJS 原生支持通过 `printInfo().repeatRowStart()` 和 `repeatRowEnd()` 设置重复表头,但对于动态重复表尾的需求,需要通过计算分页信息并动态插入行的方式实现。

## 三、实现思路

### 3.1 核心技术点

#### 获取分页信息

使用 `pageInfo()` 方法获取当前工作表的分页详情,包括总页数和每页的起始行列信息:

```javascript
let pageInfo = aimSpread.pageInfo(0)
```

该方法返回的 `pageInfo.pages` 数组包含每页的 `row`、`col`、`rowCount`、`colCount` 等信息,是计算固定行尾插入位置的基础。

#### 计算固定行尾高度

遍历需要固定的尾部行,累加计算总高度:

```javascript
let endRowTotalHeight = 0, endRowHeight = []
for (let i = 0; i < endRowCount; i++) {
    endRowHeight[i] = sheet.getRowHeight(sheet.getRowCount() - i - 1)
    endRowTotalHeight += endRowHeight[i]
}
```

这里 `endRowCount` 为 3,表示固定最后 3 行作为表尾。

#### 动态插入固定行尾

针对每一页(除最后一页),从页尾向上累加行高,找到需要移动的行位置:

```javascript
let pageEndRowTotalHeight = 0, lastRow = range.row + range.rowCount - 1
while (true) {
    pageEndRowTotalHeight += sheet.getRowHeight(lastRow)
    if (pageEndRowTotalHeight >= endRowTotalHeight) {
        break
    }
    lastRow--
}
```

然后在该位置插入固定行尾:

```javascript
sheet.addRows(lastRow, endRowCount)
sheet.setRowPageBreak(lastRow + endRowCount, true)
for (let i = 0; i < endRowCount; i++) {
    sheet.setRowHeight(lastRow + endRowCount - i - 1, endRowHeight[i])
}
sheet.copyTo(sheet.getRowCount() - endRowCount, -1, lastRow, -1, endRowCount, -1, GC.Spread.Sheets.CopyToOptions.all)
```

#### 更新打印范围

如果设置了打印范围的 `rowEnd`,需要相应增加行数:

```javascript
let printInfoRowEnd = sheet.printInfo().rowEnd()
if (printInfoRowEnd > 0) {
    sheet.printInfo().rowEnd(printInfoRowEnd + endRowCount)
}
```

### 3.2 UI 交互流程

用户点击"固定尾打印"按钮 → 创建副本工作簿 → 调用 `adjustReportEndRow()` 处理固定行尾 → 执行打印

### 3.3 技术栈

* SpreadJS 17.1.6
* SpreadJS Designer 17.1.6
* SpreadJS Print 17.1.6

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件。

### 4.2 操作步骤

1. 打开页面后,会自动加载一个房屋租赁合同示例
2. 点击页面顶部的"固定尾打印"按钮
3. 系统会自动处理分页并弹出打印预览窗口
4. 在打印预览中可以看到每页都重复显示了最后 3 行的签名和日期信息

## 五、功能特点

### 5.1 优点

* 自动计算分页位置,无需手动设置
* 支持任意行数的固定表尾
* 保持原始数据不变,通过副本工作簿处理
* 适配不同的行高和页面设置

### 5.2 局限性与扩展建议

* 当前示例仅处理第一个工作表,如需处理多个工作表需要循环调用
* 固定行尾的行数硬编码为 3,可以改为参数化配置
* 可以扩展支持固定列尾的场景

## 六、关键代码片段

完整的固定行尾处理函数:

```javascript
const adjustReportEndRow = (aimSpread, endRowCount) => {
    let sheet = aimSpread.getSheet(0)
    let pageInfo = aimSpread.pageInfo(0)
    let pageIndex = 0
    let endRowTotalHeight = 0, endRowHeight = []
    
    // 计算固定行尾总高度
    for (let i = 0; i < endRowCount; i++) {
        endRowHeight[i] = sheet.getRowHeight(sheet.getRowCount() - i - 1)
        endRowTotalHeight += endRowHeight[i]
    }
    
    // 遍历每一页(除最后一页)
    while (pageIndex < pageInfo.pages.length - 1) {
        let range = pageInfo.pages[pageIndex]
        let pageEndRowTotalHeight = 0, lastRow = range.row + range.rowCount - 1
        
        // 计算需要移动的行数
        while (true) {
            pageEndRowTotalHeight += sheet.getRowHeight(lastRow)
            if (pageEndRowTotalHeight >= endRowTotalHeight) {
                break
            }
            lastRow--
        }
        
        // 插入固定行尾
        sheet.addRows(lastRow, endRowCount)
        sheet.setRowPageBreak(lastRow + endRowCount, true)
        for (let i = 0; i < endRowCount; i++) {
            sheet.setRowHeight(lastRow + endRowCount - i - 1, endRowHeight[i])
        }
        sheet.copyTo(sheet.getRowCount() - endRowCount, -1, lastRow, -1, endRowCount, -1, GC.Spread.Sheets.CopyToOptions.all)
        
        // 更新打印范围
        let printInfoRowEnd = sheet.printInfo().rowEnd()
        if (printInfoRowEnd > 0) {
            sheet.printInfo().rowEnd(printInfoRowEnd + endRowCount)
        }
        
        pageInfo = aimSpread.pageInfo(0)
        pageIndex++
    }
}
```

## 七、总结

本示例展示了 SpreadJS 中实现打印分页时重复表头表尾的完整方案。开发者可以从中学到:

* 如何使用 `pageInfo()` 获取分页信息
* 如何动态计算行高和插入位置
* 如何使用 `copyTo()` 复制单元格内容和样式
* 如何设置分页符和更新打印范围

该方案适用于需要在每页保持统一格式的文档打印场景,具有良好的扩展性,可以根据实际需求调整固定行数和处理逻辑。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
