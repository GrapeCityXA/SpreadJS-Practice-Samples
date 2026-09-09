import * as GC from "@grapecity-software/spread-sheets";
/*
		这里声明了一个新的单元格类型
	*/
var spreadNS = GC.Spread.Sheets;
function ShowValueCellType() { }
/*
    新类型继承了SpreadJS原生的Text类型
*/
ShowValueCellType.prototype = new spreadNS.CellTypes.Text();
/*
		重写Text的paint方法
	*/
ShowValueCellType.prototype.paint = function (ctx, value, x, y, w, h, style, options) {
    //这里可以加入自己的业务逻辑，判断当内容属于不可见时，替换为*** 或其它字符
    if (value === null || value === undefined) {
        value = "-";
    }
    spreadNS.CellTypes.Base.prototype.paint.apply(this, [ctx, value, x, y, w, h, style, options]);
};

function initSpread(spread) {
    var sheet = spread.getSheet(0);
    sheet.suspendPaint();

    sheet.setRowCount(8);
    sheet.setColumnCount(10);

    sheet.setValue(0, 0, "值1", GC.Spread.Sheets.SheetArea.colHeader);
    sheet.setValue(0, 1, "值2", GC.Spread.Sheets.SheetArea.colHeader);
    sheet.setValue(0, 2, "值1+值2", GC.Spread.Sheets.SheetArea.colHeader);

    for (var i = 0; i < sheet.getRowCount() - 1; i++) {
        sheet.setValue(i, 0, i);
        sheet.setValue(i, 1, sheet.getRowCount() - i);
        var j = i + 1;
        sheet.setFormula(i, 2, "=A" + j + "+B" + j);
        sheet.setValue(i, 2, i + 1);
    }
    // 这是给整个表单设置单元格类型，实际上可以通过 sheet.setCellType更为灵活地设置到对应单元格上
    sheet.getRange(0, 0, sheet.getRowCount(), sheet.getColumnCount()).cellType(new ShowValueCellType());
    sheet.setFormula(7, 2, "=A8+B8");

    sheet.resumePaint();

};
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
initSpread(spread);