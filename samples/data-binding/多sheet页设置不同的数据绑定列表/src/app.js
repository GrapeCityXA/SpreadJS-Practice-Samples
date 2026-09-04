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



let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")

let spread = designer.getWorkbook()

spread.setSheetCount(5)

spread.bind(GC.Spread.Sheets.Events.ActiveSheetChanged, function (sender, args) {
    let { oldSheet, newSheet } = args
    let oldBinding = designer.getData("updatedTreeNode") || designer.getData("treeNodeFromJson") || designer.getData("oldTreeNodeFromJson")
    try {
        oldSheet && oldSheet.tag(oldBinding)
    } catch(e){}
    if (newSheet) {
        let newBinding = newSheet.tag() || '{"$schema":"http://json-schema.org/draft-04/schema#","properties":{},"type":"object"}'
        designer.setData("treeNodeFromJson", newBinding);
        designer.setData("oldTreeNodeFromJson", newBinding);
        designer.setData("updatedTreeNode", newBinding);
    }
})




