import * as GC from "@grapecity-software/spread-sheets";


let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));

let commandManager = spread.commandManager();
let selectionBottomCmd = {
    canUndo: true,
    execute: function (spread, options, isUndo) {
        let Commands = GC.Spread.Sheets.Commands;
        if (isUndo) {
            Commands.undoTransaction(spread, options);
            return true;
        } else {
            Commands.startTransaction(spread, options);
            console.log("start");
            spread.suspendPaint();
            let sheet = spread.getActiveSheet();
            let selections = sheet.getSelections();
            let newselection = [];

            selections.forEach((selection) => {
                let searchCondition = new GC.Spread.Sheets.Search.SearchCondition();
                searchCondition.searchString = "?";
                searchCondition.startSheetIndex = spread.getActiveSheetIndex();
                searchCondition.endSheetIndex = spread.getActiveSheetIndex();
                searchCondition.columnStart = selection.col;
                searchCondition.columnEnd = selection.col + selection.colCount - 1;
                searchCondition.rowStart = selection.row + selection.rowCount;
                searchCondition.rowEnd = sheet.getRowCount() - 1;
                searchCondition.searchFlags = GC.Spread.Sheets.Search.SearchFlags.ignoreCase | GC.Spread.Sheets.Search.SearchFlags.useWildCards | GC.Spread.Sheets.Search.SearchFlags.blockRange;
                let searchresult = sheet.search(searchCondition);
                let newendrowindx = searchresult.foundRowIndex != -1 ? searchresult.foundRowIndex : sheet.getRowCount() - 1;
                newselection.push(new GC.Spread.Sheets.Range(selection.row, selection.col, newendrowindx - selection.row + 1, selection.colCount))

            });
            sheet.clearSelection();
            newselection.forEach((selection) => {
                console.log(selection);
                if (selection)
                    sheet.addSelection(selection.row, selection.col, selection.rowCount, selection.colCount)
            })
            spread.resumePaint();
            Commands.endTransaction(spread, options);
            return true;
        }
    }
};
commandManager.register('selectionBottom', selectionBottomCmd, 40, true, true);

let sheet = spread.getActiveSheet()
sheet.setValue(1,1,1)
sheet.setValue(2,1,2)
sheet.setValue(4,1,3)
sheet.setValue(5,1,4)
sheet.setValue(7,1,5)
sheet.setValue(8,1,6)
sheet.setValue(9,1,7)




