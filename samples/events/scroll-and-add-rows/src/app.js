import * as GC from "@grapecity-software/spread-sheets";
var spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'), {
    sheetCount: 1
});
  spread.options.scrollbarMaxAlign = true;
    spread.options.scrollbarShowMax = true;
    var sheet1 = spread.getActiveSheet();
    sheet1.getRange(5, 1, 1, 1).backColor('red')
    sheet1.bind(GC.Spread.Sheets.Events.TopRowChanged, function(sender, args) {
        var rowCount = sheet1.getRowCount();
        var bottomRow = sheet1.getViewportBottomRow(1);
        if (bottomRow == rowCount - 1) {
            if (rowCount < 10000) {
                sheet1.setRowCount(rowCount + 10);
            }
            if (rowCount > 200) {
                sheet1.getRange(rowCount, 1, 1, 1).backColor('red')
            }
        }
    });
