import * as GC from "@grapecity-software/spread-sheets";
/**
*  使用前需要加入三方库
* 点击外部资源，在输入框中输入：https://cdn.staticfile.org/twitter-bootstrap/3.3.7/css/bootstrap.min.css
* 输入完成后点击按钮+，之后再点击运行。
* 在单元格多次输入内容试试效果吧
* 
* 本示例只演示通过输入修改内容的场景，不考虑拖拽、黏贴等情形
* 拖拽、黏贴思路相似，只是采用的时间不同。
**/
GC.Spread.Common.CultureManager.culture('zh-cn');

var spreadNS = GC.Spread.Sheets;


function initSpread(spread) {

    spread.bind(GC.Spread.Sheets.Events.EditEnded, function (sender, args) {
        var sheetName = args.sheetName;
        var row = args.row;
        var col = args.col;
        var sheet = args.sheet;
        var value = sheet.getValue(row, col);
        // 利用单元格tag存储历史记录
        var cellTag = sheet.getTag(row, col);
        if (!cellTag || !cellTag.history) {
            cellTag = { history: [] };
            sheet.setTag(row, col, cellTag);
        }
        // 时间戳，如需格式化，请自行添加字段转义
        cellTag.history.push({
            time: new Date().getTime(),
            user: "testUser",
            value: value
        });
        // 替换单元格类型
        var cellType = sheet.getCellType(row, col);
        if (!(cellType instanceof CustomHistoryCell) && cellTag.history.length > 1) {
            console.log("替换单元格类型");
            var hostDiv = document.getElementById('ss');
            sheet.setCellType(row, col, new CustomHistoryCell({ x: hostDiv.offsetLeft, y: hostDiv.offsetTop }));
        }
    });
    spread.getActiveSheet().setValue(0, 0, 1)

    // 点击弹窗外任意位置，清除弹窗
    document.addEventListener("click", function (event) {
        if ($(".toolTipElement").length > 0) {
            var offset = $(".toolTipElement").offset();
            var height = $(".toolTipElement").height();
            var width = $(".toolTipElement").width();
            var endX = offset.left + width;
            var endY = offset.top + height;
            var mouseX = event.x;
            var mouseY = event.y;
            var flag = true;
            if (mouseX >= offset.left && mouseX <= endX && mouseY >= offset.top && mouseY <= endY) {
                flag = false;
            }
            if (flag) {
                $(".toolTipElement").remove();
            }
        }
    })

}

// 自定义单元格实现历史数据查看
function CustomHistoryCell(hostMargin) {
    this.typeName = "CustomHistoryCell";
    this.hostMargin = hostMargin;
    this.margin = 0;
    this.size = 20;
    //this.icon = icon;
    this.backgroundImage = icon;
}
CustomHistoryCell.prototype = new GC.Spread.Sheets.CellTypes.Text();
CustomHistoryCell.prototype.paint = function (ctx, value, x, y, w, h, style, options) {
    style.hAlign = GC.Spread.Sheets.HorizontalAlign.left;
    GC.Spread.Sheets.CellTypes.Text.prototype.paint.call(this, ctx, value, x, y, w, h, style, options);
    if (!ctx) {
        return;
    }
    var tag = options.sheet.getTag(options.row, options.col, options.sheetArea);
    var startX = x + w - this.size - this.margin;
    var startY = y + (h - this.size) / 2 - this.margin;
    style.backgroundImage = this.backgroundImage;
    GC.Spread.Sheets.CellTypes.Text.prototype.paint.call(this, ctx, "", startX, startY, this.size, this.size, style, options);
};
CustomHistoryCell.prototype.getHitInfo = function (x, y, cellStyle, cellRect, context) {
    var info = {
        x: x,
        y: y,
        row: context.row,
        col: context.col,
        cellStyle: cellStyle,
        cellRect: cellRect,
        sheetArea: context.sheetArea
    };
    var hitX = x;
    var hitY = y;
    x = cellRect.x;
    y = cellRect.y;
    var w = cellRect.width;
    var h = cellRect.height;

    var startX = x + w - this.size + this.margin;
    var startY = y + (h - this.size) / 2 + this.margin;
    var endX = x + w - this.margin;
    var endY = y + (h + this.size) / 2 - this.margin;
    // 这里判断逻辑参考paint中绘制的逻辑
    if (hitX > startX && hitX < endX && hitY > startY && hitY < endY) {
        info.isReservedLocation = true;
    }
    return info;
};
CustomHistoryCell.prototype.processMouseEnter = function (hitInfo) {
    var sheet = hitInfo.sheet;
    $(".toolTipElement").remove();
    if (sheet && hitInfo.isReservedLocation) {
        if (this._toolTipElement) {
            $(".toolTipElement").remove();
            this._toolTipElement = null;
        }
        if (!this._toolTipElement) {
            var div = document.createElement("div");
            $(div).css("position", "absolute")
                .css("border", "1px #C0C0C0 solid")
                .css("box-shadow", "1px 2px 5px rgba(0,0,0,0.4)")
                .css("font", "9pt Arial")
                .css("background", "white")
                .css("padding", 5)
                .attr("class", "toolTipElement");
            this._toolTipElement = div;
        }
        showHistoryList(hitInfo.row, hitInfo.col, this, sheet);
        $(this._toolTipElement).html($('#validateCellInfo').html())
            .css("top", hitInfo.y + this.hostMargin.y + 15)
            .css("left", hitInfo.x + this.hostMargin.x + 15);
        $(this._toolTipElement).hide();
        document.body.insertBefore(this._toolTipElement, null);
        $(this._toolTipElement).show("fast");
        return true;
    }
    return false;
};
CustomHistoryCell.prototype.processMouseLeave = function (hitInfo) {
    //var sheet = hitInfo.sheet;
    //$(".toolTipElement").remove();
    //this._toolTipElement = null;
    //return false;
};

// 根据单元格历史记录生成列表
function showHistoryList(row, col, cell, sheet) {

    var cellRange = new GC.Spread.Sheets.Range(row, col, 1, 1)
    var cellTag = sheet.getTag(row, col);
    if (!cellTag || !cellTag.history) {
        return;
    }
    $("#listBody").empty();
    for (let i = 0; i < cellTag.history.length; i++) {
        let his = cellTag.history[i];
        $("#listBody").append('<tr><th scope="row">' + (i + 1) + '</th><td><p>' + his.time + '</p></td><td><p>' + his.user + '</p></td><td><p>' + his.value + '</p></td><td><button type="button" class="btn-primary" sheetName="' + sheet.name() + '" row="' + row + '" col="' + col + '" time="' + his.time + '" onclick="rollback(this)">回滚</button></td></tr>');
    }
}

window.rollback = function(button) {
    button = $(button);
    var sheetName = button.attr("sheetName");
    var row = parseInt(button.attr("row"));
    var col = parseInt(button.attr("col"));
    var time = parseInt(button.attr("time"));
    var spread = GC.Spread.Sheets.findControl('ss');
    var sheet = spread.getSheetFromName(sheetName);
    var tag = sheet.getTag(row, col);
    var newTagHis = [];
    if (tag && tag.history) {
        for (let i = 0; i < tag.history.length; i++) {
            var item = tag.history[i];
            newTagHis.push(item);
            if (item.time == time) {
                sheet.setValue(row, col, item.value);
                break;
            }
        }
        // 如果回滚到最初状态，清空单元格类型
        if (newTagHis.length <= 1) {
            sheet.setCellType(row, col, new GC.Spread.Sheets.CellTypes.Text());
        }
        tag.history = newTagHis;
        sheet.setTag(row, col, tag);
    }
    $(".toolTipElement").remove();
}

import { icon } from "./icon.js"
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
initSpread(spread);