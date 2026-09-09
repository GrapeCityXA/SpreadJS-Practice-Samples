import * as GC from "@grapecity-software/spread-sheets";
//Custom Cell Type
function FivePointedStarCellType() {
    this.typeName = "FivePointedStarCellType"
    this.size = 10;
}
FivePointedStarCellType.prototype = new GC.Spread.Sheets.CellTypes.Base();
FivePointedStarCellType.prototype.paint = function (ctx, value, x, y, w, h, style, context) {
    if (!ctx) {
        return;
    }

    ctx.save();

    // draw inside the cell's boundary
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.beginPath();

    if (value) {
        ctx.fillStyle = "orange";
    } else {
        ctx.fillStyle = "gray";
    }

    var size = this.size;
    var dx = x + w / 2;
    var dy = y + h / 2;
    ctx.beginPath();
    var dig = Math.PI / 5 * 4;
    ctx.moveTo(dx + Math.sin(0 * dig) * size, dy + Math.cos(0 * dig) * size);
    for (var i = 1; i < 5; i++) {
        ctx.lineTo(dx + Math.sin(i * dig) * size, dy + Math.cos(i * dig) * size);
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();
};
FivePointedStarCellType.prototype.getHitInfo = function (x, y, cellStyle, cellRect, context) {
    var xm = cellRect.x + cellRect.width / 2,
        ym = cellRect.y + cellRect.height / 2,
        size = 10;
    var info = { x: x, y: y, row: context.row, col: context.col, cellRect: cellRect, sheetArea: context.sheetArea };
    if (xm - size <= x && x <= xm + size && ym - size <= y && y <= ym + size) {
        info.isReservedLocation = true;
    }
    return info;
};
FivePointedStarCellType.prototype.processMouseUp = function (hitInfo) {
    var sheet = hitInfo.sheet;
    if (sheet && hitInfo.isReservedLocation) {
        var row = hitInfo.row, col = hitInfo.col, sheetArea = hitInfo.sheetArea;
        var newValue = !sheet.getValue(row, col, sheetArea);
        var spread = sheet.getParent();
        spread.commandManager().execute({ cmd: "editCell", sheetName: sheet.name(), row: row, col: col, newValue: newValue });
        return true;
    }
    return false;
};


function FullNameCellType() {
    this.typeName = "FullNameCellType"
}
FullNameCellType.prototype = new GC.Spread.Sheets.CellTypes.Base();
FullNameCellType.prototype.paint = function (ctx, value, x, y, w, h, style, options) {
    if (value) {
        GC.Spread.Sheets.CellTypes.Base.prototype.paint.apply(this, [ctx, value.firstName + "." + value.lastName, x, y, w, h, style, options]);
    }
};
FullNameCellType.prototype.updateEditor = function (editorContext, cellStyle, cellRect) {
    if (editorContext) {
        editorContext.style.width = cellRect.width;
        editorContext.style.height = 100;
        return { height: 100 };
    }
};
FullNameCellType.prototype.createEditorElement = function () {
    var div = document.createElement("div");
    div.setAttribute("gcUIElement", "gcEditingInput");
    div.style.backgroundColor = "white";
    div.style.overflow = "hidden";
    var span1 = document.createElement('span');
    span1.style.display = "block";
    var span2 = document.createElement("span");
    span2.style.display = "block";
    var input1 = document.createElement("input");
    var input2 = document.createElement("input");
    var type = document.createAttribute('type');
    type.nodeValue = "text";
    var clonedType = type.cloneNode(true);
    input1.setAttributeNode(type);
    input2.setAttributeNode(clonedType);
    div.appendChild(span1);
    div.appendChild(input1);
    div.appendChild(span2);
    div.appendChild(input2);
    return div;
};
FullNameCellType.prototype.getEditorValue = function (editorContext) {
    if (editorContext && editorContext.children.length === 4) {
        var input1 = editorContext.children[1];
        var firstName = input1.value;
        var input2 = editorContext.children[3];
        var lastName = input2.value;
        return { firstName: firstName, lastName: lastName };
    }
};
FullNameCellType.prototype.setEditorValue = function (editorContext, value) {
    if (editorContext && editorContext.children.length === 4) {
        var span1 = editorContext.children[0];
        span1.innerHTML = "First Name:";
        var span2 = editorContext.children[2];
        span2.innerHTML = "Last Name:";
        if (value) {
            var input1 = editorContext.children[1];
            input1.value = value.firstName;
            var input2 = editorContext.children[3];
            input2.value = value.lastName;
        }
    }
};
FullNameCellType.prototype.isReservedKey = function (e) {
    //cell type handle tab key by itself
    return (e.keyCode === GC.Spread.Commands.Key.tab && !e.ctrlKey && !e.shiftKey && !e.altKey);
};
FullNameCellType.prototype.isEditingValueChanged = function (oldValue, newValue) {
    console.log(arguments)

    if ((!oldValue && (newValue.firstName || newValue.lastName)) || (newValue.firstName != oldValue.firstName) || (newValue.lastName != oldValue.lastName)) {
        return true;
    }
    return false;
};
export {
    FivePointedStarCellType,
    FullNameCellType
}