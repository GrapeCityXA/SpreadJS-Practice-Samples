import * as GC from "@grapecity-software/spread-sheets";
var spreadNS = GC.Spread.Sheets;
function getDataSource() {
    var source = [{
        LastName: "张伟",
        FirstName: "Nancy",
        Title: "Sales Representative",
        Phone: "(123)555-0100",
        Email: "nancy@northwindtraders.com"
    }, {
        LastName: "王伟",
        FirstName: "Andrew",
        Title: "Vice President, Sales",
        Phone: "(123)555-0100",
        Email: "andrew@northwindtraders.com"
    }, {
        LastName: "王芳",
        FirstName: "Jan",
        Title: "Sales Representative",
        Phone: "(123)555-0100",
        Email: "jan@northwindtraders.com"
    }, {
        LastName: "李娜",
        FirstName: "Mariya",
        Title: "Sales Representative",
        Phone: "(123)555-0100",
        Email: "mariya@northwindtraders.com"
    }, {
        LastName: "王静",
        FirstName: "Steven",
        Title: "Sales Manager",
        Phone: "(123)555-0100",
        Email: "steven@northwindtraders.com"
    }, {
        LastName: "刘伟",
        FirstName: "Michael",
        Title: "Sales Representative",
        Phone: "(123)555-0100",
        Email: "michael@northwindtraders.com"
    }, {
        LastName: "王秀英",
        FirstName: "Robert",
        Title: "Sales Representative",
        Phone: "(123)555-0100",
        Email: "robert@northwindtraders.com"
    }, {
        LastName: "李化民",
        FirstName: "Laura",
        Title: "Sales Coordinator",
        Phone: "(123)555-0100",
        Email: "laura@northwindtraders.com"
    }, {
        LastName: "李庆华",
        FirstName: "Susan",
        Title: "Sales Representative",
        Phone: "(123)555-0100",
        Email: "anne@northwindtraders.com"
    }];
    return source;
}
function HighlightSearchCellType() {}
HighlightSearchCellType.prototype = new GC.Spread.Sheets.CellTypes.Text();
HighlightSearchCellType.prototype._generateSearchBlock = function(text, search) {
    if (text === "" || text === null || text === undefined || search === "" || search === null || search === undefined) {
        return null;
    }
    var originalText = text.toLowerCase();
    var searchText = search.toLowerCase();
    var patt = new RegExp(searchText, "g");
    var result, blocks = [],
        start = 0,
        end = 0,
        subStr = "";
    while ((result = patt.exec(originalText)) != null) {
        end = patt.lastIndex - searchText.length;
        if (start < end) {
            //normal block
            blocks.push({
                start: start,
                end: end,
                text: text.substring(start, end),
                highlight: false
            });
        }
        //highlight block
        start = end;
        end = patt.lastIndex;
        blocks.push({
            start: start,
            end: end,
            text: subStr = text.substring(start, end),
            highlight: true
        });
        start = end;
    }
    if (start === 0) {
        return null;
    }
    //the last block
    if (end < originalText.length) {
        blocks.push({
            start: end,
            end: end + subStr.length,
            text: text.substring(end),
            highlight: false
        });
    }
    return blocks;
}
HighlightSearchCellType.prototype.paintValue = function(ctx, value, x, y, w, h, style, options) {
    var text = this.format(value, style.formatter);
    if (!text) {
        return;
    }
    ctx.save();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.beginPath();
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    if (style.font) {
        ctx.font = style.font;
    }
    if (style.foreColor) {
        ctx.fillStyle = style.foreColor;
    }
    var originalStyle = ctx.fillStyle;
    var fontSize = options.fontInfo.fontSize;
    var lineHeight = options.lineHeight;
    var baselineOffset = fontSize > 8 ? Math.floor((fontSize - 8) / 5 + 2) : 1;
    var lineOffset = lineHeight / 2 - fontSize / 2 + baselineOffset;
    var adjY = lineHeight - lineOffset + 2;
    var blocks = this._generateSearchBlock(text, options.sheet.searchText);
    if (blocks) {
        for (var i = 0; i < blocks.length; i++) {
            var block = blocks[i];
            if (block.highlight) {
                ctx.fillStyle = "red";
            } else {
                ctx.fillStyle = originalStyle;
            }
            ctx.fillText(block.text, x + 2, y + adjY);
            x += ctx.measureText(block.text).width;
        }
    } else {
        ctx.fillText(text, x + 2, y + adjY);
    }

    ctx.restore();
}
var columnInfo = [{
    name: "LastName",
    displayName: "中文名",
    cellType: new HighlightSearchCellType(),
    size: 80
}, {
    name: "FirstName",
    displayName: "英文名",
    cellType: new HighlightSearchCellType(),
    size: 80
}, {
    name: "Phone",
    displayName: "电话",
    cellType: new HighlightSearchCellType(),
    size: 180
}, {
    name: "Email",
    displayName: "邮箱",
    cellType: new HighlightSearchCellType(),
    size: 200
},

];
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
var sheet = spread.getActiveSheet();
spread.isPaintSuspended(true);
sheet.setDataSource(getDataSource());
sheet.bindColumns(columnInfo);
// 定义自定义单元格
var style = new GC.Spread.Sheets.Style();
spread.isPaintSuspended(false);
document.getElementById("searchTxt").onkeyup = (function () {
    sheet.searchText = document.getElementById("searchTxt").value;
    spread.repaint();
});
