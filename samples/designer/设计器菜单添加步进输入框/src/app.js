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


let config =JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))
config.commandMap = {
	CustomTextOrientation: {
		title: "文字角度",
		text: "文字角度",
		bigButton: "true",
		commandName: "CustomTextOrientation",
		type: "spinner",
		commandOptions: {
			numberEditorOption: {
				min: -90,
				max: 90,
				step: 5,
			}
		},
		execute: function (context, propertyName, value) {
            let _spread = context.getWorkbook()
            let _sheet = _spread.getActiveSheet()
            _sheet.getSelections().forEach(sel => {
                _sheet.getRange(sel.row, sel.col, sel.rowCount, sel.colCount).textOrientation(value)
            })
		},
		getState: function (context, propertyName) {
			let _spread = context.getWorkbook()
            let _sheet = _spread.getActiveSheet()
            let row = _sheet.getActiveRowIndex()
            let col = _sheet.getActiveColumnIndex()
            let _style = _sheet.getStyle(row, col)
            if(!_style || !_style.textOrientation) {
                return 0
            }
            return _style.textOrientation
		}
	}
}
config.ribbon[0].buttonGroups.unshift({
	"label": "自定制区域",
	"commandGroup": {
		"children": [
			{
				"direction": "vertical",
				"commands": [
					"CustomTextOrientation"
				]
			}
		]
	}
});

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", config)
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()

sheet.setValue(1, 1, "请选中此单元格，并调整上方步进器数值")
sheet.setRowHeight(1, 250)
sheet.setColumnWidth(1, 250)


