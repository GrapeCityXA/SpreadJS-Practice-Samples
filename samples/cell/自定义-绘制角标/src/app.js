import * as GC from "@grapecity-software/spread-sheets";
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));

/**
 * 以下为16.1.0版本之前的解决方案。16.1.0之后，可以直接通过样式实现
 */
// let spreadNS = GC.Spread.Sheets;
// initSpread(spread);
// // 重写Base类型
// let CustomBase = spreadNS.CellTypes.Base;

// let oldPaint = spreadNS.CellTypes.Base.prototype.paint;

// CustomBase.prototype.paint = function (context, value, x1, y1, a1, b1, style, ctx) {
//     if (!context) {
//         return;
//     }
//     if (this.showEffect) {
//         context.save();
//         let base = a1 > b1 ? b1 / 2 : a1 / 2;
//         context.beginPath();
//         context.moveTo(x1 + a1, y1);
//         context.lineTo(x1 + a1, y1 + base);
//         context.lineTo(x1 + a1 - base, y1);

//         context.fillStyle = 'red';
//         context.fill();
//         context.closePath();
//         context.restore();
//     }
//     oldPaint.apply(this, [context, value, x1, y1, a1, b1, style, ctx]);
// };

// function initSpread(spread) {
//     let sheet = spread.getSheet(0);
//     sheet.suspendPaint();

//     sheet.setRowHeight(0, 60);
//     sheet.setColumnWidth(0, 150);

//     let myCellType = new spreadNS.CellTypes.Text();
//     // 设置参数为true时画圈，不设置或设置false时恢复
//     myCellType.showEffect = true;
//     sheet.setCellType(0, 0, myCellType);

//     sheet.resumePaint();
// }

// 16.1.0 新特性：单元格装饰
let style = new GC.Spread.Sheets.Style()
let posType = GC.Spread.Sheets.CornerPosition
style.decoration = {
    cornerFold: {
        size: 20,
        position: posType.leftTop | posType.rightBottom, // 如果想同时在左上角和右下角都添加角标，可以用或 | 
        color: "#5b9bd5"
    }
}
let sheet = spread.getActiveSheet()
sheet.setRowHeight(0, 60)
sheet.setColumnWidth(0, 150)
sheet.setStyle(0, 0, style)








