import * as GC from "@grapecity-software/spread-sheets";
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"), {
    sheetCount: 2
});
initSpread(spread);
function initSpread(spread) {
    var MyFun1 = function() {};
    MyFun1.prototype = new GC.Spread.CalcEngine.Functions.AsyncFunction("MyFUN_1", 1, 255);
    MyFun1.prototype.defaultValue = function() {
        return "Loading...";
    };
    MyFun1.prototype.evaluateAsync = function(context) {
        console.log("MyFun_1 evaluateAsync");
        context.setAsyncResult(Math.random());
    };
    // evaluateMode
    MyFun1.prototype.evaluateMode = function() {
        return GC.Spread.CalcEngine.Functions.AsyncFunctionEvaluateMode.onRecalculation;
    };


    var MyFun2 = function() {};
    MyFun2.prototype = new GC.Spread.CalcEngine.Functions.AsyncFunction("MyFUN_2", 1, 255);
    MyFun2.prototype.defaultValue = function() {
        return "Loading...";
    };
    MyFun2.prototype.evaluateAsync = function(context) {
        console.log("MyFun_2 evaluateAsync");
        context.setAsyncResult(Math.random());
    };
    // evaluateMode
    MyFun2.prototype.evaluateMode = function() {
        return GC.Spread.CalcEngine.Functions.AsyncFunctionEvaluateMode.onRecalculation;
    };

    var sheet = spread.sheets[0];
    sheet.suspendPaint();
    sheet.options.allowCellOverflow = true;

    sheet.setValue(0, 0, false);
    sheet.getCell(0, 0).backColor("lightgreen");
    // 添加sheet级别的自定义函数
    sheet.addCustomFunction(new MyFun1());
    sheet.addCustomFunction(new MyFun2());
    sheet.setFormula(1, 1, "MyFUN_1(A1)");
    sheet.setFormula(2, 1, "MyFUN_2(A1)");
    sheet.setFormula(3, 1, "MyFUN_1(A1)");
    sheet.setFormula(4, 1, "MyFUN_2(A1)");
    sheet.setFormula(5, 1, "MyFUN_1(A1)");
    sheet.setFormula(6, 1, "MyFUN_2(A1)");
    sheet.setFormula(7, 1, "MyFUN_1(A1)");
    sheet.setFormula(8, 1, "MyFUN_2(A1)");
    sheet.setFormula(9, 1, "MyFUN_1(A1)");
    sheet.setFormula(10, 1, "MyFUN_2(A1)");
    sheet.getRange(1, 1, 10, 1).foreColor("red");
    sheet.setColumnWidth(0, 100);
    sheet.setColumnWidth(1, 300);
    sheet.resumePaint();

    $("#trigger").click(function() {
        sheet.setValue(0, 0, !sheet.getValue(0, 0));
    });
}