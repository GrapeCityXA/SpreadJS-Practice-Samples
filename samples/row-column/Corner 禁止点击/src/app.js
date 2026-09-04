import * as GC from "@grapecity-software/spread-sheets";
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));

var sheet = spread.getActiveSheet();

var corner = sheet.getCellRect(0, 0, -1, -1);

console.log(corner)

$("#cornerDiv").height(corner.height).width(corner.width)