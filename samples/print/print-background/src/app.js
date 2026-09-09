import * as GC from "@grapecity-software/spread-sheets";
import '@grapecity-software/spread-sheets-print';


// Title:打印背景
// Description：打印背景
// Tag:打印,背景

function WaterMarkCellType() {
    this.typeName = "WaterMarkCellType"
}
WaterMarkCellType.prototype = new GC.Spread.Sheets.CellTypes.Text();
WaterMarkCellType.prototype.paint = function (ctx, value, x, y, w, h, style, options) {
    //Paints a cell on the canvas. 
    var background = style.backgroundImage;
    style.backgroundImage = undefined;
    GC.Spread.Sheets.CellTypes.Text.prototype.paint.apply(this, arguments)
    GC.Spread.Sheets.CellTypes.Text.prototype.paint.call(this, ctx, undefined, x, y, w + 100, h + 100, {
        backgroundImage: background
    }, options)
};

// $(document).ready(function () {
    var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
    var sheet = spread.getActiveSheet();
    sheet.getCell(3, 3).cellType(new WaterMarkCellType()).backgroundImage('https://www.grapecity.com.cn/images/metalsmith/home/logo_spjs.png')

    sheet.setArray(2, 2, [
        [1, 2, 3, 4, 5, 6,],
        [1, 2, 3, 4, 5, 6,],
        [1, 2, 3, 4, 5, 6,],
        [1, 2, 3, 4, 5, 6,],
        [1, 2, 3, 4, 5, 6,],
        [1, 2, 3, 4, 5, 6,]
    ])

    $("#print").click(function () {
        debugger;
        spread.print();
    });
// });