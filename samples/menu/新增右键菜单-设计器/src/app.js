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



let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))
// 控制自定义右键菜单显示条件
let insertRowActive = "insertRowActive"

let customeAddRow = {
    "text":"自定义添加行",
    commandName:"customeAddRow",
    iconClass:"gc-spread-new",
    className:"customer-css",
    // ClickRowHeader && !AllowInsertCopiedCutCells为行头选中条件，insertRowActive为自定义条件
    visibleContext : `ClickRowHeader && !AllowInsertCopiedCutCells && ${insertRowActive}`,
    execute:(context) => {
        let sheet = context.getWorkbook().getActiveSheet()
        if(sheet.getActiveRowIndex()==2){
            sheet.addRows(3,1)
        }else{
            alert("该区域不支持添加行")
        }
    }
}
// 追加自定义命令
config.contextMenu.unshift("customeAddRow")
config.commandMap = {
    customeAddRow
}

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container",config)
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()
sheet.setValue(1,0,"⬅️此行点击时，无自定义菜单，其他行正常。仅在行头点击时生效。")

spread.bind(GC.Spread.Sheets.Events.SelectionChanged, function (e, info) {
    let row = info.sheet.getActiveRowIndex()
    if(row == 1) {
        designer.setData(insertRowActive, false)
    } else {
        designer.setData(insertRowActive, true)
    }
});






