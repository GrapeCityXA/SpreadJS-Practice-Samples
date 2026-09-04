import * as GC from "@grapecity-software/spread-sheets";
/**
 * 不同工作薄之间同步筛选条件
 */

//创建两个工作薄并初始化
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let spread1 = new GC.Spread.Sheets.Workbook(document.getElementById("ss1"));
let sheet = spread.getActiveSheet();
let sheet1 = spread1.getActiveSheet();

sheet.setValue(0,0,1);
sheet.setValue(1,0,2);
sheet.setValue(2,0,3);
sheet.setValue(3,0,4);

sheet.setValue(0,1,4);
sheet.setValue(1,1,3);
sheet.setValue(2,1,2);
sheet.setValue(3,1,1);

sheet1.setValue(0,0,1);
sheet1.setValue(1,0,2);
sheet1.setValue(2,0,3);
sheet1.setValue(3,0,4);

sheet1.setValue(0,1,4);
sheet1.setValue(1,1,3);
sheet1.setValue(2,1,2);
sheet1.setValue(3,1,1);

//设置筛选列
var range = new GC.Spread.Sheets.Range(-1, 0, -1, 2);
sheet.rowFilter(new GC.Spread.Sheets.Filter.HideRowFilter(range));
sheet1.rowFilter(new GC.Spread.Sheets.Filter.HideRowFilter(range));

//点击按钮同步筛选条件
document.getElementById("button").onclick = function(){
	var filterItems = sheet.rowFilter().getFilterItems(0);
	if(filterItems.length > 0){
		for(var i=0;i<filterItems.length;i++){
			var filterItem = filterItems[i];
			sheet1.rowFilter().addFilterItem(0, filterItem);
		}
		sheet1.rowFilter().filter(0);
	}
}