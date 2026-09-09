import * as GC from "@grapecity-software/spread-sheets";
/**
 * 自定义单元格实现鼠标悬浮单元格时，显示一个小图标
 */

let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
import img from "./img.js"
let src = img.src
//定义FigureCellType的构造函数
function FigureCellType() { }
//为其显式原型对象赋值为文本类型的单元格
FigureCellType.prototype = new GC.Spread.Sheets.CellTypes.Text()
//绘制单元格
FigureCellType.prototype.paint = function (ctx, value, x, y, width, height, style, context) {
    if (this._mouseEnter) {
        style.backgroundImage = src;
        x = x + width / 2 + 70 / 2;
        y = y + (height - 16) / 2;
        width = 16;
        height = 16;
        value = "";
    }
    GC.Spread.Sheets.CellTypes.Text.prototype.paint.apply(this, arguments);
}
//获取单元格类型的匹配信息
FigureCellType.prototype.getHitInfo = function (x, y, cellStyle, cellRect, context) {
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
FigureCellType.prototype.processMouseEnter = function (hitInfo) {
    this._mouseEnter = true;
    let sheet = hitInfo.sheet;
    sheet.repaint(new GC.Spread.Sheets.Rect(hitInfo.cellRect.x, hitInfo.cellRect.y, hitInfo.cellRect.width, hitInfo.cellRect.height));
}
//鼠标离开
FigureCellType.prototype.processMouseLeave = function (hitInfo) {
    this._mouseEnter = false;
    let sheet = hitInfo.sheet;
    sheet.repaint(new GC.Spread.Sheets.Rect(hitInfo.cellRect.x, hitInfo.cellRect.y, hitInfo.cellRect.width, hitInfo.cellRect.height));
}
var sheet = spread.getActiveSheet()
sheet.suspendPaint()
sheet.setColumnWidth(0, 150)
sheet.setRowHeight(0, 40)
sheet.setCellType(0, 0, new FigureCellType())
sheet.setValue(0, 0, 'Hello，金牌用户')
sheet.resumePaint()