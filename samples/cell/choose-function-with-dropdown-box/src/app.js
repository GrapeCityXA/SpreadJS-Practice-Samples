import * as GC from "@grapecity-software/spread-sheets";


let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let sheet = spread.getActiveSheet()

sheet.setArray(0, 0, [[1, 2, 3], [4, 5, 6], [7, 8, 9]]);

var combo = new GC.Spread.Sheets.CellTypes.ComboBox();

combo.items([
    { text: "=SUM(A1:B2)", value: "=SUM(A1:B2)" },
    { text: "=SUM(A1:C3)", value: "=SUM(A1:C3)" }])
    .editorValueType(GC.Spread.Sheets.CellTypes.EditorValueType.value);

sheet.getCell(0, 3, GC.Spread.Sheets.SheetArea.viewport).cellType(combo);
sheet.setColumnWidth(3, 100)