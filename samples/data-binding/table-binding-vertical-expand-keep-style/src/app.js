import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-excelio"
import "@grapecity-software/spread-sheets-languagepackages"
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"

import {scheme} from "./scheme.js"
import {fileJson} from "./fileJson.js"



let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")

designer.setData("treeNodeFromJson", JSON.stringify(scheme));
designer.setData("oldTreeNodeFromJson", JSON.stringify(scheme));
let spread = designer.getWorkbook()
spread.fromJSON(fileJson)
let sheet = spread.getSheetFromName('Sheet2')
let table1 = sheet.tables.findByName('gcTable0')
table1.expandBoundRows(true)
let data = {
    test: [
        { one: 1, two: 2, three: 3},
        { one: 1, two: 2, three: 3},
        { one: 1, two: 2, three: 3},
        { one: 1, two: 2, three: 3},
        { one: 1, two: 2, three: 3},
    ]
}
let source = new GC.Spread.Sheets.Bindings.CellBindingSource(data);
sheet.setDataSource(source);
copyTableStyle(sheet, table1)
copyFormula()

function copyTableStyle(sheet, table) {
    let range = table.dataRange()
    let tableCols = isTableArea(range)
    for (let i = 0; i < range.rowCount - 1; i++) {
        for (let j = 0; j < sheet.getColumnCount(); j++) {
            //判断是否在表格内
            if (tableCols.indexOf(j) == -1) {
                sheet.copyTo(range.row + i, j, range.row + i + 1, j, 1, 1, GC.Spread.Sheets.CopyToOptions.style)
            }
        }
    }
}

function isTableArea(range) {
    //生成表格列范围数组
    let cols = []
    for (let i = 0; i < range.colCount; i++) {
        cols.push(range.col + i)
    }
    return cols
}

function copyFormula() {
    let sheet = spread.getActiveSheet();
    sheet.tables.all().forEach(table => {
        let range = table.dataRange()
        for (let col = range.col; col < range.col + range.colCount; col++) {
            let formula = sheet.getFormula(range.row, col)
            if (formula) {
                table.setColumnDataFormula(col - range.col, formula)
            }
        }
    })
}

