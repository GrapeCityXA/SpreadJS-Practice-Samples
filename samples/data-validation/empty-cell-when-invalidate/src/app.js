import * as GC from "@grapecity-software/spread-sheets";

/**
 * 若用户输入信息不满足校验规则，直接清空输入信息
 * 本示例中无法在单元格中输入“哈哈哈“
 */

let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let sheet = spread.getActiveSheet()
//绑定单元格离开编辑状态事件
sheet.bind(GC.Spread.Sheets.Events.EditEnding, (sender, args) => {
    if (args.editingText == '哈哈哈') {
        args.cancel = true
        //异步执行终止单元格编辑状态，不将编辑文本应用到单元格中。
        setTimeout(() => {
            sheet.suspendEvent()
            sheet.endEdit(true)
            sheet.resumeEvent()
        })
    }
})