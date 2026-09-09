import * as GC from "@grapecity-software/spread-sheets";
var spreadNS = GC.Spread.Sheets;
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
function ShowValueCellType() {}
ShowValueCellType.prototype = new spreadNS.CellTypes.Base();
ShowValueCellType.prototype.paint = function(ctx, value, x, y, w, h, style, options) {
    if (value || value === 0) {
        // 在此修改value的值，想显示0.00可以设置
        spreadNS.CellTypes.Base.prototype.paint.apply(this, [ctx, value, x, y, w, h, style, options]);
    }
};
ShowValueCellType.prototype.updateEditor = function(editorContext, cellStyle, cellRect) {
    if (editorContext) {
        editorContext.style.width = cellRect.width;
        editorContext.style.height = 20;
        return {
            height: 20
        };
    }
};
ShowValueCellType.prototype.createEditorElement = function() {
    var div = document.createElement("div");
    div.setAttribute("gcUIElement", "gcEditingInput");
    div.style.backgroundColor = "white";
    div.style.overflow = "hidden";
    var input1 = document.createElement("input");
    var type = document.createAttribute('type');
    type.nodeValue = "text";
    input1.setAttributeNode(type);
    div.appendChild(input1);
    return div;
};
ShowValueCellType.prototype.getEditorValue = function(editorContext) {
    if (editorContext && editorContext.children.length === 1) {
        var input1 = editorContext.children[0];
        if (input1.formula) {
            return "=" + input1.formula;
        }
        return input1.value;
    }
};
ShowValueCellType.prototype.setEditorValue = function(editorContext, value, cell) {
    if (editorContext && editorContext.children.length === 1) {
        if (value || value === 0) {
            var input1 = editorContext.children[0];
            var row = cell.row,
                col = cell.col;
            var sheet = cell.sheet;
            var text = sheet.getText(row, col);
            var formula = sheet.getFormula(row, col);
            input1.value = text;
            if (formula) {
                input1.formula = formula;
            }
        }
    }
};
ShowValueCellType.prototype.isReservedKey = function(e) {
    //cell type handle tab key by itself
    return (e.keyCode === GC.Spread.Commands.Key.tab && !e.ctrlKey && !e.shiftKey && !e.altKey);
};
ShowValueCellType.prototype.isEditingValueChanged = function(oldValue, newValue) {
    if (oldValue !== newValue) {
        return true;
    }
    return false;
};
var sheet = spread.getSheet(0);
    sheet.suspendPaint();

    sheet.setRowCount(8);
    sheet.setColumnCount(3);

    sheet.setValue(0, 0, "值1", GC.Spread.Sheets.SheetArea.colHeader);
    sheet.setValue(0, 1, "值2", GC.Spread.Sheets.SheetArea.colHeader);
    sheet.setValue(0, 2, "值1+值2", GC.Spread.Sheets.SheetArea.colHeader);

    for (var i = 0; i < sheet.getRowCount() - 1; i++) {

        sheet.setValue(i, 0, i);
        sheet.setValue(i, 1, sheet.getRowCount() - i);
        var j = i + 1;
        sheet.setFormula(i, 2, "=A" + j + "+B" + j);
        sheet.setValue(i, 2, i + 1);
        sheet.setCellType(i, 2, new ShowValueCellType());

    }
    sheet.setCellType(7, 2, new ShowValueCellType());
    sheet.setFormula(7, 2, "=A8+B8");

    sheet.resumePaint();
