import * as GC from "@grapecity-software/spread-sheets";
var spreadNS = GC.Spread.Sheets;
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
// 重写Base类型
var CustomBase = spreadNS.CellTypes.Base;

var oldPaint = spreadNS.CellTypes.Base.prototype.paint;

CustomBase.prototype.paint = function (context, value, x1, y1, a1, b1, style, ctx) {
    if (!context) {
        return;
    }
    if (this.showEffect) {
        context.save();
        let base = a1 > b1 ? b1 / 2 : a1 / 2;
        context.beginPath();
        context.moveTo(x1 + base, y1);
        context.lineTo(x1, y1 + base);
        context.lineTo(x1, y1);

        context.fillStyle = 'blue';
        context.fill();
        context.closePath();
        context.restore();
    }
    oldPaint.apply(this, [context, value, x1, y1, a1, b1, style, ctx]);
};
var sheet = spread.getSheet(0);
sheet.suspendPaint();

sheet.setRowHeight(0, 60);
sheet.setColumnWidth(0, 150);

var myCellType = new spreadNS.CellTypes.Text();


// 设置参数为true时画圈，不设置或设置false时恢复
myCellType.showEffect = true;

sheet.setCellType(0, 0, myCellType);

sheet.resumePaint();

$("#change").click(function () {
    myCellType = new spreadNS.CellTypes.Button();
    myCellType.showEffect = true;

    myCellType.text("Margin");
    myCellType.marginLeft(15);
    myCellType.marginTop(7);
    myCellType.marginRight(15);
    myCellType.marginBottom(7);

    sheet.setCellType(0, 0, myCellType);
});
