import * as GC from "@grapecity-software/spread-sheets";

/**
 * 给表单的某个区域设置命名信息，获取命名信息显示到表单中
 */
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let sheet = spread.getActiveSheet();
sheet.setArray(0, 0, [
    ['ID', 'Phone Number', 'Address'],
    [1, '021-432378', 'Marbury Road'],
    [2, '021-432668', 'Chester Road'],
    [3, '021-432238', 'Gertt Road'],
    [4, '021-432533', 'Jnyliner Road'],
    [5, '021-432125', 'Approach Road'],
    [6, '021-432789', 'Jones Road']
]);
sheet.autoFitColumn(0);
sheet.autoFitColumn(1);
sheet.autoFitColumn(2);

let border = new GC.Spread.Sheets.LineBorder("blue", GC.Spread.Sheets.LineStyle.mediumDashed)
let style = new GC.Spread.Sheets.Style()
style.borderBottom = border
style.borderTop = border
style.borderLeft = border
style.borderRight = border
let range = sheet.getRange(5, 2, 7, 3)
range.setStyle(style)

// 在当前工作表sheet上定义名称为name1的命名空间
sheet.addCustomName("name1", "$C$6:$E$12", sheet.getActiveRowIndex(), sheet.getActiveColumnIndex(), "test1");
// 获取名称为name1的命名空间对象
let nameInfo = sheet.getCustomName("name1");
sheet.setValue(0, 4, "nameInfo:");
//根据nameinfo计算命名区域，并获取命名区域的内容,并在表单中回显
let row = nameInfo.getExpression().row;
sheet.setValue(1, 4, "row:" + row);
let col = nameInfo.getExpression().column;
sheet.setValue(2, 4, "col:" + col);
let rowCount = nameInfo.getExpression().endRow - nameInfo.getExpression().row + 1;
sheet.setValue(3, 4, "rowCount:" + rowCount);
let colCount = nameInfo.getExpression().endColumn - nameInfo.getExpression().column + 1;
sheet.setValue(4, 4, "colCount:" + rowCount);
// 获取区域内容（二维数组）

let nameData = sheet.getArray(row, col, rowCount, colCount);
sheet.setValue(14, 2, "nameData:" + JSON.stringify(nameData));
sheet.addSpan(14, 2, 6, 4)
sheet.getCell(14, 2).wordWrap(true)
