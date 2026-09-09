import * as GC from "@grapecity-software/spread-sheets";
import { getData } from "./data.js";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
var color = ["#0055FF", "#008000", "#B300CC", "#800000", "#00CC33"];
var sheet = spread.getActiveSheet();
sheet.setFormula(0, 0, "=SUM(C2,D2,E2,F2,G2)");
sheet.getRange("C2").value(1);
sheet.getRange("D2").value(2);
sheet.getRange("E2").value(3);
sheet.getRange("F2").value(4);
sheet.getRange("G2").value(5);
sheet.clearSelection();

sheet.bind(GC.Spread.Sheets.Events.CellClick, function (sender, args) {
    var childNodes = sheet.getPrecedents(args.row, args.col);

    if (childNodes.length > 0) {
        spread.suspendPaint();
        for (var i = 0; i < childNodes.length; i++) {
            sheet.getRange(childNodes[i].row, childNodes[i].col, childNodes[i].rowCount, childNodes[i].colCount, GC.Spread.Sheets.SheetArea.viewport).setBorder(new GC.Spread.Sheets.LineBorder(color[i], GC.Spread.Sheets.LineStyle.medium), { all: true });
        }
        spread.resumePaint();

    } else {
        spread.suspendPaint();
        sheet.getRange(0, 0, sheet.getRowCount(), sheet.getColumnCount(), GC.Spread.Sheets.SheetArea.viewport).setBorder(new GC.Spread.Sheets.LineBorder(GC.Spread.Sheets.LineStyle.empty), { all: true });
        spread.resumePaint();

    }

});
