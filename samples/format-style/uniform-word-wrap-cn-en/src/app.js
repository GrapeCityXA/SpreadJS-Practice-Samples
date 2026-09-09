import * as GC from "@grapecity-software/spread-sheets";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();

sheet.setValue(1, 1, "中文左括号（不能在结尾")
sheet.getCell(1, 1).wordWrap(true)
sheet.setRowHeight(1, 100)
sheet.setColumnWidth(1, 100)

let zhTextFormat = JSON.parse(JSON.stringify(GC.Spread.Common.CultureManager.getCultureInfo("zh-cn").TextFormat));
let enTextFormat = JSON.parse(JSON.stringify(GC.Spread.Common.CultureManager.getCultureInfo("en-us").TextFormat));

let btn1 = document.getElementById("button1")
let btn2 = document.getElementById("button2")
document.querySelector("#button1").addEventListener("click", function () {
    disableBtn()
    GC.Spread.Common.CultureManager.culture("zh-cn");
    let currentCultureInfo = GC.Spread.Common.CultureManager.getCultureInfo();
    currentCultureInfo.TextFormat = { ...zhTextFormat }
    spread.refresh()
});

document.querySelector("#button2").addEventListener("click", function () {
    disableBtn()
    GC.Spread.Common.CultureManager.culture("en-us");
    let se = document.getElementById("select")
    let currentCultureInfo = GC.Spread.Common.CultureManager.getCultureInfo();
    if (se.value == "是") {
        currentCultureInfo.TextFormat = { ...zhTextFormat }
    } else {
        currentCultureInfo.TextFormat = { ...enTextFormat }
    }
    spread.refresh()
});

function disableBtn() {
    btn1.disabled = true
    btn2.disabled = true
    setTimeout(function() {
        btn1.disabled = false
        btn2.disabled = false
    }, 2000)
}