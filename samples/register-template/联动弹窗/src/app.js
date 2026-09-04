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




var config = GC.Spread.Sheets.Designer.DefaultConfig
//1、定义菜单
config.ribbon.push({
    "id": 'operate',
    "text": '自定义操作',
    "buttonGroups": [
        {
            "label": "其他功能",
            "thumbnailClass": "",
            "commandGroup": {
                "children": [
                    { "direction": "vertical", "commands": ["cascadeSelection"] }
                ]
            }
        },
    ]
})
//2、定义命令
config.commandMap = {
    cascadeSelection: {
        title: "联动选择弹窗",
        text: "联动选择弹窗",
        iconClass: "ribbon-button-namemanager",
        bigButton: "true",
        commandName: "cascadeSelection",
        execute: async () => {
            let dialogOptiosn = {
                "province": 0,
                ...defaultOptions

            }
            GC.Spread.Sheets.Designer.showDialog("newTab", dialogOptiosn, (result) => {
                console.log(result)
            })

        }
    }
}


let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", config)
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()

//3、定义template(弹窗)
const selectTemplate = {
    title: "选择数据源",
    content: [{
        type: "FlexContainer",
        children:
            [
                {
                    "type": "Column",
                    "children": [
                        {
                            "type": "TextBlock",
                            "style": "line-height:24px",
                            "text": "省："
                        }
                    ],
                    "width": "80px"
                },
                {
                    "type": "Column",
                    "children": [
                        {
                            "type": "ListComboEditor",
                            "items": ['陕西省', '广东省', '湖南省', '四川省', "福建省"].map((item, index) => {
                                return {
                                    "text": item,
                                    "value": index,
                                    "selected": index === 0
                                }
                            }),
                            "selectedValue": 0,
                            "selectedIndex": 0,
                            "bindingPath": "province",
                        }
                    ],
                    "width": "100px"
                },
                {
                    "type": "Column",
                    "children": [
                        {
                            "type": "TextBlock",
                            "style": "line-height:24px",
                            "text": "市："
                        }
                    ],
                    "width": "80px"
                },
            ]
    }]
}
let cityList = [['宝鸡市', "西安市"], ['湛江市', "广州市"], ["长沙市", "株洲市"], ["成都市", "眉山市"], ["厦门市", "福州市"]]
let defaultOptions = {}
cityList.forEach((item, index) => {
    selectTemplate.content[0].children.push(
        {
            "type": "Column",
            "dblClickSubmit": true,
            "visibleWhen": `province=${index}`,
            "children": [
                {
                    "type": "ListComboEditor",
                    "items": item.map((k, kIndex) => {
                        return {
                            "text": k,
                            "value": kIndex,
                            "selected": kIndex === 0
                        }
                    }),
                    "selectedValue": 0,
                    "selectedIndex": 0,
                    "bindingPath": `city_${index}`,
                }
            ],
            "width": "100px"
        })
    defaultOptions[`city_${index}`] = 0
})
GC.Spread.Sheets.Designer.registerTemplate("newTab", selectTemplate);
