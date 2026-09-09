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


const ISENABLED = "isEnabled"

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
function customeDesigner(designer) {
    let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))
    // 新增Tab
    let customerRibbon = {
        id: "operate",
        text: "自定义操作",
        buttonGroups: [
            {
                label: "自定义行为",
                commandGroup: {
                    children: [
                        {
                            direction: "vertical",
                            commands: ["changeLineVisible"]
                        }
                    ]
                }
            }
        ]
    }
    // 定义数据保存点击命令
    let changeLineVisibleExec = {
        text: '显示打印分页线',
        type: "checkbox",
        enableContext: ISENABLED,
        commandName: "changeLineVisible",
        execute: (context) => {
                let sheet = context.getWorkbook().getActiveSheet();
                var isVisible = sheet.isPrintLineVisible();
                sheet.isPrintLineVisible(!isVisible);
            }, 
        getState: (context) => {
            // getState用于控制复选框的选中状态
            let sheet = context.getWorkbook().getActiveSheet();   
            //设置 checkBox 初始状态         
            return sheet.isPrintLineVisible();   //初始为未选中状态
        }
    }





    // push新的按钮
    config.ribbon.push(customerRibbon)
    // push新增按钮点击是对应命令
    config.commandMap = {
        changeLineVisible: changeLineVisibleExec,
    }
    // 重新设置config
    designer.setConfig(config)
}

customeDesigner(designer)
designer.setData(ISENABLED, true)






