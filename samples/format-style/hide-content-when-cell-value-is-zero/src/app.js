import * as GC from "@grapecity-software/spread-sheets";
// Title：隐藏0
// Description：单元格内输入0时，0不显示
// Tag：隐藏0
GC.Spread.Common.CultureManager.culture('zh-cn');

var oldPaint = GC.Spread.Sheets.CellTypes.Text.prototype.paint;

GC.Spread.Sheets.CellTypes.Text.prototype.paint = function(ctx, value, x, y, w, h, style, context) {
    if (value === 0) {
        oldPaint.apply(this, [ctx, "", x, y, w, h, style, context])
    } else {
        oldPaint.apply(this, [ctx, value, x, y, w, h, style, context])
    }
}
$(document).ready(function() {
    var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"), {
        sheetCount: 2
    });

});