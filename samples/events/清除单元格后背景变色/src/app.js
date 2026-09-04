import * as GC from "@grapecity-software/spread-sheets";

var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"), {
    sheetCount: 1
});
GC.Spread.Common.CultureManager.culture("zh-cn");
var sheet = spread.getActiveSheet();
sheet.setValue(3,3,"点击鼠标右键清除内容")
var flag = true;

var undoManager = spread.undoManager();

var oldUndo = undoManager.undo;
undoManager.undo = function () {
    spread.suspendEvent();
    var result = oldUndo.apply(this, arguments);
    spread.resumeEvent();
    return result;
};

var command = {
    canUndo: true,
    execute: function (context, options, isUndo) { 
        let Commands = GC.Spread.Sheets.Commands;
        options.cmd = "test";
        if (isUndo) {
            Commands.undoTransaction(context, options);
            if (flag) {
                flag = false;
                spread.undoManager().undo()
            }
            return true;
        } else {
            Commands.startTransaction(context, options);
            var sheet = context.getSheetFromName(options.sheetName);
            sheet.getCell(0, 0).backColor("red");
            Commands.endTransaction(context, options);
            return true;
        }
    }
};

spread.commandManager().register("test", command);

sheet.bind(GC.Spread.Sheets.Events.RangeChanged, function (sender, args) {
    console.log('changed')
    if (args.action === GC.Spread.Sheets.RangeChangedAction.clear) {
        spread.commandManager().execute({cmd: "test", sheetName: args.sheet.name()})
    }
});


