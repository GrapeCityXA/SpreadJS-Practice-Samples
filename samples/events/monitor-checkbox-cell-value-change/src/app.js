import * as GC from "@grapecity-software/spread-sheets";
import {cellfile} from './cellfile.js'


let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
spread.fromJSON(cellfile)

let sheet = spread.getActiveSheet()
sheet.bind(GC.Spread.Sheets.Events.ValueChanged,function(e,info){
    let {row,col} = info
    let cellType = sheet.getCellType(row,col)
    if(cellType instanceof GC.Spread.Sheets.CellTypes.RadioButtonList){
        alert('单选列表的值变化了')
    }else if(cellType instanceof  GC.Spread.Sheets.CellTypes.CheckBox){
        alert("复选框的值变化了")
    }else{
        alert(sheet.getValue(row,col))
    }
})
