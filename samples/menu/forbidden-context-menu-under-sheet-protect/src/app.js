import * as GC from "@grapecity-software/spread-sheets";
/**
 * 表单保护状态下右键自定义功能FormatCells无法使用，取消保护状态时，右键自定义功能FormatCells可以使用
 */
let spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'));
let sheet = spread.getActiveSheet();

//自定义菜单对象
function ContextMenu() { }
ContextMenu.prototype = new GC.Spread.Sheets.ContextMenu.ContextMenu(spread);
ContextMenu.prototype.onOpenMenu = function (menuData, itemsDataForShown, hitInfo, spread) {
    if (sheet.options.isProtected === true) {
        for (let i = 0; i < itemsDataForShown.length; i++) {
            let item = itemsDataForShown[i];
            if (item.name === "markWithRedBg") {
                item.disable = true;
            }
        }
    }
};
//将自定义菜单应用到spread上
spread.contextMenu = new ContextMenu();


//自定义菜单子项，并将其添加到菜单列表中
let markWithRedBg = {
    text: "Format Cells",
    name: "markWithRedBg",
    command: "markWithRedBg",
    iconClass: "gc-spread-copy",
    workArea: "viewport"
};
spread.contextMenu.menuData.push(markWithRedBg);

//获取命令管理器 
let commandManager = spread.commandManager();
//自定义命令 给选中区域设置样式
let markWithRedBgCommand = {
    canUndo: false,
    execute: function () {
        let style = new GC.Spread.Sheets.Style();
        style.name = 'style1';
        style.backColor = 'red';
        let sheet = spread.getActiveSheet();
        sheet.suspendPaint();
        let selections = sheet.getSelections();
        let selectionIndex = 0,
            selectionCount = selections.length;
        for (; selectionIndex < selectionCount; selectionIndex++) {
            let selection = selections[selectionIndex];
            for (let i = selection.row; i < (selection.row + selection.rowCount); i++) {
                for (let j = selection.col; j < (selection.col + selection.colCount); j++) {
                    sheet.setStyle(i, j, style, GC.Spread.Sheets.SheetArea.viewport);
                }
            }
        }
        sheet.resumePaint();
    }
};
//将命令注册到命令管理器
commandManager.register("markWithRedBg", markWithRedBgCommand, null, false, false, false, false);

document.getElementById("protect").addEventListener("click", function (e) {
    sheet.options.isProtected === true ? sheet.options.isProtected = false : sheet.options.isProtected = true;
    sheet.options.isProtected === true ? document.getElementById("state").innerHTML = "表单已锁定,看下右键菜单最后一项目" : document.getElementById("state").innerHTML = "表单已解锁,看下右键菜单最后一项目";
})