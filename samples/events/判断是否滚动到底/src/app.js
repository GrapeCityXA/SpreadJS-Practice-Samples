import * as GC from "@grapecity-software/spread-sheets";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();


spread.options.scrollbarMaxAlign = true;

sheet.setColumnCount(40);

let totalWidth = 0;
for (let i = 0; i < sheet.getColumnCount(); i++) {
    totalWidth += sheet.getColumnWidth(i)
}

sheet.bind(GC.Spread.Sheets.Events.LeftColumnChanged, function (sender, args) {
    let leftColumn = args.newLeftCol;
    let width = 0;
    for (let i = 0; i < leftColumn; i++) {
        width += sheet.getColumnWidth(i);
    }
    console.log("左侧宽度：" + width);
    console.log("右侧宽度：" + (totalWidth - width));

    // 22为滚动条宽度
    if (spread.options.scrollByPixel) {
        let columnIndex = sheet.hitTest(sheet.getColumnWidth(0, GC.Spread.Sheets.SheetArea.rowHeader) + 1, sheet.getRowHeight(0, GC.Spread.Sheets.SheetArea.columnHeader) + 1).col;
        if ((totalWidth - width) - (spread.getHost().clientWidth - sheet.getColumnWidth(0, GC.Spread.Sheets.SheetArea.rowHeader) - 22 + sheet.getColumnWidth(columnIndex)) <= 0) {
            alert("到最右啦！");
        }
    } else {
        if ((totalWidth - width) - (spread.getHost().clientWidth - sheet.getColumnWidth(0, GC.Spread.Sheets.SheetArea.rowHeader) - 22) <= 0) {
            alert("到最右啦！");
        }
    }
});


sheet.setRowCount(50);

let totalHeight = 0;
for (let i = 0; i < sheet.getRowCount(); i++) {
    totalHeight += sheet.getRowHeight(i)
}

sheet.bind(GC.Spread.Sheets.Events.TopRowChanged, function (sender, args) {
    let topRow = args.newTopRow
    let height = 0;
    for (let i = 0; i < topRow; i++) {
        height += sheet.getRowHeight(i);
    }
    console.log("上侧高度：" + height);
    console.log("下侧高度：" + (totalHeight - height));

    // 22为滚动条宽度
    if (spread.options.scrollByPixel) {
        let rowIndex = sheet.hitTest(sheet.getRowHeight(0, GC.Spread.Sheets.SheetArea.rowHeader) + 1, sheet.getRowHeight(0, GC.Spread.Sheets.SheetArea.columnHeader) + 1).row;
        if ((totalHeight - height) - (spread.getHost().clientHeight - sheet.getRowHeight(0, GC.Spread.Sheets.SheetArea.rowHeader) - 22 + sheet.getRowHeight(rowIndex)) <= 0) {
            alert("到底啦！");
        }
    } else {
        if ((totalHeight - height) - (spread.getHost().clientHeight - sheet.getRowHeight(0, GC.Spread.Sheets.SheetArea.rowHeader) - 22) <= 0) {
            alert("到底啦！");
        }
    }
});