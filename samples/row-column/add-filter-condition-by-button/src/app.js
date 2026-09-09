import * as GC from "@grapecity-software/spread-sheets";
// Title: 自定义筛选
// Description：点击按钮添加/移除筛选按钮
// Tag:筛选


var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
var sheet = spread.getActiveSheet();
sheet.setArray(0, 0, [
    [1, 3, 2, 4],
    [2, 3, 2, 5],
    [2, 5, 3, 2]
])
sheet.rowFilter(new GC.Spread.Sheets.Filter.HideRowFilter(new GC.Spread.Sheets.Range(0, 0, 3, 4)));
sheet.getCell(4, 0).tag("aaa");

var insertRowsWithFilter = {
    canUndo: true,
    name: "insertRowsWithFilter",
    execute: function (context, options, isUndo) {
        var Commands = GC.Spread.Sheets.Commands;
        if (isUndo) {
            Commands.undoTransaction(context, options);
            return true;
        } else {
            Commands.startTransaction(context, options);
            var sheet = context.getSheetFromName(options.sheetName);
            sheet.getCell(4, 0).tag("sdf");
            options.cmd = "gc.spread.contextMenu.insertRows"
            context.commandManager().execute(options);
            options.cmd = "insertRowsWithFilter"

            var rowFilter = sheet.rowFilter(),
                range = rowFilter.range;
            rowFilter.range = new GC.Spread.Sheets.Range(range.row - 1, range.col, range.rowCount + 1, range.colCount)

            sheet.invalidateLayout()
            sheet.repaint()
            Commands.endTransaction(context, options);
            return true;
        }
    }
};
var commandManager = spread.commandManager();
commandManager.register("insertRowsWithFilter", insertRowsWithFilter);

function MyContextMenu() { }
MyContextMenu.prototype = new GC.Spread.Sheets.ContextMenu.ContextMenu(spread);
MyContextMenu.prototype.onOpenMenu = function (menuData, itemsDataForShown, hitInfo, spread) {
    // console.log(menuData);
    // console.log(itemsDataForShown);
    // console.log(hitInfo);
    // console.log(spread);
    //you can change itemsDataForShown to change filter result
    //if you only want to change filter result,return false or don't return anything
    //you also can open your own context menu,if you want to do this,return true
    //return true;
    var sheet = spread.getActiveSheet(),
        rowFilter = sheet.rowFilter();

    if (rowFilter) {
        var selections = sheet.getSelections(),
            range = rowFilter.range;

        selections.forEach(function (item, index) {
            if (item && item.row === range.row) {
                itemsDataForShown.forEach(function (item, index) {
                    if (item && item.name === "gc.spread.insertRows") {
                        item.command = "insertRowsWithFilter"
                    }
                });
                return;
            }
        });

    }

};

function CustomMenuView() { }
CustomMenuView.prototype = new GC.Spread.Sheets.ContextMenu.MenuView();
CustomMenuView.prototype.createMenuItemElement = function (menuItemData) {
    // create menu item view by your self
    // you can call super's createMenuItemElement here and only customize a few of menu item
    // should return menu item view back
    var supMenuItemContainer = GC.Spread.Sheets.ContextMenu.MenuView.prototype.createMenuItemElement
        .call(this, menuItemData);
    return supMenuItemContainer;
};
spread.contextMenu.menuView = new CustomMenuView();


var contextMenu = new MyContextMenu();
contextMenu.menuView = new CustomMenuView();
spread.contextMenu = contextMenu;



$("#addFilter").click(function () {
    var sheet = spread.getActiveSheet();
    var selections = sheet.getSelections();
    if (selections.length > 1) {
        alert("不能多选")
        return false;
    }
    var selection = selections[0];
    if (!sheet.rowFilter()) {
        sheet.rowFilter(new GC.Spread.Sheets.Filter.HideRowFilter(selection));
        return;
    }
});

$("#removeFilter").click(function () {
    var sheet = spread.getActiveSheet();

    if (sheet.rowFilter()) {
        sheet.rowFilter().unfilter();
        sheet.rowFilter(null);
        return;
    }
});