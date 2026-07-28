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

// 删了以后替换就用不了了
let findDialogTemplate = GC.Spread.Sheets.Designer.getTemplate(
  GC.Spread.Sheets.Designer.TemplateNames.FindDialogTemplate,
);
findDialogTemplate.title = "查找_自定义菜单名称";
findDialogTemplate.content[0].children.splice(1, 1);
GC.Spread.Sheets.Designer.registerTemplate(
  GC.Spread.Sheets.Designer.TemplateNames.FindDialogTemplate,
  findDialogTemplate,
);

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container");

let spread = designer.getWorkbook();

spread.setSheetCount(5);

let sheet = spread.getActiveSheet();

sheet.setValue(0, 0, "按下ctrl+F 查看");
