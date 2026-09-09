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


const SPINNERVAL = "spinnerVal"
let config = GC.Spread.Sheets.Designer.DefaultConfig
config.commandMap = {
	MySpinner: {
		title: "自定义功能",
		text: "微调器",
		bigButton: "true",
		commandName: "MySpinner",
		type: "spinner",
		commandOptions: {
			numberEditorOption: {
				min: -360,
				max: 360,
				step: 5,
			}
		},
		execute: function (context, propertyName, checked) {
			context.setData(SPINNERVAL, checked);
			let sheet = context.getWorkbook().getActiveSheet()
			let { row, col } = sheet.getSelections()[0]
			sheet.setTag(row, col, checked)
			let style = sheet.getStyle(row, col)
			style.textOrientation = context.getData(SPINNERVAL)
			sheet.setStyle(row, col, style)

		},
		getState: function (context, propertyName) {
			let sheet = context.getWorkbook().getActiveSheet()
			let { row, col } = sheet.getSelections()[0]
			let result = sheet.getTag(row, col)
			return result ? result : 0;
		}
	}
}

config.ribbon[0].buttonGroups.unshift({
	"label": "自定义功能",
	"thumbnailClass": "welcome",
	"commandGroup": {
		"children": [
			{
				"direction": "vertical",
				"commands": [
					"MySpinner"
				]
			}
		]
	}
});
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", config)

let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()
sheet.setValue(0, 0, "这是一段文字")
sheet.setRowHeight(0, 100)
sheet.setColumnWidth(0, 100)
let style = new GC.Spread.Sheets.Style()
style.hAlign = GC.Spread.Sheets.HorizontalAlign.center;
style.vAlign = GC.Spread.Sheets.VerticalAlign.center;
sheet.setStyle(0, 0, style)






