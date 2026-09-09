import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-excelio"
import "@grapecity-software/spread-sheets-charts"
import "@grapecity-software/spread-sheets-print"
import "@grapecity-software/spread-sheets-resources-zh"
import "@grapecity-software/spread-sheets-pdf"
import "@grapecity-software/spread-sheets-barcode"
import "@grapecity-software/spread-sheets-languagepackages"
import "@grapecity-software/spread-sheets-shapes"
import "@grapecity-software/spread-sheets-pivot-addon"
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"
import "./template.js"


let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")

let spread = designer.getWorkbook()

spread.fromJSON(templateJSON);
var sheet = spread.getActiveSheet();
sheet.setRowCount(50)
sheet.setRowHeight(8, 30);
sheet.getRange(8, 2, 1, 4).vAlign(GC.Spread.Sheets.VerticalAlign.center);
sheet.getCell(8, 1).value("Detail").vAlign(GC.Spread.Sheets.VerticalAlign.center);

document.getElementById("bindData").onclick = function () {
    spread.suspendPaint();
    var source = new GC.Spread.Sheets.Bindings.CellBindingSource(data);
    sheet.setDataSource(source);

    var tables = sheet.tables.all();
    if (tables) {
        for (var i = 0; i < tables.length; i++) {
            copyTableStyle(sheet, tables[i])
        }
    }

    spread.resumePaint();
}


function copyTableStyle(sheet, table) {
    var range = table.dataRange();
    var rowHeight = sheet.getRowHeight(range.row);
    for (var i = 1; i < range.rowCount; i++) {
        // Copy Style
        sheet.copyTo(range.row + i - 1, range.col, range.row + i, range.col, 1, range.colCount, GC.Spread.Sheets.CopyToOptions.style);
        // Copy Formula
        sheet.copyTo(range.row + i - 1, range.col, range.row + i, range.col, 1, range.colCount, GC.Spread.Sheets.CopyToOptions.formula);
        // Copy Span
        sheet.copyTo(range.row + i - 1, range.col, range.row + i, range.col, 1, range.colCount, GC.Spread.Sheets.CopyToOptions.span);
        // Set Row Height
        sheet.setRowHeight(range.row + i, rowHeight);


        //copyCustomerTableRowHeader
        sheet.copyTo(range.row + i - 1, 0, range.row + i, 0, 1, range.col, GC.Spread.Sheets.CopyToOptions.style);
        sheet.copyTo(range.row + i - 1, 0, range.row + i, 0, 1, range.col, GC.Spread.Sheets.CopyToOptions.value);
    }



}




