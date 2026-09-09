import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-sheets-shapes";
import "@grapecity-software/spread-sheets-print";
import { addPageBreakLines } from "./page-break-lines.js";

/**
 * 示例：在分页预览位置绘制线型形状，增强分页预览线的样式。
 */
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
spread.suspendPaint()

const sheet = spread.getActiveSheet();
// 填充足够多的数据，配合纸张大小与手动分页符，让表格分成多页
const ROW_COUNT = 40;
const COL_COUNT = 12;
for (let r = 0; r < ROW_COUNT; r++) {
  for (let c = 0; c < COL_COUNT; c++) {
    sheet.setValue(r, c, `第${r + 1}行 第${c + 1}列`);
  }
}
sheet.setColumnWidth(0, 90);

// 设置打印纸张为 A4（单位 twips），并设置手动分页符，保证产生多页
const printInfo = sheet.printInfo();
printInfo.paperSize(new GC.Spread.Sheets.Print.PaperSize(11906, 16838));
sheet.setRowPageBreak(25, true);
sheet.setColumnPageBreak(8, true);

// 根据分页信息在分页位置绘制分页线
addPageBreakLines(spread, sheet);

spread.resumePaint()