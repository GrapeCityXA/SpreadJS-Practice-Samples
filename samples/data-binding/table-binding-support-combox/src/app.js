import * as GC from "@grapecity-software/spread-sheets";

import { json } from "./template.js"

let spread = new GC.Spread.Sheets.Workbook("ss")
spread.fromJSON(json)

let sheet = spread.getActiveSheet()
let dataSource = {
    person: [
        {name: 'lily', age: '15', girl: '1'},
        {name: 'mary', age: '12', girl: '1'},
        {name: 'tom', age: '17', girl: '0'},
        {name: 'dong', age: '14', girl: '0'},
        {name: 'luna', age: '15', girl: '1'},
        {name: 'aimi', age: '12', girl: '1'}
    ]
}
let datasource = new GC.Spread.Sheets.Bindings.CellBindingSource(dataSource);
sheet.setDataSource(datasource);

let table = sheet.tables.all()[0];
let row = table.dataRange().row;
let rowCount = table.dataRange().rowCount;
let colCount = table.dataRange().colCount;
let combo = sheet.getCellType(row, colCount-1);
combo.editorValueType(GC.Spread.Sheets.CellTypes.EditorValueType.value);
//给表格最后一列设置组合框
sheet.getRange(row,colCount-1,rowCount,1).cellType(combo);
//监听表格插入行事件
spread.bind(GC.Spread.Sheets.Events.TableRowsChanged, function (e, data) {
    let newTable = sheet.tables.all()[0];
    let newRow = table.dataRange().row;
    let newCol = table.dataRange().col;
    let newRowCount = table.dataRange().rowCount;
    let newColCount = table.dataRange().colCount;
    if (newRowCount > rowCount) {
        //增加表格行时，重新给表格列设置组合框
        sheet.getRange(newRow, newCol + newColCount - 1, newRowCount, 1).cellType(combo);
    } else {
        //删除表格行时，删除表格外组合框
        sheet.getRange(newRow, newCol + newColCount - 1, newRowCount, 1).cellType(combo);
        sheet.getRange(newRow + newRowCount, newCol + newColCount - 1, rowCount - newRowCount , 1).cellType(null);
    }
});