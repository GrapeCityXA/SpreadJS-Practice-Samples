import * as GC from "@grapecity-software/spread-sheets";
// Title:自定义多行列头排序
// Description：自定义多行列头排序
// Tag:排序

var spreadNS = GC.Spread.Sheets;

var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
initSpread(spread);


function initSpread(spread) {

    // Define sort header cell types
    function SortHearderCellType() {}
    SortHearderCellType.prototype = new spreadNS.CellTypes.ColumnHeader();
    SortHearderCellType.prototype.paint = function(ctx, value, x, y, width, height, style, context) {
        spreadNS.CellTypes.ColumnHeader.prototype.paint.apply(this, arguments);
        var margin = 3;
        var gap = 1;
        var color = "red";
        var size = 20;
        var tag = context.sheet.getTag(context.row, context.col, context.sheetArea);
        ctx.save();
        if (!tag || tag && tag.ascending) {
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.moveTo(x + width - size + margin, y + height / 2 - gap);
            ctx.lineTo(x + width - margin, y + height / 2 - gap);
            ctx.lineTo(x + width - size / 2, y + (height - size) / 2 + margin);
            ctx.closePath();
            ctx.fill();
        }
        if (!tag || tag && !tag.ascending) {
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.moveTo(x + width - size + margin, y + height / 2 + gap);
            ctx.lineTo(x + width - margin, y + height / 2 + gap);
            ctx.lineTo(x + width - size / 2, y + (height + size) / 2 - margin);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    };
    SortHearderCellType.prototype.getHitInfo = function(x, y, cellStyle, cellRect, context) {
        var hitInfo = {
            x: x,
            y: y,
            row: context.row,
            col: context.col,
            cellRect: cellRect,
            sheetArea: context.sheetArea,
            sheet: context.sheet
        };
        if (x > cellRect.x + cellRect.width - cellRect.height) {
            hitInfo.isReservedLocation = true;
        }
        return hitInfo;
    };
    SortHearderCellType.prototype.processMouseDown = function(hitInfo) {};
    SortHearderCellType.prototype.processMouseMove = function(hitInfo) {};
    SortHearderCellType.prototype.processMouseUp = function(hitInfo) {
        if (hitInfo.isReservedLocation) {
            var sheet = hitInfo.sheet,
                sheetArea = hitInfo.sheetArea,
                row = hitInfo.row,
                col = hitInfo.col;
            var tag = sheet.getTag(row, col, sheetArea) || {};
            tag.ascending = !tag.ascending;
            sheet.setTag(row, col, tag, sheetArea);
            sheet.sortRange(0, 0, -1, -1, true, [{
                index: col,
                ascending: tag.ascending
            }]);
        }
    };
    SortHearderCellType.prototype.processMouseEnter = function(hitInfo) {};
    SortHearderCellType.prototype.processMouseLeave = function(hitInfo) {};

    var rowCount = 50,
        columnCount = 20;
    var sheet = spread.getSheet(0);
    sheet.suspendPaint();

    sheet.setRowCount(rowCount);
    sheet.setColumnCount(columnCount);
    sheet.setColumnWidth(0, 60, spreadNS.SheetArea.rowHeader);

    // 设置复杂表头
    sheet.setRowCount(3, spreadNS.SheetArea.colHeader);
    sheet.addSpan(0, 0, 3, 1, spreadNS.SheetArea.colHeader);
    sheet.setValue(0, 0, "第1列", spreadNS.SheetArea.colHeader);

    sheet.addSpan(0, 1, 3, 1, spreadNS.SheetArea.colHeader);
    sheet.setValue(0, 1, "第2列", spreadNS.SheetArea.colHeader);

    sheet.addSpan(1, 2, 2, 1, spreadNS.SheetArea.colHeader);
    sheet.setValue(1, 2, "第3列", spreadNS.SheetArea.colHeader);

    sheet.addSpan(1, 3, 2, 1, spreadNS.SheetArea.colHeader);
    sheet.setValue(1, 3, "第4列", spreadNS.SheetArea.colHeader);

    sheet.addSpan(0, 2, 1, 2, spreadNS.SheetArea.colHeader);
    sheet.setValue(0, 2, "合并列头", spreadNS.SheetArea.colHeader);

    sheet.setValue(2, 4, "第5列", spreadNS.SheetArea.colHeader);

    fillSampleData(sheet, new spreadNS.Range(0, 0, rowCount, columnCount));

    sheet.setCellType(0, 1, new SortHearderCellType(), spreadNS.SheetArea.colHeader);
    sheet.setCellType(1, 2, new SortHearderCellType(), spreadNS.SheetArea.colHeader);
    sheet.setCellType(1, 3, new SortHearderCellType(), spreadNS.SheetArea.colHeader);
    sheet.setCellType(2, 4, new SortHearderCellType(), spreadNS.SheetArea.colHeader);

    sheet.resumePaint();

};

function fillSampleData(sheet, range) {
    for (var i = 0; i < range.rowCount; i++) {
        for (var j = 0; j < range.colCount; j++) {
            sheet.setValue(range.row + i, range.col + j, Math.ceil(Math.random() * 300) - 100);
        }
    }
};