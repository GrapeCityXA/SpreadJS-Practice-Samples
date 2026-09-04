import GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-io"

/**
 * 创建工作簿1，2
 * 加载本地文件初始化工作薄1
 * 复制工作薄1的内容到工作薄2 
 */
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"), {
    sheetCount: 2
});
let spread1 = new GC.Spread.Sheets.Workbook(document.getElementById("ss1"), {
    sheetCount: 2
});

function loadExcel() {
    let excelFile = document.getElementById("fileDemo").files[0];
    spread.import(excelFile, function() {}, function(e){
        console.log(e)
    }, {
        fileType: GC.Spread.Sheets.FileType.excel
    })
};

/**
 * 将工作薄1中选中的内容，复制到工作薄2中
 */
function copy() {
    let sheet = spread.getActiveSheet();
    let sheet1 = spread1.getActiveSheet();
    let fromSelections = sheet.getSelections()[0];
    //暂时挂起页面绘制 待数据更新完毕之后渲染
    sheet1.suspendPaint();
    for (let i = fromSelections.row; i < fromSelections.row + fromSelections.rowCount; i++) {
        for (let j = fromSelections.col; j < fromSelections.col + fromSelections.colCount; j++) {
            sheet1.setFormatter(i, j, sheet.getFormatter(i, j));
            sheet1.setValue(i, j, sheet.getValue(i, j));
            sheet1.setStyle(i, j, sheet.getActualStyle(i, j));
        }
    }
    //恢复页面绘制
    sheet1.resumePaint();

};

document.getElementById('loadExcel').onclick = loadExcel
document.getElementById('copy').onclick = copy

