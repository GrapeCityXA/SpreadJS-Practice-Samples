import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-excelio";
import "@grapecity-software/spread-sheets-charts";
import "@grapecity-software/spread-sheets-print";
import "@grapecity-software/spread-sheets-resources-zh";
import "@grapecity-software/spread-sheets-pdf";
import "@grapecity-software/spread-sheets-barcode";
import "@grapecity-software/spread-sheets-languagepackages";
import "@grapecity-software/spread-sheets-shapes";
import "@grapecity-software/spread-sheets-pivot-addon";
import "@grapecity-software/spread-sheets-designer-resources-cn";
import "@grapecity-software/spread-sheets-designer";

GC.Spread.Sheets.Designer.LicenseKey = "";
GC.Spread.Sheets.LicenseKey = "";

import "./bindingSchema.js";

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container");

// 设置字段列表
designer.setData("treeNodeFromJson", JSON.stringify(bindingSchema));
// designer.setData("oldTreeNodeFromJson", JSON.stringify(bindingSchema));

let designModeCommand = GC.Spread.Sheets.Designer.getCommand(
  GC.Spread.Sheets.Designer.CommandNames.DesignMode,
);
designModeCommand.execute(designer);

let spread = designer.getWorkbook();

spread.setSheetCount(5);

let sheet = spread.getActiveSheet();

sheet.setValue(0, 0, "grapecity");

// 获取字段列表json
console.log(
  JSON.parse(
    designer.getData("treeNodeFromJson") ||
      designer.getData("oldTreeNodeFromJson") ||
      designer.getData("updatedTreeNode"),
  ),
);
