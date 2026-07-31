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

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container");
let spread = designer.getWorkbook();
let sheet = spread.getActiveSheet();
sheet.setColumnWidth(2, 200);

let command = {
  canUndo: true,
  execute: function (context, options, isUndo) {
    alert("自定义命令");
  },
};
let commandManager = spread.commandManager();
commandManager.register("alertSth", command);

let style1 = new GC.Spread.Sheets.Style();
style1.cellButtons = [
  {
    imageType: GC.Spread.Sheets.ButtonImageType.dropdown,
    command: "openColorPicker",
  },
];
sheet.setStyle(1, 3, style1);
sheet.setValue(1, 2, "SpreadJS内置命令：");

let style2 = new GC.Spread.Sheets.Style();
style2.cellButtons = [
  {
    imageType: GC.Spread.Sheets.ButtonImageType.dropdown,
    command: function () {
      alert("不注册命令，直接写Function");
    },
  },
];
sheet.setStyle(3, 3, style2);
sheet.setValue(3, 2, "Function方式：");

let style3 = new GC.Spread.Sheets.Style();
style3.cellButtons = [
  {
    imageType: GC.Spread.Sheets.ButtonImageType.dropdown,
    command: "alertSth",
  },
];
sheet.setStyle(5, 3, style3);
sheet.setValue(5, 2, "自定义命令：");
