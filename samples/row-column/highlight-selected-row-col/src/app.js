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

import { bootCrossHighlight } from "./crossHighlight.js";

GC.Spread.Sheets.Designer.LicenseKey = "";
GC.Spread.Sheets.LicenseKey = "";

let config = JSON.parse(
  JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig),
);

const customCommands = {
  highLightRowsAndColumns: {
    iconClass: "highlight-icon",
    text: "高亮行列",
    commandName: "highLightRowsAndColumns",
    bigButton: true,
    execute: function (designer) {
      let active = designer.getData("HightLightActive");
      if (!active) {
        designer.setData("HightLightActive", true);
        bootCrossHighlight(designer.getWorkbook());
      } else {
        designer.setData("HightLightActive", false);
        bootCrossHighlight(designer.getWorkbook(), false);
      }
    },
    // getState 控制按钮的选中状态（背景色）
    getState: function (designer) {
      return designer.getData("HightLightActive") ? true : false;
    },
  },
};

const crossHighLightTab = {
  label: "交叉高亮",
  thumbnailClass: "ribbon-thumbnail-tools",
  commandGroup: {
    children: [
      {
        direction: "vertical",
        commands: ["highLightRowsAndColumns"],
      },
    ],
  },
};

config.commandMap = config.commandMap || {};
Object.assign(config.commandMap, customCommands);

config.ribbon.forEach((rib) => {
  if (rib.id == "view") {
    rib.buttonGroups.push(crossHighLightTab);
  }
});

let designer = new GC.Spread.Sheets.Designer.Designer(
  "designer-container",
  config,
);
let spread = designer.getWorkbook();
let sheet = spread.getActiveSheet();
sheet.setValue(1, 1, '请选择上方工具栏中的 "视图"-"高亮行列"');
