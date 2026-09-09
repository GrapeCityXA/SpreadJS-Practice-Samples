import * as GC from "@grapecity-software/spread-sheets";
import { json } from "./template.js"

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
spread.fromJSON(json)
const sheet = spread.getActiveSheet();
sheet.setValue(2, 4, "点击按钮后")
sheet.setValue(3, 4, "左侧表格样式将复制到右侧")

sheet.tables.add("Table2", 1, 7, 4, 3)
document.getElementById("btn").addEventListener("click", function() {
    let table1 = sheet.tables.findByName("Table1")
    let tableStyleJson = JSON.parse(JSON.stringify(table1.style().toJSON()));

    let table2 = sheet.tables.findByName('Table2');
    let tableStyle2 = new GC.Spread.Sheets.Tables.TableTheme();
    tableStyle2.fromJSON(tableStyleJson);
    table2.style(tableStyle2)
})