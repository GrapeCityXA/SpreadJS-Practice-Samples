import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-resources-zh"
GC.Spread.Common.CultureManager.culture("zh-cn")

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();

sheet.setValue(0,0,1)
sheet.setValue(1,0,2)
sheet.setValue(2,0,"⬅️请在行头点击插入行，新增的行会出现在当前行下方")
sheet.setValue(3,0,4)
sheet.setValue(4,0,5)


let insertRowsBelow = {
    canUndo: true,
    name: "insertRowsBelow",
    execute: function (context, options, isUndo) {
        var Commands = GC.Spread.Sheets.Commands;
        if (isUndo) {
            Commands.undoTransaction(context, options);
            return true;
        } else {
            Commands.startTransaction(context, options);
            var sheet = context.getSheetFromName(options.sheetName);
            sheet.suspendPaint();
            console.log(options.selections)
            //向下插入行
            if (options.selections && options.selections.length) {
                var row = options.selections[0].row + 1;
                var rowCount = options.selections[0].rowCount;
                sheet.addRows(row, rowCount);
            }
            sheet.resumePaint();

            Commands.endTransaction(context, options);
            return true;
        }
    }
};

spread.commandManager().register("insertRowsBelow", insertRowsBelow);

function MyContextMenu() {}
MyContextMenu.prototype = new GC.Spread.Sheets.ContextMenu.ContextMenu(spread);
MyContextMenu.prototype.onOpenMenu = function (menuData, itemsDataForShown, hitInfo, spread) {
    itemsDataForShown.forEach(function (item, index) {
        if (item && item.name === "gc.spread.insertRows") {
            item.command = "insertRowsBelow"
        }
    });

};
var contextMenu = new MyContextMenu();
spread.contextMenu = contextMenu;


