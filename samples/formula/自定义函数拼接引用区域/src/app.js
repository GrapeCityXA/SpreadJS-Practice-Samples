import * as GC from "@grapecity-software/spread-sheets";
var spreadNS = GC.Spread.Sheets;
// 用正则获取单引号内容
function getArgsArr(str) {
    var result = str.match(/\'(.*?)'/g);
    if (result)
        return result.map(function (element) {
            return element;
        });
}

function initSpread(spread) {
    var sheet = spread.getSheet(0);
    sheet.setColumnWidth(1, 300);
    sheet.setColumnWidth(2, 200);
    sheet.setArray(0, 0, [
        [1],
        [2],
        [3],
        [4],
        [5]
    ]);

    function TestFunction() {
        this.name = "TEST";
        this.maxArgs = 100;
        this.minArgs = 1;
    }
    TestFunction.prototype = new GC.Spread.CalcEngine.Functions.Function();
    TestFunction.prototype.evaluate = function (arg1) {
        console.log(arguments);
        var result = arg1;
        if (arguments.length > 1) {
            var args = getArgsArr(result);
            if (args && args.length > 0) {

                for (let i = 0; i < args.length; i++) {
                    if (arguments[i + 1]) {
                        let _arg = arguments[i + 1];
                        // 如果参数是引用类型，获取引用区域
                        if (_arg.getRow) {
                            let row = _arg.getRow();
                            let col = _arg.getColumn();
                            let rowCount = _arg.getRowCount();
                            let colCount = _arg.getColumnCount();
                            let val = 1;
                            // 这里用累乘演示
                            for (let r = row; r < row + rowCount; r++) {
                                for (let c = col; c < col + colCount; c++) {
                                    val *= sheet.getValue(r, c);
                                }
                            }
                            result = result.replace(args[i], val);
                        } else {
                            // 如果参数是表达式，直接拼接结果即可
                            result = result.replace(args[i], _arg);
                        }
                    }
                }
            }
        }
        return result;
    };
    // 重写这个方法，返回true，就可以拿到参数的引用区域
    TestFunction.prototype.acceptsReference = function () {
        return true;
    };
    var test = new TestFunction();

    sheet.setValue(3, 1, '演示1：');
    sheet.addCustomFunction(test);
    sheet.setFormula(3, 2, '=test("cube(\'arg1\')||entity{19594}->period{\'arg2\'}",A1:A5,A1+A5)');
    sheet.setValue(4, 1, '演示2：');
    sheet.addCustomFunction(test);
    sheet.setFormula(4, 2, '=test("cube(\'参数\')||entity{19594}->period{\'anyString\'}",A2*A5, SUM(A1:A3))');

};
 var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"), {
        sheetCount: 1
    });
    initSpread(spread);