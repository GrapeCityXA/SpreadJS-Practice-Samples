import * as GC from "@grapecity-software/spread-sheets";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();

let colorMap = { // 定义颜色映射
    'item1': '#1abc9c', // item1对应的颜色
    'item2': '#2ecc71', // item2对应的颜色
    'item3': '#3498db', // item3对应的颜色
    'item4': '#9b59b6', // item4对应的颜色
    'item5': '#34495e', // item5对应的颜色
    'item6': '#f1c40f', // item6对应的颜色
    'item7': '#e67e22', // item7对应的颜色
    'item8': '#C76DA2', // item8对应的颜色
    'item9': '#e74c3c', // item9对应的颜色
    'item10': '#95a5a6', // item10对应的颜色
};
function ColorBlockCellType() {}
ColorBlockCellType = function () {
    GC.Spread.Sheets.CellTypes.Base.apply(this, arguments);
    this.typeName = 'ColorBlockCellType'
}

ColorBlockCellType.prototype = new GC.Spread.Sheets.CellTypes.Base();
ColorBlockCellType.prototype.paint = function (ctx, value, x, y, w, h, style, options) {
    //using the base text to render the text option.
    GC.Spread.Sheets.CellTypes.Text.prototype.paint.call(this, ctx, '', x, y, w, h, style, options);

    if (style.cellButtons && style.cellButtons.length > 0) {
        w = w - 28 * style.cellButtons.length;
    }
    var valueArr = value && value.split(','), newH = h, newY = y, newStyle = style.clone(), padding = 4,
        newX = x;
    var sheet = options.sheet, zoomFactor = sheet.zoom();
    if (valueArr && valueArr.length > 0) {
        newH = newH - 4;
        newY = y + 2;

        // remove the un-support options for block style;
        newStyle.cellButtons = [];

        valueArr.forEach((item, index) => {
            var itemWidth = GC.Spread.Sheets.CellTypes.Text.prototype.getAutoFitWidth(item, item, newStyle, zoomFactor, options) + 4;
            var itemBackground = colorMap[item];
            newStyle.backColor = itemBackground;

            newStyle.foreColor = 'white';
            if (newX + itemWidth > x + w) {
                itemWidth = x + w - newX;
            }
            if (itemWidth <= 0) {
                return;
            }
            GC.Spread.Sheets.CellTypes.Text.prototype.paint.call(this, ctx, item, newX, newY, itemWidth, newH, newStyle, options);
            newX += itemWidth + padding;
        });
    }
};
function generateThemeColors() {
    return generateColors(10, 0, 16777215)
}

let arr = ['item1', 'item2', 'item3', 'item4', 'item5', 'item6', 'item7', 'item8', 'item9', 'item10']

function generateColors(count, start, stop) {
    var div = document.createElement("div");
    div.style.width = "50px";
    var step = (stop - start) / count | 0;

    for (var i = start, index = 0; i < stop && index < count; i += step, index++) {
        var item = document.createElement("div");
        item.style.backgroundColor = colorMap[arr[index]];
        item.style.width = '35px';
        item.style.height = '15px';
        item.style.border = '1px solid #c3c3c3';
        item.style.color = 'white';
        item.style.padding = '2px';
        item.style.margin = '4px';
        item.classList.add("custom-color-block");
        item.innerHTML = arr[index]
        div.appendChild(item);
    }
    return div;
}

function colorClicked(event) {
    var target = event.target;
    if (target && target.classList.contains("custom-color-block")) {
        return target.innerHTML;
    }
}

var colorListData = {
    multiSelect: true,
    onItemSelected: colorClicked,
    items: generateThemeColors
};
var customStyle = new GC.Spread.Sheets.Style();
customStyle.cellButtons = [
    {
        imageType: GC.Spread.Sheets.ButtonImageType.dropdown,
        command: "openList",
        // useButtonStyle: true,
        width: 20
    },
];
customStyle.dropDowns = [
    {
        type: GC.Spread.Sheets.DropDownType.list,
        option: colorListData
    }
];

spread.suspendPaint();
sheet.setText(0, 0, "Custom list");
sheet.setColumnWidth(1, 500);
sheet.setValue(0, 1, 'item1');
sheet.setValue(1, 1, 'item1,item2');
sheet.setValue(2, 1, 'item1,item2,item3');
sheet.setValue(3, 1, 'item1,item2,item3,item4');
sheet.setValue(4, 1, 'item1,item2,item3,item4,item5');
sheet.setValue(5, 1, 'item1,item2,item3,item4,item5,item6');
sheet.setValue(6, 1, 'item1,item2,item3,item4,item5,item6,item7');
sheet.setValue(7, 1, 'item1,item2,item3,item4,item5,item6,item7,item8');
sheet.setValue(8, 1, 'item1,item2,item3,item4,item5,item6,item7,item8,item9');
sheet.setValue(9, 1, 'item1,item2,item3,item4,item5,item6,item7,item8,item9,item10');
sheet.getRange('B1:B10').setStyle(customStyle);
sheet.getRange('B1:C10').cellType(new ColorBlockCellType());
spread.resumePaint();