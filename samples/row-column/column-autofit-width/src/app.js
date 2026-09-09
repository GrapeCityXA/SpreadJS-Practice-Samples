import * as GC from "@grapecity-software/spread-sheets";
// Title：根据内容自适应列宽
// Description：根据内容自适应列宽
// Tag：自适应列宽
GC.Spread.Common.CultureManager.culture('zh-cn');

// $(document).ready(function() {

var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"), {
    sheetCount: 3
});
var sheet = spread.getActiveSheet();
sheet.bind(GC.Spread.Sheets.Events.EditEnded, function (sender, args) {
    sheet.autoFitColumn(args.col);
});
// });