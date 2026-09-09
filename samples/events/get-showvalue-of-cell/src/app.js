import * as GC from "@grapecity-software/spread-sheets";
GC.Spread.Common.CultureManager.culture('zh-cn');
/**
 * 获取单元格的内容
 */
let spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'));
let sheet = spread.getActiveSheet();
let date = new Date()
sheet.setValue(0,0,date)
sheet.setColumnWidth(0,120)
//设置日期格式
sheet.getCell(0,0).formatter('YYYY-MM-DD')
//给区域赋值
sheet.setArray(0,1,[['test',123],[5566,900,'grapecity']])
//获取单元格的内容
function getValue(row,col){
     let value = sheet.getValue(row,col)
     //日期获取其格式化文本信息
    if(value && value instanceof Date){
        value = sheet.getText(row,col)
    }
    alert(value)
}

document.getElementById("btn").addEventListener("click", function() {
    let selection = sheet.getSelections()
    if(!selection || !selection[0]) {
        alert("请先选择单元格")
        return
    }
    getValue(selection[0].row, selection[0].col)
})