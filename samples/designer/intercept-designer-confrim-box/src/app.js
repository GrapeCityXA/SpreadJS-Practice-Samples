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
import "@grapecity-software/spread-sheets-reportsheet-addon"
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"

import { getJson } from "./data.js";



let GeneratePages = GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.GeneratePages)

let oldF = GeneratePages.execute
GeneratePages.execute = function () {
   oldF.apply(this, arguments).then(function() {
        let curReportSheet = spread.getActiveSheet()
        let name = curReportSheet.name().split("-")[0]
        spread.sheets.forEach(s => {
            let n = s.name()
            if (n.indexOf(name) == 0) {
                s.name(n + "自定义内容")
            }
        })
   })
}

let designerConfig = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig));
designerConfig.commandMap = {};
designerConfig.commandMap[GC.Spread.Sheets.Designer.CommandNames.GeneratePages] = GeneratePages;

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", designerConfig)

let spread = designer.getWorkbook()
spread.fromJSON(JSON.parse(getJson()))



