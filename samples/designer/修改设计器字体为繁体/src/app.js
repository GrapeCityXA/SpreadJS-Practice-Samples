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


/***
 * config中包含操作按钮的定义文字，需要根据实际需求来更改成自己想要的语言字体。
 * 不同的spreadjs版本，config结构可能略有差异，可以在浏览器中打印出来结构查看
 * 
*/
var config = GC.Spread.Sheets.Designer.DefaultConfig
console.log(config)     //可以打印出来自己看看结构
config.ribbon[0].text='開始'
config.ribbon[2].text='頁面佈局'
config.ribbon[4].text='數據'
config.ribbon[5].text='視圖'
config.ribbon[6].text='設置'

//这里是designer的全局资源对象，包含很多弹出框中的显示文字
var resources = GC.Spread.Sheets.Designer.getResources()
console.log(resources)        // 打印出来自己看看结构
resources.borderDialog.border = '邊框'
resources.borderDialog.presets = '預置'
//设置全局资源为修改之后的资源
GC.Spread.Sheets.Designer.setResources(resources)
//设置当前designer使用的配置信息
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
designer.setConfig(config)

let spread = designer.getWorkbook()

spread.setSheetCount(5)

let sheet = spread.getActiveSheet()

sheet.setValue(0,0,'grapecity')





