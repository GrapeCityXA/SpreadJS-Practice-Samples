import * as GC from "@grapecity-software/spread-sheets";
GC.Spread.Sheets.LicenseKey = "";

/**
 * Excel支持Evaluate函数（宏），可以将公式字符串解析计算结果， SpreadJS可利用自定义函数实现
 */
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let sheet = spread.getActiveSheet();

/*------自定义函数------*/
//1. 从 GC.Spread.CalcEngine.Functions.Function 派生并重写一些关键方法
function FactorialFunction() {
  //函数名
  this.name = "EVALUATE";
  //最大参数个数
  this.maxArgs = 1;
  //最小参数个数
  this.minArgs = 1;
}
FactorialFunction.prototype = new GC.Spread.CalcEngine.Functions.Function();
//函数的参数接受引用单元格区域
FactorialFunction.prototype.acceptsReference = function () {
  return true;
};
//为true 时，函数的计算依赖于上下文
FactorialFunction.prototype.isContextSensitive = function () {
  return true;
};
FactorialFunction.prototype.evaluate = function (arg) {
  debugger;
  let formulaString = arg.Lf.arguments[0].value;
  //使用EvaluateFormula()方法来计算公式，而无需在表单的单元格中设置公式
  let value = GC.Spread.Sheets.CalcEngine.evaluateFormula(
    sheet,
    formulaString,
    0,
    0,
  );
  return value;
};
let factorial = new FactorialFunction();
sheet.setValue(0, 0, 2);
sheet.setValue(1, 0, 3);

document
  .getElementById("addCustomFunction")
  .addEventListener("click", function () {
    //将自定义函数添加到表单里。如果不设置，会报错 #NAME
    sheet.addCustomFunction(factorial);
    sheet.setFormula(3, 0, '=EVALUATE("SUM(A1:A2)")');
  });
