import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-excelio"
import "@grapecity-software/spread-sheets-charts"
import "@grapecity-software/spread-sheets-print"
import "@grapecity-software/spread-sheets-resources-zh"
import "@grapecity-software/spread-sheets-pdf"
import "@grapecity-software/spread-sheets-barcode"
import "@grapecity-software/spread-sheets-languagepackages"
import "@grapecity-software/spread-sheets-shapes"
import "@grapecity-software/spread-sheets-pivot-addon"
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"


let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")

let spread = designer.getWorkbook()

spread.setSheetCount(1)

let sheet = spread.getActiveSheet()

sheet.setValue(0, 0, 'grapecity')
sheet.getRange(0, 0, 5, 5).backColor("yellow");



var printFn = GC.Spread.Sheets.Workbook.prototype.print;
GC.Spread.Sheets.Workbook.prototype.print = function () {
    this.suspendPaint();
    var paintfn = GC.Spread.Sheets.CellTypes.Base.prototype.paint;
    GC.Spread.Sheets.CellTypes.Base.prototype.paint = function (ctx, val, x, y, w, h, style, context) {
        let sheet = context.sheet, printInfo = sheet.printInfo();
        if (printInfo && printInfo.blackAndWhite() && style.backColor) {
            style.backColor = void 0;
        }
        paintfn.apply(this, arguments);
    }
    printFn.apply(this);
    GC.Spread.Sheets.CellTypes.Base.prototype.paint = paintfn;
    this.resumePaint();
}


document.getElementById("print").addEventListener("click", function () {
    let sheet = spread.getActiveSheet()
    let printInfo = new GC.Spread.Sheets.Print.PrintInfo()
    printInfo.blackAndWhite(true)
    sheet.printInfo(printInfo)
    spread.print(spread.getSheetIndex(sheet.name()))
})


