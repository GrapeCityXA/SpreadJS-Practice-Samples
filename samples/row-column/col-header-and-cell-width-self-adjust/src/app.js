import * as GC from "@grapecity-software/spread-sheets";


let spread= new GC.Spread.Sheets.Workbook(document.getElementById("ss"));

let widthInfo = {}

spread.setSheetCount(5)

let sheet = spread.getActiveSheet()

// 设置表头，这里需要先设置表头，再设置内容
initHeader()
setAutoFit()
initContent()
let range = sheet.getUsedRange(GC.Spread.Sheets.UsedRangeType.all)
for (let c = range.col; c < range.col + range.colCount; c++) {
    autoFitContent(c)
}


function initHeader() {
    // 这里要填你们自己的数据，只填写列头
    sheet.setValue(0, 0, '列头有很多很多很多内容', GC.Spread.Sheets.SheetArea.colHeader);
    sheet.setValue(0, 1, '列头有很多很多很多内容', GC.Spread.Sheets.SheetArea.colHeader);
    sheet.setValue(0, 2, '列头有很多很多很多内容', GC.Spread.Sheets.SheetArea.colHeader);
    // 并在第一行填入一个很短的数据，否则会导致后面getUsedRange获取不到
    sheet.setValue(0, 0, '1', GC.Spread.Sheets.SheetArea.viewport);
    sheet.setValue(0, 1, '1', GC.Spread.Sheets.SheetArea.viewport);
    sheet.setValue(0, 2, '1', GC.Spread.Sheets.SheetArea.viewport);
}
function initContent() {
    sheet.setValue(0, 0, '测试数据测试数据测试数据测试数据测试数据测试数据1', GC.Spread.Sheets.SheetArea.viewport);
    sheet.setValue(0, 1, '测试数据2', GC.Spread.Sheets.SheetArea.viewport);
    sheet.setValue(0, 2, '测试数据3', GC.Spread.Sheets.SheetArea.viewport);
}
function setAutoFit() {
    // 设置自动调整宽度时 考虑列头行头
    spread.options.autoFitType = GC.Spread.Sheets.AutoFitType.cellWithHeader;
    // 数据加载完成后，首次调整宽度
    let range = sheet.getUsedRange(GC.Spread.Sheets.UsedRangeType.all)
    for (let c = range.col; c < range.col + range.colCount; c++) {
        sheet.autoFitColumn(c)
        // 记录初始列头宽度
        widthInfo[c] = sheet.getColumnWidth(c)
    }
    // 监听单元格编辑，编辑完成后修改宽度
    sheet.bind(GC.Spread.Sheets.Events.EditEnded, function (sender, args) {
        console.log(args)
        autoFitContent(args.col)
    });
}
function autoFitContent(col) {
    // 记录调整前的宽度
    let originalWidth = sheet.getColumnWidth(col)
    sheet.autoFitColumn(col);

    // 如果调整后的宽度小于列头宽度，则恢复到调整前的宽度（这种情况对应的是列头标题很长，但是下面单元格的内容很短）
    let adjustedWidth = sheet.getColumnWidth(col)
    if (adjustedWidth < widthInfo[col]) {
        sheet.setColumnWidth(col, originalWidth)
    }
}
