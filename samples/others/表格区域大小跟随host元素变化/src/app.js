import * as GC from "@grapecity-software/spread-sheets";
const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();
sheet.setValue(1, 1, "请点击按钮查看效果")

let host = document.getElementById("ss")
let curHeight = "90%"
let height1 = "90%"
let height2 = "50%"
document.getElementById("btn").addEventListener("click", function(){
    if(curHeight == height1) {
        host.style.height = height2
        curHeight = height2
    } else {
        host.style.height = height1
        curHeight = height1
    }
    spread.refresh()
})