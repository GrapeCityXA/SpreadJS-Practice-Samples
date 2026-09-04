import * as GC from "@grapecity-software/spread-sheets";
import { registerMergeShortcut } from "./merge-command.js";

/**
 * 示例：Ctrl+M 合并/取消合并单元格
 */
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));

const sheet = spread.getActiveSheet();

// 示例数据
sheet.setValue(0, 0, "选中多个单元格");
sheet.setValue(1, 0, "按 Ctrl+M 合并");
sheet.setValue(2, 0, "再次按 Ctrl+M 取消合并");
sheet.setColumnWidth(0, 180);

registerMergeShortcut(spread);
