import * as GC from "@grapecity-software/spread-sheets";
GC.Spread.Sheets.LicenseKey = "";

GC.Spread.Common.CultureManager.culture("zh-cn");

$(document).ready(function () {
  var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
  var sheet = spread.getActiveSheet();
  var datasource = [];
  for (var i = 0; i < 100000; i++) {
    var temp = {};
    temp.id = i;
    temp.c1 = Math.random();
    temp.c2 = Math.random();
    temp.c3 = Math.random();
    temp.c4 = Math.random();
    temp.c5 = Math.random();
    temp.c6 = Math.random();
    temp.c7 = Math.random();
    temp.c8 = Math.random();
    temp.c9 = Math.random();
    temp.c10 = Math.random();
    temp.c11 = Math.random();
    temp.c12 = Math.random();
    temp.c13 = Math.random();
    temp.c14 = Math.random();
    temp.c15 = Math.random();
    temp.c16 = Math.random();
    temp.c17 = Math.random();
    temp.c18 = Math.random();
    if (i % 4 == 0) {
      temp.color = "red";
    } else if (i % 4 == 1) {
      temp.color = "blue";
    } else if (i % 4 == 2) {
      temp.color = "yellow";
    } else if (i % 4 == 3) {
      temp.color = "green";
    }
    datasource.push(temp);
  }

  sheet.setRowCount(50000);
  sheet.setColumnCount(30);
  for (var i = 0; i < sheet.getRowCount(); i++) {
    var color = "balck";
    if (i % 4 == 0) {
      color = "red";
    } else if (i % 4 == 1) {
      color = "blue";
    } else if (i % 4 == 2) {
      color = "yellow";
    } else if (i % 4 == 3) {
      color = "green";
    }
  }

  $("#click").click(function () {
    spread.suspendPaint();
    sheet.setDataSource(datasource);
    for (var i = 0; i < datasource.length; i++) {
      sheet.getCell(i, 0).backColor(datasource[i].color);
    }
    var range = new GC.Spread.Sheets.Range(-1, 0, -1, sheet.getColumnCount());
    var rowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(range);
    sheet.rowFilter(rowFilter);
    spread.resumePaint();
  });

  sheet.bind(GC.Spread.Sheets.Events.RowChanging, function (e, info) {
    if ((info.propertyName = "deleteRows")) {
      var deleteRow = sheet.getArray(info.row, 0, 1, sheet.getColumnCount());
      console.log("delteRows:" + deleteRow);
    }
  });
});
