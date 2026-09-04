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

sheet.setValue(1, 1, "请在任意单元格点击鼠标右键，打开“设置单元格格式”菜单")
sheet.setValue(2, 1, "大部分功能都已被移除，只保留了“数字”功能")

// 获取格式化单元格的模板
let template = GC.Spread.Sheets.Designer.getTemplate(GC.Spread.Sheets.Designer.TemplateNames.FormatDialogTemplate)
// 删除不限要的功能，可以自行查看template中的内容，比较清楚。
template.content[0].children = template.content[0].children.filter(v => {
    return v.key == "Number" // 只保留格式化中的“数字”功能
})
// 修改完成之后，重新注册模板
GC.Spread.Sheets.Designer.registerTemplate(GC.Spread.Sheets.Designer.TemplateNames.FormatDialogTemplate,template)
