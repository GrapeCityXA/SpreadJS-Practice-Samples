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
let sheet = spread.getActiveSheet()

sheet.defaults.colWidth = 150

// 1. 水印方式
sheet.setValue(1, 1, "1.水印方式➡️")
let style1 = new GC.Spread.Sheets.Style()
style1.watermark = "请输入用户名"
sheet.setStyle(1, 2, style1)

// 2.默认值方式
sheet.setValue(3, 1, "2.默认值方式➡️")
sheet.setDefaultValue(3, 2, '请输入邮箱')

// 3. 掩码方式
sheet.setValue(5, 1, "3.掩码方式➡️")
let style3 = new GC.Spread.Sheets.Style();
style3.mask = {
    pattern: '[a0]{1,}@[a0]{1,}.(com|cn|gov|edu)'
}
sheet.setStyle(5, 2, style3)




