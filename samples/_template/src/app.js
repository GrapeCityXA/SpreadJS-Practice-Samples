import * as GC from "@grapecity-software/spread-sheets";

GC.Spread.Sheets.LicenseKey = "";

const spread = new GC.Spread.Sheets.Workbook(
  document.getElementById("spread-host")
);
const sheet = spread.getActiveSheet();

sheet.setValue(0, 0, "SpreadJS Demo");
sheet.setValue(1, 0, "Replace this template with the local sample logic.");
