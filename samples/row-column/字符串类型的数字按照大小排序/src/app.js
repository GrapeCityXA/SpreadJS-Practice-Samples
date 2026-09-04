import * as GC from "@grapecity-software/spread-sheets";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();

sheet.setValue(0, 0, "112");
sheet.setValue(1, 0, "10");
sheet.setValue(2, 0, "223");
sheet.setValue(3, 0, "20");
sheet.setValue(4, 0, "334");
sheet.setValue(5, 0, "30");
sheet.setValue(0, 1, "一一二");
sheet.setValue(1, 1, "一零");
sheet.setValue(2, 1, "二二三");
sheet.setValue(3, 1, "二零");
sheet.setValue(4, 1, "三三四");
sheet.setValue(5, 1, "三零");

let filter = new GC.Spread.Sheets.Filter.HideRowFilter(new GC.Spread.Sheets.Range(0, 0, 6, 2))
sheet.rowFilter(filter)

let oldFilter = GC.Spread.Sheets.Commands.sortFilter.execute
GC.Spread.Sheets.Commands.sortFilter.execute = function () {
    console.log(arguments)
    // 假设你要将第 0 列的字符串数字按照数字大小排序
    if (arguments[1].cmdOption.colIndex == 0) {
        function strNumberSort(obj1, obj2) {
            return obj1 - obj2
        }
        sheet.sortRange(0, 0, 6, 2, true, [
            { index: 0, ascending: true, compareFunction: strNumberSort }
        ], { groupSort: GC.Spread.Sheets.GroupSort.full, ignoreHidden: true });
    } else {
        oldFilter.apply(this, arguments)
    }
}

// 另一种方式
// sheet.bind(GC.Spread.Sheets.Events.RangeSorting, function (info, data) {
//     if (data.col == 0) {
//         data.compareFunction = function (a, b) {
//             return a - b
//         }
//     }
// })