import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-excelio"
import "@grapecity-software/spread-sheets-charts"
import "@grapecity-software/spread-sheets-print"
import "@grapecity-software/spread-sheets-resources-zh"
import "@grapecity-software/spread-sheets-pdf"
import "@grapecity-software/spread-sheets-barcode"
import "@grapecity-software/spread-sheets-languagepackages"
import "@grapecity-software/spread-sheets-shapes"
import "@grapecity-software/spread-sheets-pivot-addon"
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"



let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")

let spread = designer.getWorkbook()

let sheet = spread.getActiveSheet()


sheet.setValue(1, 0, 1)
sheet.setValue(2, 0, 2)
sheet.setValue(3, 0, 3)
sheet.setValue(4, 0, 4)
sheet.setValue(5, 0, 2)
sheet.setValue(6, 0, 2)
sheet.setValue(7, 0, 3)
sheet.setValue(8, 0, 4)
sheet.setValue(9, 0, 3)
sheet.setValue(10, 0, 2)
let filter = new GC.Spread.Sheets.Filter.HideRowFilter(new GC.Spread.Sheets.Range(1, 0, 10, 1));
sheet.rowFilter(filter);

let statusBar = GC.Spread.Sheets.StatusBar.findControl(document.getElementsByClassName("gc-statusBar")[0]);
let StatusItem = GC.Spread.Sheets.StatusBar.StatusItem;

function FilterItem(name, options) {
    StatusItem.call(this, name, options);
}
FilterItem.prototype = new StatusItem();
FilterItem.prototype.onUpdate = function (visible, value) {
    if (value != null) {
        this.value = value;
    }
    if (visible != null) {
        this.visible = visible;
    }

    StatusItem.prototype.onUpdate.call(this, this.value);
};
var filterItem = new FilterItem('selectInfoItem', {
    menuContent: '筛选结果',
    tipText: '此工作表中应用了一个筛选',
    visible: false,
    showStatusInContexMenu: false,
    value: ''
});
statusBar.add(filterItem);

spread.bind(GC.Spread.Sheets.Events.RangeFiltered, function (e, info) {
    var filterRowCount = info.sheet.rowFilter().range.rowCount;
    var unfilteredCount = getFilterResult(info.sheet);
    if (filterRowCount != unfilteredCount) {
        filterItem.onUpdate(true, "在" + filterRowCount + "条记录中找到" + unfilteredCount + "个");
    } else {
        filterItem.onUpdate(false, "");
    }

});

function getFilterResult(sheet) {
    var rowFilter = sheet.rowFilter();
    var range = rowFilter.range;
    var unfilteredCount = 0
    for (var i = 0; i < range.rowCount; i++) {
        var row = range.row + i;
        if (!rowFilter.isRowFilteredOut(row)) {
            unfilteredCount++;
        }
    }
    return unfilteredCount;

}



