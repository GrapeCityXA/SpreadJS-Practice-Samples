import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-shapes"
import "@grapecity-software/spread-sheets-charts"
import "@grapecity-software/spread-sheets-print"
import "@grapecity-software/spread-sheets-resources-zh"
import "@grapecity-software/spread-sheets-pdf"
import "@grapecity-software/spread-sheets-barcode"
import "@grapecity-software/spread-sheets-tablesheet"
import "@grapecity-software/spread-sheets-io"
import "@grapecity-software/spread-sheets-languagepackages"
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"

import { getData } from "./data.js";


let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
let spread = designer.getWorkbook()
spread.fromJSON(JSON.parse(getData()))

// 监听复制事件
spread.bind(GC.Spread.Sheets.Events.ClipboardChanging, function (e, info) {
    if (info.objects && info.objects[0] instanceof GC.Spread.Sheets.Charts.Chart) {
        // 复制时将图表写入剪贴板
        writeChart2Clipboard(info.objects[0])
    }
})


function writeChart2Clipboard(chart) {
    if (chart.isSelected()) {
        fetch(chart.toImageSrc()).then(res => {
            res.blob().then(b => {
                let item = new ClipboardItem({
                    "image/png": b
                })
                navigator.clipboard.write([item])
            })
        })
    }
}

