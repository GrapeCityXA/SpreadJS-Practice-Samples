import * as GC from "@grapecity-software/spread-sheets";


const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();
sheet.setValue(1, 1, "当选择的单元格数量超过100时，Ctrl C 复制不会成功")

let oldExecute = GC.Spread.Sheets.Commands.copy.execute;
GC.Spread.Sheets.Commands.copy.execute = function (context, options) {
    let sheet = context.getSheetFromName(options.sheetName);
    let selections = sheet.getSelections();
    let count = 0;
    for (let range of selections) {
        let rowCount = range.rowCount;
        if (range.row === -1) {
            rowCount = sheet.getRowCount();
        }
        let colCount = range.colCount;
        if (range.col === -1) {
            colCount = sheet.getColumnCount();
        }
        count += rowCount * colCount;
    }
    if (count > 100) {
        alert("复制失败，单元格数量过多")
        throw new Error("Copy too many cells maybe very slow.")
    }
    return oldExecute(context, options);
};