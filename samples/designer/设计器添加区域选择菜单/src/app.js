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




const designerConfig = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig));
//1、定义菜单
designerConfig.ribbon.push({
    "id": 'operate',
    "text": '自定义操作',
    "buttonGroups": [
        {
            "label": '区域',
            "thumbnailClass": '',
            "commandGroup": {
                "children": [
                    { commands: ['selectRangeCommand'], direction: "vertical" },
                ]
            }
        }
    ],
});


//2、定义命令
const operateCommands = {
    selectRangeCommand: {
        title: "选择区域",
        text: "选择区域",
        iconClass: "ribbon-button-upload",
        bigButton: "true",
        commandName: "selectRangeCommand",
        execute: async (context) => {
            var spread = context.getWorkbook();
            var sheet = spread.getSheet(0);
            var option = { target1: "请选择一个表/区域", }
            GC.Spread.Sheets.Designer.showDialog("newTab", option, (result) => {
                console.log("result:", result);
                var rangesStr = result.target1.replace('=', '');
                // 使用选定区域创建公式
                var formula = "=Sum(" + rangesStr + ")";
                console.log(formula)
                // 在表单的单元格中设置公式
                sheet.setFormula(sheet.getActiveRowIndex(), sheet.getActiveColumnIndex(), formula, GC.Spread.Sheets.SheetArea.viewport);
            })
        },
    }
}

designerConfig.commandMap = {};
Object.assign(designerConfig.commandMap, operateCommands);

//3、定义template(弹窗)
const rangeTemplate = {
    title: "获取单元格区域",
    content: [{
        type: "FlexContainer",
        children: [
            {
                type: "ColumnSet",
                children: [
                    {
                        type: "RangeSelect",
                        needSheetName: false,
                        absoluteReference: true,
                        bindingPath: "target1",
                        style: "width: 300px",
                        margin: "5px 15px"
                    }

                ]
            },


        ]
    }]

}
GC.Spread.Sheets.Designer.registerTemplate("newTab", rangeTemplate);

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", designerConfig)
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()

sheet.setValue(0, 0, 1)
sheet.setValue(1, 0, 9)
sheet.setValue(1, 1, 5)

