import * as GC from "@grapecity-software/spread-sheets";
let spreadNS = GC.Spread.Sheets;
function FivePointedStarCellType() {
    this.texts = ["1532.1", "233", "5555"];
    this._color = "orange";
    this._margin = 10;
}
FivePointedStarCellType.prototype = new spreadNS.CellTypes.Base();
FivePointedStarCellType.prototype.paint = function(ctx, value, x, y, w, h, style, options) {
    if (!ctx) {
        return;
    }
    ctx.save();
    var width = (w - 60) / 3;
    var height = (h - 60) / 3;
    var texts = this.texts;
    for (var i = 0; i < texts.length; i++) {
        ctx.rect(x + this._margin * (i + 1) + width * (i), y + this._margin, width, height);
        ctx.fillStyle = this._color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fill();

    }

    for (var i = 0; i < texts.length; i++) {
        ctx.fillStyle = "black";
        ctx.font = "20px 宋体";
        ctx.fillText(texts[i], x + this._margin * (i + 1) + width * (i) + width / 2, y + this._margin + height / 2);
    }

};

FivePointedStarCellType.prototype.getHitInfo = function(x, y, cellStyle, cellRect, context) {
    var info = {
        x: x,
        y: y,
        row: context.row,
        col: context.col,
        cellRect: cellRect,
        sheetArea: context.sheetArea,
        isReservedLocation: false,
        reservedLocation: -1
    };
    var width = (cellRect.width - 60) / 3;
    var height = (cellRect.height - 60) / 3;
    var margin = this._margin;
    var texts = this.texts;
    var startx = cellRect.x;
    var starty = cellRect.y;
    for (var i = 0; i < texts.length; i++) {
        if ((startx + margin * (i + 1) + width * i) <= x && x <= (startx + margin * (i + 1) + width * (i + 1))) {
            if (starty + margin <= y && y <= (starty + margin + width)) {
                info.reservedLocation = i + 1;
            }
        }
    }
    return info;
};

FivePointedStarCellType.prototype.processMouseDown = function(hitInfo) {
    if (hitInfo.reservedLocation == 1) {
        alert("first button");
    }
    if (hitInfo.reservedLocation == 2) {
        alert("second button");
    }
    if (hitInfo.reservedLocation == 3) {
        alert("third button");
    }
};


function initSpread(spread) {
    var sheet = spread.getSheet(0);
    sheet.suspendPaint();
    sheet.setColumnWidth(0, 400);
    sheet.setRowHeight(0, 200);
    var b1 = new FivePointedStarCellType();
    sheet.setCellType(0, 0, b1, GC.Spread.Sheets.SheetArea.viewport);
    sheet.resumePaint();

};


var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
initSpread(spread);
