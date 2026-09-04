import * as GC from "@grapecity-software/spread-sheets";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();
sheet.setValue(1, 0, "←此sheet已被保护，请右键行头删除行测试")
sheet.options.isProtected = true
sheet.options.protectionOptions.allowDeleteRows = true


let forceDeleteRowsCommand = {
    canUndo: true,
    name: "forceDeleteRows",
    execute: function (context, options, isUndo) {
        let Commands = GC.Spread.Sheets.Commands;
        if (isUndo) {
            Commands.undoTransaction(context, options);
            return true;
        } else {
            Commands.startTransaction(context, options);
            let sheet = context.getSheetFromName(options.sheetName);
            sheet.suspendPaint();
            console.log(options.selections);
            if (options.selections && options.selections.length) {
                let row = options.selections[0].row;
                let rowCount = options.selections[0].rowCount;
                sheet.deleteRows(row, rowCount);
            }
            sheet.resumePaint();
            Commands.endTransaction(context, options);
            return true;
        }
    },
};

spread.commandManager().register("forceDeleteRows", forceDeleteRowsCommand);

let oldOpenMenu = spread.contextMenu.onOpenMenu;
spread.contextMenu.onOpenMenu = function (menuData, itemsDataForShown, hitInfo, spread) {
    oldOpenMenu.apply(this, arguments);
    for (const element of itemsDataForShown) {
        const item = element;
        console.log(item)
        if (item.name == "gc.spread.contextMenu.deleteRows"||item.name == "gc.spread.deleteRows") {
            item.command = "forceDeleteRows";
        }
    }
};
