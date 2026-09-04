import * as GC from "@grapecity-software/spread-sheets";


new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let spread = new GC.Spread.Sheets.findControl(document.getElementById("ss"));
let activeSheet = spread.getActiveSheet();
activeSheet.selectionPolicy(GC.Spread.Sheets.SelectionPolicy.range);
activeSheet.selectionUnit(GC.Spread.Sheets.SelectionUnit.cell);
activeSheet.bind(GC.Spread.Sheets.Events.SelectionChanged, function (e, info) {
    var selection = activeSheet.getSelections()[0];
    let activeSheetName = activeSheet.name();
    document.getElementById('reference').value = activeSheetName + "!" + GC.Spread.Sheets.CalcEngine.rangeToFormula(selection, 0, 0, GC.Spread.Sheets.CalcEngine.RangeReferenceRelative.allRelative);
});