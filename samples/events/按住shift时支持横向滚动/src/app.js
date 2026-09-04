import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
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
let sheet = spread.getActiveSheet()
sheet.setColumnCount(200)

document.getElementById("vp_vp").addEventListener("wheel", function (arg) {
    let sheet = spread.getActiveSheet()
    if (arg.shiftKey) {
        let scrollValue = -arg.wheelDelta
        sheet.scroll(0, scrollValue)
    } else {
        let scrollValue = -arg.wheelDelta / 3
        sheet.scroll(scrollValue, 0)
    }
})




