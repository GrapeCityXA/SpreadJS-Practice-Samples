import * as GC from "@grapecity-software/spread-sheets";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();

spread.options.highlightInvalidData = true;
var dv = GC.Spread.Sheets.DataValidation.createDateValidator(GC.Spread.Sheets.ConditionalFormatting.ComparisonOperators.between, 10, 20);
dv.showInputMessage(true);
dv.inputMessage("请输入10~20之间的数字");
dv.inputTitle("输入提示");
sheet.getCell(-1, 0).validator(dv);

sheet.setArray(0, 0, [1, 2, 10, 20]);

document.getElementById('validatorBtn').addEventListener('click', function() {
    var validRes = [];
    for (var i = 0; i < 4; i++) {
        if (sheet.getDataValidator(i, 0)) {
            validRes.push({
                row: i, 
                col: 0, 
                value: sheet.getValue(i, 0), 
                valid: sheet.getDataValidator(i, 0).isValid(sheet, i, 0, sheet.getValue(i, 0))
            });
        }
    }

    alert(JSON.stringify(validRes));
});

document.getElementById('sheetBtn').addEventListener('click', function() {
    var validRes = [];
    for (var i = 0; i < 4; i++) {
        validRes.push({
            row: i, 
            col: 0, 
            value: sheet.getValue(i, 0),
            valid: sheet.isValid(i, 0, sheet.getValue(i, 0)) 
        });
    }
    alert(JSON.stringify(validRes));
});