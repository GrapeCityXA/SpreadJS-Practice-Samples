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


import { createTraceEngine } from "./trace-engine.js";

const Designer = GC.Spread.Sheets.Designer;
const Events = GC.Spread.Sheets.Events;

const precedentsCommandName = "formulaTracePrecedents";
const dependentsCommandName = "formulaTraceDependents";
const removeArrowsCommandName = "formulaTraceRemoveArrows";

// —— 三个功能区命令 ——
// 追踪引擎在 Designer 创建后初始化，命令通过惰性引用执行，避免循环依赖。
let traceEngine = null;

const precedentsCommand = {
  title: "追踪引用单元格",
  text: "追踪引用单元格",
  iconClass: "ribbon-button-find",
  type: "button",
  bigButton: true,
  commandName: precedentsCommandName,
  execute: function () {
    if (traceEngine) traceEngine.tracePrecedents();
  },
};

const dependentsCommand = {
  title: "追踪从属单元格",
  text: "追踪从属单元格",
  iconClass: "ribbon-button-find",
  type: "button",
  bigButton: true,
  commandName: dependentsCommandName,
  execute: function () {
    if (traceEngine) traceEngine.traceDependents();
  },
};

const removeArrowsCommand = {
  title: "删除箭头",
  text: "删除箭头",
  iconClass: "ribbon-button-delete",
  type: "button",
  bigButton: true,
  commandName: removeArrowsCommandName,
  execute: function () {
    if (traceEngine) traceEngine.clearTrace();
  },
};

// —— 设计器配置：注册命令，并在“公式”选项卡上追加“公式追踪”按钮组 ——
const designerConfig = JSON.parse(JSON.stringify(Designer.DefaultConfig));
designerConfig.commandMap = designerConfig.commandMap || {};
designerConfig.commandMap[precedentsCommandName] = precedentsCommand;
designerConfig.commandMap[dependentsCommandName] = dependentsCommand;
designerConfig.commandMap[removeArrowsCommandName] = removeArrowsCommand;

const formulasTab =
  designerConfig.ribbon.find(function (tab) {
    return /^formulas?$/i.test(String(tab.id || ""));
  }) ||
  designerConfig.ribbon.find(function (tab) {
    return /formula|公式/i.test(
      String(tab.label || tab.text || tab.title || ""),
    );
  }) ||
  designerConfig.ribbon[0];
formulasTab.buttonGroups.push({
  label: "公式追踪",
  thumbnailClass: "formula-trace",
  commandGroup: {
    children: [
      {
        commands: [
          precedentsCommandName,
          dependentsCommandName,
          removeArrowsCommandName,
        ],
      },
    ],
  },
});

// —— 创建设计器，并初始化追踪引擎 ——
const designer = new Designer.Designer("gc-designer-container", designerConfig);
const spread = designer.getWorkbook();
traceEngine = createTraceEngine(spread);

// —— 示例数据：订单表（Sheet1）——
const sheet = spread.getActiveSheet();
sheet.setValue(0, 0, "数量");
sheet.setValue(0, 1, "单价");
sheet.setValue(0, 2, "折扣");
sheet.setValue(0, 3, "折后金额");
sheet.setValue(0, 4, "税额");
sheet.setValue(0, 5, "含税金额");

const orderRows = [
  [10, 25, 0.9],
  [8, 36, 0.85],
  [12, 18, 0.95],
  [5, 68, 0.88],
  [16, 12.5, 0.92],
  [7, 45, 0.9],
];
orderRows.forEach(function (values, index) {
  const row = index + 1;
  const rowNumber = row + 1;
  sheet.setValue(row, 0, values[0]);
  sheet.setValue(row, 1, values[1]);
  sheet.setValue(row, 2, values[2]);
  sheet.setFormula(row, 3, "=A" + rowNumber + "*B" + rowNumber + "*C" + rowNumber);
  sheet.setFormula(row, 4, "=D" + rowNumber + "*13%");
  sheet.setFormula(row, 5, "=D" + rowNumber + "+E" + rowNumber);
});

sheet.setValue(8, 2, "订单合计");
sheet.setFormula(8, 3, "=SUM(D2:D7)");
sheet.setFormula(8, 4, "=SUM(E2:E7)");
sheet.setFormula(8, 5, "=D9+E9");
sheet.getRange(0, 0, 1, 6).font("bold 11pt Calibri");
sheet.getRange(0, 0, 1, 6).backColor("#D9EAF7");
sheet.getRange(8, 2, 1, 4).font("bold 11pt Calibri");
sheet.getRange(8, 2, 1, 4).backColor("#E2F0D9");
sheet.getRange(1, 1, 6, 1).formatter("#,##0.00");
sheet.getRange(1, 2, 6, 1).formatter("0%");
sheet.getRange(1, 3, 8, 3).formatter("#,##0.00");
sheet.setColumnWidth(0, 80);
sheet.setColumnWidth(1, 80);
sheet.setColumnWidth(2, 80);
sheet.setColumnWidth(3, 100);
sheet.setColumnWidth(4, 90);
sheet.setColumnWidth(5, 110);

// —— 示例数据：跨表结算表（Sheet2）——
let crossSheet = spread.getSheetCount() > 1 ? spread.getSheet(1) : null;
if (!crossSheet) {
  crossSheet = new GC.Spread.Sheets.Worksheet("Sheet2");
  spread.addSheet(1, crossSheet);
}
const escapedSourceSheetName = sheet.name().replace(/'/g, "''");
crossSheet.setValue(0, 0, "跨表金额");
crossSheet.setFormula(1, 0, "='" + escapedSourceSheetName + "'!D2*1.05");
crossSheet.setColumnWidth(0, 120);

crossSheet.setValue(0, 2, "结算项目");
crossSheet.setValue(0, 3, "金额");
crossSheet.setValue(1, 2, "订单含税合计");
crossSheet.setFormula(1, 3, "='" + escapedSourceSheetName + "'!F9");
crossSheet.setValue(2, 2, "配送费");
crossSheet.setValue(2, 3, 48);
crossSheet.setValue(3, 2, "服务费");
crossSheet.setFormula(3, 3, "=D2*2%");
crossSheet.setValue(4, 2, "结算小计");
crossSheet.setFormula(4, 3, "=D2+D3+D4");
crossSheet.setValue(5, 2, "风险准备金");
crossSheet.setFormula(5, 3, "=D5*1%");
crossSheet.setValue(6, 2, "最终应付");
crossSheet.setFormula(6, 3, "=D5+D6");
crossSheet.getRange(0, 2, 1, 2).font("bold 11pt Calibri");
crossSheet.getRange(0, 2, 1, 2).backColor("#D9EAF7");
crossSheet.getRange(6, 2, 1, 2).font("bold 11pt Calibri");
crossSheet.getRange(6, 2, 1, 2).backColor("#E2F0D9");
crossSheet.getRange(1, 0, 1, 1).formatter("#,##0.00");
crossSheet.getRange(1, 3, 6, 1).formatter("#,##0.00");
crossSheet.setColumnWidth(2, 130);
crossSheet.setColumnWidth(3, 120);

crossSheet.setValue(1, 6, "请选中任意公式单元格后，点击上方设计器的“公式”——最右边的“公式追踪”中的按钮测试")
let cell = crossSheet.getCell(1, 6)
cell.foreColor("blue")
cell.fontWeight("bold")

// —— 绑定追踪事件：为已有 sheet 及后续新增 sheet 绑定跨表跳转 ——
for (let i = 0; i < spread.getSheetCount(); i += 1) {
  traceEngine.bindSheet(spread.getSheet(i));
}

spread.bind(Events.ActiveSheetChanged, function () {
  traceEngine.bindSheet(spread.getActiveSheet());
});
spread.bind(Events.SheetChanged, function (event, args) {
  if (args && args.sheet) {
    traceEngine.bindSheet(args.sheet);
  }
});

// 初始定位到跨表结算表，方便直接体验跨表追踪
spread.setActiveSheet(crossSheet.name());
crossSheet.setActiveCell(6, 3);
