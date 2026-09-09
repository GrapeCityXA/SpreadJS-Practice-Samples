import * as GC from "@grapecity-software/spread-sheets";
 function FactorialFunction() {
     this.name = 'test';
     this.maxArgs = 0;
     this.minArgs = 0;
     this.typeName = "FactorialFunction";
 }

 $(document).ready(function() {
     var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
     var sheet = spread.getActiveSheet();
     var factorial = new FactorialFunction();
     sheet.addCustomFunction(factorial);
     sheet.setColumnWidth(0, 50);
     document.getElementById("btn").addEventListener("click", function() {
        sheet.setFormula(1, 0, "=test()");
     })
 });
 var spread = GC.Spread.Sheets.findControl(document.getElementById('ss'));
 FactorialFunction.prototype = new GC.Spread.CalcEngine.Functions.Function();
 FactorialFunction.prototype.evaluate = function() {
     var context = arguments[0];
     var curRow = context.row;
     var curCol = context.column;
     setTimeout(function() {
         var spread = GC.Spread.Sheets.findControl(document.getElementById('ss'));
         var sheet = spread.getActiveSheet();
         sheet.suspendCalcService(true);
         var data = [
             ["value1", "value2", "value3", "value4"],
             ["value5", "value6", "value7", "value8"]
         ];
         //context.source.getSheet().setValue(0,1,1);//正常
         //sheet.setArray(0,1,data);//异常
         context.source.getSheet().setArray(curRow, curCol + 1, data); //异常
         sheet.resumeCalcService(false);
     }, 0);
     return 1;
 }
 FactorialFunction.prototype.acceptsError = function() {
     return true;
 }
 FactorialFunction.prototype.isContextSensitive = function() {
     return true;
 }