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


import { patchInsertTableCommand } from "./insert-table-patch.js";

const Designer = GC.Spread.Sheets.Designer;

// 修改 insertTable 命令：允许在筛选区域插入表格
const insertTableCommand = patchInsertTableCommand();

const designerConfig = JSON.parse(JSON.stringify(Designer.DefaultConfig));

// 将修改后的 insertTable 命令注册到 commandMap
designerConfig.commandMap = designerConfig.commandMap || {};
if (insertTableCommand) {
  designerConfig.commandMap.insertTable = insertTableCommand;
}

const designer = new Designer.Designer("gc-designer-container", designerConfig);
const spread = designer.getWorkbook();

// —— 示例数据：准备带筛选器的数据区域，方便直接体验“筛选区域插入表格” ——
const sheet = spread.getActiveSheet();
const headers = ["产品", "地区", "数量", "金额"];
const rows = [
  ["笔记本电脑", "华东", 120, 960000],
  ["显示器", "华北", 200, 400000],
  ["键盘", "华南", 500, 150000],
  ["鼠标", "华东", 800, 80000],
  ["服务器", "西南", 15, 450000],
  ["打印机", "东北", 90, 135000],
];
headers.forEach(function (header, col) {
  sheet.setValue(0, col, header);
});
sheet.setArray(1, 0, rows)
sheet.getRange(0, 0, 1, headers.length).font("bold 11pt Calibri");
sheet.getRange(0, 0, 1, headers.length).backColor("#D9EAF7");

// 为数据区域添加筛选器，验证在筛选区域上插入表格的功能
const filter = new GC.Spread.Sheets.Filter.HideRowFilter(new GC.Spread.Sheets.Range(1, 0, rows.length + 1, headers.length));
sheet.rowFilter(filter);

sheet.setValue(1,5,"未经特殊处理的SpreadJS无法在有筛选的区域插入表格")
sheet.setValue(3,5,"请选择A1:D7，并点击工具栏的“插入”-“表格”，插入一个表格")
sheet.setValue(5,5,"并对比其他SpreadJS")

