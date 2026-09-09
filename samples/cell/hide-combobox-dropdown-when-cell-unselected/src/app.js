import * as GC from "@grapecity-software/spread-sheets";


const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();


let text = new GC.Spread.Sheets.CellTypes.DataObject();
sheet.getCell(1, 2, GC.Spread.Sheets.SheetArea.viewport).tag(
    JSON.stringify([
        { text: "Oranges", value: "11k" },
        { text: "Apples", value: "15k" },
        { text: "Grape", value: "100k" },
    ])
);

let style = new GC.Spread.Sheets.Style()
style.backColor = "yellow"
sheet.setStyle(1, 2, style)

let lastComboCellRow;
let lastComboCellCol;
spread.bind(GC.Spread.Sheets.Events.CellClick, function (e, info) {
    let row = info.sheet.getActiveRowIndex()
    let col = info.sheet.getActiveColumnIndex()

    if (lastComboCellRow && lastComboCellCol) {
        info.sheet.getCell(lastComboCellRow, lastComboCellCol, GC.Spread.Sheets.SheetArea.viewport).cellType(text);
        lastComboCellRow = undefined;
        lastComboCellCol = undefined;
        return;
    }

    if (info.sheet.getCell(row, col).tag()) {
        if (info.sheet.getCell(row, col).cellType() instanceof GC.Spread.Sheets.CellTypes.ComboBox) {
            return;
        }

        lastComboCellRow = row;
        lastComboCellCol = col;

        info.sheet.suspendPaint()
        let newCombo = new GC.Spread.Sheets.CellTypes.ComboBox();
        newCombo.items(JSON.parse(sheet.getCell(row, col).tag()))
        newCombo.editorValueType(GC.Spread.Sheets.CellTypes.EditorValueType.text);
        info.sheet.getCell(lastComboCellRow, lastComboCellCol, GC.Spread.Sheets.SheetArea.viewport).cellType(newCombo);
        info.sheet.resumePaint()
        info.sheet.clearSelection();
        info.sheet.setSelection(lastComboCellRow, lastComboCellCol, 1, 1);
    }
});