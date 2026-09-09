import * as GC from "@grapecity-software/spread-sheets";
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
var sheet = spread.getActiveSheet();
sheet.setArray(0, 0, [
    [1, 3, 2, 4],
    [2, 3, 2, 5],
    [2, 5, 3, 2]
])
sheet.getRange(1, 0, 1, 4).backColor("red");
sheet.getRange(3, -1, 1, -1).backColor("yellow");
sheet.addSpan(1, 0, 1, 2)
sheet.setRowCount(6)
var deleteSheetCommand = {
    canUndo: true,
    name: "deleteSheetCommand",
    execute: function (context, options, isUndo) {


        options.cmd = "gc.spread.contextMenu.deleteSheet";
        console.log("do Some thing here~", options)
        context.commandManager().execute(options);
        options.cmd = "deleteSheetCommand";
        return true;

    }
};

spread.commandManager().register("deleteSheetCommand", deleteSheetCommand);

function MyContextMenu() { }
MyContextMenu.prototype = new GC.Spread.Sheets.ContextMenu.ContextMenu(spread);
MyContextMenu.prototype.onOpenMenu = function (menuData, itemsDataForShown, hitInfo, spread) {
    itemsDataForShown.forEach(function (item, index) {
        if (item && item.name === "gc.spread.deleteSheet") {
            item.text = "自定义右键菜单-删除"
            item.command = "deleteSheetCommand"
        }
    });
};
var contextMenu = new MyContextMenu();
spread.contextMenu = contextMenu;
