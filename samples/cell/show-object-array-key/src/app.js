import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-excelio"
import "@grapecity-software/spread-sheets-charts"
import "@grapecity-software/spread-sheets-print"
import "@grapecity-software/spread-sheets-pdf"
import "@grapecity-software/spread-sheets-barcode"
import "@grapecity-software/spread-sheets-languagepackages"
import "@grapecity-software/spread-sheets-shapes"
import "@grapecity-software/spread-sheets-pivot-addon"
import "@grapecity-software/spread-sheets-designer-resources-en"
import "@grapecity-software/spread-sheets-designer"



let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()

// 传入要显示的对象数组的key
function ArrayCellType(key) {
    this.key = key
}
ArrayCellType.prototype = new GC.Spread.Sheets.CellTypes.Text()
let oldPaint = GC.Spread.Sheets.CellTypes.Text.prototype.paint
ArrayCellType.prototype.paint = function () {
    let arg = arguments
    if (arg[1] && Array.isArray(arg[1])) {
        arg[1] = arg[1].map(v => {
            return v[this.key]
        }).join(",")
    }
    oldPaint.apply(this, arg)
}

sheet.setCellType(0, 0, new ArrayCellType("name"))
sheet.setValue(0, 0, [{ name: "xxx", id: 3 }, { name: "yyy", id: 4 }])



let defaultStyle = sheet.getDefaultStyle()
defaultStyle.showEllipsis = true
sheet.setDefaultStyle(defaultStyle)

document.getElementById("btn").addEventListener("click", function () {
    let value = sheet.getValue(0, 0)
    document.getElementById("value").innerText = JSON.stringify(value)
})


