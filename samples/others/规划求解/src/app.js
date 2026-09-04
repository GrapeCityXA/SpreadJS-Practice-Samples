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


import { designerConfig } from "./designer-config.js";

const Designer = GC.Spread.Sheets.Designer;

// —— 创建设计器（配置里已注册“操作”选项卡与“规划求解”对话框模板）——
const designer = new Designer.Designer("gc-designer-container", designerConfig);
const spread = designer.getWorkbook();
const sheet = spread.getActiveSheet();

// —— 生成示例数据（原 Home.vue mounted）——
// 表格布局：飞机型号 / 容量 / 数量 / 容纳人数 / 费用
const sampleData = [
  ["飞机", "容量", "容纳人数", "费用"],
  ["美国", 30000, 16, 9000],
  ["英国", 20000, 8, 5000],
  ["总", null, null, null],
];
sheet.setArray(1, 1, sampleData);
// 合计行的容量（C5）= 美国容量×数量 + 英国容量×数量
sheet.setFormula(4, 2, "=C3*D3+C4*D4");

sheet.setValue(7, 1, "条件：")
sheet.setValue(8, 1, "飞机数量<=")
sheet.setValue(9, 1, "人数<=")
sheet.setValue(10, 1, "总花费<=")

sheet.setValue(8, 2, 44)
sheet.setValue(9, 2, 512)
sheet.setValue(10, 2, 300000)

sheet.setValue(12,1,"相关介绍请看：")
sheet.setHyperlink(12, 2, {
    url: 'https://gcdn.grapecity.com.cn/showtopic-98885.html',
    tooltip: '组件版设计器结合jsLPSolver实现规划求解',
    target: GC.Spread.Sheets.Hyperlink.HyperlinkTargetType.blank
});
sheet.setValue(12,2,"组件版设计器结合jsLPSolver实现规划求解")

sheet.setColumnWidth(1, 100)

// 表格区域边框，表头绿底白字
sheet
  .getRange(1, 1, 4, 4)
  .setBorder(
    new GC.Spread.Sheets.LineBorder("black", GC.Spread.Sheets.LineStyle.thin),
    { all: true },
  );
sheet.getRange(1, 1, 1, 4).backColor("green").foreColor("white");
