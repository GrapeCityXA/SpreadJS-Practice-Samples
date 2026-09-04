import * as GC from "@grapecity-software/spread-sheets";
export default function AuthController() { }

/**
 * 
 * @param {*} spread 
 * @param {*} sheet 
 * @param {*} allowCallBack 允许编辑的回调函数，此函数返回false时，则对应单元格不可修改
 */
AuthController.prototype.register = function (spread, sheet, allowCallBack) {
    // 进入编辑状态
    sheet.bind(GC.Spread.Sheets.Events.EditStarting, function (sender, args) {
        if (allowCallBack && !allowCallBack(args.row, args.col, "EditStarting")) {
            args.cancel = true
        }
    });

    // 粘贴
    spread.bind(GC.Spread.Sheets.Events.ClipboardPasting, function (sender, args) {
        if (args.sheet != sheet) {
            return
        }
        for (let row = args.cellRange.row; row < args.cellRange.row + args.cellRange.rowCount; row++) {
            for (let col = args.cellRange.col; col < args.cellRange.col + args.cellRange.colCount; col++) {
                if (allowCallBack && !allowCallBack(row, col, "ClipboardPasting")) {
                    args.cancel = true
                    return
                }
            }
        }
    });

    // 拖拽单元格
    sheet.bind(GC.Spread.Sheets.Events.DragDropBlock, function (e, args) {
        for (let row = args.toRow; row < args.toRow + args.rowCount; row++) {
            for (let col = args.toCol; col < args.toCol + args.colCount; col++) {
                if (allowCallBack && !allowCallBack(row, col, "DragDropBlock")) {
                    args.cancel = true
                    return
                }
            }
        }
    });

    // 下拉填充
    sheet.bind(GC.Spread.Sheets.Events.DragFillBlock, function (e, args) {
        console.log(args)
        for (let row = args.fillRange.row; row < args.fillRange.row + args.fillRange.rowCount; row++) {
            for (let col = args.fillRange.col; col < args.fillRange.col + args.fillRange.colCount; col++) {
                if (allowCallBack && !allowCallBack(row, col, "DragFillBlock")) {
                    args.cancel = true
                    return
                }
            }
        }
    });

    // 单独处理del键
    let command = {
        canUndo: true,
        execute: function (context, options, isUndo) {
            let Commands = GC.Spread.Sheets.Commands;
            if (isUndo) {
                Commands.undoTransaction(context, options);
                return true;
            } else {
                let row = context.getActiveSheet().getActiveRowIndex()
                let col = context.getActiveSheet().getActiveColumnIndex()
                if (allowCallBack && !allowCallBack(row, col, "DeleteCommand")) {
                    return true
                }
                Commands.startTransaction(context, options);
                context.getActiveSheet().setValue(row, col, null)
                Commands.endTransaction(context, options);
                return true;
            }
        }
    };

    spread.commandManager().register("ban1", command);
    spread.commandManager().setShortcutKey("ban1", GC.Spread.Commands.Key.del, false, false, false, false);
}

// 使用示例：
// let authContoller = new AuthController()
// authContoller.register(spread, sheet, function (row, col, type) {
//     if (col == 0) {
//         return type != "EditStarting"
//     } else if (col == 1) {
//         return type != "ClipboardPasting"
//     } else {
//         return true
//     }
// })