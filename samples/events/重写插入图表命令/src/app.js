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




let newInsertChartCommand = GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.InsertChart);
if (newInsertChartCommand) {
  let oldExecute = newInsertChartCommand.execute;
  newInsertChartCommand.execute = function (context, propertyName, args) {
    //添加confirm逻辑
    console.log("重写插入图表逻辑"); // 判断当前选择区域的列数
    let activeSheet = context.getWorkbook().getActiveSheet();
    let sel = activeSheet.getSelections()[0];
    if (sel.colCount == 2) {
      oldExecute.call(this, context, propertyName, args);
    } else {
      alert("数据不为2列，禁止插入");
    }
  };
}

let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))

config.commandMap = {};
config.commandMap[GC.Spread.Sheets.Designer.CommandNames.InsertChart] = newInsertChartCommand;


let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", config)
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()

sheet.setValue(0, 0, "1. 选择任意2列/3列")
sheet.setValue(1, 0, "2. 点击上方的\"插入\" — \"图表\"")



