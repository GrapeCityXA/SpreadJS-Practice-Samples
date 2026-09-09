import * as GC from "@grapecity-software/spread-sheets";

GC.Spread.Sheets.CellTypes.Corner.prototype.paint = function (ctx, value, x, y, w, h, style, context) {
    if (!ctx) {
        return;
    }
    ctx.save();
    // draw inside the cell's boundary
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.beginPath();
    ctx.fillStyle = "orange";
    let size = 10;
    var dx = x + w / 2;
    var dy = y + h / 2;
    ctx.beginPath();
    var dig = Math.PI / 5 * 4;
    ctx.moveTo(dx + Math.sin(0 * dig) * size, dy + Math.cos(0 * dig) * size);
    for (var i = 1; i < 5; i++) {
        ctx.lineTo(dx + Math.sin(i * dig) * size, dy + Math.cos(i * dig) * size);
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}


new GC.Spread.Sheets.Workbook(document.getElementById("ss"));