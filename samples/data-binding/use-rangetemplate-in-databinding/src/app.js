import * as GC from "@grapecity-software/spread-sheets";

import "./templateSheet.js";
import "./data.js";

let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let dialogSS;
let editorDialog = document.getElementById("editorDialog");
let dialogOK = document.getElementById("dialogOK");
let dialogCancel = document.getElementById("dialogCancel");


let renderSheet = spread.getActiveSheet();
renderSheet.defaults.rowHeight = 207;

let templateSheet = new GC.Spread.Sheets.Worksheet();
templateSheet.fromJSON(templatesheetjson);
spread.addSheet(1, templateSheet);
templateSheet.setFormatter(2, 2, "=IMAGE(@)");



renderSheet.suspendPaint();
let celltype = new GC.Spread.Sheets.CellTypes.RangeTemplate(templateSheet);

// renderSheet.setCellType(0, 1, celltype);
// renderSheet.setBindingPath(0, 1, "detail")

renderSheet.setRowHeight(0, 10)
renderSheet.setColumnWidth(0, 440)
// renderSheet.setColumnWidth(1, 440)
let dataSource = new GC.Spread.Sheets.Bindings.CellBindingSource({ //"detail": data[10],
    list: [{ "detail": data[0] }, { "detail": data[1] }, { "detail": data[2] }]
});

renderSheet.setRowHeight(1, 30)
let table = renderSheet.tables.add("tableRecordds", 1, 0, 4, 1);

table.autoGenerateColumns(false);

let tableColumn1 = new GC.Spread.Sheets.Tables.TableColumn();
tableColumn1.name("Detail");
tableColumn1.dataField("detail");
table.bindColumns([tableColumn1]);
table.bindingPath("list")

renderSheet.setDataSource(dataSource)
renderSheet.getRange(2, 0).cellType(celltype)
copyTableStyle(renderSheet, table)
renderSheet.resumePaint();

function copyTableStyle(sheet, table) {
    let range = table.dataRange();
    let rowHeight = sheet.getRowHeight(range.row);
    for (let i = 1; i < range.rowCount; i++) {
        // Copy Style
        sheet.copyTo(range.row + i - 1, range.col, range.row + i, range.col, 1, range.colCount, GC.Spread.Sheets.CopyToOptions.style);
        // Copy Formula
        sheet.copyTo(range.row + i - 1, range.col, range.row + i, range.col, 1, range.colCount, GC.Spread.Sheets.CopyToOptions.formula);
        // Copy Span
        sheet.copyTo(range.row + i - 1, range.col, range.row + i, range.col, 1, range.colCount, GC.Spread.Sheets.CopyToOptions.span);
        // Set Row Height
        sheet.setRowHeight(range.row + i, rowHeight);
    }
}

spread.bind(GC.Spread.Sheets.Events.CellDoubleClick, function (s, e) {
    let sheet = e.sheet, row = e.row, col = e.col;
    let cellType = sheet.getCellType(row, col);
    if (cellType && cellType instanceof GC.Spread.Sheets.CellTypes.RangeTemplate) {
        editRangeCell(sheet, row, col);
    }
})

function initDialogSpread() {
    if (!dialogSS) {
        dialogSS = new GC.Spread.Sheets.Workbook(document.getElementById("dialogSS"));
    }

    dialogSS.options.tabStripVisible = false;
    dialogSS.refresh();
}
function setEditorValue(sheet, row, col) {
    let cellType = sheet.getCellType(row, col);
    if (dialogSS && cellType) {
        let editorSheet = dialogSS.getActiveSheet()
        editorSheet.fromJSON(templatesheetjson);
        let value = JSON.parse(JSON.stringify(sheet.getValue(row, col)))
        let dataSource = new GC.Spread.Sheets.Bindings.CellBindingSource(value);
        editorSheet.setDataSource(dataSource);
        console.log(editorSheet.recalcAll)
        editorSheet.recalcAll(true);
    }
}

function editRangeCell(sheet, row, col) {
    setTimeout(function () {
        initDialogSpread()
        setEditorValue(sheet, row, col)
    }, 10)
    editorDialog.style.display = "block"
}

function closeDialog() {
    editorDialog.style.display = "none"
}

dialogCancel.onclick = function () {
    closeDialog();
}

dialogOK.onclick = function () {
    let editorSheet = dialogSS.getActiveSheet()
    let cellValue = editorSheet.getDataSource().getSource()

    let renderSheet = spread.getActiveSheet();
    renderSheet.setValue(renderSheet.getActiveRowIndex(), renderSheet.getActiveColumnIndex(), cellValue)
    closeDialog();
    console.log(JSON.stringify(renderSheet.getDataSource().getSource()));
}
