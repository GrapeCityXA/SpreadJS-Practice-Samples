import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-excelio"
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
GC.Spread.Common.CultureManager.culture("zh-cn")

/**
 * 点击没有背景色的区域,可以弹出修改之后的保护状态下的弹出框
 * 弹框样式的修改可采取重写CSS实现,使用的SpreadJS版本不同，css可能略有差异
 * 主要的需要修改的CSS类如下，详细可以自行在浏览器元素检查中查看
 * .gc-sjs-designer-dialog
 * .dialog-titlebar
 * .dialog-content
 * .dialog-footer
 * **/

 // 修改弹框标题
 let resources = GC.Spread.Sheets.Designer.getResources()
 resources.title = "**设计器"

 GC.Spread.Sheets.Designer.setResources(resources)

 //修改弹框内容
 let culture = GC.Spread.Common.CultureManager.getResources("zh-cn")
 culture.Sheets.Exp_InvalidOperationInProtect = "不支持对锁定单元格进行修改"
 GC.Spread.Common.CultureManager.addCultureInfo("zh-cn",null,culture)

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()
sheet.getRange(0,0,5,5).backColor("#ff5764")
sheet.options.isProtected = true