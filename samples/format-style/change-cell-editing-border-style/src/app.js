import * as GC from "@grapecity-software/spread-sheets";


const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();
sheet.setValue(1,1,"请双击任意单元格，进入编辑状态")

// 修改编辑状态边框色
let oldActiveEditorFn = GC.Spread.Sheets.CellTypes.Text.prototype.activateEditor
GC.Spread.Sheets.CellTypes.Text.prototype.activateEditor = function(editorContext,cellStyle,cellRect,context){
  oldActiveEditorFn.apply(this,arguments)
  editorContext.parentNode.parentNode.style.border = '2px dashed blue'
}
