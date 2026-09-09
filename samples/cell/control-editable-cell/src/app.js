import * as GC from "@grapecity-software/spread-sheets";

/**
 * 在编辑时，希望可以在单元格中有按钮控制当前单元格是否可以编辑，初次加载时默认不能修改，
 * 点击单元格中的某一按钮，可以变为可编辑状态，编辑完成之后点击按钮，变为不可编辑状态。
 */
let spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'))
let sheet = spread.getActiveSheet();
//自定义单元格
function ImageCellType() {
    //iconFlag用于判断按钮按钮图片的切换
    this.iconFlag = true
}

let rightImg = new Image()
rightImg.src = "http://pic.616pic.com/ys_b_img/00/03/91/mXAtKNBAvt.jpg"
let errorImg = new Image()
errorImg.src = "http://pic.616pic.com/ys_b_img/00/06/30/dqvvtBk82o.jpg"
//重新绘制更新表单内容
rightImg.onload = () => {
    sheet.repaint()
}
errorImg.onload = () => {
    sheet.repaint
}
//继承文本单元格
ImageCellType.prototype = new GC.Spread.Sheets.CellTypes.Text()
//绘制单元格时绘制图片
ImageCellType.prototype.paint = function (ctx, value, x, y, width, height, style, context) {
    GC.Spread.Sheets.CellTypes.Text.prototype.paint.apply(this, [ctx, value, x, y, width, height, style, context])
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(x, y)
    //切换图片显示
    if (this.iconFlag) {
        ctx.drawImage(rightImg, x + width - 20, y, 20, 20)
    } else {
        ctx.drawImage(errorImg, x + width - 20, y, 20, 20)
    }
    ctx.restore()
    return
}

//获取单元格类型的匹配信息
ImageCellType.prototype.getHitInfo = function (x, y, cellStyle, cellRect, context) {
    var info = {
        x: x,
        y: y,
        row: context.row,
        col: context.col,
        cellStyle: cellStyle,
        cellRect: cellRect,
        sheetArea: context.sheetArea
    };

    //命中目标区域
    if ((cellRect.x + cellRect.width - 20 < x) && (x < cellRect.x + cellRect.width) && (cellRect.y < y) && (y < cellRect.y + 20)) {
        info.isReservedLocation = true;
    }

    return info;
}

//鼠标移开时切换图标信息
ImageCellType.prototype.processMouseUp = function (hitInfo) {
    var sheet = hitInfo.sheet;
    var that = this;
    //点击单元格特定区域 切换图标显示
    if (sheet && hitInfo.isReservedLocation) {
        if (that.iconFlag) {
            that.iconFlag = false;
        } else {
            that.iconFlag = true;
        }
        //根据图标更新单元格锁定状态
        let cell = hitInfo.sheet.getCell(hitInfo.row, hitInfo.col);
        cell.locked(that.iconFlag);
        sheet.repaint();
        return true;
    }
    return false;
};
//应用自定义单元格并开启表单保护，禁止编辑操作
sheet.setCellType(0, 0, new ImageCellType());
sheet.options.isProtected = true;
sheet.setValue(0, 0, "葡萄城");
