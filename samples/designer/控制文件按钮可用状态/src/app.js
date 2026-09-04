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
 * 场景说明：根据不同的用户权限，控制文件按钮是否可用
 */
let isDisable = false
let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))
let fileCommand = GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.FileMenuButton)
function changeText(){
    if(!isDisable){
        fileCommand.text="不可用"
    }else{
        fileCommand.text="文件"
    }
}
changeText()

// 重写文件按钮点击调用命令
let oldFileCommandExecute = fileCommand.execute
fileCommand.execute = function(context,propertyName){
    if(isDisable){
        oldFileCommandExecute.call(this,context,propertyName)
    }else{
        alert('您没有权限使用该按钮')
    }
}

// 注册命令
config.commandMap = {
    fileMenuButton: fileCommand
}

// 初始化designer
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container",config)


document.getElementById("changeStatus").onclick = function(){
    // 切换状态时重置config
    isDisable = !isDisable
    changeText()
    config.commandMap = {
        fileMenuButton: fileCommand
    }
    designer.setConfig(config)
    designer.refresh()
}









