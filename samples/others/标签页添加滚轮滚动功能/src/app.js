import * as GC from "@grapecity-software/spread-sheets";


const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let sheet = spread.getActiveSheet()
sheet.setValue(1, 1, "请将鼠标悬浮在下方Sheet标签区域，并滚动鼠标滚轮")

spread.setSheetCount(50)

document.getElementById("ss_tabStrip").onmousewheel = function (args) {
    //判断tab标签页位置是在上方或者下方，避免影响原有的左右两侧的滚动逻辑
    if (spread.options.tabStripPosition == GC.Spread.Sheets.TabStripPosition.bottom || spread.options.tabStripPosition == GC.Spread.Sheets.TabStripPosition.top) {
        //判断滚动方向
        if (args.deltaY > 0 && spread.startSheetIndex() < spread.getSheetCount() - 1) {
            console.log("右移");
            //调用startSheetIndex改变第一个标签的index
            spread.startSheetIndex(spread.startSheetIndex() + 1);
        } else if (args.deltaY < 0 && spread.startSheetIndex() > 0) {
            console.log("左移");
            spread.startSheetIndex(spread.startSheetIndex() - 1);
        }
    }
}