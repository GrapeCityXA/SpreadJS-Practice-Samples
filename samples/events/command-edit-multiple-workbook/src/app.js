import * as GC from "@grapecity-software/spread-sheets";

/**
 * 同步编辑多个工作薄中的对应sheet
 * 在SpreadJS的命令管理器中，把anyscLicenser事件和自定义的处理方法进行关联，
 * 使得SpreadJS一旦监听到anyscLicenser事件，就自动执行对应处理方法。
 */
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let spread1 = new GC.Spread.Sheets.Workbook(document.getElementById("ss1"));

let sheet = spread.getActiveSheet();
//定义更新单元格背景色的命令
let command = {
    canUndo: true,
    execute: function (context, options, isUndo) {
        let Commands = GC.Spread.Sheets.Commands;
        //回滚逻辑
        if (isUndo) {
            Commands.undoTransaction(context, options);
            return true;
        } else {
            Commands.startTransaction(context, options);
            let sheet = context.getSheetFromName(options.sheetName);
            let cell = sheet.getCell(options.row, options.col);
            cell.backColor(options.backColor);
            Commands.endTransaction(context, options);
            return true;
        }
    }
};
//获取命令管理器
let commandManager = spread.commandManager();
let commandManager1 = spread1.commandManager();
//向命令管理器注册命令
commandManager.register("changeBackColor", command);
commandManager1.register("changeBackColor", command);

//工作薄1监听到anyscLicenser事件，触发工作薄2去执行逻辑
spread.commandManager().addListener("anyscLicenser", function () {
    for (let i = 0; i < arguments.length; i++) {
        let cmd = arguments[i].command;
        if (cmd.clipboardText) {
            cmd.fromSheet = null;
            cmd.fromRanges = null;
        }
        commandManager1.execute(cmd)
    }
});

//设置背景色button的点击响应事件
document.getElementById("backcolor").onclick =function () {
    let selections = sheet.getSelections();
    for (let i = 0; i < selections.length; i++) {
        let row = selections[i].row;
        let col = selections[i].col;
        //执行更新背景色的命令
        commandManager.execute({ cmd: "changeBackColor", sheetName: sheet.name(), row: row, col: col, backColor: "#ffcc99" });
    }
};