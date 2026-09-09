import * as GC from "@grapecity-software/spread-sheets";
/**
 * 单元格中输入数据时，若按下回车键，实现换行
 */
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
var sheet = spread.getActiveSheet();
sheet.bind(GC.Spread.Sheets.Events.ValueChanged, function(e, info) {
    console.log(info)
    sheet.getRange(info.row, info.col, 1, 1, GC.Spread.Sheets.SheetArea.viewport).wordWrap(true);
    console.log(sheet.getRange(info.row, info.col, 1, 1, GC.Spread.Sheets.SheetArea.viewport))
    sheet.autoFitRow(info.row);
})