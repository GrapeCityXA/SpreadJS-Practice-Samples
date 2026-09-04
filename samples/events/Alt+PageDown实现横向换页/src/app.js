import * as GC from "@grapecity-software/spread-sheets";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();
sheet.setColumnCount(500)
let pageDown = {
    canUndo: false,
    name: "pageDown",
    execute: function (context, options, isUndo) {
        let Commands = GC.Spread.Sheets.Commands;
        Commands.startTransaction(context, options);
        context.getActiveSheet().scroll(
                0,
                context.getHost().clientWidth -
                context.getActiveSheet().getColumnWidth(0, GC.Spread.Sheets.SheetArea.rowHeader)
            );
        Commands.endTransaction(context, options);
        return true;
    },
};

let pageUp = {
    canUndo: false,
    name: "pageUp",
    execute: function (context, options, isUndo) {
        let Commands = GC.Spread.Sheets.Commands;
        Commands.startTransaction(context, options);
        context.getActiveSheet().scroll(
                0,
                -context.getHost().clientWidth +
                context.getActiveSheet().getColumnWidth(0, GC.Spread.Sheets.SheetArea.rowHeader)
            );
        Commands.endTransaction(context, options);
        return true;
    },
};

spread.commandManager().register("pageDown", pageDown, 34, false, false, true, false);
spread.commandManager().register("pageUp", pageUp, 33, false, false, true, false);