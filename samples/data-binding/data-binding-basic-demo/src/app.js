import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-excelio";
import "@grapecity-software/spread-sheets-charts";
import "@grapecity-software/spread-sheets-print";
import "@grapecity-software/spread-sheets-pdf";
import "@grapecity-software/spread-sheets-barcode";
import "@grapecity-software/spread-sheets-languagepackages";
import "@grapecity-software/spread-sheets-shapes";
import "@grapecity-software/spread-sheets-pivot-addon";
import "@grapecity-software/spread-sheets-designer-resources-cn";
import "@grapecity-software/spread-sheets-designer";

GC.Spread.Sheets.Designer.LicenseKey = "";
GC.Spread.Sheets.LicenseKey = "";

import { myTemplate } from "./template.js";
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container");
let spread = designer.getWorkbook();
spread.fromJSON(myTemplate);

let sheet = spread.getActiveSheet();
let dbSource = {
  textField_02: "主表头",
  textField_01: {
    subField_01: "子表头_01",
    subField_02: "子表头_02",
  },
  table_01: [
    {
      tField_01: 5,
      tField_02: 10,
    },
    {
      tField_01: 6,
      tField_02: 20,
    },
    {
      tField_01: 7,
      tField_02: 30,
    },
  ],
};
let dataSource = new GC.Spread.Sheets.Bindings.CellBindingSource(dbSource);
sheet.setDataSource(dataSource);

document.getElementById("btn").addEventListener("click", function () {
  console.log(sheet.getDataSource().getSource());
});
