import * as GC from "@grapecity-software/spread-sheets";


const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();

sheet.setValue(1, 1, 1)
sheet.setValue(2, 1, 2)
sheet.setValue(3, 1, 3)
sheet.setValue(4, 1, 4)
sheet.setValue(5, 1, 5)
sheet.setValue(6, 1, 6)
sheet.setValue(7, 1, 7)
sheet.rowFilter(new GC.Spread.Sheets.Filter.HideRowFilter(new GC.Spread.Sheets.Range(1,1,7,1)))
sheet.setValue(0, 5, "请在B列任意筛选后查看效果")

// 方式1：条件格式
// let style = new GC.Spread.Sheets.Style();
// style.backColor = "red";
// let ranges = [new GC.Spread.Sheets.Range(0, 0, 10, 5)];
// sheet.conditionalFormats.addFormulaRule("=ISODD(ROW(A1))", style, ranges);

// 方式2：背景色
setAltStyle(sheet)
sheet.bind(GC.Spread.Sheets.Events.RangeFiltered, function (e, info) {
    setAltStyle(sheet)
});
function setAltStyle(sheet) {
    sheet.suspendPaint()
    let i = 0
    for (let r = 0; r < sheet.getRowCount(); r++) {
        if (sheet.getRowVisible(r)) {
            i++;
            if (i % 2 == 0) {
                sheet.getRange(r, -1, 1, -1).backColor('#EEEEF8');
            } else {
                sheet.getRange(r, -1, 1, -1).backColor('white');
            }
        }
    }
    sheet.resumePaint()
}