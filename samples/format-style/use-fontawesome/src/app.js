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


let resource = GC.Spread.Sheets.Designer.getResources()

resource.ribbon.fontFamilies['ff24'] = {
    name: "FontAwesome", text: "FontAwesome",
}
GC.Spread.Sheets.Designer.setResources(resource);

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()


sheet.setValue(3,3, "")
sheet.getRange(3,3).fontFamily("FontAwesome")
sheet.getRange(3,3).fontSize("26px")
sheet.getRange(3,3).foreColor("red")
sheet.setRowHeight(3, 40)