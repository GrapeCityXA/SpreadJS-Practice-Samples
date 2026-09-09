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

GC.Spread.Common.CultureManager.culture('zh-cn')

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")

let spread = designer.getWorkbook()


let defaultStyle = new GC.Spread.Sheets.Style()
defaultStyle.locked = false

// 修改所有sheet的默认样式
for (let i = 0; i < spread.getSheetCount(); i++) {
    let sheet = spread.getSheet(i)
    sheet.setDefaultStyle(defaultStyle)
    sheet.options.isProtected = true
}
// 监听表格切换，新建表格也设置默认样式
spread.bind(GC.Spread.Sheets.Events.ActiveSheetChanged, function (sender, args) {
    args.newSheet.setDefaultStyle(defaultStyle)
});

let style = new GC.Spread.Sheets.Style()
style.backColor = "#f0f0f0"
style.locked = true
spread.getActiveSheet().getRange(3,3,5,5).setStyle(style)
