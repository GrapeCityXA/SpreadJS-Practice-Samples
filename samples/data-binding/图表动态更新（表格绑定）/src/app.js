import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-excelio"
import "@grapecity-software/spread-sheets-charts"
import "@grapecity-software/spread-sheets-print"
import "@grapecity-software/spread-sheets-pdf"
import "@grapecity-software/spread-sheets-barcode"
import "@grapecity-software/spread-sheets-languagepackages"
import "@grapecity-software/spread-sheets-shapes"
import "@grapecity-software/spread-sheets-pivot-addon"
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"

import { bindFile } from "./bindFile.js";


let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
let spread = designer.getWorkbook()
spread.fromJSON(bindFile)
/***
 * 实现思路：使用表格绑定设计模版文件
 * 图表引用整个表格"gcTable0"
 * 后期表格绑定数据行变化后，图表会自动更新
 * 使用方式：点击修改绑定数据按钮，绑定数据数量和值会随机变化,图表随之更新
 */

const generateData = () => {
    let dataCount = Math.ceil(Math.random() * 10 + 1)
    let data = []
    for(let i=0; i<dataCount;i++){
        let items = {
            "day1": Math.ceil(Math.random() * 200 + 1),
            "day2": Math.ceil(Math.random() * 100 + 1),
            "day3": Math.ceil(Math.random() * 400 + 1),
            "day4": Math.ceil(Math.random() * 500 + 1)
        }
        data.push(items)
    }
    return data
}


document.getElementById("changeData").onclick = function(){
    let data = {
        infos:generateData()
    }
    let sheet = spread.getActiveSheet()
    sheet.tables.all()[0].expandBoundRows(true)
    let source = new GC.Spread.Sheets.Bindings.CellBindingSource(data)
    sheet.setDataSource(source)
}



