import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
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
import {
  sidePanelsAuditCommands,
  sidePanelsAuditConfig,
} from "./sidePanels.js";

GC.Spread.Sheets.Designer.LicenseKey = "";
GC.Spread.Sheets.LicenseKey = "";

var config = GC.Spread.Sheets.Designer.DefaultConfig;
config.commandMap = {
  Welcome: {
    title: "Audit",
    text: "审计追踪",
    iconClass: "ribbon-button-upload",
    bigButton: "false",
    commandName: "Audit",
    execute: async (context, propertyName) => {
      if (context.getData("CData")) {
        context.setData("CData", false);
      } else {
        context.setData("CData", true);
      }
    },
  },
};
config.ribbon[0].buttonGroups.unshift({
  label: "自定义功能",
  thumbnailClass: "welcome",
  commandGroup: {
    children: [
      {
        direction: "vertical",
        commands: ["Welcome"],
      },
    ],
  },
});

Object.assign(config.commandMap, sidePanelsAuditCommands);

config.sidePanels.push(sidePanelsAuditConfig);

let designer = new GC.Spread.Sheets.Designer.Designer(
  "designer-container",
  config,
);

let spread = designer.getWorkbook();

spread.setSheetCount(5);

let sheet = spread.getActiveSheet();

sheet.setValue(0, 0, "grapecity");
