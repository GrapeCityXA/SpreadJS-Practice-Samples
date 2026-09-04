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
import "@grapecity-software/spread-sheets-designer-resources-en"
import "@grapecity-software/spread-sheets-designer"



let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
let spread = designer.getWorkbook()
spread.setSheetCount(3)

let prevent = false
spread.bind(GC.Spread.Sheets.Events.SheetTabClick, function (e, info) {
    // 如果index为-1，则点击的是新增按钮，需要阻止该行为
    if (info.sheetTabIndex == -1) {
        prevent = true
        setTimeout(() => {
            prevent = false
        }, 0);
    }
});

spread.bind(GC.Spread.Sheets.Events.ActiveSheetChanging, function (sender, args) {
    // 如果被阻止切换了，说明是点击了新增sheet的按钮，移除被新增的表，并将ActiveSheet设置为原值
    if (prevent) {
        args.cancel = true
        spread.removeSheet(spread.getSheetCount() - 1)        
        spread.setActiveSheet(args.oldSheet)
        // do something
        alert("新建sheet被阻止")
    }
});

