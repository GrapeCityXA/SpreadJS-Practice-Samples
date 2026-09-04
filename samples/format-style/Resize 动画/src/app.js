import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-excelio"
import "@grapecity-software/spread-sheets-tablesheet"
import "@grapecity-software/spread-sheets-charts"
import "@grapecity-software/spread-sheets-print"
import "@grapecity-software/spread-sheets-resources-zh"
import "@grapecity-software/spread-sheets-pdf"
import "@grapecity-software/spread-sheets-barcode"
import "@grapecity-software/spread-sheets-languagepackages"
import "@grapecity-software/spread-sheets-shapes"
import "@grapecity-software/spread-sheets-pivot-addon"
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"


let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")

let spread = designer.getWorkbook()

spread.setSheetCount(5)

let sheet = spread.getActiveSheet()

sheet.setValue(0,0,'grapecity')
let designerHost = document.getElementById("designer-container");

// 两种方案实现渐进刷新
document.getElementById("narrow").onclick = function(){
    designerHost.style.width = "50%";
    resizeForever()
}
document.getElementById("wide").onclick = function(){
    designerHost.style.width = "100%";
    resizeSmooth(designerHost, 2000)
}
var myInterval;
// 每100毫秒刷新一次，监听动画结束事件停止
function resizeForever(){
    myInterval = setInterval(function(){
        designer.refresh()
    }, 100);
}
const animated = document.querySelector('.resizing');
animated.addEventListener("transitionend", () => {
    clearInterval(myInterval)
    designer.refresh()
});

// 在指定时间内刷新，可以把这个方法封装到Designer的原型里，通过this调用refresh方便使用
function resizeSmooth(host, timing){
    let designer = GC.Spread.Sheets.Designer.findControl(host);
    if(!designer) return;
    let refreshInterval = setInterval(function(){
        designer.refresh()
    }, 100);
    setTimeout(function(){
        clearInterval(refreshInterval)
        designer.refresh()
        console.log("End")
    }, timing)
}


// const resizeObserver = new ResizeObserver(entries => {
//     //回调
//     console.log(1)
//     designer.refresh()
// });
 
// //监听对应的dom
// resizeObserver.observe(animated);