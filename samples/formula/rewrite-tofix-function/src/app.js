import * as GC from "@grapecity-software/spread-sheets";
// Title:浮点数与公式
// Description：浮点数与公式
// Tag:浮点数，公式

var spreadNS = GC.Spread.Sheets;


var toPrecisionFn = Number.prototype.toPrecision;
Number.prototype.toPrecision = function (precision) {
    precision = Math.min(11, precision);
    var number = toPrecisionFn.apply(this, arguments);
    return number;
}

var toFixFn = Number.prototype.toFixed;
Number.prototype.toFixed = function (precision) {
    precision = Math.min(11, precision);
    return toFixFn.apply(this, arguments);
}

$(document).ready(function () {
    var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
    var sheet = spread.getActiveSheet();
    var menuData = spread.contextMenu.menuData;
    var newMenuData = [];
    menuData.forEach(function (item) {
    })
    spread.contextMenu.menuData = newMenuData;

    sheet.bind(GC.Spread.Sheets.Events.RangeChanged, function (sender, args) {
        console.log("RangeChanged");
        console.log(args);
    });

    /*----------------------------基本函数-----------------------*/
    sheet.suspendPaint();
    sheet.setValue(2, 1, '姓名');
    sheet.setValue(3, 1, '丁玉琴');
    sheet.setValue(4, 1, '杨国强');
    sheet.setValue(5, 1, '董超杨');
    sheet.setValue(6, 1, '杨猫猫');
    sheet.setValue(7, 1, '陈米灵');

    sheet.setValue(2, 2, '余额');
    sheet.setValue(3, 2, 342);
    sheet.setValue(4, 2, 3);
    sheet.setValue(5, 2, 5654);
    sheet.setValue(6, 2, 3455);
    sheet.setValue(7, 2, 2);

    sheet.setValue(9, 1, '平均：');
    sheet.setValue(10, 1, '合计：');
    sheet.setValue(11, 1, '最大值：');
    sheet.setValue(12, 1, '最小值：');
    sheet.setValue(13, 1, '名字包含杨的：');
    sheet.setValue(14, 1, '姓杨的：');

    sheet.setFormula(9, 2, '=AVERAGE(C4:C8)');
    sheet.setFormula(10, 2, '=SUM(C4:C8)');
    sheet.setFormula(11, 2, '=MAX(C4:C8)');
    sheet.setFormula(12, 2, '=MIN(C4:C8)');
    sheet.setFormula(13, 2, 'COUNTIF(B4:B8,"*杨*")');
    sheet.setFormula(14, 2, 'COUNTIF(B4:B8,"杨*")');
    sheet.setColumnWidth(1, 100)
    sheet.setValue(14, 5, '=MAX(C4:C7)');
    sheet.setFormula(15, 5, '=MAX(C4:C7)');

    sheet.addSpan(0, 0, 30, 1);
    sheet.setColumnCount(40);

    /*--------------------------INDIRECT函数----------------------*/

    sheet.setValue(1, 4, 234);
    sheet.setValue(2, 4, 'E2');
    sheet.setValue(3, 4, 'B4');
    sheet.setValue(4, 4, 23423);

    sheet.setValue(5, 5, 'INDIRECT("E1")=');
    sheet.setValue(6, 5, 'INDIRECT("B3")=');
    sheet.setValue(7, 5, 'INDIRECT("E"&(1+2))=');
    sheet.setValue(8, 5, 'INDIRECT(E4)=');
    sheet.setColumnWidth(5, 150);

    sheet.setFormula(5, 6, '=INDIRECT("E1")');
    sheet.setFormula(6, 6, '=INDIRECT("B3")');
    sheet.setFormula(7, 6, '=INDIRECT("E"&(1+2))');
    sheet.setFormula(8, 6, '=INDIRECT(E4)');

    sheet.resumePaint();
    /*-----------------------------自定义函数-------------------*/
    let sheet2 = new GC.Spread.Sheets.Worksheet();
    var spreadNS = GC.Spread.Sheets;
    spread.addSheet(1, sheet2)
    sheet2.setArray(1, 1, [["序号", "底边长", "高", "面积"],
    [1, 4, 5], [2, 3, 4], [3, 1, 44], [4, 8, 3], [5, 4, 10], [6, 7, 10]]);
    sheet2.addSpan(0, 1, 1, 4);
    sheet2.setValue(0, 1, "计算三角形面积");
    sheet2.getRange(0, 1, 1, 1).hAlign(spreadNS.HorizontalAlign.center);
    sheet2.setFormula(2, 4, '=(C3*D3)/2');
    sheet2.setValue(2, 0, '使用普通公式:');
    sheet2.setValue(3, 0, '使用自定义函数:');
    sheet2.setValue(7, 0, '异步函数:');
    sheet2.setValue(8, 0, '当前时间:');
    sheet2.setColumnWidth(0, 120);
    function calcuArea() {
        this.name = "area";
        this.maxArgs = 2;
        this.minArgs = 2;
    }
    calcuArea.prototype = new GC.Spread.CalcEngine.Functions.Function();
    calcuArea.prototype.evaluate = function (arg1, arg2) {
        if (arguments.length == 2 && !isNaN(parseInt(arg1)) && !isNaN(parseInt(arg2))) {
            return (arg1 * arg2) / 2;
        }
        return "#value"
    };
    var area = new calcuArea();
    sheet2.addCustomFunction(area);
    sheet2.setFormula(3, 4, "=area(C4,D4)");

    /*-----------------------数组公式----------------------*/
    sheet2.setValue(4, 0, '使用数组公式:');
    sheet2.addSpan(4, 0, 3, 1);
    sheet2.setArrayFormula(4, 4, 3, 1, "=(C5:C7*D5:D7)/2");

    /*----------------------异步函数---------------------*/
    var asyncSum = function () {
        this.name = "asyncArea";
        this.maxArgs = 2;
        this.minArgs = 2;
    };
    asyncSum.prototype = new GC.Spread.CalcEngine.Functions.AsyncFunction("ASUM", 1, 10);
    asyncSum.prototype.defaultValue = function () {
        return "计算中...";
    };
    asyncSum.prototype.evaluateAsync = function (context) {
        var args = arguments;

        var result = 0;
        setTimeout(function () {
            result = (args[1] * args[2]) / 2;
            console.log(args[1]);
            console.log(args[2]);
            context.setAsyncResult(result);
        }, 3000);
    };
    var asyncTime = function () {
        this.name = "asyncTime";
        this.maxArgs = 2;
        this.minArgs = 0;
    };
    asyncTime.prototype = new GC.Spread.CalcEngine.Functions.AsyncFunction("ASUM", 1, 10);
    asyncTime.prototype.evaluateAsync = function (context) {
        var args = arguments;
        var time = new Date().toString();
        context.setAsyncResult(time);
    };
    var asyncArea = new asyncSum();
    sheet2.addCustomFunction(asyncArea);
    sheet2.setFormula(7, 4, "=asyncArea(C8,D8)");
    var asyncTime = new asyncTime();
    sheet2.addCustomFunction(asyncTime);
    setInterval(function () {
        sheet2.setFormula(8, 1, "=asyncTime()");
    }, 1000);
});