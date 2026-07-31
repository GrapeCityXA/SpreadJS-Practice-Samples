import * as GC from "@grapecity-software/spread-sheets";
GC.Spread.Sheets.LicenseKey = "";
// Title：插入行复制样式
// Description：插入行复制样式
// Tag：插入行，复制样式

GC.Spread.Common.CultureManager.culture("zh-cn");

var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
var sheet = spread.getActiveSheet();
sheet
  .getRange(
    1,
    0,
    1,
    sheet.getColumnCount(),
    GC.Spread.Sheets.SheetArea.viewport,
  )
  .backColor("pink");
sheet
  .getRange(
    2,
    0,
    1,
    sheet.getColumnCount(),
    GC.Spread.Sheets.SheetArea.viewport,
  )
  .backColor("blue");
sheet
  .getRange(
    3,
    0,
    1,
    sheet.getColumnCount(),
    GC.Spread.Sheets.SheetArea.viewport,
  )
  .backColor("yellow");
sheet
  .getRange(
    sheet.getRowCount() - 1,
    0,
    1,
    sheet.getColumnCount(),
    GC.Spread.Sheets.SheetArea.viewport,
  )
  .backColor("pink");
//sheet.addSpan(1, 0, 3, 5);
const cellButtons = [
  {
    imageType: GC.Spread.Sheets.ButtonImageType.dropdown,
    command: "openDateTimePicker",
    useButtonStyle: false,
  },
];
sheet.getRange(1, 0, 3, 1).cellButtons(cellButtons);

sheet.bind(GC.Spread.Sheets.Events.RowChanged, function (sender, info) {
  console.log(info);
  if (info.propertyName == "addRows") {
    info.sheet.copyTo(
      info.row + info.count,
      0,
      info.row,
      0,
      info.count,
      sheet.getColumnCount(),
      GC.Spread.Sheets.CopyToOptions.style,
    );
  }
});
