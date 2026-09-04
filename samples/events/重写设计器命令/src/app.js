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


let mergeCenterCommand = GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.MergeCenter);
if (mergeCenterCommand) {
  let oldExecute = mergeCenterCommand.execute;
  mergeCenterCommand.execute = function (context, propertyName, args) {
    // 添加自己的逻辑
    alert("开始合并单元格")
    // 执行原本的逻辑
    oldExecute.apply(this, arguments);
  }
}
let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))
config.commandMap = config.commandMap || {}
config.commandMap[GC.Spread.Sheets.Designer.CommandNames.MergeCenter] = mergeCenterCommand;
designer.setConfig(config)