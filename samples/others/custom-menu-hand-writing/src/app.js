import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-excelio";
import "@grapecity-software/spread-sheets-charts";
import "@grapecity-software/spread-sheets-print";
import "@grapecity-software/spread-sheets-resources-zh";
import "@grapecity-software/spread-sheets-pdf";
import "@grapecity-software/spread-sheets-barcode";
import "@grapecity-software/spread-sheets-languagepackages";
import "@grapecity-software/spread-sheets-shapes";
import "@grapecity-software/spread-sheets-pivot-addon";
import "@grapecity-software/spread-sheets-designer-resources-cn";
import "@grapecity-software/spread-sheets-designer";

GC.Spread.Sheets.Designer.LicenseKey = "";
GC.Spread.Sheets.LicenseKey = "";

let config = JSON.parse(
  JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig),
);
let customeAddSign = {
  text: "添加手写签名",
  commandName: "customeAddSign",
  execute: () => {
    if (document.getElementById("signArea")) {
      document.getElementById("signArea").style.visibility = "visible";
    }
  },
};
// 追加自定义右键菜单
config.contextMenu.unshift("customeAddSign");
config.commandMap = {
  customeAddSign,
};

let designer = new GC.Spread.Sheets.Designer.Designer(
  "designer-container",
  config,
);

let spread = designer.getWorkbook();

$("#sign").jSignature({ lineWidth: "16", width: "100%", height: "100%" });

document.getElementById("clear").onclick = function () {
  $("#sign").jSignature("reset");
};

document.getElementById("confirm").onclick = function () {
  let datapair = "data:" + $("#sign").jSignature("getData");
  let sheet = spread.getActiveSheet();
  let row = sheet.getActiveRowIndex();
  let col = sheet.getActiveColumnIndex();
  let picture = sheet.shapes.addPictureShape(
    `${sheet.name()}-${row}-${col}}`,
    datapair,
    0,
    0,
    100,
    100,
  );
  picture.startRow(row);
  picture.endRow(row + 1);
  picture.startColumn(col);
  picture.endColumn(col + 1);
  picture.startRowOffset(0);
  picture.startColumnOffset(0);
  picture.endRowOffset(0);
  picture.endColumnOffset(0);
  picture.allowResize(false);
  picture.allowMove(false);
  picture.allowRotate(false);
  $("#sign").jSignature("reset");
  document.getElementById("signArea").style.visibility = "hidden";
};
