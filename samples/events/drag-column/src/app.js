import * as GC from "@grapecity-software/spread-sheets";
var oldDragDropExcecte = GC.Spread.Sheets.Commands.dragDrop.execute;
GC.Spread.Sheets.Commands.dragDrop.execute = function (context, option, isUndo) {
    if (option.fromRow === -1 || option.fromColumn === -1) {
        option.insert = true;
    }
    oldDragDropExcecte.call(this, context, option, isUndo);
}

var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));

var sheet = spread.getActiveSheet();

sheet.setValue(0, 0, 0);
sheet.setValue(0, 1, 1);
sheet.setValue(0, 2, 2);
sheet.setValue(0, 3, 3);