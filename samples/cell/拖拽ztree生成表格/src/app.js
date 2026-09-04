import * as GC from "@grapecity-software/spread-sheets";
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


import { DragElement } from './dragElement'
import { ZTree } from './zTree'
// V14 Key
// GC.Spread.Sheets.Designer.LicenseKey = "jscodemine.grapecity.com,569244782343791#B0vlAOxVESNRjevEjNWtEN0xmNSR5KzVUVXlzYRd5RT36LtB7cFZ7Y6hGS7YEU9ZFOrdTQDt4LP9kavJUc4dmMop4MQh5dHZUU88EbQpVYxskTiJjVQx6S9oVbRxWMCpGOH96buJDMwdWWHlmajNlarAzV5QnTUlmWi5kdlBTbVNzKudFMzlFOnZFVWNXRjl6TQRDd8RkQvklapJ5YxdTM5QGcodTdrQVMJ3SY8YmWEd7bhd4aMdjNhRUSwwEUld6RvIzc7ZDbZJUQldUU8N6YSdDS9NHOKpmcy2iQvoldTZmcxBDN0VlQy44cOxkI0IyUiwiIFlzQycDR8cjI0ICSiwiNzkzNyQzN7YTM0IicfJye35XX3JSW6U4NiojIDJCLiQTMuYHIu3GZkFULyVmbnl6clRULTpEZhVmcwNlI0IiTis7W0ICZyBlIsICMxADM4ADI6EDOwEjMwIjI0ICdyNkIsISbvNmL9RXajVGchJ7ZuUmbp5WZk36YzpmI0IyctRkIsICqUe+v3SOqDmehGWuI0ISYONkIsISM9czM4MjM8cDN4ITO6UjI0ICZJJye0ICRiwiI34TQmRzTSdlVnJ5bsNHWD5UbOdmQul7QjFTREJzdHplbVZWbFZmNWFGT5QESrIESz2kcv94ZLRmQyRDN9ZlckVXYGpWbo96TPRmWUhUNZdUcUNkbUlVVXBjNKZ7V7YDWBBHdKRmQQR6aYtHa"



var zNodes = [
    { id: 1, pId: 0, name: "数据项 1", open: true },
    { id: 11, pId: 1, name: "数据项 1-1" },
    { id: 12, pId: 1, name: "表格 1-2", open: true },
    { id: 121, pId: 12, name: "字段 1-2-1", dataField: "字段1" },
    { id: 122, pId: 12, name: "字段 1-2-2", dataField: "字段2" },
    { id: 123, pId: 12, name: "字段 1-2-3", dataField: "字段3" },
    { id: 13, pId: 1, name: "数据项 1-3", open: true, drag: false },
    { id: 131, pId: 13, name: "数据项 1-3-1", drag: false },
    { id: 132, pId: 13, name: "数据项 1-3-2", drag: false },
    { id: 133, pId: 13, name: "数据项 1-3-3" },
    { id: 2, pId: 0, name: "数据项 2", open: true },
    { id: 21, pId: 2, name: "数据项 2-1" },
    { id: 22, pId: 2, name: "数据项 2-2", open: true, drop: false },
    { id: 221, pId: 22, name: "数据项 2-2-1" },
    { id: 222, pId: 22, name: "数据项 2-2-2" },
    { id: 223, pId: 22, name: "数据项 2-2-3" },
    { id: 23, pId: 2, name: "数据项 2-3" }
];

// var originalTextCellTypeGetTextLogic = GC.Spread.Sheets.CellTypes.Text.prototype.getText;
// function replacePaint() {
//     GC.Spread.Sheets.CellTypes.Text.prototype.getText = function (value, context) {
//         var bp = context.sheet.getBindingPath(context.row, context.col);
//         if (bp) {
//             return "[" + bp + "]";
//         }
//         return originalTextCellTypeGetTextLogic.apply(this, arguments);
//     };
// }
// function restorePaint() {
//     GC.Spread.Sheets.CellTypes.Text.prototype.getText = originalTextCellTypeGetTextLogic;
// }

initDesigner();



function initDesigner() {

    // replacePaint();

    var fieldListTreePanelCommand = GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.FieldListTreePanel)
    fieldListTreePanelCommand.visibleContext = "FieldListVisible && DefaultFieldList";
    let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.ToolBarModeConfig))
    config.commandMap = {};
    config.commandMap[GC.Spread.Sheets.Designer.CommandNames.FieldListTreePanel] = fieldListTreePanelCommand
    let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", config)
    designer.setData("DefaultFieldList", true)

    let spread = designer.getWorkbook()


    let sheet = spread.getActiveSheet()

    sheet.setValue(0, 0, 'grapecity')

    spread.getHost().style.position = "relative"
    let zTree = new ZTree("treeDemo", zNodes, spread)
}






