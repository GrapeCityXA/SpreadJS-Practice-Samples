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
import "@grapecity-software/spread-sheets-io"
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"


/***
 * 应用场景：表单保护时，会有相关的保护下还可以做什么操作的控制参数
 * 如果什么参数都不设置，大部分按钮都是不能操作的
 * 希望在什么参数都不设置的同时，少量按钮仍然可用
 */

let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))
console.log(config)
const ENABLEUSE = 'enableUse'
// 设置需要可用的按钮显示状态 - 工具栏文字变粗
GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.FontWeight).enableContext = ENABLEUSE
// 设置需要可用的按钮显示状态 - 工具栏背景色填充可用
GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.BackColor).enableContext = ENABLEUSE
// 右键菜单-插入菜单可用
GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.InsertDialog).enableContext = ENABLEUSE
// 注册修改后的命令
config.commandMap = {
    [GC.Spread.Sheets.Designer.CommandNames.FontWeight]: GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.FontWeight),
    [GC.Spread.Sheets.Designer.CommandNames.BackColor]:GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.BackColor),
    [GC.Spread.Sheets.Designer.CommandNames.InsertDialog]:GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.InsertDialog)
}



let designer = new GC.Spread.Sheets.Designer.Designer("designer-container",config)
designer.setData(ENABLEUSE,true)
designer.refresh()

let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()
sheet.setValue(0,0,123)
sheet.options.isProtected = true







