import * as GC from "@grapecity-software/spread-sheets";

var spreadNS = GC.Spread.Sheets;
var spread = new spreadNS.Workbook(document.getElementById('ss'), {
    sheetCount: 2
});
spread.suspendPaint();
initSpread(spread);
spread.resumePaint();
function initSpread(spread) {
    var sheet = spread.getActiveSheet();
    sheet.setValue(0, 0, 'value');
    sheet.setValue(1, 0, 0);
    sheet.setValue(2, 0, 1);
    sheet.setValue(3, 0, 2);
    sheet.setValue(4, 0, 3);
    sheet.setValue(5, 0, 4);
    sheet.setValue(6, 0, 5);
    sheet.setValue(7, 0, 6);
    sheet.setValue(8, 0, 7);
    sheet.setValue(9, 0, 8);
    sheet.setValue(10, 0, 9);

    var cfs = sheet.conditionalFormats;
    var style = new GC.Spread.Sheets.Style();
    style.backColor = '#CCFFCC';
    cfs.addCellValueRule(GC.Spread.Sheets.ConditionalFormatting.ComparisonOperators.greaterThan, 5, 0, style, [new GC.Spread.Sheets.Range(1, 0, 10, 1)]);

    $("#btn").click(function () {
        var cfs = sheet.conditionalFormats;
        var rule = cfs.getRules()[0];
        rule.value1(8);
        rule.condition(null);
        //加入clearRule
        cfs.clearRule();
        cfs.addRule(rule);
    });
}