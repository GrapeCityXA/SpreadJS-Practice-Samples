import * as GC from "@grapecity-software/spread-sheets";

import json from "./json.js";

console.log(json)
let spread = new GC.Spread.Sheets.Workbook("designer-container")
spread.fromJSON(JSON.parse(json))
let sheet = spread.getActiveSheet()

document.getElementById("btn1").addEventListener("click", function () {
    let table = sheet.tables.all()[0]
    let range = table.range()
    let rowFilter = table.rowFilter()
    let rowFilterBac = {}
    let sortStateBac = {}
    for (let col = range.col; col < range.col + range.colCount; col++) {
        let filterItems = rowFilter.getFilterItems(col)
        if (filterItems.length) {
            rowFilterBac[col] = filterItems
        }

        let sortState = rowFilter.getSortState(col)
        if (sortState) {
            sortStateBac[col] = sortState
        }
    }

    let data = [{ name: "Tom", age: 12 }, { name: "Mike", age: 13 }, { name: "Nile", age: 14 }, { name: "Williams", age: 15 }, { name: "Gustavo", age: 16 }, { name: "Billi", age: 17 }, { name: "Tom", age: 18 }]
    sheet.setDataSource(new GC.Spread.Sheets.Bindings.CellBindingSource({ table: data }))

    for (let col = range.col; col < range.col + range.colCount; col++) {
        Object.keys(rowFilterBac).forEach(col => {
            rowFilter.addFilterItem(Number(col), rowFilterBac[col])
            rowFilter.filter(Number(col))
        })
        Object.keys(sortStateBac).forEach(col => {
            rowFilter.sortColumn(Number(col), sortStateBac[col] === 1)
        })
    }

})