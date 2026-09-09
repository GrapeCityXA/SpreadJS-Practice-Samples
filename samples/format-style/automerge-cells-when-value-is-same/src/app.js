import * as GC from "@grapecity-software/spread-sheets";
import { reports, data } from "./data.js"
/**
 * 表格绑定时，某些参数项相同时需要自动合并这些单元格，形成分组显示的效果。
 */
let spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'));

spread.fromJSON(reports)


//绑定数据源
let source = new GC.Spread.Sheets.Bindings.CellBindingSource(data)
let sheet = spread.getActiveSheet()
sheet.setDataSource(source)

let table = sheet.tables.findByName('details')
let tableRange = table.dataRange()
//获取数据区域的前两列
let range = new GC.Spread.Sheets.Range(tableRange.row, tableRange.col, tableRange.rowCount, 2)
//数据区域列方向上自动合并显示
sheet.autoMerge(range, GC.Spread.Sheets.AutoMerge.AutoMergeDirection.rowColumn)
