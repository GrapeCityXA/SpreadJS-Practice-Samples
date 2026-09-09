import * as GC from "@grapecity-software/spread-sheets";
var spreadNS = GC.Spread.Sheets;
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));


/*自定义连续方框*/
function ContinuousBoxCellType() {
    this.html = '<input style="margin-top:2px;display:block;float:left;height:10px;font-size:10px;line-height:10px;width:10px;text-align:center;margin-left:1px;border:1px solid #999" value="{3}"/>'
        + '<input style="margin-top:2px;display:block;float:left;height:10px;font-size:10px;line-height:10px;width:10px;text-align:center;margin-left:3px;border:1px solid #999" value="{4}"/>'
        + '<input style="margin-top:2px;display:block;float:left;height:10px;font-size:10px;line-height:10px;width:10px;text-align:center;margin-left:3px;border:1px solid #999" value="{5}"/>'
        + '<input style="margin-top:2px;display:block;float:left;height:10px;font-size:10px;line-height:10px;width:10px;text-align:center;margin-left:3px;border:1px solid #999" value="{6}"/>';
}
ContinuousBoxCellType.prototype = new spreadNS.CellTypes.Base();


ContinuousBoxCellType.prototype._getPaintStartX = function (x, y, w, h, hAlign) {
    var startX = x;
    var size = this._size * this._zoomCatah;
    if (this._isHorizontal) {
        switch (hAlign) {
            case 1:
                //center
                startX = x + w / 2 - (this._sumItemTextWidth + size * this._items.length) / 2;
                break;
            case 2:
                //right
                startX = x + w - (this._sumItemTextWidth + size * this._items.length);
                break;
            default:
                //left
                startX = x
        }
    }
    else {
        switch (hAlign) {
            case 1:
                //center
                startX = x + w / 2 - (this._maxItemTextWidth + size) / 2;
                break;
            case 2:
                //right
                startX = x + w - (this._maxItemTextWidth + size + 2);
                break;
            default:
                //left
                startX = x
        }
    }
    return startX;
}
ContinuousBoxCellType.prototype._getPaintStartY = function (x, y, w, h, vAlign) {
    var startY = y;
    var size = this._size * this._zoomCatah;
    if (this._isHorizontal) {
        switch (vAlign) {
            case 1:
                //center
                startY = y + h / 2 - size / 2;
                break;
            case 2:
                //bottom
                startY = y + h - size;
                break;
            default:
                //top
                startY = y
        }
    }
    else {
        switch (vAlign) {
            case 1:
                //center
                startY = y + h / 2 - size * this._items.length / 2;
                break;
            case 2:
                //bottom
                startY = y + h - size * this._items.length;
                break;
            default:
                startY = y
        }

    }
    return startY;
}


ContinuousBoxCellType.prototype.paint = function (ctx, value, x, y, w, h, style, context) {
    var DOMURL = window.URL || window.webkitURL || window;
    var cell = context.sheet.getCell(context.row, context.col);
    var img = cell.tag();
    if (img) {
        try {
            ctx.save();
            ctx.rect(x, y, w, h);
            ctx.clip();
            ctx.drawImage(img, x + 2, y + 2)
            ctx.restore();
            cell.tag(null);
            return;
        } catch (err) {
            GC.Spread.Sheets.CustomCellType.prototype.paint.apply(this, [ctx, "#HTMLError", x, y, w, h, style, context])
            cell.tag(null);
            return;
        }
    }
    var svgPattern = '<svg xmlns="http://www.w3.org/2000/svg" width="{0}" height="{1}">' +
        '<foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="font:{2}">' + this.html + '</div></foreignObject></svg>';

    var data = svgPattern.replace("{0}", w).replace("{1}", h).replace("{2}", style.font).replace("{3}", value.toString()[0] == null ? "" : value.toString()[0]).replace("{4}", value.toString()[1] == null ? "" : value.toString()[1]).replace("{5}", value.toString()[2] == null ? "" : value.toString()[2]).replace("{6}", value.toString()[3] == null ? "" : value.toString()[3]);
    var doc = document.implementation.createHTMLDocument("");
    doc.write(data);
    // Get well-formed markup
    data = (new XMLSerializer()).serializeToString(doc.body.children[0]);

    img = new Image();
    //var svg = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
    //var url = DOMURL.createObjectURL(svg);
    //img.src = url;
    img.src = 'data:image/svg+xml;base64,' + window.btoa(data);
    cell.tag(img);
    img.onload = function () {
        context.sheet.repaint(new GC.Spread.Sheets.Rect(x, y, w, h));
    }

};
ContinuousBoxCellType.prototype.updateEditor = function (editorContext, cellStyle, cellRect) {
    if (editorContext) {
        editorContext.style.width = cellRect.width;
        editorContext.style.height = 100;
        //return {height: 200};
    }
};
ContinuousBoxCellType.prototype.createEditorElement = function () {
    var div = document.createElement("div");
    div.setAttribute("gcUIElement", "gcEditingInput");
    div.style.backgroundColor = "white";
    div.style.overflow = "hidden";
    div.innerHTML = '<input style="margin-top:2px;display:block;float:left;height:10px;font-size:10px;line-height:10px;width:10px;text-align:center;margin-left:1px;border:1px solid #999"/>'
        + '<input style="margin-top:2px;display:block;float:left;height:10px;font-size:10px;line-height:10px;width:10px;text-align:center;margin-left:3px;border:1px solid #999"/>'
        + '<input style="margin-top:2px;display:block;float:left;height:10px;font-size:10px;line-height:10px;width:10px;text-align:center;margin-left:3px;border:1px solid #999"/>'
        + '<input style="margin-top:2px;display:block;float:left;height:10px;font-size:10px;line-height:10px;width:10px;text-align:center;margin-left:3px;border:1px solid #999"/>';

    return div;
};
ContinuousBoxCellType.prototype.getEditorValue = function (editorContext) {

    /*console.log('getEditorValue');
    if(editorContext){
        return "1111";
    }*/

    var value = "";
    for (var i = 0; i < 4; i++) {
        value += editorContext.children[i].value;
    }
    return value;

    /*
    if (editorContext && editorContext.children.length === 4) {
        var input1 = editorContext.children[1];
        var firstName = input1.value;
        var input2 = editorContext.children[3];
        var lastName = input2.value;
        return { firstName: firstName, lastName: lastName };
    }
    */
};
ContinuousBoxCellType.prototype.setEditorValue = function (editorContext, value) {
    /*
    if (editorContext && editorContext.children.length === 4) {
        var span1 = editorContext.children[0];
        span1.innerHTML="First Name:";
        var span2 = editorContext.children[2];
        span2.innerHTML="Last Name:";
        if (value) {
            var input1 = editorContext.children[1];
            input1.value=value.firstName;
            var input2 = editorContext.children[3];
            input2.value=value.lastName;
        }
    }
    */
    for (var i = 0; i < 4; i++) {
        if (value.toString()[i] != null)
            editorContext.children[i].value = value.toString()[i];
    }

};
ContinuousBoxCellType.prototype.isReservedKey = function (e) {
    //cell type handle tab key by itself
    return (e.keyCode === GC.Spread.Commands.Key.tab && !e.ctrlKey && !e.shiftKey && !e.altKey);
};
/*自定义连续方框结束*/

initSpread(spread);
function initSpread(spread) {
    var sheet = spread.getSheet(0);
    sheet.suspendPaint();
    sheet.setColumnWidth(0, 100);
    sheet.setColumnWidth(1, 170);

    var columnInfo = [
       
        { name: "test", displayName: "test", cellType: new ContinuousBoxCellType(), size: 170 }
    ];

    var source = [
        { test: "3333" },
        { test: 123 },
        {  test: "456" },
    ];
    sheet.setDataSource(source);
    sheet.bindColumns(columnInfo);
    sheet.resumePaint();

};
