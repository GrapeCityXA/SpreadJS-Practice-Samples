import * as GC from "@grapecity-software/spread-sheets";
GC.Spread.Sheets.LicenseKey = "";

/**
 * 加载本地图片文件，插入到表单特定位置
 * note：FileReader是一种异步文件读取机制，结合input:file可以很方便的读取本地文件。
 */
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let sheet = spread.getActiveSheet();
//定义插入图片相关变量，比如位置，大小等
let startRow, startCol, rowHeight, colWidth, file, reader, timestamp;
//添加图片的操作
function addPic() {
  startRow = sheet.getActiveRowIndex();
  startCol = sheet.getActiveColumnIndex();
  rowHeight = sheet.getRowHeight();
  colWidth = sheet.getColumnWidth();
  console.log(startRow);
  console.log(rowHeight);
  file = document.getElementById("fileDemo").files[0];
  reader = new FileReader();
  //将文件内容以base64编码输出
  reader.readAsDataURL(file);
  //文件内容读取成功之后添加到表单中
  reader.onload = function () {
    timestamp = Date.parse(new Date());
    picture = sheet.pictures.add(
      timestamp.toString(),
      this.result,
      startCol * colWidth,
      startRow * rowHeight,
    );
  };
}
document.getElementById("fileDemo").addEventListener("change", addPic);
