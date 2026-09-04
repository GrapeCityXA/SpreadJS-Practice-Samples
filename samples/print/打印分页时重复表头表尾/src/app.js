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
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"

import { file } from "./data.js";


let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
let spread = designer.getWorkbook()
spread.fromJSON(file)
/**
 * 该文件以sheet1为例，打印时，头部重复前三行，尾部重复后三行
 */
let aimSpread = new GC.Spread.Sheets.Workbook()     //创建的副本spread，用来执行对源文件添加固定行尾的逻辑

const adjustReportEndRow = (aimSpread, endRowCount) => {
    //以第一个sheet为例，测试第一张Sheet的固定行尾
    let sheet = aimSpread.getSheet(0)
    /**获取第一张sheet的分页信息，可以拿到当前sheet打印时分为几页，每页的其实行数和列数
     * 
     * **/
    let pageInfo = aimSpread.pageInfo(0)
    //从该sheet当前打印第一列开始处理，添加固定行尾
    let pageIndex = 0
    let endRowTotalHeight = 0, endRowHeight = []
    for (let i = 0; i < endRowCount; i++) {
        // 获取固定行尾每行的高度和所有行高度
        endRowHeight[i] = sheet.getRowHeight(sheet.getRowCount() - i - 1)
        endRowTotalHeight += endRowHeight[i]
    }
    while (pageIndex < pageInfo.pages.length - 1) {
        let range = pageInfo.pages[pageIndex]
        let pageEndRowTotalHeight = 0, lastRow = range.row + range.rowCount - 1
        while (true) {
            // 计算添加固定行尾，需要移动的行数量
            pageEndRowTotalHeight += sheet.getRowHeight(lastRow)
            if (pageEndRowTotalHeight >= endRowTotalHeight) {
                break
            }
            lastRow--
        }
        sheet.addRows(lastRow, endRowCount)
        sheet.setRowPageBreak(lastRow + endRowCount, true)
        for (let i = 0; i < endRowCount; i++) {
            sheet.setRowHeight(lastRow + endRowCount - i - 1, endRowHeight[i])
        }
        // 将固定尾部添加到对应sheet上计算出来的动态位置
        sheet.copyTo(sheet.getRowCount() - endRowCount, -1, lastRow, -1, endRowCount, -1, GC.Spread.Sheets.CopyToOptions.all)
        let printInfoRowEnd = sheet.printInfo().rowEnd()
        if (printInfoRowEnd > 0) {
            sheet.printInfo().rowEnd(printInfoRowEnd + endRowCount)
        }
        // 更新调整完后的打印信息
        pageInfo = aimSpread.pageInfo(0)
        pageIndex++
    }
}
document.getElementById("print").onclick = () => {
    aimSpread.suspendPaint()
    aimSpread.fromJSON(JSON.parse(JSON.stringify(spread.toJSON())))
    adjustReportEndRow(aimSpread, 3)
    aimSpread.resumePaint()
    aimSpread.print()
}


