import * as GC from "@grapecity-software/spread-sheets";
import { getData } from "./data.js";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();

var style = new GC.Spread.Sheets.Style();
style.formatter = "0";
style.backColor = "green"
var ranges = [new GC.Spread.Sheets.Range(0, 0, 2, 3)];
sheet.conditionalFormats.addFormulaRule("=IF(MOD(A1,1),,A1)", style, ranges);
sheet.setFormatter(0, 0, '0.00')
sheet.setValue(0, 0, 2);
sheet.setValue(0, 1, 1.334);
sheet.setValue(0, 2, 5.3);
sheet.setValue(1, 0, 7.00);
