import * as GC from "@grapecity-software/spread-sheets";
import HighlightLayout from "./highlightLayout.js"



let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss")); 
let sheet = spread.getActiveSheet();

sheet.setColumnWidth(0, 160);
sheet.setColumnWidth(1, 70);
sheet.setColumnWidth(2, 90);
sheet.setColumnWidth(3, 110);
sheet.setColumnWidth(4, 80);
sheet.setColumnWidth(6, 110);

sheet.frozenRowCount(4);
let highlightLayout = new HighlightLayout();
highlightLayout.bind(spread)
highlightLayout.addRanges("Sheet1", "user1",
 [new GC.Spread.Sheets.Range(40, 4, 4, 4), new GC.Spread.Sheets.Range(5, 4, 8, 4)], { borderColor: "lightGreen" })