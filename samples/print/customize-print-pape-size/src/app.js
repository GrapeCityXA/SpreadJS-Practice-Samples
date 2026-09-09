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



function getParams() {
    let CustomPaperSizeTemplate = {
        templateName: "CustomPaperSizeTemplate",
        title: "设置自定义纸张尺寸",
        width: 300,
        height: 200,
        content: [{
            type: "FlexContainer",
            children: [{
                type: "TextBlock",
                text: "设置纸张自定义宽高",
                margin: "5px 10px"
            },
            {
                type: "Column",
                width: "auto",
                children: [{
                    type: "ColumnSet",
                    children: [{
                        "type": "Column",
                        "width": "50px",
                        "children": [{
                            "type": "TextBlock",
                            "margin": "5px 10px -5px 10px",
                            "text": "宽:"
                        }]
                    },
                    {
                        "type": "Column",
                        "width": "auto",
                        "children": [{
                            type: "NumberEditor",
                            bindingPath: "width",
                            margin: "5px 10px"
                        }]
                    }
                    ]
                },
                {
                    type: "ColumnSet",
                    width: "160px",
                    children: [{
                        "type": "Column",
                        "width": "50px",
                        "children": [{
                            "type": "TextBlock",
                            "margin": "5px 10px",
                            "text": "高:"
                        }]
                    },
                    {
                        "type": "Column",
                        "width": "auto",
                        "children": [{
                            type: "NumberEditor",
                            bindingPath: "height",
                            margin: "5px 10px"
                        }]
                    }
                    ]
                },
                ]
            },
            ]
        }]
    };
    let paperSizeDialog = {
        title: "自定义纸张尺寸",
        text: "自定义纸张尺寸",
        direction: "vertical",
        commandName: "cmdPaperSizeDialog",
        iconClass: "ribbon-button-pageSetup-size",
        bigButton: true,
        type: 'button', // 单击按钮命令时，将调用执行函数。
        execute: (context, propertyName) => {
            let custompapersize = designer.getData("custompapersize")
            GC.Spread.Sheets.Designer.showDialog("CustomPaperSize", {
                width: custompapersize.width,
                height: custompapersize.height
            }, (result) => {
                console.log(result);

                let {
                    width,
                    height
                } = result; // 结果的数据结构.
                designer.setData("custompapersize", {
                    width: width,
                    height: height
                })
                let spread = context.getWorkbook();
                let sheet = spread.getActiveSheet();
                sheet.printInfo().paperSize(new GC.Spread.Sheets.Print.PaperSize(width, height));
            }, (e) => { // 错误回调
                console.log(e);
            }, (result) => { // 有效回调，用于检查结果值是否有效。如果没有，对话框将无法关闭。
                return result;
            });
        }
    }
    return {
        CustomPaperSizeTemplate,
        paperSizeDialog
    }
}

function getConfig() {
    let { CustomPaperSizeTemplate, paperSizeDialog } = getParams();
    let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))
    config.commandMap = {};
    GC.Spread.Sheets.Designer.registerTemplate("CustomPaperSize", CustomPaperSizeTemplate);
    config.commandMap["cmdPaperSizeDialog"] = paperSizeDialog;
    config.ribbon[2].buttonGroups[1].commandGroup.children[0].children.push("cmdPaperSizeDialog");
    return config
}

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", getConfig())
designer.setData("custompapersize", {
      width: 50,
      height: 50
})
let spread = designer.getWorkbook()

spread.commandManager().addListener('', function (args) {
    let command = args.command;
    if (command.cmd == "Designer.setPageLayout" && command.paperKind == 0) {
        let custompapersize = designer.getData("custompapersize");
        spread.getActiveSheet().printInfo().paperSize(new GC.Spread.Sheets.Print.PaperSize(custompapersize.width, custompapersize.height));
    }
});

let sheet = spread.getActiveSheet()
sheet.setValue(1,1,"请点击\"页面布局\" - \"自定义纸张尺寸\" 查看效果")
