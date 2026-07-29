import * as GC from "@grapecity-software/spread-sheets";
GC.Spread.Sheets.LicenseKey = "";
GC.Spread.Common.CultureManager.culture("zh-cn");

$(document).ready(function () {
  var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"), {
    sheetCount: 2,
  });
  var sheet = spread.getActiveSheet();
  sheet.setValue(1, 0, "South");
  sheet.setValue(2, 0, "East");
  sheet.setValue(3, 0, "South");
  sheet.setValue(4, 0, "North");
  sheet.setValue(5, 0, "North");
  sheet.setValue(6, 0, "West");
  sheet.setValue(1, 1, "GuangZhou");
  sheet.setValue(2, 1, "ShangHai");
  sheet.setValue(3, 1, "ShenZhen");
  sheet.setValue(4, 1, "BeiJing");
  sheet.setValue(5, 1, "TianJin");
  sheet.setValue(6, 1, "ChengDu");
  var range = new GC.Spread.Sheets.Range(1, 0, 6, 2);
  var rowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(range);
  sheet.rowFilter(rowFilter);
  $("#filter").click(function () {
    var condition1 = new GC.Spread.Sheets.ConditionalFormatting.Condition(
      GC.Spread.Sheets.ConditionalFormatting.ConditionType.textCondition,
      {
        compareType:
          GC.Spread.Sheets.ConditionalFormatting.TextCompareType.equalsTo,
        expected: "North",
      },
    );
    var condition2 = new GC.Spread.Sheets.ConditionalFormatting.Condition(
      GC.Spread.Sheets.ConditionalFormatting.ConditionType.textCondition,
      {
        compareType:
          GC.Spread.Sheets.ConditionalFormatting.TextCompareType.equalsTo,
        expected: "TianJin",
      },
    );
    rowFilter.addFilterItem(0, condition1);
    rowFilter.addFilterItem(1, condition2);
    rowFilter.filter(0);
    rowFilter.filter(1);
    sheet.invalidateLayout();
    sheet.repaint();
  });
});
