import * as GC from "@grapecity-software/spread-sheets";
import { file } from "./file.js";
GC.Spread.Sheets.LicenseKey = "";

let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
spread.fromJSON(file);
let sheet = spread.getActiveSheet();

sheet.bind(GC.Spread.Sheets.Events.ClipboardPasting, function (sender, args) {
  let range = args.cellRange;
  let { row, col, rowCount, colCount } = range;
  for (let i = row; i < rowCount + row; i++) {
    for (let j = col; j < colCount + col; j++) {
      if (
        sheet.getDataValidator(i, j) &&
        sheet.getDataValidator(i, j).type() == 3
      ) {
        args.cancel = true;
        return;
      }
    }
  }
});

sheet.bind(GC.Spread.Sheets.Events.EditStarting, function (sender, args) {
  let { row, col } = args;

  if (
    sheet.getDataValidator(row, col) &&
    sheet.getDataValidator(row, col).type() == 3
  ) {
    args.cancel = true;
  }
});
