import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-excelio"
import "@grapecity-software/spread-sheets-resources-zh"
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
var spreadNS = GC.Spread.Sheets;
var sheet = spread.getActiveSheet();
sheet.setColumnWidth(1, 500);
sheet.setRowHeight(1, 200);
sheet.setValue(0,1,"请在B2单元格双击进入手写模式")
window.spread = spread
// 创建自定义手写输入单元格类型
function HandwritingCellType() { }

HandwritingCellType.prototype = new spreadNS.CellTypes.Base();

HandwritingCellType.prototype.createEditorElement = function (context) {
    var canvas = document.createElement('canvas');
    canvas.className = 'handwriting-canvas';
    canvas.width = context.sheet.getColumnWidth(context.col);
    canvas.height = context.sheet.getRowHeight(context.row);

    var isDrawing = false;
    var ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;

    canvas.addEventListener('pointerdown', function (e) {
        isDrawing = true;
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    });

    canvas.addEventListener('pointermove', function (e) {
        if (isDrawing) {
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
        }
    });

    canvas.addEventListener('pointerup', function () {
        isDrawing = false;
    });

    return canvas;
};

HandwritingCellType.prototype.getEditorValue = function (editorContext, context) {
    console.log(arguments)
    var canvas = editorContext;
    saveCanvasToTag(canvas, sheet, context.row, context.col);
    var value = "";

    try {
        recognizeHandwriting(canvas.toDataURL()).then(res => {
            context.sheet.setValue(context.row, context.col, res)
            // context.sheet.repaint()
            spread.refresh()
        });
    } catch (err) {
        console.error('OCR 识别出错:', err);
    }

};

// };

HandwritingCellType.prototype.setEditorValue = function (editorContext, cellStyle, cellRect, context) {
    var canvas = editorContext;

    var ctx = canvas.getContext("2d");
    // var isDrawing = false;

    // 加载之前保存的图片内容
    var sheet = cellRect.sheet;
    var row = cellRect.row;
    var col = cellRect.col;
    var tag = sheet.getTag(row, col);

    if (tag) {
        var img = new Image();
        img.src = tag;
        img.onload = function () {
            ctx.drawImage(img, 0, 0);
        };
    }

};

function saveCanvasToTag(canvas, sheet, row, col) {
    var dataURL = canvas.toDataURL();
    sheet.setTag(row, col, dataURL);
}

HandwritingCellType.prototype.updateEditor = function (editorContext, cellStyle, cellRect) {
    if (editorContext) {
        editorContext.style.width = cellRect.width + 'px';
        editorContext.style.height = cellRect.height + 'px';
    }
};




var handwritingCellType = new HandwritingCellType();
sheet.getCell(1, 1).cellType(handwritingCellType);

// 使用 Tesseract.js 进行手写识别
async function recognizeHandwriting(dataURL) {
    try {
        const result = await Tesseract.recognize(
            dataURL,
            'eng+chi_sim', // language pack, adjust as needed
            {
                logger: m => console.log(m)
            }
        );
        return result.data.text;
    } catch (err) {
        console.error('OCR recognition error:', err);
        throw err;
    }
}

