import * as GC from "@grapecity-software/spread-sheets";
import fileJson from "./template";

GC.Spread.Sheets.LicenseKey = "";
/**
 * 进行表格数据绑定时自动扩展表格区域并应用样式
 */

//初始化工作薄
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
spread.fromJSON(fileJson);

//处理绑定数据点击事件
document.getElementById("bind").onclick = function () {
  let sheet = spread.getSheetFromName("Sheet2");
  let table1 = sheet.tables.findByName("gcTable0");
  //允许自动扩展
  table1.expandBoundRows(true);
  let data = {
    test: [
      { one: 1, two: 2, three: 3, four: 4 },
      { one: 1, two: 2, three: 3, four: 4 },
      { one: 1, two: 2, three: 3, four: 4 },
      { one: 1, two: 2, three: 3, four: 4 },
      { one: 1, two: 2, three: 3, four: 4 },
    ],
  };
  let source = new GC.Spread.Sheets.Bindings.CellBindingSource(data);
  sheet.setDataSource(source);
  copyTableStyle(sheet, table1);

  //拷贝表格样式
  function copyTableStyle(sheet, table) {
    let range = table.dataRange();
    let tableCols = isTableArea(range);
    sheet.suspendPaint();
    for (let i = 0; i < range.rowCount - 1; i++) {
      for (let j = 0; j < sheet.getColumnCount(); j++) {
        //判断是否在表格内
        if (tableCols.indexOf(j) == -1) {
          sheet.copyTo(
            range.row + i,
            j,
            range.row + i + 1,
            j,
            1,
            1,
            GC.Spread.Sheets.CopyToOptions.style,
          );
        }
      }
    }
    sheet.resumePaint();
  }

  //生成表格列范围数组
  function isTableArea(range) {
    let cols = [];
    for (let i = 0; i < range.colCount; i++) {
      cols.push(range.col + i);
    }
    return cols;
  }
};
