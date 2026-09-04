import * as GC from "@grapecity-software/spread-sheets";
import number2chinesenumber from './number2chinesenumber.js'



function NumberStringFunction() {
    this.name = "NUMBERSTRING";
    this.maxArgs = 2;
    this.minArgs = 2;
}
NumberStringFunction.prototype = new GC.Spread.CalcEngine.Functions.Function();
//计算公式的结果
NumberStringFunction.prototype.evaluate = function (num, type) {
    switch (type) {
        case 1:
            return number2chinesenumber(num)
        case 2:
            return number2chinesenumber(num, "max")
        case 3:
            return toZh(num);
    }
    return "Err";
};


GC.Spread.CalcEngine.Functions.defineGlobalCustomFunction("NUMBERSTRING", new NumberStringFunction());

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();
sheet.setFormula(2, 1, '=NUMBERSTRING(1234567890,1)');
sheet.setFormula(3, 1, '=NUMBERSTRING(1234567890,2)');
sheet.setFormula(4, 1, '=NUMBERSTRING(1234567890,3)');

sheet.setColumnWidth(1, 300)

function toZh(digit) {
    digit = typeof digit === 'number' ? String(digit) : digit;
    let zh = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    let result = '';
    for (let i = 0; i < digit.length; i++) {
        result += (digit[i] === "." ? "点": zh[digit[i]]);
    }
    return result;
}

