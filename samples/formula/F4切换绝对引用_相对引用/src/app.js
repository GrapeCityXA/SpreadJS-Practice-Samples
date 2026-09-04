import * as GC from "@grapecity-software/spread-sheets";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();

sheet.setValue(0, 0, 1)
sheet.setValue(0, 1, 2)
sheet.setFormula(1, 1, "=SUM(A1, B1)")


spread.commandManager().setShortcutKey(
    "changeFormulaReference", 115, false, false, false, false
);