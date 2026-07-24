import * as GC from "@grapecity-software/spread-sheets";

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

/*****
 * 合并工作簿不属于一个简单的需求，因为Excel中涉及大量的公式引用，并且图表，工作表，表格等的名称都不一致
 * 除此之外，单个工作表可能还会以来spread工作簿上的样式空间，所以细节性问题很多
 * 本demo只是一个简单的解决方案，用户需要根据自己的文件再去处理有冲突的细节问题。
 *
 */
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container");

let spread = designer.getWorkbook();
let activeSheet = spread.getActiveSheet();
activeSheet.name("源文件");
activeSheet.setArray(0, 0, [
  [123, 34, 890],
  [899, 221, 990],
]);

let midSpread = new GC.Spread.Sheets.Workbook();

designer.bind(GC.Spread.Sheets.Designer.Events.FileLoading, (event, args) => {
  let isAdd = confirm("是否使用文件追加模式？");
  //  追加时注意处理文件冲突 详细可以参考：https://gcdn.grapecity.com.cn/forum.php?mod=viewthread&tid=142037
  if (isAdd) {
    midSpread.fromJSON(args.data);
    for (let i = 0; i < midSpread.getSheetCount(); i++) {
      let sheet = new GC.Spread.Sheets.Worksheet("newsheet");
      sheet.fromJSON(midSpread.getSheet(i).toJSON());
      spread.addSheet(0, sheet);
    }
    args.cancel = true;
    designer.setData("FileMenu_show", false);
  }
});
