import * as GC from "@grapecity-software/spread-sheets";


const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();


sheet.setRowCount(10)
// 测试数据
sheet.setValue(0, 0, 1);
sheet.setValue(0, 1, 2);
sheet.setValue(1, 0, 3);
sheet.setValue(1, 1, 4);
sheet.setValue(2,0,"⬅️请复制多行后，在行头点击右键菜单的\"插入粘贴\"")
// TODO
let copySelection;
//重写Ctrl+C复制
spread.commandManager().register('mycopy', function () {
    copySelection = sheet.getSelections()[0];
});
spread.commandManager().setShortcutKey('mycopy', GC.Spread.Commands.Key.c, true, false, false, false);
let openDialog = {
    text: '插入新行并粘贴',
    name: 'openDialog',
    command: insertPaste,
    workArea: 'rowheader'// 生效区域
};
spread.contextMenu.menuData.push(openDialog);
function insertPaste() {
    let selection = sheet.getSelections()[0];
    let row = selection.row;// 粘贴的行索引
    let col = selection.col;// 粘贴的列索引
    let rowCount = copySelection.rowCount;// 复制的行数
    let colCount = copySelection.colCount;// 复制的行数
    sheet.addRows(row, rowCount);// 增加rowCount-1行，因为你选中的位置也算一行
    let fromRange = [new GC.Spread.Sheets.Range(copySelection.row, copySelection.col, rowCount, colCount)];
    let toRange = [new GC.Spread.Sheets.Range(row, col, rowCount, colCount)];
    spread.commandManager().execute({ cmd: "clipboardPaste", sheetName: sheet.name(), fromSheet: sheet, fromRanges: fromRange, pastedRanges: toRange, isCutting: false, clipboardText: "", pasteOption: GC.Spread.Sheets.ClipboardPasteOptions.all });
}
//重写右键菜单复制
function myContextMenuCopy() {
    copySelection = sheet.getSelections()[0];
    spread.commandManager().execute({ cmd: "gc.spread.contextMenu.copy", sheetName: sheet.name() });
}
for (var i = 0; i < spread.contextMenu.menuData.length; i++) {
    if (spread.contextMenu.menuData[i].name == "gc.spread.copy") {
        spread.contextMenu.menuData[i].command = myContextMenuCopy
    }
}