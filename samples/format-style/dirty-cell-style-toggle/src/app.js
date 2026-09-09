import * as GC from "@grapecity-software/spread-sheets";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();


document.querySelector("#button1").addEventListener("click", function () {
    var style = new GC.Spread.Sheets.Style();
    style.backColor = "yellow";

    sheet.cellStates.add(
        new GC.Spread.Sheets.Range(
            0,
            0,
            sheet.getRowCount(),
            sheet.getColumnCount()
        ),
        GC.Spread.Sheets.CellStatesType.dirty,
        style
    );
});

document.querySelector("#button2").addEventListener("click", function () {
    sheet.cellStates.clear(
        new GC.Spread.Sheets.Range(
            0,
            0,
            sheet.getRowCount(),
            sheet.getColumnCount()
        ),
        GC.Spread.Sheets.SheetArea.viewport
    );
    sheet.repaint();
});