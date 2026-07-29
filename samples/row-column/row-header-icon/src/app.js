import * as GC from "@grapecity-software/spread-sheets";
GC.Spread.Sheets.LicenseKey = "";

let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let sheet = spread.getActiveSheet();
sheet.options.rowHeaderAutoText = GC.Spread.Sheets.HeaderAutoText.blank;

sheet.bind(GC.Spread.Sheets.Events.ValueChanged, function (e, info) {
  // 监听单元格修改事件
  let { row } = info;
  sheet.setValue(
    row,
    0,
    String.fromCharCode("0xe735"),
    GC.Spread.Sheets.SheetArea.rowHeader,
  );
  sheet
    .getCell(row, 0, GC.Spread.Sheets.SheetArea.rowHeader)
    .font("12px iconfont");
});

sheet.bind(GC.Spread.Sheets.Events.RowChanged, function (e, info) {
  // 监听新增行事件
  if (info.propertyName == "addRows") {
    sheet.setValue(
      info.row,
      0,
      String.fromCharCode("0xe735"),
      GC.Spread.Sheets.SheetArea.rowHeader,
    );
    sheet
      .getCell(info.row, 0, GC.Spread.Sheets.SheetArea.rowHeader)
      .font("12px iconfont");
  }
});

sheet.setValue(0, 0, "请在任意输入一个值，查看效果");
