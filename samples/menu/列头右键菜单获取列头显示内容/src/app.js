import * as GC from "@grapecity-software/spread-sheets";

/**
 * 点击列头右键菜单，弹出列号
 */
let spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'));
let sheet = spread.getActiveSheet();
//设置列头为2行
sheet.setRowCount(2, 1);
sheet.addSpan(0, 3, 1, 2, GC.Spread.Sheets.SheetArea.colHeader);
sheet.setValue(0, 3, "2019", GC.Spread.Sheets.SheetArea.colHeader)

//自定义菜单
function MyContextMenu() { }
MyContextMenu.prototype = new GC.Spread.Sheets.ContextMenu.ContextMenu(spread);
MyContextMenu.prototype.onOpenMenu = function (menuData, itemsDataForShown, hitInfo, spread) {
    // 获取点击的行列信息
    let worksheetHitInfo = hitInfo.worksheetHitInfo;
    // 表示选择的是列头右键菜单
    if (worksheetHitInfo.rowViewportIndex == -1) {
        // 获取行列索引
        let row = worksheetHitInfo.row;
        let col = worksheetHitInfo.col;
        // 判断是否为合并单元格，如果是则获取合并单元格左上角单元格的row、col，进一步获取合并单元格的实际value
        let range = new GC.Spread.Sheets.Range(row, col, 1, 1);
        let spanArr = sheet.getSpans(range, GC.Spread.Sheets.SheetArea.colHeader);
        if (spanArr.length > 0) {
            let relRow = spanArr[0].row;
            let relCol = spanArr[0].col;
            let relValue = sheet.getValue(relRow, relCol, GC.Spread.Sheets.SheetArea.colHeader);
            alert("选择列头单元格的值为" + relValue);
        } else {
            let value = sheet.getValue(row, col, GC.Spread.Sheets.SheetArea.colHeader);
            alert("选择列头单元格的值为" + value);
        }

    }

};
//将自定义菜单应用到spread
let contextMenu = new MyContextMenu();
spread.contextMenu = contextMenu;