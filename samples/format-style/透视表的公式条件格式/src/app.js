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
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"


let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()

fetch("template.sjs").then(res => {
    return res.blob()
}).then(blob => {
    spread.open(blob, afterOpen)
})

function afterOpen() {
    let sheet = spread.getActiveSheet();
    let style = new GC.Spread.Sheets.Style();
    style.backColor = "red";
    sheet.conditionalFormats.addFormulaRule(
        "=AND(GETPIVOTDATA(\"quantity\",$A$3,\"salesperson\",A5,\"car\",\"Audi\")>20,GETPIVOTDATA(\"quantity\",$A$3,\"salesperson\",A5,\"car\",\"BMW\")>20)",
        style,
        [new GC.Spread.Sheets.Range(4, 0, 5, 1)]
    );
}



