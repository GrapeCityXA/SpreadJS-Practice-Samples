import * as GC from "@grapecity-software/spread-sheets";


const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();

function ImageCellType() {
    this.iconFlag = true;
}
ImageCellType.prototype = new GC.Spread.Sheets.CellTypes.Text();
ImageCellType.prototype.paint = function (ctx, value, x, y, width, height, style, context) {
    GC.Spread.Sheets.CellTypes.Text.prototype.paint.apply(this, [ctx, value, x, y, width - 20, height, style, context]);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y);
    if (!this.iconFlag) {
        ctx.drawImage(rightImg, x + width - 20, y, 20, 20);
    } else {
        ctx.drawImage(errorImg, x + width - 20, y, 20, 20);
    }
    ctx.restore();
    return;
};

ImageCellType.prototype.getHitInfo = function (
    x,
    y,
    cellStyle,
    cellRect,
    context
) {
    var info = {
        x: x,
        y: y,
        row: context.row,
        col: context.col,
        cellStyle: cellStyle,
        cellRect: cellRect,
        sheetArea: context.sheetArea,
    };

    if (
        cellRect.x + cellRect.width - 20 < x &&
        x < cellRect.x + cellRect.width &&
        cellRect.y < y &&
        y < cellRect.y + 20
    ) {
        info.isReservedLocation = true;
    }

    return info;
};

ImageCellType.prototype.processMouseMove = function (hitInfo) {
    var sheet = hitInfo.sheet;
    var div = sheet.getParent().getHost();
    var canvasId = div.id + "vp_vp";
    var canvas = document.querySelectorAll("#" + canvasId)[0];
    if (sheet && hitInfo.isReservedLocation) {
        canvas.style.cursor = "pointer";
        return true;
    } else {
        canvas.style.cursor = "default";
    }
    return false;
};

ImageCellType.prototype.processMouseUp = function (hitInfo) {
    var sheet = hitInfo.sheet;
    var that = this;
    if (sheet && hitInfo.isReservedLocation) {
        if (that.iconFlag) {
            that.iconFlag = false;
        } else {
            that.iconFlag = true;
        }
        setTimeout(function () {
            var cell = hitInfo.sheet.getCell(hitInfo.row, hitInfo.col);
            cell.locked(that.iconFlag);
        }, 0);
        sheet.repaint();
        return true;
    }
    return false;
};



let rightImg = new Image(); //指定图片的URL
rightImg.src = "./assets/right.png";
let errorImg = new Image(); //指定图片的URL
errorImg.src = "./assets/wrong.png";
rightImg.onload = function () {
    sheet.repaint();
};
errorImg.onload = function () {
    sheet.repaint();
};



sheet.setCellType(0, 0, new ImageCellType());
sheet.options.isProtected = true;
sheet.setValue(0, 0, "葡萄城");
sheet.setColumnWidth(0, 100)
