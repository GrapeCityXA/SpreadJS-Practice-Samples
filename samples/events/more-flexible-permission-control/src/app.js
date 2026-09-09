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

import AuthController from "./AuthController.js";


let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()
sheet.defaults.colWidth = 130
sheet.setValue(0, 0, "此Demo允许开发者对单元格做不同操作的权限控制")
sheet.setRowHeight(0, 60)
sheet.getCell(0, 0).vAlign(GC.Spread.Sheets.VerticalAlign.center)

sheet.setValue(1, 0, "此列禁止下拉填充")
sheet.setValue(1, 1, "此列禁止粘贴")
sheet.setValue(1, 2, "此列禁止直接编辑")
sheet.setArray(2, 0, [[1, 1, 1],[2, 2, 2], [3, 3, 3]])

let authContoller = new AuthController()
authContoller.register(spread, sheet, function (row, col, type) {
    if (col == 0) {
        return type != "DragFillBlock"
    } else if (col == 1) {
        return type != "ClipboardPasting"
    } else if (col == 2) {
        return type != "EditStarting"
    } else {
        return true
    }
})