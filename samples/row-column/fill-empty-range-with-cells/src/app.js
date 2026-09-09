import * as GC from "@grapecity-software/spread-sheets";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();

sheet.setRowCount(5)
sheet.setColumnCount(5)

document.getElementById("fill").addEventListener("click", function () {
    let sheet = spread.getActiveSheet();
    //  获取viewport行高
    let viewportHeight = sheet.getViewportHeight(1);
    //  获取viewport列宽
    let viewportWidth = sheet.getViewportWidth(1);
    //  获取当前sheet总行高
    let heightSum = 0;
    for (let i = 0; i < sheet.getRowCount(); i++) {
        heightSum += sheet.getRowHeight(i);
    }
    //  获取当前sheet总列宽
    let widthSum = 0;
    for (let j = 0; j < sheet.getColumnCount(); j++) {
        widthSum += sheet.getColumnWidth(j);
    }
    //  计算填满空白区域所需新增行数
    let addedRowCount = Math.ceil((viewportHeight - heightSum) / sheet.getRowHeight(0));
    //  计算填满空白区域所需新增列数
    let addedColCount = Math.ceil((viewportWidth - widthSum) / sheet.getColumnWidth(0));
    //  扩展行数
    sheet.setRowCount(sheet.getRowCount() + addedRowCount);
    //  扩展列数
    sheet.setColumnCount(sheet.getColumnCount() + addedColCount);
})