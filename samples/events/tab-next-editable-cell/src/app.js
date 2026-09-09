import * as GC from "@grapecity-software/spread-sheets";
var spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'), {
    sheetCount: 1
});

var activeSheet = spread.getActiveSheet();
activeSheet.setRowCount(10);
activeSheet.setColumnCount(10)

var unLockedStyle = new GC.Spread.Sheets.Style();
unLockedStyle.backColor = "lightgreen";
//unLockedStyle.locked = false;
activeSheet.setStyle(0, 0, unLockedStyle);
activeSheet.getCell(0, 0).locked(false);
activeSheet.setStyle(0, 9, unLockedStyle);
activeSheet.getCell(0, 9).locked(false);
activeSheet.setStyle(3, 3, unLockedStyle);
activeSheet.getCell(3, 3).locked(false);
activeSheet.setStyle(4, 4, unLockedStyle);
activeSheet.getCell(4, 4).locked(false);
activeSheet.setStyle(8, 8, unLockedStyle);
activeSheet.getCell(8, 8).locked(false);
activeSheet.setStyle(9, 0, unLockedStyle);
activeSheet.getCell(9, 0).locked(false);
activeSheet.setStyle(9, 9, unLockedStyle);
activeSheet.getCell(9, 9).locked(false);
activeSheet.options.isProtected = true;
spread.commandManager().register('mytab', function(spread) {
    spread.suspendEvent();
    var startRow, startCol, row, col, searchStartRow, searchStartCol;
    var isLocked;
    var activeSheet = spread.getActiveSheet();
    startRow = activeSheet.getActiveRowIndex();
    startCol = activeSheet.getActiveColumnIndex();

    var rowCount = activeSheet.getRowCount();
    var colCount = activeSheet.getColumnCount();


    searchStartRow = startRow;
    for (row = startRow; row < rowCount; row++) {

        searchStartCol = row === startRow ? startCol + 1 : 0;

        if (searchStartCol == colCount) {
            row++;
            searchStartCol = 0;
        }

        for (col = searchStartCol; col < colCount; col++) {
            isLocked = activeSheet.getCell(row, col).locked();
            if (!isLocked) {

                if (!activeSheet.endEdit()) {
                    return
                }
                activeSheet.setActiveCell(row, col);
                return;
            }
        }
    }

    for (row = 0; row < rowCount; row++) {
        for (col = 0; col < colCount; col++) {
            if (row === startRow && col === startCol) {
                return
            }

            isLocked = activeSheet.getCell(row, col).locked();
            if (!isLocked) {

                if (!activeSheet.endEdit()) {
                    return
                }
                activeSheet.setActiveCell(row, col);
                return;
            }
        }
    }
    spread.resumeEvent();
});
spread.commandManager().setShortcutKey(null, GC.Spread.Commands.Key.tab, false, false, false, false);
spread.commandManager().setShortcutKey('mytab', GC.Spread.Commands.Key.tab, false, false, false, false);