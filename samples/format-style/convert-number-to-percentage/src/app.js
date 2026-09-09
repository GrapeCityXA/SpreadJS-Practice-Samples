import * as GC from "@grapecity-software/spread-sheets";
// Title:输入数字转为百分比
// Description：在B2输入数字转为百分比
// Tag:自定义单元格，百分比


var oldsetEditorValue = GC.Spread.Sheets.CellTypes.Text.prototype.setEditorValue;
GC.Spread.Sheets.CellTypes.Text.prototype.setEditorValue = function (editorContext, value, context) {
    var sheet = context.sheet, row = context.row, col = context.col
    var format = sheet.getFormatter(row, col)
    if (value && !isNaN(value) && format && format.indexOf("%") === format.length - 1) {
        value = value * 100 + "%";
    }
    oldsetEditorValue.call(this, editorContext, value, context);
}
var spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'), { sheetCount: 1 });

var sheet = spread.getActiveSheet();
sheet.setFormatter(1, 1, "0%");
sheet.setFormatter(2, 1, "@");
// get spread object
// var spread = GC.Spread.Sheets.findControl(document.getElementById('ss'));
// 这是结束编辑前，给值设置/100
spread.bind(GC.Spread.Sheets.Events.EditEnding, function (sender, args) {
    var sheet = args.sheet, row = args.row, col = args.col, text = args.editingText;
    var format = sheet.getFormatter(row, col)
    if (format && format.indexOf("%") === format.length - 1 && text && text.indexOf("%") === -1 && !isNaN(text)) {
        setTimeout(function () {
            sheet.setValue(row, col, text / 100);
        }, 0);
    }
});

// 结束编辑后
spread.bind(GC.Spread.Sheets.Events.EditEnded, function (sender, args) {
    var sheet = args.sheet, row = args.row, col = args.col, text = args.editingText;
    var format = sheet.getFormatter(row, col);
    if (!format && text && text.indexOf("%") === text.length - 1 && !isNaN(text.substr(0, text.length - 1))) {
        var format = text.indexOf('.') > 0 ? '0.00%' : "0%";
        sheet.setFormatter(row, col, format);
    }
});