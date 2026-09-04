import * as GC from "@grapecity-software/spread-sheets";

var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"), { sheetCount: 2 });


function initSpread(spread) {
    var sheet = spread.getSheet(0);
    var a1 = getFormulaFromRowCol(0, 0)
    sheet.addCustomName('SourceCell', a1, 0, 0)
    sheet.setColumnWidth(1, 300)
    sheet.setRowHeight(1, 30)
    sheet.setRowHeight(2, 30)
    sheet.suspendPaint();

    var style = new GC.Spread.Sheets.Style();

    style.font = "14px simkai";
    sheet.setStyle(-1, -1, style, GC.Spread.Sheets.SheetArea.viewport);

    var cell = sheet.getCell(1, 1);
    cell.cellType(new ShowTagCellType());
    cell.formatter('"$USA"#,##0.00_);("$USA"[red]#,##0.00)')
    // cell.value(-5000.02);
    cell.formula("SourceCell")
    sheet.setValue(0, 0, -5000.02)

    var cellTagStart = [
        {
            type: 'text', //普通文本
            text: '(Text Mark)'
        },
        {
            type: 'text',
            text: '(Text11111)'
        },
        {
            type: 'link', //超链接
            isCustomName: true, //自定义名称连接
            link: 'SourceCell'
        },
        {
            type: 'link',
            isCustomName: false,
            link: 'B12'
        },
        {
            type: 'link',
            isCustomName: false,
            link: 'C3'
        },
    ];
    var cellTagEnd = {
        supText: 'Sup',
        subText: 'Sub'
    }

    cell.tag({
        cellTagStart: cellTagStart,
        cellTagEnd: cellTagEnd
    });

    var cell2 = sheet.getCell(2, 1);
    cell2.cellType(new ShowTagCellType());
    cell2.formatter('"$USA"#,##0.00_);("$USA"#,##0.00)')
    cell2.value(1000.03);

    var cellTagStart2 = [
        {
            type: 'text',
            text: '{Mark}'
        },
        {
            type: 'text',
            text: '{Text}'
        },
        {
            type: 'text',
            text: '{Text}'
        },
        {
            type: 'link',
            isCustomName: true,
            link: 'SourceCell'
        },
        {
            type: 'link',
            isCustomName: false,
            link: 'B22'
        },
    ];
    var cellTagEnd2 = {
        supText: 'A B C',
        subText: 'TRUE'
    }

    cell2.tag({
        cellTagStart: cellTagStart2,
        cellTagEnd: cellTagEnd2
    });

    sheet.resumePaint();
    sheet.autoFitColumn(1);
    sheet.autoFitRow(1);
    sheet.autoFitRow(2);
};

function getFormulaFromRowCol(row, col) {
    var range = new GC.Spread.Sheets.Range(row, col, 1, 1)
    return GC.Spread.Sheets.CalcEngine.rangeToFormula(range, 0, 0, GC.Spread.Sheets.CalcEngine.RangeReferenceRelative.allAbsolute, false)
}

//自定义单元格
function ShowTagCellType() {
    this.typeName = "ShowTagCellType";
    this._cellTagStartCache = undefined
    this._cellTagEndCache = undefined
    this._textWidth = undefined
    this._textHeight = undefined
}

ShowTagCellType.prototype = new GC.Spread.Sheets.CellTypes.Text();

ShowTagCellType.prototype.paintContent = function (ctx, value, x, y, w, h, style, context) {
    var tag = context.sheet.getTag(context.row, context.col);
    if (tag == '' || tag == null || tag === undefined) {
        this._cellTagStartCache = undefined
        this._cellTagEndCache = undefined
        this._textWidth = undefined
        this._textHeight = undefined
        GC.Spread.Sheets.CellTypes.Text.prototype.paintContent.call(this, ctx, value, x, y, w, h, style, context)
        return;
    }
    this._cellTagStartCache = [], this._textWidth = 0;
    var startTextWidth = 0, endTextWidth = 0;
    var sheet = context.sheet, zoomFactor = sheet.zoom();
    var foreColor = style.foreColor, textDecoration = style.textDecoration;

    //为了实现简单，单元格垂直居中，如果有其他需求，绘制文字位置重新计算
    style.vAlign = GC.Spread.Sheets.VerticalAlign.center;

    for (var i = 0; i < tag.cellTagStart.length; i++) {
        var node = tag.cellTagStart[i];

        if (node.type === 'text') {
            style.foreColor = foreColor
            style.textDecoration = textDecoration
            var cellText = node.text;
            GC.Spread.Sheets.CellTypes.Text.prototype.paintContent.call(this, ctx, cellText, x + startTextWidth, y, w - startTextWidth, h, style, context)
            var textWidth = GC.Spread.Sheets.CellTypes.Text.prototype.getAutoFitWidth.call(this, cellText, cellText, style, zoomFactor, context)
            startTextWidth += textWidth
        }
        else if (node.type === 'link') {
            style.foreColor = "blue"
            style.textDecoration = GC.Spread.Sheets.TextDecorationType.underline;
            var linkText = node.link;
            if (node.isCustomName) {
                linkText = this.getFormulaFromCustomerName(sheet, node.link);
            }
            GC.Spread.Sheets.CellTypes.Text.prototype.paintContent.call(this, ctx, linkText, x + startTextWidth + 2, y, w - startTextWidth, h, style, context)
            var textWidth = GC.Spread.Sheets.CellTypes.Text.prototype.getAutoFitWidth.call(this, linkText, linkText, style, zoomFactor, context)

            this._cellTagStartCache[i] = {
                startX: x + startTextWidth,
                textWidth: textWidth + 3,
                formula: linkText
            }
            startTextWidth += (textWidth + 3)
        }
    }
    this._textWidth += startTextWidth;

    // Set Font to default
    style.foreColor = foreColor
    style.textDecoration = textDecoration

    if (tag.cellTagEnd) {
        var supText = tag.cellTagEnd.supText, subText = tag.cellTagEnd.subText;
        var supTextWidth = GC.Spread.Sheets.CellTypes.Text.prototype.getAutoFitWidth.call(this, supText, supText, style, zoomFactor, context)
        var subTextWidth = GC.Spread.Sheets.CellTypes.Text.prototype.getAutoFitWidth.call(this, subText, subText, style, zoomFactor, context)

        endTextWidth = supTextWidth > subTextWidth ? supTextWidth : subTextWidth;

        var textHeight = GC.Spread.Sheets.CellTypes.Text.prototype.getAutoFitHeight.call(this, supText, supText, style, zoomFactor, context)
        this._textHeight = textHeight * 2

        style.hAlign = GC.Spread.Sheets.HorizontalAlign.center;
        style.vAlign = GC.Spread.Sheets.VerticalAlign.bottom;
        GC.Spread.Sheets.CellTypes.Text.prototype.paintContent.call(this, ctx, supText, x + w - endTextWidth - 5, y, endTextWidth + 5, h / 2, style, context)

        style.vAlign = GC.Spread.Sheets.VerticalAlign.top;
        GC.Spread.Sheets.CellTypes.Text.prototype.paintContent.call(this, ctx, subText, x + w - endTextWidth - 5, y + h / 2, endTextWidth + 5, h / 2, style, context)
    }
    this._textWidth += endTextWidth;

    //Paint Value
    style.font = "bold " + style.font
    style.hAlign = GC.Spread.Sheets.HorizontalAlign.right;
    style.vAlign = GC.Spread.Sheets.VerticalAlign.center;
    GC.Spread.Sheets.CellTypes.Text.prototype.paintContent.call(this, ctx, value, x, y, w - endTextWidth - 3, h, style, context)

};
ShowTagCellType.prototype.getFormulaFromCustomerName = function (sheet, customName) {
    var nameInfo = sheet.getCustomName(customName);
    var expression = nameInfo.getExpression();
    var expStr = GC.Spread.Sheets.CalcEngine.expressionToFormula(sheet, expression, 0, 0);
    var range = GC.Spread.Sheets.CalcEngine.formulaToRange(sheet, expStr, 0, 0);
    expStr = GC.Spread.Sheets.CalcEngine.rangeToFormula(range, 0, 0, GC.Spread.Sheets.CalcEngine.RangeReferenceRelative.allRelative, false)
    return expStr;
}
ShowTagCellType.prototype.getHitInfo = function (x, y, cellStyle, cellRect, context) {
    var info = { x: x, y: y, row: context.row, col: context.col, cellRect: cellRect, sheetArea: context.sheetArea, isReservedLocation: false, reservedLocation: -1 };

    if (y > cellRect.y + (cellRect.height - this._textHeight) / 2 && y < cellRect.y + cellRect.height - (cellRect.height - this._textHeight) / 2)

        for (var i = 0; i < this._cellTagStartCache.length; i++) {
            var item = this._cellTagStartCache[i];
            if (item) {
                var startX = item.startX;
                if (x - startX > 0 && x < startX + item.textWidth) {
                    info.isReservedLocation = true;
                    info.reservedLocation = i;
                    break;
                }
            }
        }

    return info;
}
ShowTagCellType.prototype.processMouseUp = function (hitInfo) {
    var sheet = hitInfo.sheet, self = this;
    if (sheet && hitInfo.isReservedLocation && hitInfo.reservedLocation >= 0) {
        setTimeout(function () {
            var expStr = self._cellTagStartCache[hitInfo.reservedLocation].formula;
            var range = GC.Spread.Sheets.CalcEngine.formulaToRange(sheet, expStr, 0, 0);
            sheet.setActiveCell(range.row, range.col);

            var rec = sheet.getCellRect(range.row, range.col)
            if (rec.x === undefined) {
                sheet.showCell(range.row, range.col, GC.Spread.Sheets.VerticalPosition.top, GC.Spread.Sheets.HorizontalPosition.left);
            }
        }, 10);
        return true;
    }
    return false;
};
ShowTagCellType.prototype.processMouseMove = function (hitInfo) {
    var sheet = hitInfo.sheet;
    var div = sheet.getParent().getHost();
    var canvasId = div.id + "vp_vp";
    var canvas = div.querySelector("#" + canvasId);
    if (sheet && hitInfo.isReservedLocation) {
        canvas.style.cursor = 'pointer';
        return true;
    } else {
        canvas.style.cursor = 'default';
    }
    return false;
};
ShowTagCellType.prototype.getAutoFitWidth = function (value, text, cellStyle, zoomFactor, context) {
    if (this._textWidth) {
        cellStyle.font = "bold " + cellStyle.font
        return 5 + this._textWidth + GC.Spread.Sheets.CellTypes.Text.prototype.getAutoFitWidth.call(this, value, text, cellStyle, zoomFactor, context);
    } else
        return GC.Spread.Sheets.CellTypes.Text.prototype.getAutoFitWidth.call(this, value, text, cellStyle, zoomFactor, context)
}
ShowTagCellType.prototype.getAutoFitHeight = function (value, text, cellStyle, zoomFactor, context) {
    if (this._textHeight) {
        return this._textHeight;
    }
    else {
        return GC.Spread.Sheets.CellTypes.Text.prototype.getAutoFitHeight.call(this, value, text, cellStyle, zoomFactor, context)
    }
}

initSpread(spread);