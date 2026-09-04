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


/**
 * 应用场景：不同客户，对右菜单的可操作权限不同，需要控制右键菜单是否可用
 */

const ALLOWINSERT = "allowInsert"

// designer右键菜单的菜单项的控制都在config中的contextMenu中
let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))

// 行头插入按钮显示可用的状态控制设置
GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.InsertRows).enableContext = ALLOWINSERT
// 表格区域插入模态框状态控制
GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.InsertDialog).enableContext = ALLOWINSERT
// 命令修改之后覆盖注册
let newInsertRow = GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.InsertRows)
let newInsertDialog = GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.InsertDialog)
// 修改或新增的一些命令需要反应在commandMap中
config.commandMap = {
    [GC.Spread.Sheets.Designer.CommandNames.InsertRows]: newInsertRow,
    [GC.Spread.Sheets.Designer.CommandNames.InsertDialog]:newInsertDialog
}

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container",config)
designer.setData(ALLOWINSERT,false)
designer.refresh()




