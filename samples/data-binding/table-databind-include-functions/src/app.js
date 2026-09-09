import * as GC from "@grapecity-software/spread-sheets";
import { bindfile } from "./data.js"
/**
 * 表格绑定中，某一列根据表格中的其它项计算得到，在表格绑定时需要随着数据扩展公式。
 */
let spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'));

spread.fromJSON(bindfile)
//mock的数据源
let datas = {
    details:[
        {
            subject: '******',
            title: '初级工程师',
            num: 1200,
            site: '南京',
            price: 500,
            item01: 760,
            item02: 960,
            item03: 860,
            item04: 790,
            item05: 862,
            item06: 940,
            item07: 780,
            item08: 860,
        },{
            subject: '******',
            title: '中级工程师',
            num: 1500,
            site: '武汉',
            price: 1500,
            item01: 960,
            item02: 960,
            item03: 860,
            item04: 690,
            item05: 862,
            item06: 740,
            item07: 850,
            item08: 780,
        },{
            subject: '******',
            title: '高级工程师',
            num: 2200,
            site: '武汉',
            price: 2000,
            item01: 760,
            item02: 860,
            item03: 960,
            item04: 790,
            item05: 662,
            item06: 840,
            item07: 850,
            item08: 780,
        }
    ]
}
//设置数据源
let sheet = spread.getActiveSheet()
let source = new GC.Spread.Sheets.Bindings.CellBindingSource(datas)
sheet.setDataSource(source)

let table = sheet.tables.findByName('details')
copyTableFormula(sheet,table)

//第六列汇总公式列，不属于数据源部分，需要根据表格区域范围进行动态扩展
function copyTableFormula(sheet, table) {
        let range = table.dataRange()
        for (let i = 0; i < range.rowCount - 1; i++) {
                //总工时这一列可以打个tag做一下标记
                sheet.copyTo(range.row + i, 5, range.row + i + 1,5, 1, 1, GC.Spread.Sheets.CopyToOptions.formula) 
        }
    }

//监听表格增加数据事件，动态设置公式列数据
sheet.bind(GC.Spread.Sheets.Events.TableRowsChanged,function(e,data){
    copyTableFormula(data.sheet,data.table)
}) 

document.getElementById('getData').onclick = function(){
    alert("打印成功，请打开f12在控制台查看")
    console.log(sheet.getDataSource().getSource())
}
