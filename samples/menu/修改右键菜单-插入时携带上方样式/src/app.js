import * as GC from "@grapecity-software/spread-sheets";


// Title:自定义右键菜单
// Description：自定义右键菜单：插入行复制样式
// Tag:自定义右键菜单，插入行复制样式

var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"), { sheetCount: 1 });
GC.Spread.Common.CultureManager.culture("zh-cn");

//定义插入复制样式insertRowsCopyStyle命令
var insertRowsCopyStyle = {
    canUndo: true,
    name: "insertRowsCopyStyle",
    execute: function (context, options, isUndo) {
        var Commands = GC.Spread.Sheets.Commands;
        if (isUndo) {
            Commands.undoTransaction(context, options);
            return true;
        } else {
            Commands.startTransaction(context, options);
            var sheet = context.getSheetFromName(options.sheetName);
            sheet.suspendPaint();
            // 先执行原生insertRows命令
            options.cmd = "gc.spread.contextMenu.insertRows"
            context.commandManager().execute(options);
            options.cmd = "insertRowsCopyStyle";

            var beforeRowCount = 0;
            if (options.selections && options.selections.length) {
                var selections = getSortedRowSelections(options.selections)
                for (var i = 0; i < selections.length; i++) {
                    var selection = selections[i];
                    if (selection.row > 0) {
                        for (var row = selection.row + beforeRowCount; row < selection.row + beforeRowCount + selection.rowCount; row++) {
                            sheet.copyTo(selection.row + beforeRowCount - 1, -1, row, -1, 1, -1, GC.Spread.Sheets.CopyToOptions.style | GC.Spread.Sheets.CopyToOptions.span);
                        }
                    }
                    beforeRowCount += selection.rowCount;
                }
            }
            sheet.resumePaint();

            Commands.endTransaction(context, options);
            return true;
        }
    }
};

// getSortedRowSelections为对selections按照row Index排序的方法
function getSortedRowSelections(selections) {
    var sortedRanges = selections;
    for (var i = 0; i < sortedRanges.length - 1; i++) {
        for (var j = i + 1; j < sortedRanges.length; j++) {
            if (sortedRanges[i].row > sortedRanges[j].row) {
                var temp = sortedRanges[i];
                sortedRanges[i] = sortedRanges[j];
                sortedRanges[j] = temp;
            }
        }
    }
    return sortedRanges;
}

// 注册命令
spread.commandManager().register("insertRowsCopyStyle", insertRowsCopyStyle);

// 替换原有插入命令
function MyContextMenu() { }
MyContextMenu.prototype = new GC.Spread.Sheets.ContextMenu.ContextMenu(spread);
MyContextMenu.prototype.onOpenMenu = function (menuData, itemsDataForShown, hitInfo, spread) {
    itemsDataForShown.forEach(function (item, index) {
        if (item && item.name === "gc.spread.insertRows") {
            item.text = "插入复制行样式"
            item.command = "insertRowsCopyStyle"
        }
    });

};


var contextMenu = new MyContextMenu();
spread.contextMenu = contextMenu;
var sheet = spread.getActiveSheet();
sheet.setArray(0, 0, [[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
sheet.getRange(2, -1, 1, -1).foreColor("blue").backColor("red");
sheet.setRowHeight(2, 50);
sheet.setValue(3,0,"←在此处点击鼠标右键 插入复制行样式")