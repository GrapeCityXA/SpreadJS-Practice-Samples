import * as GC from "@grapecity-software/spread-sheets";
GC.Spread.Common.CultureManager.culture('zh-cn');


var spreadNS = GC.Spread.Sheets;


function ShowValueCellType() {
}
ShowValueCellType.prototype = new spreadNS.CellTypes.Text();
ShowValueCellType.prototype.paint = function (ctx, value, x, y, w, h, style, options) {
    if (value && value._error === "#DIV/0!") {
        // 在这里改变值
        value = "我是错误值";
    }
    spreadNS.CellTypes.Text.prototype.paint.apply(this, [ctx, value, x, y, w, h, style, options]);
};
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
var sheet = spread.getSheet(0);
sheet.setColumnWidth(2, 100)
sheet.suspendPaint();

sheet.setRowCount(8);
sheet.setColumnCount(3);

sheet.setValue(0, 0, "值1", GC.Spread.Sheets.SheetArea.colHeader);
sheet.setValue(0, 1, "值2", GC.Spread.Sheets.SheetArea.colHeader);
sheet.setValue(0, 2, "值1/值2", GC.Spread.Sheets.SheetArea.colHeader);

for (var i = 0; i < sheet.getRowCount() - 1; i++) {

    sheet.setValue(i, 0, i);
    sheet.setValue(i, 1, 0);
    var j = i + 1;
    sheet.setFormula(i, 2, "=A" + j + "/B" + j);
}
sheet.setValue(3,1,2)
// 为整列添加自定义单元格类型
sheet.setCellType(-1, 2, new ShowValueCellType());
sheet.setFormula(7, 2, "=A8+B8");

sheet.resumePaint();

