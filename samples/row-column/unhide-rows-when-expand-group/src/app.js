import * as GC from "@grapecity-software/spread-sheets";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();

spread.suspendPaint()
for (let r = 5; r < 10; r++) {
    sheet.setValue(r, 0, "隐藏")
    sheet.setRowVisible(r, false)
}
let ro = sheet.rowOutlines
ro.group(2, 11)
ro.setCollapsed(2, true)
spread.resumePaint()

spread.commandManager().addListener("_", function (info) {
    console.log(info)
    let type = ""
    if (info.command && info.command.cmd == "expandRowOutline") {
        type = "row"
    }
    if (info.command && info.command.cmd == "expandColumnOutline") {
        type = "col"
    }
    if (!type) {
        return
    }
    // 为true时代表此时是收起分组
    if (info.command.collapsed) {
        return
    }

    let _sheet = spread.getSheetFromName(info.command.sheetName)
    let outline = _sheet.rowOutlines
    if (type == "col") {
        outline = _sheet.columnOutlines
    }

    _sheet.suspendPaint()
    // 注意这里第一个参数要减 1
    let range = outline.find(info.command.index - 1, info.command.level)
    for (let i = range.start; i < range.end; i++) {
        if (type == "row") {
            _sheet.setRowVisible(i, true)
        } else if (type == "col") {
            _sheet.setColumnVisible(i, true)
        }
    }
    _sheet.resumePaint()
})