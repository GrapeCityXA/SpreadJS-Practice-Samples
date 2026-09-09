import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-excelio"
import "@grapecity-software/spread-sheets-charts"
import "@grapecity-software/spread-sheets-print"
import "@grapecity-software/spread-sheets-pdf"
import "@grapecity-software/spread-sheets-barcode"
import "@grapecity-software/spread-sheets-languagepackages"
import "@grapecity-software/spread-sheets-shapes"
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"



let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()
sheet.setValue(1, 1, "GrapeCity")
sheet.setValue(2, 2, "SpreadJS")
let style = new GC.Spread.Sheets.Style()
style.backColor = "green"
sheet.setStyle(1, 1, style)


spread.bind(GC.Spread.Sheets.Events.ClipboardChanging, function (e, info) {
    if (info.copyData && info.copyData.html) {
        navigator.clipboard.write([new ClipboardItem({
            "text/html": new Blob([info.copyData.html], { type: "text/html" }),
            "text/plain": new Blob([info.copyData.text], { type: "text/plain" })
        })])
    }
})

