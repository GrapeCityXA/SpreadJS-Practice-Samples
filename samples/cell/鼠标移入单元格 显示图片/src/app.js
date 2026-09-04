import * as GC from "@grapecity-software/spread-sheets";
 var spreadNS = GC.Spread.Sheets;
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
import { img as src } from "./img.js"

function SortHearderCellType() {
    this.pars = {};
}
SortHearderCellType.prototype = new spreadNS.CellTypes.Text();
SortHearderCellType.prototype.paint = function (ctx, value, x, y, width, height, style, context) {
    spreadNS.CellTypes.Text.prototype.paint.apply(this, arguments);
    if (this.pars[context.row + "." + context.col]) {
        style.backgroundImage = src;
        x = x + width / 2 + 70 / 2;
        y = y + (height - 16) / 2;
        width = 16;
        height = 16;
        value = "";
        spreadNS.CellTypes.Text.prototype.paint.apply(this, arguments);
    }
}
SortHearderCellType.prototype.getHitInfo = function (x, y, cellStyle, cellRect, context) {
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
//点击列头排序
//鼠标抬起

//鼠标移动
SortHearderCellType.prototype.processMouseEnter = function (hitInfo) {
    // this._mouseEnter = true;
    this.pars[hitInfo.row + "." + hitInfo.col] = true;
    var sheet = hitInfo.sheet;
    sheet.repaint();
}
//鼠标离开
SortHearderCellType.prototype.processMouseLeave = function (hitInfo) {
    // this._mouseEnter = false;
    this.pars[hitInfo.row + "." + hitInfo.col] = false;
    var sheet = hitInfo.sheet;
    sheet.repaint();
}


var rowCount = 50,
    columnCount = 20;

var sheet = spread.getSheet(0);
var columnInfo = [{
    name: 'result',
    cellType: new SortHearderCellType(),
    size: 200
},]
var source = [{
    data: ''
},
{
    data: ''
},
{
    data: ''
},
{
    data: ''
},
{
    data: ''
},
{
    data: ''
},
{
    data: ''
},
{
    data: ''
},
{
    data: ''
},
{
    data: ''
}
]
sheet.setDataSource(source);
sheet.bindColumns(columnInfo);