import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-resources-zh"
import "@grapecity-software/spread-sheets-tablesheet";
import * as ExcelIO from "@grapecity-software/spread-excelio"
import "@grapecity-software/spread-sheets-charts"
import "@grapecity-software/spread-sheets-print"
import "@grapecity-software/spread-sheets-pdf"
import "@grapecity-software/spread-sheets-barcode"
import "@grapecity-software/spread-sheets-languagepackages"
import "@grapecity-software/spread-sheets-shapes"
import "@grapecity-software/spread-sheets-pivot-addon"
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"

GC.Spread.Common.CultureManager.culture("zh-cn");


// 设计器相关的资源都在Resource中，获取默认值，修改更新
// 非设计器的资源修改参考 https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/features/culture/custom-localization/purejs 
var res = GC.Spread.Sheets.Designer.getResources()
console.log(res)
res.title = "SpreadJS NO.1---定制标题"
GC.Spread.Sheets.Designer.setResources(res)


let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")

let spread = designer.getWorkbook()

spread.setSheetCount(5)

let sheet = spread.getActiveSheet()

sheet.setValue(0,0,'grapecity')



