import * as GC from "@grapecity-software/spread-sheets";
// Title:使用进度条进行筛选
// Description：使用进度条进行筛选
// Tag:筛选，进度条


var ns = GC.Spread.Sheets;
function customFilterDialog(sheet, filterHitInfo) {
    this._sheet = sheet;
    this._filterHitInfo = filterHitInfo;
    this._container = null;
    this.init();
}

customFilterDialog.prototype.init = function () {
    var $overlay = $("<div><input type='range' style='position: absolute;width:200px;height:30px' min='0' max='100' /></div>");
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

customFilterDialog.prototype.open = function () {
    var sheet = this._sheet, tempSpread = sheet.getParent(), self = this;

    $(self._container).css("display", "display");
    var x = self._filterHitInfo.x + self._filterHitInfo.width + tempSpread.getHost().offsetLeft;
    var y = self._filterHitInfo.y + self._filterHitInfo.height + tempSpread.getHost().offsetTop;
    $(self._container).children().css({ "left": x, "top": y });
    if (window.filterMaxValue) {
        $(self._container).children().val(window.filterMaxValue);
    }
    $(self._container).bind("mousedown", function (event) {
        if (event.target === self._container) {
            self.close();
        }
    });
    $(self._container).children().bind("change", function () {
        self.doFilter();
    });
}

customFilterDialog.prototype.close = function () {
    window.filterMaxValue = +$(this._container).children().val();
    $(this._container).remove();
    this._container = null;
}

customFilterDialog.prototype.doFilter = function () {
    var colIndex = this._filterHitInfo.col;
    var drf = this._filterHitInfo.rowFilter;
    drf.removeFilterItems(colIndex);

    //When close, create condition with the value which fetched from the dialog UI.
    var minCondition = new ns.ConditionalFormatting.Condition(ns.ConditionalFormatting.ConditionType.cellValueCondition, {
        compareType: ns.ConditionalFormatting.GeneralComparisonOperators.greaterThan,
        expected: +$(this._container).children()[0].min
    });
    var maxCondition = new ns.ConditionalFormatting.Condition(ns.ConditionalFormatting.ConditionType.cellValueCondition, {
        compareType: ns.ConditionalFormatting.GeneralComparisonOperators.lessThan,
        expected: +$(this._container).children().val()
    });
    var relationCondition = new ns.ConditionalFormatting.Condition(ns.ConditionalFormatting.ConditionType.relationCondition, {
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
GC.Spread.Sheets.Filter.HideRowFilter.prototype.openFilterDialog = function (filterButtonHitInfo) {
    var sheet = GC.Spread.Sheets.findControl("ss").getActiveSheet();
    var filterDialog = new customFilterDialog(sheet, filterButtonHitInfo);
    filterDialog.open();
}

// $(document).ready(function () {
    var spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'), { sheetCount: 3 });
    var sheet = spread.getActiveSheet();
    sheet.setValue(3, 3, -10);
    sheet.setValue(4, 3, -20);
    sheet.setValue(5, 3, 0);
    sheet.setValue(6, 3, 10);
    sheet.setValue(7, 3, 50);
    sheet.setValue(8, 3, 25);
    sheet.setValue(9, 3, 70);
    sheet.setValue(10, 3, 30);
    sheet.setValue(11, 3, 90);
    //Create filter.
    sheet.rowFilter(new ns.Filter.HideRowFilter(new ns.Range(3, 3, 10, 1)));
// });