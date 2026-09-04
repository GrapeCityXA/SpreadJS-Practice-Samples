import * as GC from "@grapecity-software/spread-sheets";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();

function customCellType() { }
// 继承Text类型
customCellType.prototype = new GC.Spread.Sheets.CellTypes.Text()
customCellType.prototype.processMouseEnter = function (hitinfo) {
    let enter = specialRange.intersect(hitinfo.row, hitinfo.col, 1, 1)
    if(hasEnter == enter) {
        return
    }
    hasEnter = enter
    let cellRange = hitinfo.sheet.getRange(specialRange.row, specialRange.col, specialRange.rowCount, specialRange.colCount)
    if(enter) {
        cellRange.setStyle(specialStyle)
    } else {
        cellRange.setStyle(defaultStyle)
    }
}

customCellType.prototype.getHitInfo = function (x, y, cellStyle, cellRect, context) {
    return {
        row: context.row,
        col: context.col
    }
}

let specialRange = new GC.Spread.Sheets.Range(0, 0, 10, 10)
// 记录是否进入了区域
let hasEnter = false

let border = new GC.Spread.Sheets.LineBorder("#dddddd", GC.Spread.Sheets.LineStyle.thin);
let defaultStyle = sheet.getDefaultStyle()
defaultStyle.cellType = new customCellType()
defaultStyle.borderTop = border
defaultStyle.borderRight = border
defaultStyle.borderBottom = border
defaultStyle.borderLeft = border
sheet.setDefaultStyle(defaultStyle)

let specialStyle = new GC.Spread.Sheets.Style()
specialStyle.cellType = new customCellType()
specialStyle.backColor = "#ecf5ff"
specialStyle.borderTop = border
specialStyle.borderRight = border
specialStyle.borderBottom = border
specialStyle.borderLeft = border