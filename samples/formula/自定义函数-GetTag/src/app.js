import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-excelio"
import "@grapecity-software/spread-sheets-charts"
import "@grapecity-software/spread-sheets-print"
import "@grapecity-software/spread-sheets-resources-zh"
import "@grapecity-software/spread-sheets-pdf"
import "@grapecity-software/spread-sheets-barcode"
import "@grapecity-software/spread-sheets-languagepackages"
import "@grapecity-software/spread-sheets-shapes"
import "@grapecity-software/spread-sheets-pivot-addon"
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"



let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()


/*------自定义函数------*/

//1. 从 GC.Spread.CalcEngine.Functions.Function 派生并重写一些关键方法
function FactorialFunction() {
};
FactorialFunction.prototype = new GC.Spread.CalcEngine.Functions.Function(
    "GETTAG",                    //函数名称，在单元格输入“=”时显示
    1,                              //函数最少需要传递的参数个数
    2,                             //函数最多能传递的参数个数
    {
        description: "获取区域单元格的tag",    //单元格输入函数时对应的提示信息
        //parameters是对函数每个参数的描述，对应的是一个Object的数组
        parameters: [
            {
                name: '引用的单元格区域',         //参数的名字，输入函数中的参数时会显示
                repeatable: false,   //参数是否可以重复，一般只有最后一个参数可重复
                optional: false      //参数是否可选
            }
        ]
    }
);
FactorialFunction.prototype.acceptsReference = function () {
    return true;//函数的参数接受引用单元格区域
}
FactorialFunction.prototype.isContextSensitive = function () {
    return true;//为true 时，函数的计算依赖于上下文
}
FactorialFunction.prototype.evaluate = function (arg) {
    console.log(arguments);
    if (arguments.length === 2) {
        var info = arguments[1];
        var row = info.getRow();
        var column = info.getColumn();
        var rowCount = info.getRowCount();
        var columnCount = info.getColumnCount();
        var tag = sheet.getRange(row, column, rowCount, columnCount).tag();
        if (tag) {
            return tag;
        } else {
            return "null"
        }
    }
    return "#VALUE!";
}
var factorial = new FactorialFunction();
sheet.addCustomFunction(factorial)

sheet.setValue(0, 1, "<---此单元格tag=1");
sheet.setValue(2, 1, "<---此区域（A2:A4）tag=\"range tag\"");

sheet.setTag(0, 0, 1);
let range = sheet.getRange(1, 0, 3, 1)
range.tag("Range Tag");
let rangeStyle = new GC.Spread.Sheets.Style()
rangeStyle.backColor = "yellow"
range.setStyle(rangeStyle)

sheet.setFormula(0, 5, '=GETTAG(A1) + 100');
sheet.setFormula(2, 5, '=GETTAG(A2:A4)');
sheet.setColumnWidth(5, 200)

