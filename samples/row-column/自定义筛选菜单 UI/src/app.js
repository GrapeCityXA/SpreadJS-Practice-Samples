import * as GC from "@grapecity-software/spread-sheets";
var ns = GC.Spread.Sheets;

function customFilterDialog(sheet, filterHitInfo) {
    this._sheet = sheet;
    this._filterHitInfo = filterHitInfo;
    this._container = null;
    this.init();
}

customFilterDialog.prototype.init = function() {
    var $overlay = $("<div><div style='position: absolute;width:180px; border: 1px solid;background-color: #fff;height:100px;backgroundcolor:gray;'><label style='position: absolute;top:5px;left:5px;'>最小值</label><input id='min' style='position: absolute;left: 60px;top: 5px;width:100px;height:20px' min='0' max='100' /><label style='position: absolute;top:35px;left:5px;'>最大值</label><input id='max' style='position: absolute;width:100px;left: 60px;height:20px;top:35px;' min='0' max='100' /><button id='filter' style='position: absolute;width:100px; height:30px;top:66px;left:50px;'>确定</button></div></div>");
    $overlay.css("width", 100000);
    $overlay.css("height", 100000);
    $overlay.css("left", 0);
    $overlay.css("top", 0);
    $overlay.css("z-index", 100000)
    $overlay.css("position", "absolute");
    $overlay.css("display", "hidden");
    this._container = $overlay[0];
    $overlay.appendTo($(document.body));
}

customFilterDialog.prototype.open = function() {
    var sheet = this._sheet,
        tempSpread = sheet.getParent(),
        self = this;
    $(self._container).css("display", "display");
    var x = self._filterHitInfo.x + self._filterHitInfo.width + tempSpread.getHost().offsetLeft;
    var y = self._filterHitInfo.y + self._filterHitInfo.height + tempSpread.getHost().offsetTop;
    $(self._container).children().css({
        "left": x,
        "top": y
    });
    if (window.filterMaxValue) {
        $(self._container).children().val(window.filterMaxValue);
    }
    $(self._container).bind("mousedown", function(event) {
        if (event.target === self._container) {
            self.close();
        }
    });
    document.getElementById('filter').addEventListener('click', function() {
        self.doFilter();
        self.close();
    });
}

customFilterDialog.prototype.close = function() {
    window.filterMaxValue = +$(this._container).children().val();
    $(this._container).remove();
    this._container = null;
}

customFilterDialog.prototype.doFilter = function() {
    var colIndex = this._filterHitInfo.col;
    var drf = this._filterHitInfo.rowFilter;
    drf.removeFilterItems(colIndex);

    //When close, create condition with the value which fetched from the dialog UI.
    let minCondition = new ns.ConditionalFormatting.Condition(ns.ConditionalFormatting.ConditionType.cellValueCondition, {
        compareType: ns.ConditionalFormatting.GeneralComparisonOperators.greaterThan,
        //  expected: +$(this._container).children()[0].min
        expected: document.getElementById("min").value
    });
    let maxCondition = new ns.ConditionalFormatting.Condition(ns.ConditionalFormatting.ConditionType.cellValueCondition, {
        compareType: ns.ConditionalFormatting.GeneralComparisonOperators.lessThan,
        // expected: +$(this._container).children().val()
        expected: document.getElementById("max").value
    });
    let relationCondition = new ns.ConditionalFormatting.Condition(ns.ConditionalFormatting.ConditionType.relationCondition, {
        compareType: ns.ConditionalFormatting.LogicalOperators.and,
        item1: minCondition,
        item2: maxCondition
    });
    drf.addFilterItem(colIndex, relationCondition);

    this._sheet.suspendPaint(true);
    //Execute the filter behavior.
    drf.filter(colIndex);
    this._sheet.resumePaint(false);
}

//overwrite openFilterDialog and create our own dialog here.

var oldOpenFilterDialog = GC.Spread.Sheets.Filter.HideRowFilter.prototype.openFilterDialog;
GC.Spread.Sheets.Filter.HideRowFilter.prototype.openFilterDialog = function(filterButtonHitInfo) {
    var sheet = GC.Spread.Sheets.findControl("ss").getActiveSheet();
    console.log(filterButtonHitInfo);
    if (filterButtonHitInfo.col == 4) { //第四列自定义筛选弹框
        var filterDialog = new customFilterDialog(sheet, filterButtonHitInfo);
        filterDialog.open();
    } else {
        oldOpenFilterDialog.apply(this, [filterButtonHitInfo]);
    }
}

var spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'), {
        sheetCount: 3
    });
    var sheet = spread.getActiveSheet();
    var salesData = [
        ["SalesPers", "Birth", "Region", "SaleAmt", "ComPct", "ComAmt"],
        ["Joe", "2000/01/23", "North", 260, 0.1, 26],
        ["Robert", "1988/08/21", "South", 660, 0.15, 99],
        ["Michelle", "1995/08/03", "East", 940, 0.15, 141],
        ["Erich", "1994/05/23", "West", 410, 0.12, 49.2],
        ["Dafna", "1992/07/21", "North", 800, 0.15, 120],
        ["Rob", "1995/11/03", "South", 900, 0.15, 135],
        ["Jonason", "1987/02/11", "West", 300, 0.17, 110],
        ["Enana", "1997/04/01", "West", 310, 0.16, 99.2],
        ["Dania", "1997/02/15", "North", 500, 0.10, 76],
        ["Robin", "1991/12/28", "East", 450, 0.18, 35]
    ];
    sheet.setArray(1, 1, salesData);
    sheet.setColumnWidth(2, 100);
    var filter = new GC.Spread.Sheets.Filter.HideRowFilter(new GC.Spread.Sheets.Range(2, 4, salesData.length - 1, salesData[0].length - 3));
    sheet.rowFilter(filter);