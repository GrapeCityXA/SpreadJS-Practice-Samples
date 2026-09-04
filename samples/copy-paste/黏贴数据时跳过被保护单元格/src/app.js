import * as GC from "@grapecity-software/spread-sheets";

/**
 * 该平台会限制复制，粘贴快捷键，请下载到本地测试
 * 绿色区域为非保护区域 可以黏贴数据 其它区域不可以黏贴
 ***/
let spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'));

var sheet = spread.getActiveSheet();
sheet.options.isProtected = true;

sheet.setValue(0, 0, "A1");
sheet.setValue(1, 0, "A2");
sheet.setValue(2, 0, "A3");
sheet.setValue(3, 0, "A4");
sheet.setValue(4, 0, "A5");

// 第7、8行未锁定
sheet.getCell(6, -1).locked(false).backColor("pink");
sheet.getCell(7, -1).locked(false).backColor("pink");

// 第5、6列未锁定
sheet.getCell(-1, 4).locked(false).backColor("pink");
sheet.getCell(-1, 5).locked(false).backColor("pink");

let pasteCommand = spread.commandManager().getCommand("paste");
let oldExecute = pasteCommand.execute;
pasteCommand.execute = function (context, propertyName, args) {
    let sheet = context.getActiveSheet();
    if (!sheet.isEditing()) {
        sheet.options.isProtected = false;
    }
    oldExecute.call(this, context, propertyName, args);
};

let cells;
sheet.bind(GC.Spread.Sheets.Events.ClipboardPasting, function (sender, args) {
    cells = [];
    let { row, col, rowCount, colCount } = args.cellRange;
    for (let r = row; r < row + rowCount; r++) {
        for (let c = col; c < col + colCount; c++) {
            let cell = sheet.getCell(r, c);
            if (cell == null) {
                continue;
            }
            cells.push({
                row: cell.row,
                col: cell.col,
                value: cell.value(),
                locked: cell.locked(),
            });
        }
    }
});

sheet.bind(GC.Spread.Sheets.Events.ClipboardPasted, function (sender, args) {
    let sheet = args.sheet;
    sheet.suspendPaint();
    console.log(cells);
    for (let i = 0; i < cells.length; i++) {
        let lockedCell = cells[i];
        sheet.getCell(lockedCell.row, lockedCell.col).locked(lockedCell.locked);
        if (lockedCell.locked) {
            sheet.setValue(lockedCell.row, lockedCell.col, lockedCell.value);
        }
    }
    sheet.options.isProtected = true;
    sheet.resumePaint();
});