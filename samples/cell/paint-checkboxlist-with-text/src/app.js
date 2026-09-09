import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-print"
import "@grapecity-software/spread-sheets-pdf"
import "@grapecity-software/spread-sheets-barcode"
import "@grapecity-software/spread-sheets-languagepackages"
import "@grapecity-software/spread-sheets-shapes"
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"



let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()

let checkboxlist = new GC.Spread.Sheets.CellTypes.CheckBoxList()
checkboxlist.items([
    { text: "中文", value: "cn" },
    { text: "英文", value: "en" },
    { text: "韩文", value: "kr" },
])

sheet.setCellType(0, 0, checkboxlist)
sheet.setColumnWidth(0, 200)


let checkBoxListPaint = GC.Spread.Sheets.CellTypes.CheckBoxList.prototype.paintValue
GC.Spread.Sheets.CellTypes.CheckBoxList.prototype.paintValue = function (ctx, value, x, y, w, h, style, context) {
    let _sheet = context.sheet
    if (style.locked && _sheet.options.isProtected) {
        let items = style.cellType._items
        let _value = []
        if (value && Array.isArray(value)) {
            _value = value
        }
        let str = items.filter(v => {
            return _value.indexOf(v.value) > -1
        }).map(v => {
            return v.text
        }).join(",")
        GC.Spread.Sheets.CellTypes.Text.prototype.paintValue.apply(this, [ctx, str, x, y, w, h, style, context]);
    }
    else {
        checkBoxListPaint.apply(this, arguments)
    }
}



