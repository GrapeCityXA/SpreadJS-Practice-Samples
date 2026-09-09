import * as GC from "@grapecity-software/spread-sheets";
//Title: 分散对齐单元格
//Description：单元格内文本分散对齐
//Tag：分散对齐，单元格

GC.Spread.Common.CultureManager.culture('zh-cn');
var spreadNS = GC.Spread.Sheets;
//Custom Cell Type
function CustomCellType() {
    this.typeName = "CustomCellType"
}
CustomCellType.prototype = new spreadNS.CellTypes.Text();
CustomCellType.prototype.paint = function(ctx, value, x, y, w, h, style, options) {
    if (!ctx) {
        return;
    }
    GC.Spread.Sheets.CellTypes.Text.prototype.paint.call(this, ctx, "", x, y, w, h, style, options);
    if (value) {
        ctx.save();
        ctx.font = style.font;
        ctx.fillStyle = style.foreColor;

        var charLength = value.length;
        var valueWidth = ctx.measureText(value).width;
        var charWidth = valueWidth / charLength;
        var spaceWidth = (w - valueWidth) / (charLength - 1);

        //字符宽度比单元格宽，默认方式展示
        if (valueWidth > w) {
            GC.Spread.Sheets.CellTypes.Text.prototype.paint.call(this, ctx, value, x, y, w, h, style, options);
        } else {
            ctx.textAlign = "start";
            ctx.textBaseline = "middle";

            for (var i = 0; i < charLength; i++) {
                ctx.fillText(value[i], x + (charWidth + spaceWidth) * i, y + h / 2);
            }
        }
        ctx.restore();
    }
};
function initSpread(spread) {
    var sheet = spread.getSheet(0);
    sheet.suspendPaint();

    sheet.setColumnWidth(1, 200);
    sheet.setRowHeight(1, 45);
    var cellType = new CustomCellType();

    sheet.getCell(1, 1).cellType(cellType).value("举杯邀明月")
        .font("30px 微软雅黑").foreColor("red")

    sheet.resumePaint();
};
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
    initSpread(spread)