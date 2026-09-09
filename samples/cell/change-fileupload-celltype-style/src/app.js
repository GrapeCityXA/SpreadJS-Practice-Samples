import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-excelio"
import "@grapecity-software/spread-sheets-charts"
import "@grapecity-software/spread-sheets-print"
import "@grapecity-software/spread-sheets-pdf"
import "@grapecity-software/spread-sheets-barcode"
import "@grapecity-software/spread-sheets-languagepackages"
import "@grapecity-software/spread-sheets-shapes"
import "@grapecity-software/spread-sheets-pivot-addon"
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"



let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()


//自定义单元格
function CustomCellType() {
    this.typeName = "CustomCellType";
}
CustomCellType.prototype = new GC.Spread.Sheets.CellTypes.FileUpload();
var oldPaint = GC.Spread.Sheets.CellTypes.FileUpload.prototype.paint;
CustomCellType.prototype.paint = function (ctx, value, x, y, w, h, style, context) {
    console.log(x, y)
    if (!ctx) return;
    ctx.save();
    ctx.restore();
    if (!value) {
        var x = x + 5;
        var y = y + 5;
        var w = w - 10;
        var h = h - 10;
        var r = 15; // r为圆角半径

        // 1、绘制圆角
        ctx.beginPath();
        ctx.moveTo(x + r, y); // 起始点：左上角右侧
        ctx.arcTo(x + w, y, x + w, y + h, r); // 右上圆角
        ctx.arcTo(x + w, y + h, x, y + h, r); // 右下圆角
        ctx.arcTo(x, y + h, x, y, r); // 左下圆角
        ctx.arcTo(x, y, x + w, y, r); // 左上圆角
        ctx.closePath();

        // 2、填充指定颜色
        ctx.fillStyle = "pink";
        ctx.fill();

        // 3. 设置虚线样式并绘制深灰色边框
        ctx.lineWidth = 2; // 线宽
        ctx.strokeStyle = 'gray'; // 深灰色
        ctx.setLineDash([10, 5]); // 长虚线段10px，间隔5px
        ctx.stroke(); // 执行描边

        // 4、文本
        ctx.font = '20px simsun'; // 字号及字体（需根据需求调整）
        ctx.fillStyle = 'black'; // 文本颜色
        ctx.textAlign = 'center'; // 水平居中[5](@ref)
        ctx.textBaseline = 'middle'; // 垂直居中[5](@ref)
        const textX = x + w / 2; // 矩形水平中心点
        const textY = y + h / 2; // 矩形垂直中心点
        // 绘制文本
        ctx.fillText('点击上传文件', textX, textY);

    } else {
        oldPaint.apply(this, [ctx, value, x, y, w, h, style, context]);
    }

};


var customCellType = new CustomCellType();
sheet.setCellType(1, 1, customCellType);
sheet.setColumnWidth(1, 400);
sheet.setRowHeight(1, 200);