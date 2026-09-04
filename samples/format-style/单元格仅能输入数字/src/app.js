import * as GC from "@grapecity-software/spread-sheets";
// Title:单元格仅能输入数字
// Description：C3单元格仅能输入数字
// Tag:自定义单元格


var spreadNS = GC.Spread.Sheets;
/**
 * 限制数值类型输入
 * @constructor
 */
function NumberCellType() {
    var self = this;
}
NumberCellType.prototype = new GC.Spread.Sheets.CellTypes.Base();
/**
 * 创建一个input输入框
 * @returns {HTMLInputElement}
 */
NumberCellType.prototype.createEditorElement = function (sheet) {
    var input = document.createElement("input");
    input.setAttribute('data-col', sheet.col);
    input.setAttribute('data-row', sheet.row);
    return input;
};
/**
 * 初始化事件
 * @param editorContext
 * @param cellStyle
 * @param cellRect
 */
NumberCellType.prototype.activateEditor = function (editorContext, cellStyle, cellRect) {
    var self = this;
    //Initialize input editor.
    if (editorContext) {
        GC.Spread.Sheets.CellTypes.Base.prototype.activateEditor.apply(this, arguments);
        editorContext.style.position = "absolute"
        function cb(e) {
            var value = editorContext.value;
            editorContext.value = value.replace(/[^0-9.]/g, '')
        }
        editorContext.addEventListener("input", cb)
        editorContext.addEventListener("change", cb)

    }
}
/**
 * 隐藏提示框
 * @param editorContext
 */
NumberCellType.prototype.deactivateEditor = function (editorContext) {
    //Remove input editor when end editor status.
    GC.Spread.Sheets.CellTypes.Base.prototype.deactivateEditor.apply(this, arguments)
};
NumberCellType.prototype.setEditorValue = function (editor, value) {
    if (value) {
        editor.value = value
    }
};
NumberCellType.prototype.getEditorValue = function (editor) {
    return editor.value;
};
NumberCellType.prototype.updateEditor = function (editorContext, cellStyle, cellRect) {
    if (editorContext) {
        editorContext.style.width = "1000px"
        editorContext.style.height = "1000px"
    }
}


var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"), {
    sheetCount: 2
});
var sheet = spread.getActiveSheet();

// 限制只能输入数字
sheet.getCell(2, 2).cellType(new NumberCellType());
// 输入其他字符的话，失焦时报提示，此设置在spread和excel都生效，设置只能输入0到999的数字
let dv = GC.Spread.Sheets.DataValidation.createNumberValidator(GC.Spread.Sheets.ConditionalFormatting.ComparisonOperators.between, 0, 999, true)
sheet.getCell(2, 2).validator(dv)

sheet.setValue(2, 1, "→")
sheet.setValue(2, 3, "←")
sheet.setValue(1, 2, "↓")
sheet.setValue(3, 2, "↑")

let style = new GC.Spread.Sheets.Style()
style.hAlign = GC.Spread.Sheets.HorizontalAlign.center
sheet.setStyle(2, 1, style)
sheet.setStyle(2, 3, style)
sheet.setStyle(1, 2, style)
sheet.setStyle(3, 2, style)
