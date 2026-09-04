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


/**
 * 需求：调整右键菜单显示位置
 * demo以表单保护为例，将表单保护右键菜单从表单名称区域调整到表格区域
 * 表单保护原本的visibleContext为TabStripSelected && !IsProtected
 * 修改为ClickViewport && !IsProtected
 */
let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))
let ptotectSheetComd = GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.ProtectSheet)
ptotectSheetComd.visibleContext = "ClickViewport && !IsProtected"
config.commandMap = {
    [GC.Spread.Sheets.Designer.CommandNames.ProtectSheet]:ptotectSheetComd
}

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", config)




