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



let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig));
config.commandMap = {};
let sortAZData = GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.SortAZData);
let oldSortAZExecute = sortAZData.execute;
sortAZData.execute = function (context, propertyName) {
	let activeSheet = context.getWorkbook().getActiveSheet();
	let flag = false;
	let selection = activeSheet.getSelections()[0];

	for (let i = selection.row; i < selection.row + selection.rowCount; i++) {
		if (selection.col > 0) {
			let valueLeft = activeSheet.getValue(i, selection.col - 1);
			if (valueLeft != null) {
				flag = true;
				break;
			}
		}
		if ((selection.col + selection.colCount) < activeSheet.getColumnCount()) {
			let valueRight = activeSheet.getValue(i, selection.col + selection.colCount);
			if (valueRight != null) {
				flag = true;
				break;
			}
		}

	}

	if (flag) {
		GC.Spread.Sheets.Designer.showMessageBox("发现在选定区域旁边还有数据。该数据未被选择，将不参与排序。", "提示", GC.Spread.Sheets.Designer.MessageBoxIcon.warning, function () {
			oldSortAZExecute.call(this, context, propertyName);
		});
	} else {
		oldSortAZExecute.call(this, context, propertyName);
	}
};
config.commandMap[GC.Spread.Sheets.Designer.CommandNames.SortAZData] = sortAZData;


let sortZAData = GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.SortZAData);
let oldSortZAExecute = sortZAData.execute;
sortZAData.execute = function (context, propertyName) {				
	let activeSheet = context.getWorkbook().getActiveSheet();
	let flag = false;
	let selection = activeSheet.getSelections()[0];

	for (let i = selection.row; i < selection.row + selection.rowCount; i++) {
		if (selection.col > 0) {
			let valueLeft = activeSheet.getValue(i, selection.col - 1);
			if (valueLeft != null) {
				flag = true;
				break;
			}
		}
		if ((selection.col + selection.colCount) < activeSheet.getColumnCount()) {
			let valueRight = activeSheet.getValue(i, selection.col + selection.colCount);
			if (valueRight != null) {
				flag = true;
				break;
			}
		}

	}

	if (flag) {
		GC.Spread.Sheets.Designer.showMessageBox("发现在选定区域旁边还有数据。该数据未被选择，将不参与排序。", "提示", GC.Spread.Sheets.Designer.MessageBoxIcon.warning, function () {
			oldSortZAExecute.call(this, context, propertyName);
		});
	} else {
		oldSortZAExecute.call(this, context, propertyName);
	}
};
config.commandMap[GC.Spread.Sheets.Designer.CommandNames.SortZAData] = sortZAData;


let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", config)
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()
sheet.setValue(1,1,"请选择黄色背景的区域，然后点击上方工具栏的\"数据\"-\"AZ排序\"测试")
sheet.setArray(3,3,[[1, null],[2, null],[3, null],[4, 9],[5, 8],[6, 7]])
let style = new GC.Spread.Sheets.Style()
style.backColor = "yellow"
sheet.getRange(3,3,6,1).setStyle(style)

