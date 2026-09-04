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


let newInsertChartCommand = GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.InsertChart);
if (newInsertChartCommand) {
    var oldExecute = newInsertChartCommand.execute;
    newInsertChartCommand.execute = function (context, propertyName, args) {
        //添加confirm逻辑
        console.log("重写插入图表逻辑");
        // 判断当前选择区域的列数
        var activeSheet = context.getWorkbook().getActiveSheet();
        var sel = activeSheet.getSelections()[0];
        if (sel.colCount <= 2) {
            oldExecute.apply(this, arguments);
        } else {
            alert("数据大于两列，禁止插入");
        }
    }
}
let designerConfig = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig));
designerConfig.commandMap = {};
designerConfig.commandMap[GC.Spread.Sheets.Designer.CommandNames.InsertChart] = newInsertChartCommand;

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", designerConfig)
let spread = designer.getWorkbook()
spread.setSheetCount(1)
let sheet = spread.getActiveSheet()

sheet.setArray(0, 0, [
    ["产品", "月份", "价格", "销量"],
    ["牙刷", "1月", 5, 100],
    ["牙膏", "1月", 15, 20],
    ["洗洁精", "1月", 20, 150],
    ["毛巾", "1月", 15, 78],
])

