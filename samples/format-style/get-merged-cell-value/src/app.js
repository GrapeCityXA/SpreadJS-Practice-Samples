import * as GC from "@grapecity-software/spread-sheets";

GC.Spread.Sheets.LicenseKey = "";
/**
 * 合并单元格区域中任一单元格可显示区域内容
 */
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let sheet = spread.getActiveSheet();
sheet.addSpan(0, 0, 5, 5);
sheet.setText(0, 0, "grapecity");
sheet.getCell(0, 0).backColor("lightblue");
sheet.addSpan(7, 7, 2, 2);
sheet.setText(7, 7, "spreadjs");
sheet.getCell(7, 7).backColor("#cccc66");
//显示目标单元格内容
document.getElementById("get_value").onclick = () => {
  let row = document.getElementById("row").value;
  let col = document.getElementById("col").value;
  if (row.length > 0 && col.length > 0) {
    alert(myGetValue(sheet, row, col));
  } else {
    alert("please input row index and column index");
  }
};
/**
 * 获取指定位置单元格的内容
 */
function myGetValue(sheet, row, col) {
  let spanInfo = sheet.getSpan(row, col);
  if (spanInfo) {
    return sheet.getValue(spanInfo.row, spanInfo.col);
  } else {
    return sheet.getValue(row, col);
  }
}
