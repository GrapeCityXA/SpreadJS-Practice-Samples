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

let template = GC.Spread.Sheets.Designer.getTemplate(GC.Spread.Sheets.Designer.TemplateNames.FileMenuPanelTemplate)
template.content[0].children[0].children[1].children[2].children[1].children[1].children[2].children.push({
    type: "CheckBox",
    bindingPath: "WhatEverName",
    text: "WhatEverText",
    visibleWhen: "WhatEverName===1"
})
template.content[0].children[0].children[1].children[2].children[1].children[1].children[2].children.forEach(v => {
    if(v.bindingPath != "button_export_excel" && v.type != "TextBlock") {
        v.enableWhen = "WhatEverName===1"
    }
})
GC.Spread.Sheets.Designer.registerTemplate(GC.Spread.Sheets.Designer.TemplateNames.FileMenuPanelTemplate, template)