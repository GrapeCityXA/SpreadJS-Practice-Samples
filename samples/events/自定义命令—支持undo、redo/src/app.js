import * as GC from "@grapecity-software/spread-sheets";


// new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
    var sheet = spread.getActiveSheet();

    sheet.suspendPaint();

    // 锁定表格
    sheet.options.isProtected = true;
    // 设置默认列宽
    sheet.defaults.colWidth = 150;
    // 设置单元格默认样式为解锁状态
    var ds = sheet.getDefaultStyle();
    ds.locked = false;
    sheet.setDefaultStyle(ds);
    // 设置锁定行、列
    sheet.getRange(-1, 1).backColor("red").locked(true);
    sheet.getRange(1, -1).backColor("red").locked(true);
    // 设置单元格格式为日期格式
    sheet.setFormatter(-1, -1, "yyyy年m月d日");

    sheet.resumePaint();

    // 设置允许撤销操作
    spread.options.allowUndo = true;

    // 注册命令的调用方法
    /*
     * 其中第一个参数fillNow是命令的名称
     * 第二个参数
     * */
    spread.commandManager().register("fillNow", {
        canUndo: true,
        execute: function(context, options, isUndo) {
            var Commands = GC.Spread.Sheets.Commands;
            // 在此加cmd名称
            options.cmd = "fillNow";
            if (isUndo) {
                // isUndo 为true时，调用undoTransaction
                Commands.undoTransaction(context, options);
                return true;
            } else {
                // 开始事务
                Commands.startTransaction(context, options);
                var sheet = options.sheet;
                var ranges = options.ranges;
                if (ranges.length > 0) {
                    var range = ranges[0];
                    var cell = sheet.getCell(range.row, range.col);
                    if (!cell.locked()) {
                        sheet.setValue(range.row, range.col, new Date());
                    }
                }
                // 结束事务
                Commands.endTransaction(context, options);
                return true;
            }
        }
    });

    // 设置快捷键：Ctrl + ;
    // 参数含义：commandName, key, isCtrl, isShift, isAlt, isMeta
    spread.commandManager().setShortcutKey(
        "fillNow", 186, true, false, false, false
    );

    $("#btn1").click(function() {
        var sheet = spread.getActiveSheet();
        // 调用命令执行
        spread.commandManager().execute({
            cmd: "fillNow",
            sheet: sheet,
            ranges: sheet.getSelections(),
            sheetName: sheet.name()
        });
    });

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