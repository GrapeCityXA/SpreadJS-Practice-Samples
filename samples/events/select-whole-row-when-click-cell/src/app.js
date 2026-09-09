import * as GC from "@grapecity-software/spread-sheets";
var spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'), {
    sheetCount: 1
});
var sheet = spread.getActiveSheet();


spread.bind(GC.Spread.Sheets.Events.CellClick,
    function (e, args) {
        var sheet = args.sheet,
            row = args.row,
            col = args.col;
        sheet.clearSelection()
        sheet.setActiveCell(row, col);
        sheet.addSelection(row, -1, 1, -1)
    });