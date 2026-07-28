import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-io";
import "@grapecity-software/spread-sheets-resources-zh";

GC.Spread.Common.CultureManager.culture("zh-cn");
GC.Spread.Sheets.LicenseKey = "";

let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let sheet = spread.getActiveSheet();

sheet.setValue(1, 0, 1);
sheet.setValue(2, 0, 2);
sheet.setValue(3, 0, 3);
sheet.setValue(4, 0, 4);
sheet.setValue(5, 0, 5);
sheet.setValue(6, 0, 6);
sheet.setValue(7, 0, 7);
let range = new GC.Spread.Sheets.Range(1, 0, 7, 1);
let rowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(range);
sheet.rowFilter(rowFilter);
document.getElementById("exportFile").onclick = function () {
  // 创建一个副本Workbook
  let tempSpread = new GC.Spread.Sheets.Workbook();
  tempSpread.fromJSON(spread.toJSON());
  let count = tempSpread.getSheetCount();
  // 循环去除工作表中的筛选条件
  for (let i = 0; i < count; i++) {
    let tempSheet = tempSpread.getSheet(i);
    var rowFilter = tempSheet.rowFilter();
    if (rowFilter != null) {
      rowFilter.reset();
    }
  }
  // 保存副本文件
  tempSpread.export(
    function (blob) {
      saveAs(blob, "export.xlsx");
    },
    function (e) {
      // process error
      console.log(e);
    },
  );
};
