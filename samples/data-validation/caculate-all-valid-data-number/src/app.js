import * as GC from "@grapecity-software/spread-sheets";



import "./template.js"

let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
spread.fromJSON(spreadJSON);

function checkCount(){

    var sheet = spread.getActiveSheet();
    var sel = sheet.getSelections()[0]
    alert(getPassConditionCount(sheet, sel.row, sel.col, sel.rowCount, sel.colCount))
}
document.getElementById("checkCount").onclick = checkCount;


function getPassConditionCount(sheet, row, col, rowCount, colCount) {
    var count = 0;

    for (var i = row; i < row + rowCount; i++) {
        for (var j = col; j < col + colCount; j++) {
            var rules = sheet.conditionalFormats.getRules(i, j);
            console.log(rules)
            if (rules && rules.length) {
                for (var k = 0; k < rules.length; k++) {
                    var rule = rules[k];
                    if (rule.evaluate(sheet, 0, 0, sheet.getValue(i, j))) {
                        count++;
                        break;
                    }
                }
            }
        }
    }

    return count;
}

