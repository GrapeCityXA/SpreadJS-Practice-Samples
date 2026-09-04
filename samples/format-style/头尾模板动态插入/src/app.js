import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-excelio"
import "@grapecity-software/spread-sheets-charts"
import "@grapecity-software/spread-sheets-print"
import "@grapecity-software/spread-sheets-pdf"
import "@grapecity-software/spread-sheets-barcode"
import "@grapecity-software/spread-sheets-languagepackages"
import "@grapecity-software/spread-sheets-shapes"
import "@grapecity-software/spread-sheets-pivot-addon"
import "@grapecity-software/spread-sheets-designer-resources-en"
import "@grapecity-software/spread-sheets-designer"



let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()

for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 20; col++) {
        sheet.setValue(row, col, row + "_" + col)
    }
}

document.getElementById("btn1").addEventListener("click", function () {
    sheet = spread.getActiveSheet()
    let usedRange = sheet.getUsedRange(GC.Spread.Sheets.UsedRangeType.all)
    if (!usedRange) {
        return
    }

    let xhr = new XMLHttpRequest()
    xhr.open("get", "./header-footer.sjs")
    xhr.responseType = "blob"
    xhr.onloadend = function () {
        let tempSpread = new GC.Spread.Sheets.Workbook()
        tempSpread.open(this.response, function () {
            sheet.suspendPaint()

            let headerRange = insertTemplate(tempSpread, sheet, "header", usedRange.row)
            let usedRange2 = sheet.getUsedRange(GC.Spread.Sheets.UsedRangeType.all)
            let footerRange = insertTemplate(tempSpread, sheet, "footer", usedRange2.row + usedRange2.rowCount)

            let diff = usedRange.col + usedRange.colCount - headerRange.colCount
            if (diff > 0) {
                // 从哪里插入列
                let insertFromColumn = 5
                sheet.addColumns(insertFromColumn, diff)
                // 插入列后，处理样式问题
                for (let r = usedRange.row; r < usedRange.row + headerRange.rowCount; r++) {
                    let style = sheet.getActualStyle(r, insertFromColumn + diff)
                    for (let c = insertFromColumn + diff - 1; c >= insertFromColumn; c--) {
                        sheet.setStyle(r, c, style)
                    }
                }
                for (let r = usedRange.row + usedRange.rowCount + headerRange.rowCount; r < usedRange.row + usedRange.rowCount + headerRange.rowCount + footerRange.rowCount; r++) {
                    let style = sheet.getActualStyle(r, insertFromColumn + diff)
                    for (let c = insertFromColumn + diff - 1; c >= insertFromColumn; c--) {
                        sheet.setStyle(r, c, style)
                    }
                }
                // 插入后多出的空行移回来
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
            sheet.resumePaint()
        })
    }
    xhr.send()
})


function insertTemplate(tempSpread, targetSheet, templateType, fromRow) {
    let t_sheet = tempSpread.getSheetFromName(templateType)
    let usedRange = t_sheet.getUsedRange(GC.Spread.Sheets.UsedRangeType.style)
    targetSheet.addRows(fromRow, usedRange.rowCount)
    for (let r = usedRange.row; r < usedRange.row + usedRange.rowCount; r++) {
        // 设置行高
        targetSheet.setRowHeight(fromRow + r, t_sheet.getRowHeight(r))
        for (let c = usedRange.col; c < usedRange.col + usedRange.colCount; c++) {
            // 处理单元格的值和样式
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
