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
import "@grapecity-software/spread-sheets-designer-resources-en"
import "@grapecity-software/spread-sheets-designer"



let fontSizeCommand = GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.FontSize)
let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig));
// 修改原命令
fontSizeCommand.dropdownList.unshift({
    text: "6",
    value: "6"
});
fontSizeCommand.dropdownList.unshift({
    text: "4",
    value: "4"
});
// 使新命令生效
if(!config.commandMap) {
    config.commandMap = {};
}
config.commandMap[GC.Spread.Sheets.Designer.CommandNames.FontSize] = fontSizeCommand;


let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", config)
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()
sheet.setValue(1,1,"请查看工具栏设置字号的下拉列表，新增了4号和6号字体的选项")
sheet.setValue(2,1,"过小的字体不一定能生效，这取决于浏览器的渲染逻辑")

