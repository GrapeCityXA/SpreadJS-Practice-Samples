import * as GC from "@grapecity-software/spread-sheets";
/**
 * 目标：生成一个表格，每两列合并，同时绑定数据源
 * 思路：先生成一个m*2n大小的表格，然后逐行合并相邻的两个单元格，最后生成一个m*n列，每列都是2n宽度的表格。
 */
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
var sheet = spread.getActiveSheet();
//初始化数据源
var data = {
    name: 'Jones',  
    region: 'East',
    sales: [
	    { orderDate: '1/6/2013', item: 'Pencil', units: 95, cost: 1.99 },
    	{ orderDate: '4/1/2013', item: 'Binder', units: 60, cost: 4.99 },
	    { orderDate: '6/8/2013', item: 'Pen Set', units: 16, cost: 15.99 }
    ]};
// 初始化表头信息
var tableColumns = [], 
	names = ['orderDate', 'item', 'units', 'cost'],
	labels = ['Order Date', 'Item', 'Units', 'Cost'];
//生成一个名称为“tableRecords” 一行8列的Table。注意：表头数据只有4列，生成的表格有8列
var table = sheet.tables.add('tableRecords', 0, 0, 1, 8);
table.autoGenerateColumns(false);
//获取表格的全部区域
var range = table.range();
var row = range.row;
var col = range.col;
var colCount = range.colCount;
//构建表头数据对象
for(var i=0;i<colCount;i++){
   if(i%2 == 0){
	   var tableColumn = new GC.Spread.Sheets.Tables.TableColumn();
	   tableColumn.name(labels[i/2]);
	   tableColumn.dataField(names[i/2]);
	   tableColumns.push(tableColumn);
   }else{
	   var tableColumn = new GC.Spread.Sheets.Tables.TableColumn();
	   tableColumns.push(tableColumn);
   }
};
//绑定表头信息
table.bindColumns(tableColumns);	
//绑定数据源
table.bindingPath('sales');
var source = new GC.Spread.Sheets.Bindings.CellBindingSource(data);
sheet.setDataSource(source);

var datasourcelength = data.sales.length;
//根据数据源的数据量重新调整表格大小
sheet.tables.resize(table,new GC.Spread.Sheets.Range(row,col,datasourcelength+1,colCount));
//对于表格区域的每一行，合并相邻的两个单元格。即2n->n
for(var i=0;i<datasourcelength+1;i++){
	for(var j=0;j<colCount;j++){
		if(j%2==0){
			sheet.addSpan(i,j,1,2);
			var cell = sheet.getCell(i,j);
			cell.hAlign(GC.Spread.Sheets.HorizontalAlign.center);
			cell.vAlign(GC.Spread.Sheets.VerticalAlign.center);
		}
	}
}