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
import "@grapecity-software/spread-sheets-io"
import "@grapecity-software/spread-sheets-pivot-addon"
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"

/**
 * 需求场景：不需要使用工作表页签右键功能
 */
let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))
let sheetTabContext = [
            GC.Spread.Sheets.Designer.CommandNames.InsertSheet,
            GC.Spread.Sheets.Designer.CommandNames.DeleteSheet,
            GC.Spread.Sheets.Designer.CommandNames.SheetTabMoveOrCopy,
            GC.Spread.Sheets.Designer.CommandNames.ProtectSheet,
            GC.Spread.Sheets.Designer.CommandNames.UnprotectSheet,
            GC.Spread.Sheets.Designer.CommandNames.HideSheet,
            GC.Spread.Sheets.Designer.CommandNames.UnhideSheet,
            GC.Spread.Sheets.Designer.CommandNames.SheetTag,
            GC.Spread.Sheets.Designer.CommandNames.ChangeSheetTabPosition,
            GC.Spread.Sheets.Designer.CommandNames.ShowTabColor
        ]
for(let i=0;i<config.contextMenu.length;i++){
    if(sheetTabContext.indexOf(config.contextMenu[i]) > -1){
        config.contextMenu.splice(i,1)
        i--
    }
}

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container",config)


