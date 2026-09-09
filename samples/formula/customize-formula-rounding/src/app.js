import * as GC from "@grapecity-software/spread-sheets";
// Title:自定义函数：四舍六入
// Description：自定义函数：四舍六入
// Tag:自定义函数，四舍六入


var FdaFunction = function () {
    this.name = "FDA";
    this.minArgs = 1;
    this.maxArgs = 2;
};
FdaFunction.prototype = new GC.Spread.CalcEngine.Functions.Function();
FdaFunction.prototype.description = function () {
    return {
        description: "对value进行四舍六入五留双修约，保留小数点后指定位数",
        parameters: [{
            name: "value",
            repeatable: false,
            optional: false
        }, {
            name: "places",
            repeatable: false,
            optional: false
        }]
    }
}
FdaFunction.prototype.isContextSensitive = function () {
    return true;
}
FdaFunction.prototype.evaluate = function (context, value, places) {
    var num;
    if (!isNaN(parseInt(value)) && !isNaN(parseInt(places))) {
        if (value < 0) {
            num = -value;
        } else {
            num = value;
        }

        if (places < 0)
            return value;
        var v = Number(num);
        var s = v + "";
        var result = "";
        if (s.indexOf(".") != -1) {
            var s_1 = s.substring(s.indexOf(".") + 1);
            if (s_1.length == parseInt(places) + 1) {
                if (s_1.endsWith("5")) {
                    var s_2 = s.substr(0, s.length - 1);
                    var n = Number(s_2);
                    var s_n = n.toFixed(places);
                    var x = s_n.substring(s_n.length - 1);
                    if (Number(x) % 2 == 0) {
                        result = s_n;
                    }
                }
            }
        }
        if (result == "") {
            result = v.toFixed(places);
        }
        if (value < 0) {
            result = "-" + result;
            if (result.startsWith("-0")) {
                if (Number(result) == 0)
                    result = result.substring(1, result.length);
            }
        }

        return result;
    } else {
        return "#VALUE!";
    }
}
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"), {
    sheetCount: 2
});
var sheet = spread.getActiveSheet();
sheet.getCell(1, 2).value('↓请编辑以查看公式');
sheet.getCell(2, 1).value(1.432);
sheet.setColumnWidth(1, 120);
sheet.setColumnWidth(2, 160);

var fda = new FdaFunction();
sheet.addCustomFunction(fda);

sheet.setFormula(2, 2, "=fda(B3,2)");