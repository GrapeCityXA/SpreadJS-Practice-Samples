import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-excelio"
import "@grapecity-software/spread-sheets-charts"
import "@grapecity-software/spread-sheets-print"
import "@grapecity-software/spread-sheets-pdf"
import "@grapecity-software/spread-sheets-barcode"
import "@grapecity-software/spread-sheets-languagepackages"
import "@grapecity-software/spread-sheets-shapes"
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"


import { close, open, initBindSideBar, setData } from "./bind.js"




let isBinding = false
let designerConfig = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))
designerConfig.commandMap = {
    customWorksheetBind: {
        title: "工作表绑定",
        text: "工作表绑定",
        iconClass: "ribbon-button-template",
        bigButton: "true",
        commandName: "customWorksheetBind",
        execute: function (context, propertyName, fontItalicChecked) {
            isBinding = !isBinding
            let designModeCommand = GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.DesignMode);
            designModeCommand.execute(context)
            if (!isBinding) {
                close()
            } else {
                open()
            }

        }
    }
}

let c = designerConfig.ribbon[4].buttonGroups[0].commandGroup.children
// 移除原本的工作表绑定
designerConfig.ribbon[4].buttonGroups[0].commandGroup.children = c.filter(v => {
    return v.command != "templateDesignMode"
})
designerConfig.ribbon[4].buttonGroups[0].commandGroup.children.push({
    commands: ["customWorksheetBind"]
});


let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", designerConfig)
let spread = designer.getWorkbook()

initBindSideBar(spread, designer)

let _data = [{
    desc: "个人信息",
    path: "personal_info",
    type: "string",
    child: [{
        desc: "姓名",
        path: "name",
        type: "string",
        child: [{
            desc: "英文名",
            path: "en_name",
            type: "string"
        }, {
            desc: "中文名",
            path: "cn_name",
            type: "string"
        }]
    }, {
        desc: "年龄",
        path: "age",
        type: "string"
    }]
}, {
    desc: "学校信息",
    path: "school_info",
    type: "table",
    child: [{
        desc: "校名",
        path: "name",
        type: "string"
    }, {
        desc: "级别",
        path: "level",
        type: "string"
    }]
}]
setData(_data)


