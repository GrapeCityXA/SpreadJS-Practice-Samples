import * as GC from "@grapecity-software/spread-sheets";
GC.Spread.Common.CultureManager.culture('zh-cn');
/**
 * 合并单元格中数据的自适应行高
 */
let spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'));
let sheet = spread.getActiveSheet();
sheet.addSpan(2, 1, 3, 3)
sheet.setValue(2, 1, "哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈")
sheet.getCell(2, 1).wordWrap(true);


sheet.bind(GC.Spread.Sheets.Events.ValueChanged, function () {
    spread.suspendPaint()
    spread.addSheet(1)
    let tempSheet = spread.getSheet(1)

    let span = sheet.getSpan(2, 1)
    let spanWidth = 0
    // 计算合并后的总宽度
    for (let c = span.col; c < span.col + span.colCount; c++) {
        spanWidth += sheet.getColumnWidth(c)
    }
    // 将临时sheet的某一列宽度设置为和合并单元格的总宽度相同
    tempSheet.setColumnWidth(0, spanWidth)
    tempSheet.setValue(0, 0, sheet.getValue(2, 1))
    tempSheet.getCell(0, 0).wordWrap(true)
    tempSheet.autoFitRow(0)
    // 这里就是真实的高度，你只需要将其分配到合并的单元格的行中
    let realHeight = tempSheet.getRowHeight(0)

    // 我们使用平均分配的方式
    let spanHeight = 0
    for (let r = span.row; r < span.row + span.rowCount; r++) {
        spanHeight += sheet.getRowHeight(r)
    }
    // 平均分配到每一行的高度
    let increaseHeight = parseFloat((realHeight - spanHeight) / span.rowCount)
    for (let r = span.row; r < span.row + span.rowCount; r++) {
        sheet.setRowHeight(r, sheet.getRowHeight(r) + increaseHeight)
    }
    console.log(increaseHeight)
    // 移除临时sheet
    spread.removeSheet(1)
    spread.resumePaint()
})