import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-resources-zh"
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
GC.Spread.Common.CultureManager.culture("zh-cn")



let cnResource = GC.Spread.Common.CultureManager.getResources("zh-cn")
console.log(cnResource)
cnResource.Sheets.Exp_InvalidOperationInProtect = "自定义报错信息：此Sheet已被保护，请解除保护后再试"
GC.Spread.Common.CultureManager.addCultureInfo("zh-cn", null, cnResource);

let resource = GC.Spread.Sheets.Designer.getResources();
console.log(resource)
resource.title = "xxx 设计器";
GC.Spread.Sheets.Designer.setResources(resource)

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()
sheet.options.isProtected = true
sheet.setValue(1, 1, "请双击任意单元格，查看弹窗效果")
