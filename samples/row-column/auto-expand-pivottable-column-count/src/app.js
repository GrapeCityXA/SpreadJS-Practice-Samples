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

fetch("template.sjs").then(res => {
    return res.blob()
}).then(blob => {
    spread.open(blob, function() {
        let _sheet = spread.getActiveSheet()
        _sheet.defaults.colWidth = 100
        _sheet.setValue(0,0,"请选择数据透视表")
        _sheet.setValue(1, 0, "并在右侧面板勾选多于3个的字段")
        // 请注意，绑定事件的代码需要在打开模板之后执行
        spread.bind(GC.Spread.Sheets.Events.PivotTableChanged, function () {
        let sheet = spread.getActiveSheet()
        let all = sheet.pivotTables.all();
        all.forEach((element) => {
            let range = element.getRange();
            let lastColIndex = range.content.col + range.content.colCount;
            if (sheet.getColumnCount() < lastColIndex) {
                sheet.setColumnCount(sheet.getColumnCount() + (lastColIndex - sheet.getColumnCount()));
            }
        });
    });
    })
})

