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

sheet.setValue(0, 0, 1)
sheet.setValue(1, 0, '1')
sheet.setFormula(2, 0, '=sum(1)')
sheet.getRange(0, 0, 3, 1).backColor('red')
spread.bind(GC.Spread.Sheets.Events.ClipboardPasting, (sender, args) => {
    console.log(args)
    // 取消默认的粘贴
    args.cancel = true
    // 从哪里获取数据
    args.fromRange
    // 数据粘贴到哪里
    args.cellRange

    for (let i = 0; i < args.fromRange.rowCount; i++) {
        for (let j = 0; j < args.fromRange.colCount; j++) {
            // 当前单元格如果有公式，获取公式，粘贴到目标区域，否则获取值粘贴到目标区域
            let sourceCell = spread.getActiveSheet().getCell(args.fromRange.row + i, args.fromRange.col + j)
            let formula = sourceCell.formula()
            let value = sourceCell.value()
            let destinationCell = spread.getActiveSheet().getCell(args.cellRange.row + i, args.cellRange.col + j)
            if (formula) {
                destinationCell.formula(formula)
            } else {
                destinationCell.value(value)
            }
        }
    }
})


