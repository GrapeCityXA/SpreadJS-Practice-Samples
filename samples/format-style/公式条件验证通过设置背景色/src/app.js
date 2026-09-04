import * as GC from "@grapecity-software/spread-sheets";
// 引用这两个资源，如果systemjs-plugin-css报错： package添加：  "systemjs-plugin-css": "0.1.37",
import "./videoTools.css"
import { videoPreview } from "./videoTools.js"
videoPreview("https://videos.grapecity.com.cn/SpreadJS/CodeLibrary/Formula%20cell%20condition%20verification%20by%20setting%20different%20background%20colors.mp4");
var spreadNS = GC.Spread.Sheets;
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
function MyCellType() { }
MyCellType.prototype = new spreadNS.CellTypes.Text();
MyCellType.prototype.paint = function (ctx, value, x, y, w, h, style, options) {
    if (!value || value === 0) {
        // 当value为0时触发逻辑
        style.backColor = "red";
    }
    spreadNS.CellTypes.Base.prototype.paint.apply(this, [ctx, value, x, y, w, h, style, options]);
};
var sheet = spread.getSheet(0);
sheet.suspendPaint();

sheet.setRowCount(8);
sheet.setColumnCount(3);

sheet.setValue(0, 0, "值1", GC.Spread.Sheets.SheetArea.colHeader);
sheet.setValue(0, 1, "值2", GC.Spread.Sheets.SheetArea.colHeader);
sheet.setValue(0, 2, "值1+值2", GC.Spread.Sheets.SheetArea.colHeader);

for (var i = 0; i < sheet.getRowCount() - 1; i++) {

    sheet.setValue(i, 0, i);
    sheet.setValue(i, 1, 0 - i);
    // var j = i+1;
    sheet.setFormula(i, 2, "=A" + (i + 1) + "+B" + (i + 1));
    sheet.setCellType(i, 2, new MyCellType());
}
sheet.setValue(4, 0, 8)
sheet.resumePaint();