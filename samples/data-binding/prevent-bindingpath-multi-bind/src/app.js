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




const bindSchema = {"$schema":"http://json-schema.org/draft-04/schema#","properties":{"name":{"dataFieldType":"text","type":"string"}},"type":"object"}
/***
 * 需求背景：数据绑定时，一个字段只能绑定表单中的一个单元格，在绑定第二个单元格时提示禁止绑定
 * 实现思路：通过重写GC.Spread.Sheets.CellRange.prototype.bindingPath
 */

let oldSetBindingPath = GC.Spread.Sheets.CellRange.prototype.bindingPath
GC.Spread.Sheets.CellRange.prototype.bindingPath = function(field){
    console.log(field)
    let sheet = this.sheet
    let rc = sheet.getRowCount()
    let cc = sheet.getColumnCount()
    for(let r=0;r<rc;r++){
        for(let c=0;c<cc;c++){
            let path = sheet.getBindingPath(r,c)
            if(path&&path==field){
                alert("该字段已绑定")
                return
            }
        }
    }
    oldSetBindingPath.call(this,field)
}

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
//designer初始化完成之后，加载右侧Tree
designer.setData("treeNodeFromJson",JSON.stringify(bindSchema))
designer.setData("oldTreeNodeFromJson",JSON.stringify(bindSchema))
designer.setData('updatedTreeNode',JSON.stringify(bindSchema))





