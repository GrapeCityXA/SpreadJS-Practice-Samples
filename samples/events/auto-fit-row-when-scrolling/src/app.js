import * as GC from "@grapecity-software/spread-sheets";


let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));

// 开始计时
console.time("rowFit")

let sheet = spread.getActiveSheet();
// 初始化一些数据
spread.suspendPaint()
sheet.setRowCount(5000)
for (let row = 0; row < 5000; row++) {
    for (let col = 0; col < 30; col++) {
        sheet.setValue(row, col, `测试文字${row}-----${col}`)
    }
}
sheet.getRange(-1, -1, -1, -1).wordWrap(true)
spread.resumePaint()

let fitedRows = {}
// 调整行高的逻辑
function autoFitViewportArea(sheet) {
    let topRow = sheet.getViewportTopRow(1)
    let bottomRow = sheet.getViewportBottomRow(1);
    sheet.suspendPaint();
    for (let row = topRow; row <= bottomRow; row++) {
        // 记录已经被调整的行高，不重复处理，提升速度
        if (!fitedRows[row]) {
            sheet.autoFitRow(row);
            fitedRows[row] = 1
        }
    }
    sheet.resumePaint();
}

// 优化后的行高自动调整：随着滚动逐渐调整行高
function betterFitRows() {
    sheet.bind(GC.Spread.Sheets.Events.TopRowChanged, function (type, args) {
        autoFitViewportArea(args.sheet);
    });
    autoFitViewportArea(sheet);
    console.timeEnd("rowFit") // 6400ms
}

// 在一开始就调整所有行的行高
function defaultFitRows() {
    spread.suspendPaint()
    for (let row = 0; row < 5000; row++) {
        sheet.autoFitRow(row)
    }
    spread.resumePaint()
    console.timeEnd("rowFit")  // 31000ms
}


// 请打开F12，并自行更换为defaultFitRows，感受差距
betterFitRows()
// defaultFitRows()







