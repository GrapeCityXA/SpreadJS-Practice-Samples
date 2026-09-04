import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-io";
import { getData } from "./data.js";


const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));


fetch("./template.sjs").then(res => {
    return res.blob()
}).then(blob => {
    spread.open(blob, function () {
        const sheet = spread.getActiveSheet();
        sheet.tables.all().forEach(table => {
            let range = table.dataRange()
            for (let col = range.col; col < range.col + range.colCount; col++) {
                let formula = sheet.getFormula(range.row, col)
                if (formula) {
                    table.setColumnDataFormula(col - range.col, formula)
                }
            }
        })
        sheet.setDataSource(new GC.Spread.Sheets.Bindings.CellBindingSource(getData()));
    })
})

