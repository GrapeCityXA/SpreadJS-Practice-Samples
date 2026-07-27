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

GC.Spread.Sheets.Designer.LicenseKey = "";
GC.Spread.Sheets.LicenseKey = "";

let designerConfig = JSON.parse(
  JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig),
);
let customerRibbon = {
  id: "operate",
  text: "操作",
  buttonGroups: [],
};

let ribbonFileConfig = {
  label: "文件操作",
  thumbnailClass: "ribbon-thumbnail-spreadsettings",
  commandGroup: {
    children: [
      {
        direction: "vertical",
        commands: ["getTemplates", "uploadFile"],
      },
    ],
  },
};

// 定义命令
let ribbonFileCommands = {
  getTemplates: {
    iconClass: "ribbon-button-welcome", // 按钮样式，可以指定按钮图片
    text: "加载", // 显示文本
    commandName: "getTemplates", // 命令名称，需要全局唯一
    execute: async function (context) {
      // 命令对应的操作
      alert("加载");
    },
  },
  uploadFile: {
    iconClass: "ribbon-button-welcome",
    text: "上传",
    commandName: "uploadFile",
    execute: async function (context) {
      alert("上传");
    },
  },
};
// 注册命令到config的commandMap属性上
designerConfig.commandMap = {};
Object.assign(designerConfig.commandMap, ribbonFileCommands);

// 在designer的config中加入自定义的命令和按钮
customerRibbon.buttonGroups.push(ribbonFileConfig);
designerConfig.ribbon.push(customerRibbon);

let designer = new GC.Spread.Sheets.Designer.Designer(
  "designer-container",
  designerConfig,
);

let spread = designer.getWorkbook();
