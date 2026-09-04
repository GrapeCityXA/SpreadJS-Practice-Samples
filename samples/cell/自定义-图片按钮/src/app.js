import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
var sheet;
var spread;
var spreadNS
var updateRows = [];
var columnSetting = [];
var pagIndex = 1;

//自定义行列头单元格
//列头全选
// $(document).ready(function () {

spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'));

//spread.fromJSON(JSON.parse(test1));


sheet = spread.getActiveSheet();

spreadNS = GC.Spread.Sheets;


//Custom Cell Type
function MutipHyperLinkPictureCellType(items, size, isHorizontal) {
    this.typeName = "MutipHyperLinkPictureCellType";
    this._size = size || 22;
    this._isHorizontal = isHorizontal || false;
    this._items = items || [];
    this._valueArr = [];
    this._itemsTextWidth = [];
    this._maxItemTextWidth = 0;
    this._sumItemTextWidth = 0;
    this._zoomCatah = 1;
    this._autofitheight = 0;
    this._autofitwidth = 0;
}

MutipHyperLinkPictureCellType.prototype = new spreadNS.CellTypes.Base();

MutipHyperLinkPictureCellType.prototype.items = function(items) {
    if (arguments.length === 0) {
        return this._items
    }
    this._items = items;
    this._isCatchedTextWidth = false;
    return this
}

MutipHyperLinkPictureCellType.prototype.size = function(size) {
    if (arguments.length === 0) {
        return this._size
    }
    this._size = size;
    return this
}

MutipHyperLinkPictureCellType.prototype.isHorizontal = function(isHorizontal) {
    if (arguments.length === 0) {
        return this._isHorizontal
    }
    this._isHorizontal = isHorizontal;
    return this
}
MutipHyperLinkPictureCellType.prototype._getPaintStartX = function(x, y, w, h, hAlign) {
    return x;
}
MutipHyperLinkPictureCellType.prototype._getPaintStartY = function(x, y, w, h, vAlign) {
    return y;
}


MutipHyperLinkPictureCellType.prototype.paint = function(ctx, value, x, y, w, h, style, options) {
    GC.Spread.Sheets.CellTypes.Base.prototype.paint.call(this, ctx, '', x, y, w, h, style, options);
    if (!ctx) {
        return;
    }
    var sheet = options.sheet;
    var items = this._items;
    var zoomFactor = sheet.zoom();

    ctx.save();

    ctx.rect(x, y, w, h);
    ctx.clip();


    //ctx.font= style.font;
    ctx.font = " 12px Calibri"; //字体
    ctx.fillStyle = style.foreColor;


    this._zoomCatah = zoomFactor;



    var size = this._size * zoomFactor;
    var startX = this._getPaintStartX(x, y, w, h, style.hAlign),
        startY = this._getPaintStartY(x, y, w, h, style.vAlign);

    var hyperStyle = new GC.Spread.Sheets.Style();
    hyperStyle.foreColor = 'blue';
    hyperStyle.font = style.font;

    hyperStyle.textDecoration = GC.Spread.Sheets.TextDecorationType.none;



    //var valueArr = value.split(";");

    for (var i = 0; i < value.length; i++) {

        var backgroundImgStyle = new GC.Spread.Sheets.Style();
        backgroundImgStyle.backgroundImage = value[i].url; //背景图片


        var width = ctx.measureText(value[i]).width;
        if (width + 100 + 10 > this._autofitwidth) {
            this._autofitwidth = width + 100 + 10;
        }

        var valueObj = {};
        valueObj.width = width;
        valueObj.value = value[i].text;
        valueObj.url = value[i].url;
        valueObj.fuc = value[i].fuc;
        this._valueArr.push(valueObj);

        const pictureWidth = 20;
        const pictureHeight = 20;
        const groupWidth = 60;
        //这个是文字
        GC.Spread.Sheets.CellTypes.Text.prototype.paint.call(this, ctx, value[i].text, startX + pictureWidth + i * groupWidth, startY + 10 - size / 2, width + 10, size, hyperStyle, options); //修改文字  size 文字的大小

        //这个是图片
        GC.Spread.Sheets.CellTypes.Text.prototype.paint.call(this, ctx, "", startX + i * 60, startY, pictureWidth, pictureHeight, backgroundImgStyle, options);

    }
    this._autofitheight = value.length * 100;

    ctx.restore();
};
MutipHyperLinkPictureCellType.prototype.getHitInfo = function(x, y, cellStyle, cellRect, context) {
    var info = {
        x: x,
        y: y,
        row: context.row,
        col: context.col,
        cellStyle: cellStyle,
        cellRect: cellRect,
        sheetArea: context.sheetArea
    };
    const groupWidth = 60;
    const pictureWidth = 20;
    for (var i = 0; i < this._valueArr.length; i++) {
        var width = this._valueArr[i].width;
        let oddNum = (i % 2 == 0) ? 0 : 1;
        if (x > cellRect.x + i * width + pictureWidth && x < cellRect.x + oddNum * groupWidth + width - 20) {
            if (y > cellRect.y + i * 20 - this._size * this._zoomCatah / 2 - 10 &&
                y < cellRect.y + i * 20 - this._size * this._zoomCatah / 2 + this._size * this._zoomCatah + 10) {
                info.isReservedLocation = true;
                info.reservedLocation = i;
                info.url = this._valueArr[i].url; //修改url
                info.fuc = this._valueArr[i].fuc;
                break;
            }
        }
    }

    return info;
};

//鼠标移动
MutipHyperLinkPictureCellType.prototype.processMouseMove = function(hitInfo) {
    var sheet = hitInfo.sheet;
    var div = sheet.getParent().getHost();
    var canvasId = div.id + "vp_vp";
    var canvas = $("#" + canvasId)[0];
    if (sheet && hitInfo.isReservedLocation) {
        canvas.style.cursor = 'pointer';
        return true;
    } else {
        canvas.style.cursor = 'default';
    }
    return false;
};

//鼠标放开
MutipHyperLinkPictureCellType.prototype.processMouseUp = function(hitInfo) {
    var sheet = hitInfo.sheet;
    if (sheet && hitInfo.isReservedLocation && hitInfo.reservedLocation >= 0) {
        var row = hitInfo.row,
            col = hitInfo.col,
            sheetArea = hitInfo.sheetArea;
        var mm = hitInfo.fuc;
        mm();
        // alert(111)
        // window.open(hitInfo.url);
        //  alert(hitInfo.url);
        return true;
    }
    return false;
};


MutipHyperLinkPictureCellType.prototype.getAutoFitHeight = function() {
    return this._autofitheight;
}


MutipHyperLinkPictureCellType.prototype.getAutoFitWidth = function() {
    return this._autofitwidth;
}



//所有的checkbox 都勾选，header也得勾选
spread.bind(GC.Spread.Sheets.Events.ButtonClicked,
    function(e, args) {
        var sheet = args.sheet,
            row = args.row,
            col = args.col;
        var cellType = sheet.getCellType(row, col);
        if (cellType instanceof GC.Spread.Sheets.CellTypes.CheckBox) {
            var colHeaderCell = cellType = sheet.getCell(0, col, GC.Spread.Sheets.SheetArea.colHeader);
            if (colHeaderCell.cellType() instanceof HeaderCheckBoxCellType) {
                var checkStatus = true;
                for (var i = 0; i < sheet.getRowCount(); i++) {
                    var cell = sheet.getCell(i, col);
                    if (cell.cellType() instanceof GC.Spread.Sheets.CellTypes.CheckBox && !cell.value()) {
                        checkStatus = false;
                        break;
                    }
                }
                colHeaderCell.tag(checkStatus);
                sheet.repaint();
            }
        }
    });

function HeaderCheckBoxCellType() {
    spreadNS.CellTypes.CheckBox.apply(this);
}

HeaderCheckBoxCellType.prototype = new spreadNS.CellTypes.CheckBox();
var basePaint = spreadNS.CellTypes.CheckBox.prototype.paint;

HeaderCheckBoxCellType.prototype.paint = function(ctx, value, x, y, width, height, style, context) {
    var tag = context.sheet.getTag(context.row, context.col, context.sheetArea);
    if (tag !== true) {
        tag = false;
    }
    basePaint.apply(this, [ctx, tag, x, y, width, height, style, context]);
};


//获取碰撞信息方法,这个信息主要是提供给处理鼠标事件方法。
HeaderCheckBoxCellType.prototype.getHitInfo = function(x, y, cellStyle, cellRect, context) {
    if (context) {
        return {
            x: x,
            y: y,
            row: context.row,
            col: context.col,
            cellRect: cellRect,
            sheetArea: context.sheetArea,
            isReservedLocation: true,
            sheet: context.sheet
        };
    }
    return null;
};

//提供一个鼠标放开的行为事件方法
HeaderCheckBoxCellType.prototype.processMouseUp = function(hitInfo) {

    var sheet = hitInfo.sheet,
        row = hitInfo.row,
        col = hitInfo.col,
        sheetArea = hitInfo.sheetArea;

    if (sheet.getCell(0, 0, GC.Spread.Sheets.SheetArea.colHeader).locked() && sheet.options.isProtected) {
        return;
    }

    var tag = sheet.getTag(row, col, sheetArea);
    //var tag = sheet.getColumn(col,sheetArea).tag();
    if (tag === undefined || tag === null) { //first time
        sheet.setTag(row, col, true, sheetArea);
        //sheet.getColumn(col,sheetArea).tag(true)
    } else {
        sheet.setTag(row, col, !tag, sheetArea);
        //sheet.getColumn(col,sheetArea).tag(!tag)
    }
    //add your code here
    tag = sheet.getTag(row, col, sheetArea);
    //tag = sheet.getColumn(col,sheetArea).tag();
    // sheet.setValue(-1, 0, tag);
    sheet.suspendPaint();
    for (var i = 0; i < sheet.getRowCount(); i++) {
        var cell = sheet.getCell(i, col);
        if (cell.cellType() instanceof GC.Spread.Sheets.CellTypes.CheckBox) {
            cell.value(tag);
        }
    }
    sheet.resumePaint();
};


function edit(i) {
    alert("edit" + i);
}

function update(i) {
    alert("update" + i);
}


sheet.name('DataBind');
sheet.suspendPaint();
var _lines = ["Computers", "Washers", "Stoves"];
var _colors = ["Red", "Green", "Blue", "White"];
var _ratings = ["Terrible", "Bad", "Average", "Good", "Great", "Epic"];

var lineCellType = new spreadNS.CellTypes.ComboBox();
lineCellType.items(_lines);
var colorCellType = new spreadNS.CellTypes.ComboBox();
colorCellType.items(_colors);

var checkBoxCellType = new spreadNS.CellTypes.CheckBox();
checkBoxCellType.textAlign(GC.Spread.Sheets.CellTypes.CheckBoxTextAlign.right);

var ratingCellType = new spreadNS.CellTypes.ComboBox();
ratingCellType.items(_ratings);

var datasource = [{
    discontinued: 1,
    name: "Stoves S0",
    line: "Washers",
    color: "Green",
    rating: "Average"
}, {
    discontinued: 1,
    name: "Computers C1",
    line: "Washers",
    color: "Green",
    rating: "Average"
}, {
    discontinued: 0,
    name: "Washers W3",
    line: "Washers",
    color: "Green",
    rating: "Average"
}];
var colInfos = [{
    name: "discontinued",
    cellType: checkBoxCellType,
    size: 80
}, {
    name: "name",
    size: 100
}, {
    name: "line",
    cellType: lineCellType,
    size: 80
}, {
    name: "color",
    cellType: colorCellType
}, {
    name: "rating",
    cellType: ratingCellType
}, {
    name: "操作",
    size: 300
}];
sheet.autoGenerateColumns = false;
sheet.setDataSource(datasource);
sheet.bindColumns(colInfos);

sheet.setCellType(0, 0, new HeaderCheckBoxCellType(), spreadNS.SheetArea.colHeader);

for (let i = 0; i < sheet.getRowCount(GC.Spread.Sheets.SheetArea.viewport); i++) {
    sheet.getCell(i, 0).hAlign(GC.Spread.Sheets.HorizontalAlign.center).vAlign(GC.Spread.Sheets.VerticalAlign.center);

    var rbCellType = new MutipHyperLinkPictureCellType([1, 2, 3], 20, true);

    var cell = sheet.getCell(i, 5);
    cell.foreColor("green");
    cell.cellType(rbCellType);
    //https://www.baidu.com/img/bd_logo1.png?where=super;https://www.google.com.hk/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png
    //  cell.value("编辑,/image/edit.jpg,edit("+i+");修改,https://www.google.com.hk/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png,update(i)");
    cell.value([{
        text: "编辑",
        url: "https://www.google.com.hk/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png",
        fuc: function() {
            edit(i)
        }
    }, {
        text: "修改",
        url: "https://www.baidu.com/img/bd_logo1.png",
        fuc: function() {
            update(i)
        }
    }]);





}



sheet.resumePaint();



// });