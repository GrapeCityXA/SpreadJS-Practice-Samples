import * as GC from "@grapecity-software/spread-sheets";
var spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'), {
    sheetCount: 1
});


var rangeSelector = new GC.Spread.Sheets.FormulaTextBox.FormulaTextBox(document.getElementById("ftb"), {
    rangeSelectMode: true,
    absoluteReference: false
});
rangeSelector.workbook(spread);

spread.options.scrollbarShowMax = false;


var sheet = spread.getActiveSheet()

sheet.setValue(0, 0, 1)
sheet.setValue(1, 0, 1)
sheet.setValue(2, 0, 1)
sheet.setValue(3, 0, 1)
sheet.setValue(4, 0, 2)
sheet.setValue(5, 0, 2)
sheet.setValue(6, 0, 2)
sheet.setValue(7, 0, 3)
sheet.setValue(8, 0, 4)
sheet.setValue(9, 0, 4)


sheet.setValue(0, 1, 11)
sheet.setValue(1, 1, 11)
sheet.setValue(2, 1, 12)
sheet.setValue(3, 1, 13)
sheet.setValue(4, 1, 21)
sheet.setValue(5, 1, 21)
sheet.setValue(6, 1, 22)
sheet.setValue(7, 1, 31)
sheet.setValue(8, 1, 41)
sheet.setValue(9, 1, 41)

sheet.setValue(0, 2, 1)
sheet.setValue(1, 2, 1)
sheet.setValue(2, 2, 1)
sheet.setValue(3, 2, 1)
sheet.setValue(4, 2, 1)
sheet.setValue(5, 2, 1)
sheet.setValue(6, 2, 1)
sheet.setValue(7, 2, 1)
sheet.setValue(8, 2, 1)
sheet.setValue(9, 2, 1)
// return
var rowCount = 10;
for (var col = 1; col >= 0; col--) {
    var start = 0,
        end = 0;
    var spanValue = sheet.getValue(0, col);
    for (var i = 1; i <= rowCount; i++) {
        var newRowValue = sheet.getValue(i, col);
        end = i;
        if (spanValue !== newRowValue) {
            if (end - start > 1) {
                sheet.addSpan(start, col, end - start, 1);
            }

            sheet.addRows(end, 1);
            if (col > 0) {
                sheet.copyTo(end - 1, 0, end, 0, 1, col, GC.Spread.Sheets.CopyToOptions.value);
            }
            sheet.setValue(end, col, "subTotal");
            sheet.setFormula(end, 2, "SUBTOTAL(109,C" + (start + 1) + ":C" + end + ")");
            sheet.rowOutlines.group(start, end - start);
            i++ , end++ , rowCount++;

            start = end;
            spanValue = newRowValue;
        }
    }
}