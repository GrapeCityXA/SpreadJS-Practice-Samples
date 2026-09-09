import * as GC from "@grapecity-software/spread-sheets";
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"), {
    sheetCount: 1
});
GC.Spread.Common.CultureManager.culture("zh-cn");
var sheet = spread.getActiveSheet();
sheet.options.isProtected = true;
sheet.setRowCount(10);
sheet.setValue(3,0,"←请在这里点击右键，查看隐藏和取消隐藏按钮")
/*
 *  通过继承ContextMenu的方式自定义右键菜单逻辑
 * */
function ContextMenu() {}
ContextMenu.prototype = new GC.Spread.Sheets.ContextMenu.ContextMenu(spread);
/*
 * onOpenMenu是右键菜单弹出前触发的事件，可以用来自定义右键菜单项
 * itemsDataForShown 是本次右键单击弹出的右键菜单项
 * */
ContextMenu.prototype.onOpenMenu = function(menuData, itemsDataForShown, hitInfo, spread) {

    for (let i = 0; i < itemsDataForShown.length; i++) {
        var item = itemsDataForShown[i];
        if (item.name === "gc.spread.hideRows") {
            item.text = "隐藏（改写）"
            item.disable = false;
        } else if (item.name === "gc.spread.unhideRows") {
            item.text = "取消隐藏（改写）"
            item.disable = false;
        }
    }
};

// 将自定义右键菜单赋值给spread.contextMenu
spread.contextMenu = new ContextMenu();