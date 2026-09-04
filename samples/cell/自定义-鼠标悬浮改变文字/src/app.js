import * as GC from "@grapecity-software/spread-sheets";


let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));

function customCellType() { }

customCellType.prototype = new GC.Spread.Sheets.CellTypes.Text()

customCellType.prototype.paint = function (ctx, value, x, y, width, height, style, context) {
    if (this._mouseEnter) {
        let tag = context.sheet.getTag(context.row, context.col)
        if (tag) {
            arguments[1] = tag
            let style = new GC.Spread.Sheets.Style()
            style.foreColor = "red"
            arguments[6] = style
        }
    }
    GC.Spread.Sheets.CellTypes.Text.prototype.paint.apply(this, arguments);
}

//获取单元格类型的匹配信息
customCellType.prototype.getHitInfo = function (x, y, cellStyle, cellRect, context) {
    if (context) {
        return {
            x: x,
            y: y,
            row: context.row,
            col: context.col,
            cellRect: cellRect,
            cellStyle: cellStyle,
            sheetArea: context.sheetArea,
            isReservedLocation: true,
            sheet: context.sheet,
            context: context
        };
    }
    return null;
}
//鼠标进入
customCellType.prototype.processMouseEnter = function (hitInfo) {
    this._mouseEnter = true;
    let sheet = hitInfo.sheet;
    sheet.repaint(new GC.Spread.Sheets.Rect(hitInfo.cellRect.x, hitInfo.cellRect.y, hitInfo.cellRect.width, hitInfo.cellRect.height));
}
//鼠标离开
customCellType.prototype.processMouseLeave = function (hitInfo) {
    this._mouseEnter = false;
    let sheet = hitInfo.sheet;
    sheet.repaint(new GC.Spread.Sheets.Rect(hitInfo.cellRect.x, hitInfo.cellRect.y, hitInfo.cellRect.width, hitInfo.cellRect.height));
}

let sheet = spread.getActiveSheet()
sheet.getRange(-1, -1, -1, -1).cellType(new customCellType())
sheet.setValue(0, 0, 'Hello')
sheet.setTag(0, 0, "123")



