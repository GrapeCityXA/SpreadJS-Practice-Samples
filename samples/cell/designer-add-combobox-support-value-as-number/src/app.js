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

// V18版本已原生支持，不需要以下代码
spread.bind(GC.Spread.Sheets.Events.CellChanged, function (e, info) {
    if (info.propertyName != "[styleinfo]") {
        return
    }
    if (info.newValue && info.newValue.cellType instanceof GC.Spread.Sheets.CellTypes.ComboBox) {
        info.sheet.suspendEvent()
        let comboBox = info.sheet.getCellType(info.row, info.col)
        comboBox.items(comboBox.items().map(v => {
            if (!isNaN(Number(v.value))) {
                v.value = Number(v.value)
            }
            return v
        }))
        info.sheet.setCellType(info.row, info.col, comboBox)
        info.sheet.resumeEvent()
    }
});

sheet.setValue(1, 1, 1)
sheet.setValue(2, 2, 2)