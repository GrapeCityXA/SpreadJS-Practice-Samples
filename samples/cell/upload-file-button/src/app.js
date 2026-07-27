import * as GC from "@grapecity-software/spread-sheets";
GC.Spread.Sheets.LicenseKey = "";
// Title:将文件上传按钮定制在SpreadJS中
// Description：将文件上传按钮定制在SpreadJS中
// Tag:文件上传按钮

var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
var sheet = spread.getActiveSheet();
var b1 = new GC.Spread.Sheets.CellTypes.Button();
b1.text("选择文件");
sheet.setCellType(3, 3, b1, GC.Spread.Sheets.SheetArea.viewport);
sheet.autoFitColumn(3);
sheet.autoFitRow(3);
var b2 = new GC.Spread.Sheets.CellTypes.Button();
b2.text("上传");
sheet.setCellType(3, 4, b2, GC.Spread.Sheets.SheetArea.viewport);
sheet.autoFitColumn(4);
spread.bind(GC.Spread.Sheets.Events.ButtonClicked, function (e, args) {
  var sheet = args.sheet,
    row = args.row,
    col = args.col;
  var cellType = sheet.getCellType(row, col);
  if (cellType instanceof GC.Spread.Sheets.CellTypes.Button) {
    if (cellType.text() == "选择文件") {
      $("#file").click();
    }
    if (cellType.text() == "上传") {
      alert("test ok");
    }
  }
});
$("#file").change(function () {
  spread.suspendPaint();
  var uploadFileArr = document.getElementById("file").files;
  for (var i = 0; i < uploadFileArr.length; i++) {
    sheet.setValue(3 + i, 2, uploadFileArr[i].name);
    sheet
      .getCell(3 + i, 2, GC.Spread.Sheets.SheetArea.viewport)
      .setBorder(
        new GC.Spread.Sheets.LineBorder(
          "black",
          GC.Spread.Sheets.LineStyle.thick,
        ),
        { all: true },
        3,
      );
  }
  sheet.autoFitColumn(2);
  spread.resumePaint();
});
