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
spread.setSheetCount(2);

let sheet = spread.getActiveSheet();
let sheet1 = spread.getSheet(1);

spread.setActiveSheetIndex(1)

let spreadNS = GC.Spread.Sheets;

let data = {
	name: 'Jones', region: 'East',
	sales: [
		{ orderDate: '1/6/2013', item: 'Pencil', units: 95 },
		{ orderDate: '4/1/2013', item: 'Binder', units: 60 },
		{ orderDate: '6/8/2013', item: 'Pen Set', units: 16 }
	]
};
let tableColumns = [],
	names = ['orderDate', 'item', 'units'],
	labels = ['orderDate', 'item', 'units'];
let table = sheet.tables.add('tableRecords', 0, 0, 4, 3);
table.autoGenerateColumns(false);
names.forEach(function (name, index) {
	let tableColumn = new GC.Spread.Sheets.Tables.TableColumn();
	tableColumn.name(labels[index]);
	tableColumn.dataField(name);
	tableColumns.push(tableColumn);
});

table.bindColumns(tableColumns);
table.bindingPath('sales');
let source = new GC.Spread.Sheets.Bindings.CellBindingSource(data);
sheet.setDataSource(source);

let myPivotTable = sheet1.pivotTables.add("myPivotTable", "tableRecords", 1, 1, GC.Spread.Pivot.PivotTableLayoutType.outline, GC.Spread.Pivot.PivotTableThemes.light8);
myPivotTable.suspendLayout();
myPivotTable.options.showRowHeader = true;
myPivotTable.options.showColumnHeader = true;
myPivotTable.add("orderDate", "OrderDate", GC.Spread.Pivot.PivotTableFieldType.rowField);
myPivotTable.add("item", "Item", GC.Spread.Pivot.PivotTableFieldType.rowField);
myPivotTable.resumeLayout();
myPivotTable.autoFitColumn();

document.getElementById("insertCol").addEventListener('click', function () {
	table.insertColumns(2, 1, true);
	let newdata = {
		name: 'Jones',
		region: 'East',
		sales: [{
			orderDate: '1/6/2013',
			item: 'Pencil',
			units: 95,
			cost: 1.99
		}, {
			orderDate: '4/1/2013',
			item: 'Binder',
			units: 60,
			cost: 4.99

		}, {
			orderDate: '6/8/2013',
			item: 'Pen Set',
			units: 16,
			cost: 15.99
		}]
	};
	let tableColumnNew = new spreadNS.Tables.TableColumn();
	tableColumnNew.name("cost");
	tableColumnNew.dataField("cost");
	tableColumns.push(tableColumnNew);

	table.bindColumns(tableColumns);
	table.bindingPath('sales');
	source = new GC.Spread.Sheets.Bindings.CellBindingSource(newdata);
	sheet.setDataSource(source);

	myPivotTable.updateSource()
	myPivotTable.add("cost", "Cost", GC.Spread.Pivot.PivotTableFieldType.valueField);

});

