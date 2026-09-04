import * as GC from "@grapecity-software/spread-sheets";

if(top.location.href.indexOf("/serve/share/") != "-1"){
    document.getElementById("tip").style.display = "none"
}

let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let activeSheet = spread.getActiveSheet()

// 设置数据
spread.suspendPaint()
let rowCount = 5000;
let colCount = 25;
activeSheet.setColumnCount(colCount);
activeSheet.setRowCount(rowCount);
activeSheet.setColumnWidth(0, 200)
console.time("start")
for (let r = 0; r < rowCount - 1; r++) {
    for (let c = 0; c < colCount - 1; c++) {
        activeSheet.setValue(r, c, `r${r}c${c}`)
        activeSheet.getRange(r, c, 1, 1).textIndent(1 + (r % 6));
    }
}
console.timeEnd("start")

activeSheet.outlineColumn.options({
    columnIndex: 0,
    showImage: true,
    showCheckBox: true,
    images: ['star2.png', 'box4.png', 'rating4.png'],
    maxLevel: 6
});
activeSheet.showRowOutline(false);
spread.invalidateLayout();
spread.repaint();

spread.resumePaint()


// 计算当前sheet可视的行数
let visibleLines
let topRow = activeSheet.getViewportTopRow(1)
let bottomRow = activeSheet.getViewportBottomRow(1)
visibleLines = bottomRow - topRow
console.log("visibleLines=", visibleLines)

// 监听滚动事件
activeSheet.bind(GC.Spread.Sheets.Events.TopRowChanged, function (sender, args) {
    console.log(args)

    console.time("scroll")
    spread.suspendPaint()
    spread.suspendEvent()

    handleCollapse(args.sheet, args.newTopRow)

    spread.resumeEvent()
    spread.resumePaint()
    console.timeEnd("scroll")
});

// 监听缩放，动态修改visibleLines
activeSheet.bind(GC.Spread.Sheets.Events.ViewZoomed, function (e, info) {
    let topRow = info.sheet.getViewportTopRow(1)
    let bottomRow = info.sheet.getViewportBottomRow(1)
    visibleLines = bottomRow - topRow
});


let collapsed = false
document.getElementById("btn").addEventListener("click", function () {
    spread.suspendPaint()
    spread.suspendEvent()
    collapsed = !collapsed
    let sheet = spread.getActiveSheet()

    handleCollapse(sheet)

    spread.resumeEvent()
    spread.resumePaint()
    console.log(collapsed ? "已折叠" : "已展开")
})

function handleCollapse(sheet, tr) {
    let topRow = tr || sheet.getViewportTopRow(1)
    console.log(topRow)

    let outlineColumn = sheet.outlineColumn
    if (sheet.getRange(topRow, 0, 1, 1).textIndent != 1 && collapsed) {
        for (let r = topRow; r >= 0; r--) {
            if (sheet.getRange(r, 0, 1, 1).textIndent() == 1) {
                outlineColumn.setCollapsed(r, collapsed)
                topRow = r
                break
            }
        }
    }

    let count = 0
    let curRow = topRow
    while (count < visibleLines && sheet.getRowCount() > curRow) {
        if (sheet.getRange(curRow, 0, 1, 1).textIndent() == 1 && outlineColumn.getCollapsed(curRow) != collapsed) {
            outlineColumn.setCollapsed(curRow, collapsed)
        }
        if (sheet.getRowVisible(curRow)) {
            count++
        }
        curRow++
    }
    sheet.showCell(topRow, 0)
}
