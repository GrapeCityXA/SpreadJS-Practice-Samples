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


let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()
sheet.setValue(1, 5, "1. 请选择不同颜色的区域，")
sheet.setValue(2, 5, "2. 查看工具栏的\"合并后居中\"的可用性")
sheet.setValue(3, 5, "3. 如果选择的区域和灰色背景区域相交")
sheet.setValue(4, 5, "4. 则\"合并后居中\"不可用")
sheet.getRange(1, 1, 10, 3).backColor("gray")

sheet.options.isProtected = true

let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))
let mergeCenter = GC.Spread.Sheets.Designer.getCommand("mergeCenter")
mergeCenter.enableContext = "customAllowMerge || " + mergeCenter.enableContext
config.commandMap = config.commandMap || {}
config.commandMap.mergeCenter = mergeCenter
designer.setConfig(config)

sheet.bind(GC.Spread.Sheets.Events.SelectionChanged, function(e, info) {
    console.log(info)
    let flag = true
    info.newSelections.forEach(r => {
        if(r.intersect(1, 1, 10, 3)) {
            flag = false
        }
    })
    designer.setData("customAllowMerge", flag)
})

