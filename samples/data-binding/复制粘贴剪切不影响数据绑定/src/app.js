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


import { installBindingPreserve } from "./binding-preserve.js";

const Designer = GC.Spread.Sheets.Designer;

const designerConfig = JSON.parse(JSON.stringify(Designer.DefaultConfig));
const designer = new Designer.Designer("gc-designer-container", designerConfig);
const c = designer.getWorkbook();

/**
 * 准备示例数据：给单元格设置数据源绑定路径，
 * 方便直接体验“复制/粘贴后绑定不被破坏”的效果。
 */
function setupBindingSample() {
  const sheet = c.getActiveSheet();
  const dataSource = {
    姓名: "张伟",
    部门: "研发部",
    年龄: 30,
    城市: "上海",
  };
  const bindingSource = new GC.Spread.Sheets.Bindings.CellBindingSource(
    dataSource,
  );
  sheet.setDataSource(bindingSource);

  // 第 0 行为标题，第 1 行绑定数据字段
  const fields = ["姓名", "部门", "年龄", "城市"];
  fields.forEach(function (field, col) {
    sheet.setValue(0, col, field);
    sheet.setBindingPath(1, col, field);
  });
  sheet.getRange(0, 0, 1, fields.length).font("bold 11pt Calibri");
  sheet.getRange(0, 0, 1, fields.length).backColor("#D9EAF7");
  sheet.setColumnWidth(0, 90);
  sheet.setColumnWidth(1, 90);
  sheet.setColumnWidth(2, 70);
  sheet.setColumnWidth(3, 90);
}

setupBindingSample();

c.getActiveSheet().setValue(4, 0, "请复制/剪切 A2:D2的内容，并在其他地方粘贴")
c.getActiveSheet().setValue(5, 0, "然后点击上方设计器的 数据-工作表绑定，查看数据绑定路径是否改变")

// 安装“粘贴不影响数据绑定”功能
installBindingPreserve(c);
