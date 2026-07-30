import * as GC from "@grapecity-software/spread-sheets";
GC.Spread.Sheets.LicenseKey = "";
/*
 *单元格输入字符串时，点击按钮，按钮上方会给出提示
 */

GC.Spread.Common.CultureManager.culture("zh-cn");
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
var sheet = spread.getActiveSheet();

sheet.setValue(1, 3, 99);
sheet.setActiveCell(1, 3);
sheet.setColumnWidth(3, 120);

spread.bind(GC.Spread.Sheets.Events.CellChanged, function (s, e) {
  document.getElementById("log").innerHTML = JSON.stringify(e.propertyName);
  if (e.propertyName === "formula" || e.propertyName === "[styleinfo]") {
    setTimeout(function () {
      checkCellFormat(e.sheet, e.row, e.col);
    }, 10);
  }
});

function checkCellFormat(sheet, row, col) {
  var cell = sheet.getCell(row, col),
    value = cell.value(),
    formatter = cell.formatter();
  if (typeof value === "string" && formatter) {
    alert("请不要给string单元格设置格式，如果需要设置格式，请加Value方法");
  }
}

document.getElementById("setFormatter").addEventListener("click", function () {
  var sheet = spread.getActiveSheet();
  var cell = sheet.getCell(
    sheet.getActiveRowIndex(),
    sheet.getActiveColumnIndex(),
  );
  cell.formatter("0.00000");
});
