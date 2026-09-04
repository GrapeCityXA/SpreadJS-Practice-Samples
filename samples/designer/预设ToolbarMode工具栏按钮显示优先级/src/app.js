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


let toolbarConfig = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.ToolBarModeConfig))
toolbarConfig.commandMap = {};
let customerRibbon = {
    "id": "operate",
    "text": "操作",
    "overflow": true,
    "buttonGroups": [
        {
            "thumbnailClass": "ribbon-thumbnail-clipboard",
            "buttonGroupName": "第一梯队",
            "commandGroup": {
                "children": [
                    "priority1",
                    "priority2",
                    "priority3",
                    "priority4",
                    "priority5",
                    "priority6",
                ]
            }
        },
        {
            "buttonGroupName": "第二梯队",
            "commandGroup": {
                "children": [
                    {
                        "children": [
                            "fontFamily",
                            "fontSize",
                            "increaseFontsize",
                            "decreaseFontsize",
                            "fontWeight",
                            "fontItalic",
                            "fontUnderline",
                        ]
                    }
                ]
            }
        },
        {
            "thumbnailClass": "ribbon-thumbnail-clipboard",
            "buttonGroupName": "第三梯队",
            "commandGroup": {
                "children": [
                    "priority1",
                    "priority2",
                    "priority3",
                    "priority4",
                    "priority5",
                    "priority6",
                ]
            }
        },
    ]
};
let ribbonFileCommands = {
    "priority1": {
        iconClass: "ribbon-button-namemanager",
        bigButton: false,
        text: "优先级1",
        visiblePriority: 1,
        commandName: "priority1",
        execute: async function (context) {
            console.log("我是priority1")
        }
    },
    "priority2": {
        iconClass: "ribbon-button-namemanager",
        bigButton: false,
        text: "优先级2",
        visiblePriority: 2,
        commandName: "priority2",
        execute: async function (context) {
            console.log("我是priority2")
        }
    },
    "priority3": {
        iconClass: "ribbon-button-namemanager",
        bigButton: false,
        text: "优先级3",
        visiblePriority: 3,
        commandName: "priority3",
        execute: async function (context) {
            console.log("我是priority3")
        }
    },
    "priority4": {
        iconClass: "ribbon-button-namemanager",
        bigButton: false,
        text: "优先级4",
        visiblePriority: 4,
        commandName: "priority4",
        execute: async function (context) {
            console.log("我是priority4")
        }
    },
    "priority5": {
        iconClass: "ribbon-button-namemanager",
        bigButton: false,
        text: "优先级5",
        visiblePriority: 5,
        commandName: "priority5",
        execute: async function (context) {
            console.log("我是priority5")
        }
    },
    "priority6": {
        iconClass: "ribbon-button-namemanager",
        bigButton: false,
        text: "优先级6",
        visiblePriority: 6,
        commandName: "priority6",
        execute: async function (context) {
            console.log("我是priority6")
        }
    }
}
Object.assign(toolbarConfig.commandMap, ribbonFileCommands);
toolbarConfig.ribbon.panels.push(customerRibbon);

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", toolbarConfig)
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()
sheet.setValue(1, 1, "请改变浏览器的宽度，查看\"操作\"工具栏下方菜单的变化情况")
