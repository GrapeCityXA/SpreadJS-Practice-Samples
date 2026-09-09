import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-excelio";
import "@grapecity-software/spread-sheets-shapes";
import "@grapecity-software/spread-sheets-charts";
import "@grapecity-software/spread-sheets-print";
import "@grapecity-software/spread-sheets-pdf";
import "@grapecity-software/spread-sheets-barcode";
import "@grapecity-software/spread-sheets-languagepackages";
import "@grapecity-software/spread-sheets-shapes";
import "@grapecity-software/spread-sheets-pivot-addon";
import "@grapecity-software/spread-sheets-designer-resources-cn";
import "@grapecity-software/spread-sheets-designer";

import { HZPinyin, installSortHandlers } from "./pinyin-sort.js";
import {
  buildFilterCommandMap,
  registerSheetFilterContextCommand,
} from "./designer-commands.js";
const Designer = GC.Spread.Sheets.Designer;

// // —— 创建设计器（先合并修改后的筛选命令）——
const designerConfig = JSON.parse(JSON.stringify(Designer.DefaultConfig));
designerConfig.commandMap = Object.assign(
  {},
  designerConfig.commandMap,
  buildFilterCommandMap(),
);
const designer = new Designer.Designer("gc-designer-container", designerConfig);
const spread = designer.getWorkbook();

// 注册工作表右键菜单“筛选”命令
registerSheetFilterContextCommand(spread);

// 安装自定义中文拼音排序
installSortHandlers(spread);

// —— 示例数据：销售数据表 + 数据透视表 ——
function createSampleData() {
  if (spread.getSheetFromName("销售数据")) {
    return;
  }

  const dataSheet = spread.getSheet(0);
  dataSheet.name("销售数据");

  const sourceData = [
    ["姓名", "地区", "产品", "数量", "金额"],
    ["张伟", "华东", "笔记本电脑", 12, 96000],
    ["王芳", "华北", "显示器", 20, 40000],
    ["李娜", "华南", "键盘", 50, 15000],
    ["陈晨", "华东", "鼠标", 80, 8000],
    ["赵磊", "西南", "服务器", 3, 90000],
    ["孙丽", "东北", "打印机", 9, 13500],
    ["周杰", "西北", "路由器", 15, 7500],
    ["吴敏", "华中", "显示器", 30, 60000],
  ];
  dataSheet.setArray(0, 0, sourceData);
  dataSheet.getRange(0, 0, 1, 5).font("bold 11pt Calibri");
  dataSheet.getRange(0, 0, 1, 5).backColor("#D9EAF7");
  dataSheet.setColumnWidth(0, 90);
  dataSheet.setColumnWidth(1, 70);
  dataSheet.setColumnWidth(2, 100);

  // 为数据区域添加筛选器，用户可点击列头筛选按钮体验拼音排序
  const filter = new GC.Spread.Sheets.Filter.HideRowFilter(
    new GC.Spread.Sheets.Range(0, 0, sourceData.length, 5),
  );
  dataSheet.rowFilter(filter);

  // 数据透视表（在“销售透视”工作表中）
  const pivotSheet = new GC.Spread.Sheets.Worksheet("销售透视")
  spread.addSheet(1, pivotSheet);
  const pt = pivotSheet.pivotTables.add(
    "销售透视表",
    sourceData,
    1,
    1,
    GC.Spread.Pivot.PivotTableLayoutType.compact,
    GC.Spread.Pivot.PivotTableThemes.medium2,
    { showRowHeader: true, showColumnHeader: true },
  );
  pt.add("姓名", "姓名", GC.Spread.Pivot.PivotTableFieldType.rowField);
  pt.add(
    "金额",
    "金额合计",
    GC.Spread.Pivot.PivotTableFieldType.valueField,
    GC.default.Pivot.SubtotalType.sum,
  );

  spread.setActiveSheet(dataSheet);
}
createSampleData();

spread.setActiveSheetIndex(1)
let pivotSheet = spread.getActiveSheet(0)
pivotSheet.setValue(1, 4, "请点击B2单元格的下拉按钮，按照升序和降序排序")
pivotSheet.setValue(2, 4, "观察其排序后的结果，是按照拼音排序的")

