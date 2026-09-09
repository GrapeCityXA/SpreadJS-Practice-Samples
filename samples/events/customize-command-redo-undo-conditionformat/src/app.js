import * as GC from "@grapecity-software/spread-sheets";
function registerCommand(cmdName, operateFun, params) {
    var sheet = spread.getActiveSheet();
    // 注册命令的调用方法
    if (!spread.commandManager()[cmdName]) {
        spread.commandManager().register(cmdName, {
            canUndo: true,
            execute: function(context, options, isUndo) {
                var Commands = GC.Spread.Sheets.Commands;
                // 在此加cmd名称
                options.cmd = cmdName;
                if (isUndo) {
                    // isUndo 为true时，调用undoTransaction
                    Commands.undoTransaction(context, options);
                    return true;
                } else {
                    Commands.startTransaction(context, options);
                    operateFun(options.sheet, options.ranges, options.rule, options.style)
                    Commands.endTransaction(context, options);
                    return true;
                }
            }
        });
    }
    var style = {
        backColor: 'red',
        foreColor: '#447ee7',
    };
    if (cmdName == "changeCondiiton") {
        style = {
            backColor: 'yellow',
            foreColor: '#447ee7',
        };
    }
    spread.commandManager().execute({
        cmd: cmdName,
        sheet: sheet,
        params: params,
        ranges: sheet.getSelections(),
        style: style,
        sheetName: sheet.name()
    });
};
var spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'), {
        sheetCount: 1
    });
    var sheet = spread.getActiveSheet();
    sheet.suspendPaint();
    sheet.setArray(0, 0, [
        [1, 2, 3],
        [2, 3, 4],
        [3, 4, 5],
        [4, 5, 6],
        [5, 6, 7],
        [6, 7, 8],
        [7, 8, 9],
        [8, 9, 10],
        [9, 10, 11],
        [10, 11, 12]
    ]);
    sheet.setSelection(0, 0, 10, 3);
    sheet.options.isProtected = true;
    sheet.defaults.colWidth = 150;
    var ds = sheet.getDefaultStyle();
    ds.locked = false;
    sheet.setDefaultStyle(ds);
    sheet.resumePaint();

    // 设置允许撤销操作
    spread.options.allowUndo = true;
    $("#btn2").click(function() {
        // 调用代码撤销
        var undoManager = spread.undoManager();
        undoManager.undo();
    });
    $("#btn3").click(function() {
        // 重做
        var undoManager = spread.undoManager();
        undoManager.redo();
    });
    $("#btn4").click(function() {
        // 设置条件格式 大于2
        registerCommand('setCondiiton', (sheet, sels, rule, style) => {
            condition(sheet, sels, rule, style);
        }, [])
    });
    $("#btn5").click(function() {
        // 编辑条件格式 大于2
        registerCommand('changeCondiiton', (sheet, sels, rule, style) => {
            condition(sheet, sels, rule, style);
        }, [])


    });

    var condition = function(sheet, sels, rule, style) {
        let cfs = sheet.conditionalFormats;
        let operator = 2 //大于
        style.textDecoration = 3;
        let value1 = 2 || '';
        let value2 = undefined || '';
        // 这行还是现场获取选区
        // let sels = sheet.getSelections();
        let doubleValue1 = parseFloat(value1);
        let doubleValue2 = parseFloat(value2);
        cfs.addCellValueRule(operator, isNaN(doubleValue1) ? value1 : doubleValue1, isNaN(doubleValue2) ? value2 : doubleValue2, style, sels);
    }