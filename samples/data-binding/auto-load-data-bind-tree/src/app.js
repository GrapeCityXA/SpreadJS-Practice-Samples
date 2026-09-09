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
GC.Spread.Common.CultureManager.culture("zh-cn");

/**
 *  需求场景：大部分客户右侧绑定Tree是根据服务端数据表构建的，直接从服务端反回来，我们设计好的模板json中也会有右侧的tree结构
 *  */ 

 // bindSchema为根据数据库表构建的绑定树结构
let bindSchema = {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "properties": {
        "检测单位": {
            "dataFieldType": "text",
            "type": "string"
        },
        "委托单名称": {
            "dataFieldType": "text",
            "type": "string"
        },
        "委托编号": {
            "dataFieldType": "text",
            "type": "string"
        },
        "受理日期": {
            "dataFieldType": "text",
            "type": "string"
        },
        "委托人": {
            "dataFieldType": "text",
            "type": "string"
        },
        "受理人": {
            "dataFieldType": "text",
            "type": "string"
        },
        "委托单位": {
            "dataFieldType": "text",
            "type": "string"
        },
        "检测次数": {
            "dataFieldType": "text",
            "type": "string"
        },
        "检测对象": {
            "dataFieldType": "text",
            "type": "string"
        },
        "型号规格": {
            "dataFieldType": "text",
            "type": "string"
        },
        "器具编号": {
            "dataFieldType": "text",
            "type": "string"
        },
        "温度": {
            "dataFieldType": "text",
            "type": "string"
        },
        "相对湿度": {
            "dataFieldType": "text",
            "type": "string"
        },
        "检定员": {
            "dataFieldType": "text",
            "type": "string"
        },
        "检定日期": {
            "dataFieldType": "text",
            "type": "string"
        },
        "核验员": {
            "dataFieldType": "text",
            "type": "string"
        },
        "检定依据": {
            "dataFieldType": "text",
            "type": "string"
        },
        "其它": {
            "dataFieldType": "text",
            "type": "string"
        },
        "单位地址": {
            "dataFieldType": "text",
            "type": "string"
        },
        "备注": {
            "dataFieldType": "text",
            "type": "string"
        }
    },
    "type": "object"
}
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
// 默认打开数据Tab
const FirstLoad = "firstLoad"
let config = GC.Spread.Sheets.Designer.DefaultConfig
// ribbon不同版本可能略有差异，可以打印出来看一下自己要修改的功能在哪里
config.ribbon[4].visibleWhen = FirstLoad
designer.setConfig(config)
designer.setData(FirstLoad, true)
designer.refresh()


//designer初始化完成之后，加载右侧Tree
designer.setData("treeNodeFromJson",JSON.stringify(bindSchema))
designer.setData("oldTreeNodeFromJson",JSON.stringify(bindSchema))
designer.setData('updatedTreeNode',JSON.stringify(bindSchema))


// 如果没有单独保存右侧绑定树的结构，而是获取到整个文件的json，可采用如下方式,workbookJson代表整个文件的json
// designer.setData("treeNodeFromJson",JSON.stringify(workbookJson.designerBindingPathSchema))
// designer.setData("oldTreeNodeFromJson",JSON.stringify(workbookJson.designerBindingPathSchema))
// designer.setData("updatedTreeNode",JSON.stringify(workbookJson.designerBindingPathSchema))

//数据提交时，spread.toJSON()没有右侧bindTree结构，如果需要的话可以获取相关属性再保存一下
//调用designer.getData('treeNodeFromJson') || designer.getData('updatedTreeNode') || designer.getData('oldTreeNodeFromJson')

if(!GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.DesignMode).getState(designer)){
 //没有打开的时候打开，已经打开了就不用去管了。
 GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.DesignMode).execute(designer)
}
let spread = designer.getWorkbook()

let sheet = spread.getActiveSheet()






