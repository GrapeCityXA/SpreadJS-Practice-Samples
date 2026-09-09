import * as GC from "@grapecity-software/spread-sheets";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();

sheet.setValue(0, 0, false);
sheet.setArray(1, 0, [
    [0.1, 0.1, 0.1, 0.1, 0.1, 0.1], 
    [0.2, 0.2, 0.2, 0.2, 0.2, 0.2], 
    [0.3, 0.3, 0.3, 0.3, 0.3, 0.3], 
    [0.4, 0.4, 0.4, 0.4, 0.4, 0.4], 
    [0.5, 0.5, 0.5, 0.5, 0.5, 0.5], 
    [0.6, 0.6, 0.6, 0.6, 0.6, 0.6]
]);

var style = new GC.Spread.Sheets.Style();
style.formatter = '0.00%';
sheet.conditionalFormats.addFormulaRule('=Sheet1!$A$1=TRUE', style, [new GC.Spread.Sheets.Range(1, 0, 6, 6)]);

document.getElementById('percentageBtn').addEventListener('click', function() {
    if (sheet.getValue(0, 0)) {
        sheet.setValue(0, 0, false);
        this.textContent = '切换为百分比格式';
    } else {
        sheet.setValue(0, 0, true);
        this.textContent = '还原';
    }
});