import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-io";

GC.Spread.Sheets.LicenseKey = "";
// 创建空表单
var spread1 = new GC.Spread.Sheets.Workbook(document.getElementById("ss1"));
spread1.getActiveSheet().setValue(0, 0, "spread1");
var spread2 = new GC.Spread.Sheets.Workbook(document.getElementById("ss2"));
spread2.getActiveSheet().setValue(0, 0, "spread2");
var spread3 = new GC.Spread.Sheets.Workbook(document.getElementById("ss3"));
spread3.getActiveSheet().setValue(0, 0, "spread3");

var spreads = [spread1, spread2, spread3];

// 导出事件
$("#saveExcel").click(function () {
  // 创建JSZip实例用于前端文件打包
  const zip = new JSZip();
  if (!zip && spreads.length === 0) {
    return;
  }

  var fileName = "spread";
  for (let i = 0; i < spreads.length; i++) {
    var spread = spreads[i];
    let file = "";
    spread.export(
      function (blob) {
        file = blob;
        // 在此处把文件的blob流打包到zip里
        zip.file(fileName + (i + 1) + ".xlsx", file);
      },
      function (e) {
        console.log(e);
      },
    );
  }

  // 定时器，每500毫秒检查一下是否完成了文件导出操作。
  var intervalId = setInterval(function () {
    var files = zip.files;
    var len = 0;
    for (let file in files) {
      len++;
    }
    if (len === spreads.length) {
      // 利用FileSaver的saveAs下载打包好的压缩包
      zip
        .generateAsync({
          type: "blob",
        })
        .then((content) => {
          saveAs(content, "spreads.zip");
        })
        .catch((err) => {
          console.log(err);
        });
      clearInterval(intervalId);
    }
  }, 500);
});
