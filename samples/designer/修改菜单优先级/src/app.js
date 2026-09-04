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


// 在toolBarModeConfig 中，将插入函数按钮InsertFunction复制到了开始中，但是由于这个命令没有设置优先级，默认会被隐藏到...中
import './toolBarModeConfig.js'
// 通过给insertFunction修改visiblePriority优先级，将它显示出来
let insertFunction = GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.InsertFunction);
insertFunction.visiblePriority = 10;
toolBarModeConfig.commandMap = {};
toolBarModeConfig.commandMap[GC.Spread.Sheets.Designer.CommandNames.InsertFunction] = insertFunction;

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", toolBarModeConfig)

let spread = designer.getWorkbook()

spread.setSheetCount(5)

let sheet = spread.getActiveSheet()

sheet.setValue(0,0,'grapecity')





