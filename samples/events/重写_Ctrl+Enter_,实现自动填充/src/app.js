import * as GC from "@grapecity/spread-sheets";
var spread = new GC.Spread.Sheets.Workbook("ss");
let sheet = spread.getActiveSheet()
sheet.setValue(0,0,1)

var oldFn = GC.Spread.Sheets.CellTypes.Text.prototype.isReservedKey;
GC.Spread.Sheets.CellTypes.Text.prototype.isReservedKey = function (event, context) {
    var src = event.srcElement || event.target, keyCode = event.keyCode, ctrlKey = event.ctrlKey, altKey = event.altKey, metaKey = event.metaKey;
    if (keyCode === 13 && ctrlKey && (!event.shiftKey || altKey)) {
        return false
    } else {
        return oldFn.apply(this, arguments);
    }
    return false;
}
spread.commandManager().register('extendValueCmd', {
    canUndo: true,
    execute: function (spread, options, isUndo) {
        options.cmd = 'extendValueCmd';
        var Commands = GC.Spread.Sheets.Commands;
        if (isUndo) {
            Commands.undoTransaction(spread, options);
            return true;
        } else {
            Commands.startTransaction(spread, options);
            var sheet = spread.getSheetFromName(options.sheetName);
            if (sheet.isEditing()) {
                sheet.endEdit(false);
            }
            spread.suspendPaint();
            spread.suspendCalcService();
            var value = sheet.getValue(sheet.getActiveRowIndex(), sheet.getActiveColumnIndex());
            var sels = sheet.getSelections();
            sels.forEach(function (range) {
                sheet.getRange(range.row, range.col, range.rowCount, range.colCount).value(value);
            });
            spread.resumeCalcService();
            spread.resumePaint();
            Commands.endTransaction(spread, options);
            return true;
        }
    }
}, 13, true, false, false, false);