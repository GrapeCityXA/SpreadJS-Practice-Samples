import * as GC from "@grapecity-software/spread-sheets";
import json from "./template.js"

let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
spread.fromJSON(json)

let sheet = spread.getActiveSheet()
let data = {
    name: "张三",
    age: 25,
    sex: "男",
    address: {
        postcode: "100000"
    }
}
sheet.setDataSource(new GC.Spread.Sheets.Bindings.CellBindingSource(data))

function BindingPathCellType(fields) {
    this.fields = fields;
}
BindingPathCellType.prototype = new GC.Spread.Sheets.CellTypes.Text()
BindingPathCellType.prototype.paint = function (ctx, value, x, y, w, h, style, context) {
    let arg = arguments
    if (value === null || value === undefined) {
        let sheet = context.sheet,
            row = context.row,
            col = context.col;
        if (sheet && (row === 0 || !!row) && (col === 0 || !!col)) {
            let bindingPath = sheet.getBindingPath(row, col);
            console.log(bindingPath)
            if (bindingPath) {
                arg[1] = "[" + bindingPath + "]";
            }
        }
    }
    GC.Spread.Sheets.CellTypes.Text.prototype.paint.apply(this, arg);
};
BindingPathCellType.prototype.getEditorValue = function (editorContext, context) {
    let text = GC.Spread.Sheets.CellTypes.Text.prototype.getEditorValue.apply(this, arguments);
    let sheet = context.sheet,
        row = context.row,
        col = context.col;
    if (text && text.indexOf("[") === 0 && text.indexOf("]") === text.length - 1) {
        sheet.setBindingPath(row, col, text.substring(1, text.length - 1));
        return null;
    }
    sheet.setBindingPath(row, col, null);
    return text;
};
BindingPathCellType.prototype.setEditorValue = function (editorContext, value, context) {
    let sheet = context.sheet,
        row = context.row,
        col = context.col;
        let arg = arguments
    if (sheet && (row === 0 || !!row) && (col === 0 || !!col)) {
        let bindingPath = sheet.getBindingPath(row, col);
        if (bindingPath) {
            arg[1] = "[" + bindingPath + "]";
        }
    }
    GC.Spread.Sheets.CellTypes.Text.prototype.setEditorValue.apply(this, arg);
}

BindingPathCellType.prototype.isReservedKey = function (e, context) {
    if (context.isEditing && (e.keyCode == 40 || e.keyCode == 38)) { // reserve up/down key to select items
        return true;
    }
    return GC.Spread.Sheets.CellTypes.Text.prototype.isReservedKey.apply(this, arguments);
}


document.getElementById("btn").addEventListener("click", function () {
    console.log("?")
    if (this.innerText == "Design") {
        let fields = [];
        getFields(fields, data, "");
        let defaultStyle = new GC.Spread.Sheets.Style();
        defaultStyle.cellType = new BindingPathCellType(fields);
        sheet.setDefaultStyle(defaultStyle);
        this.innerText = "Run";
        sheet.setDataSource(null);

    } else {
        this.innerText = "Design";
        let defaultStyle = new GC.Spread.Sheets.Style();
        defaultStyle.cellType = new GC.Spread.Sheets.CellTypes.Text();
        sheet.setDefaultStyle(defaultStyle);
        sheet.setDataSource(new GC.Spread.Sheets.Bindings.CellBindingSource(data));

    }
})


function getFields(fields, source, parentName) {
    if (toString.call(source) === "[object String]") return;
    if (toString.call(source) === "[object Array]") return;
    if (parentName !== "") parentName = parentName + ".";
    for (let propertyName in source) {
        fields.push("[" + parentName + propertyName + "]");
        getFields(fields, source[propertyName], parentName + propertyName);
    }
}