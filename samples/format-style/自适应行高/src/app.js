import * as GC from "@grapecity-software/spread-sheets";

var spreadNS = GC.Spread.Sheets;
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
// 声明用户自定义单元格类型，并支持序列化
function EnterNewlineCellType() {
    GC.Spread.Sheets.CellTypes.Text.apply(this, arguments);
    this.typeName = "EnterNewlineCellType";
}
EnterNewlineCellType.prototype = new spreadNS.CellTypes.Text();

// 重写paint方法
EnterNewlineCellType.prototype.paint = function (ctx, value, x, y, w, h, style, options) {

    // 这里需要加一个判断，当value前端有空格时，换成\t
    var val = "";
    if (value && (typeof value === 'string') && value.constructor === String) {
        for (var i = 0; i < value.length; i++) {
            if (value[i] === " ") {
                val += "\t";
            } else {
                val += value[i];
            }
        }
    }
    spreadNS.CellTypes.Text.prototype.paint.apply(this, [ctx, val, x, y, w, h, style, options]);
};

// 动态获取当前单元格编辑框的高度
EnterNewlineCellType.prototype.getEditorValue = function (editorContext, context) {
    var editHeight = $(editorContext).height();
    var sheet = context.sheet;
    var row = context.row;
    var col = context.col;
    sheet.setTag(row, col, editHeight);
    return spreadNS.CellTypes.Text.prototype.getEditorValue.apply(this, arguments);
};

// 设置不响应SpreadJS的Enter事件
EnterNewlineCellType.prototype.isReservedKey = function (e) {
    //这个方法目的是将enter事件注销，改为DOM自己的事件。
    return (e.keyCode === GC.Spread.Commands.Key.enter && !e.ctrlKey && !e.shiftKey && !e.altKey);
};

var sheet = spread.getSheet(0);
sheet.setValue(1, 1, "这是很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长的一段话");
sheet.getCell(1, 1).wordWrap(true);

// 给第2列设置自定义单元格
sheet.setCellType(-1, 1, new EnterNewlineCellType());
sheet.setColumnWidth(1, 200);
sheet.autoFitRow(1);

// 设置ValueChanged事件，动态调整行高
spread.bind(GC.Spread.Sheets.Events.ValueChanged, function (s, e) {
    var newValue = e.newValue;
    var oldValue = e.oldValue;

    if (newValue !== oldValue) {
        var sheet = spread.getActiveSheet();
        var row = e.row, col = e.col;
        var span = sheet.getSpan(row, col);
        // 处理含有合并单元格的情况
        if (span) {
            var tag = sheet.getTag(row, col);
            if (tag) {
                var editHeight = parseFloat(tag);
                var rowCount = span.rowCount;
                var heightAll = 0;
                for (let i = row; i < row + rowCount; i++) {
                    heightAll += sheet.getRowHeight(i);
                }
                if (heightAll < editHeight) {
                    sheet.setRowHeight(row, editHeight - heightAll + sheet.getRowHeight(row));
                }
            }
        } else {
            sheet.autoFitRow(row);
        }
    }
});