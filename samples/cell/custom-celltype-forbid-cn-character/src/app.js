import * as GC from "@grapecity-software/spread-sheets";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();

function NumberCellType() {
    var typeName = 'NumberCellType';
}

NumberCellType.prototype = new GC.Spread.Sheets.CellTypes.Base();

NumberCellType.prototype.createEditorElement = function(sheet) {
    var input = document.createElement('input');
    input.setAttribute('data-col', sheet.col);
    input.setAttribute('data-row', sheet.row);
    return input;
}

NumberCellType.prototype.activateEditor = function(editorContext, cellStyle, cellRect) {
    if (editorContext) {
        GC.Spread.Sheets.CellTypes.Base.prototype.activateEditor.apply(this, arguments);
        editorContext.style.position = 'absolute';
        editorContext.addEventListener('input', function(e) {
            var value = editorContext.value;
            value = value.replace(/[\u4e00-\u9fa5]/g, '');
            editorContext.value = value;
        });

        editorContext.addEventListener('change', function(e) {
            var value = editorContext.value;
            value = value.replace(/[\u4e00-\u9fa5]/g, '');
            editorContext.value = value;
        });
    }
}

NumberCellType.prototype.deactiveEditor = function(editorContext) {
    GC.Spread.Sheets.CellTypes.Base.prototype.deactiveEditor.apply(this, arguments);
}

NumberCellType.prototype.setEditorValue = function(editor, value) {
    if (value) {
        editor.value = value;
    }
}

NumberCellType.prototype.getEditorValue = function(editor) {
    var value = editor.value;
    return value;
}

NumberCellType.prototype.updateEditor = function(editorContext, cellStyle, cellRect) {
    if (editorContext) {
        editorContext.style.width = cellRect.width + 'px';
        editorContext.style.height = cellRect.height + 'px';
    }
}

sheet.setValue(0, 0, '自定义数字单元格：');
sheet.autoFitColumn(0);
sheet.setCellType(0, 1, new NumberCellType());