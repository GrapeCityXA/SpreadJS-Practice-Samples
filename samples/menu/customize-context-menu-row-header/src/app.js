import * as GC from "@grapecity-software/spread-sheets";
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



let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")

let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))

// 控制自定义右键菜单显示条件
let insertRowActive = "insertRowActive"

let customeAddRow = {
    "text":"自定义添加行",
    commandName:"customeAddRow",
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

designer.setConfig(config)

let spread = designer.getWorkbook()
spread.bind(GC.Spread.Sheets.Events.SelectionChanged,function(e,info){
    if(info.sheet.getActiveRowIndex()==2){
       designer.setData(insertRowActive,true)
    }else{
       designer.setData(insertRowActive,false)
    }
    designer.refresh()
})
let sheet = spread.getActiveSheet()
sheet.setColumnWidth(0,300)
sheet.setValue(2,0,"←--- 请在左侧行头点击鼠标右键，查看效果")
sheet.setValue(3,0,"←--- 请在左侧行头点击鼠标右键，查看效果")
sheet.setValue(2,1,"此行支持")
sheet.setValue(3,1,"此行不支持")
sheet.getRange(2,-1,2,-1).backColor("pink")








