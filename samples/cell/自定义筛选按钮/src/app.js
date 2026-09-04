import * as GC from "@grapecity-software/spread-sheets";
// Title:自定义筛选按钮
// Description：自定义筛选按钮
// Tag:筛选按钮


var spreadNS = GC.Spread.Sheets;
var salesData = [
    ["SalesPers", "Birth", "Region", "SaleAmt", "ComPct", "ComAmt"],
    ["Joe", new Date("2000/01/23"), "North", 260, 0.1, 26],
    ["Robert", new Date("1988/08/21"), "South", 660, 0.15, 99],
    ["Michelle", new Date("1995/08/03"), "East", 940, 0.15, 141],
    ["Erich", new Date("1994/05/23"), "West", 410, 0.12, 49.2],
    ["Dafna", new Date("1992/07/21"), "North", 800, 0.15, 120],
    ["Rob", new Date("1995/11/03"), "South", 900, 0.15, 135],
    ["Jonason", new Date("1987/02/11"), "West", 300, 0.17, 110],
    ["Enana", new Date("1997/04/01"), "West", 310, 0.16, 99.2],
    ["Dania", new Date("1997/02/15"), "North", 500, 0.10, 76],
    ["Robin", new Date("1991/12/28"), "East", 450, 0.18, 35]];
var data = [
    { name: 'Preface', chapter: '1', page: 1, level: 0 },
    { name: 'Java SE5 and SE6', chapter: '1.1', page: 2, level: 1 },
    { name: 'Java SE6', chapter: '1.1.1', page: 2, level: 2 },
    { name: 'The 4th edition', chapter: '1.2', page: 2, level: 1 },
    { name: 'Changes', chapter: '1.2.1', page: 3, level: 2 },
    { name: 'Note on the cover design', chapter: '1.3', page: 4, level: 1 },
    { name: 'Acknowledgements', chapter: '1.4', page: 4, level: 1 },
    { name: 'Introduction', chapter: '2', page: 9, level: 0 },
    { name: 'Prerequisites', chapter: '2.1', page: 9, level: 1 },
    { name: 'Learning Java', chapter: '2.2', page: 10, level: 1 },
    { name: 'Goals', chapter: '2.3', page: 10, level: 1 },
    { name: 'Teaching from this book', chapter: '2.4', page: 11, level: 1 },
    { name: 'JDK HTML documentation', chapter: '2.5', page: 11, level: 1 },
    { name: 'Exercises', chapter: '2.6', page: 12, level: 1 },
    { name: 'Foundations for Java', chapter: '2.7', page: 12, level: 1 },
    { name: 'Source code', chapter: '2.8', page: 12, level: 1 },
    { name: 'Coding standards', chapter: '2.8.1', page: 14, level: 2 },
    { name: 'Errors', chapter: '2.9', page: 14, level: 1 },
    { name: 'Introduction to Objects', chapter: '3', page: 15, level: 0 },
    { name: 'The progress of abstraction', chapter: '3.1', page: 15, level: 1 },
    { name: 'An object has an interface', chapter: '3.2', page: 17, level: 1 },
    { name: 'An object provides services', chapter: '3.3', page: 18, level: 1 },
    { name: 'The hidden implementation', chapter: '3.4', page: 19, level: 1 },
    { name: 'Reusing the implementation', chapter: '3.5', page: 20, level: 1 },
    { name: 'Inheritance', chapter: '3.6', page: 21, level: 1 },
    { name: 'Is-a vs. is-like-a relationships', chapter: '3.6.1', page: 24, level: 2 },
    { name: 'Interchangeable objects with polymorphism', chapter: '3.7', page: 25, level: 1 },
    { name: 'The singly rooted hierarchy', chapter: '3.8', page: 28, level: 1 },
    { name: 'Containers', chapter: '3.9', page: 28, level: 1 },
    { name: 'Parameterized types (Generics)', chapter: '3.10', page: 29, level: 1 },
    { name: 'Object creation & lifetime', chapter: '3.11', page: 30, level: 1 },
    { name: 'Exception handling: dealing with errors', chapter: '3.12', page: 31, level: 1 },
    { name: 'Concurrent programming', chapter: '3.13', page: 32, level: 1 },
    { name: 'Java and the Internet', chapter: '3.14', page: 33, level: 1 },
    { name: 'What is the Web?', chapter: '3.14.1', page: 33, level: 2 },
    { name: 'Client-side programming', chapter: '3.14.2', page: 34, level: 2 },
    { name: 'Server-side programming', chapter: '3.14.3', page: 38, level: 2 }
];
window.onload = function () {

};


/************更改filter按钮的方法*******************/
function changeButton() {
    var spread = GC.Spread.Sheets.findControl("ss");
    var sheet = spread.getActiveSheet();
    sheet.suspendPaint();
    sheet.rowFilter().filterButtonVisible(false);
    var style = sheet.getStyle(1, 1);
    style.cellButtons = [
        {
            imageType: GC.Spread.Sheets.ButtonImageType.search,
            command: (sheet, row, col, option) => {
                var filter = sheet.rowFilter();
                var cellRect = sheet.getCellRect(row, col);
                var x = cellRect.x;
                var y = cellRect.y;
                var filterButtonHitInfo = {
                    rowFilter: filter,
                    row: row, col: col,
                    sheetArea: GC.Spread.Sheets.SheetArea.viewport,
                    x: x, y: y,
                    width: cellRect.width,
                    height: cellRect.height
                };
                filter.openFilterDialog(filterButtonHitInfo);
            }
        }
    ];
    sheet.setStyle(1, 1, style);
    sheet.resumePaint();
}
/**************************************************/

function initSpread(spread) {
    var sheet = spread.getSheet(0);
    sheet.suspendPaint();
    sheet.options.allowCellOverflow = true;
    sheet.name("FilterDialog");

    sheet.setArray(1, 1, salesData);
    var filter = new spreadNS.Filter.HideRowFilter(new spreadNS.Range(2, 1, salesData.length - 1, salesData[0].length));
    sheet.rowFilter(filter);
    prepareFilterItems(sheet, salesData[0]);
    sheet.defaults.rowHeight = 28;
    sheet.setColumnWidth(1, 110);
    sheet.setColumnWidth(2, 80);
    sheet.setColumnWidth(3, 100);
    sheet.setColumnWidth(4, 80);
    sheet.setColumnWidth(5, 80);
    sheet.setColumnWidth(6, 80);
    sheet.getRange(2, 2, 10, 1).formatter("yyyy/mm/dd");

    var SpreadNS = GC.Spread.Sheets;
    var ComparisonOperators = SpreadNS.ConditionalFormatting.ComparisonOperators;
    var equalsTo = ComparisonOperators.equalsTo;

    var range = sheet.getRange(1, 1, 11, 6);
    range.setBorder(new spreadNS.LineBorder("gray", spreadNS.LineStyle.thin), { all: true });

    var ranges = [new SpreadNS.Range(2, 3, 10, 1)];
    var style1 = new SpreadNS.Style();
    style1.foreColor = "Accent 2";
    var rule1 = new SpreadNS.ConditionalFormatting.NormalConditionRule(1, ranges, style1, equalsTo, "West", "");
    sheet.conditionalFormats.addRule(rule1);
    var style2 = new SpreadNS.Style();
    style2.foreColor = "Accent 3";
    var rule2 = new SpreadNS.ConditionalFormatting.NormalConditionRule(1, ranges, style2, equalsTo, "East", "");
    sheet.conditionalFormats.addRule(rule2);
    var style3 = new SpreadNS.Style();
    style3.foreColor = "Accent 6";
    var rule3 = new SpreadNS.ConditionalFormatting.NormalConditionRule(1, ranges, style3, equalsTo, "North", "");
    sheet.conditionalFormats.addRule(rule3);
    var style4 = new SpreadNS.Style();
    style4.foreColor = "Accent 1";
    var rule4 = new SpreadNS.ConditionalFormatting.NormalConditionRule(1, ranges, style4, equalsTo, "South", "");
    sheet.conditionalFormats.addRule(rule4);

    var ranges = [new SpreadNS.Range(2, 2, 10, 1)];
    var style1 = new SpreadNS.Style();
    style1.backColor = "rgb(241, 135, 102)";
    var rule1 = new SpreadNS.ConditionalFormatting.NormalConditionRule(1, ranges, style1, ComparisonOperators.lessThan, "1990/01/01", "");
    sheet.conditionalFormats.addRule(rule1);
    var style2 = new SpreadNS.Style();
    style2.backColor = "lightGreen";
    var rule2 = new SpreadNS.ConditionalFormatting.NormalConditionRule(1, ranges, style2, ComparisonOperators.between, "1990/01/01", "2000/01/01");
    sheet.conditionalFormats.addRule(rule2);
    var style3 = new SpreadNS.Style();
    style3.backColor = "deepSkyBlue";
    var rule3 = new SpreadNS.ConditionalFormatting.NormalConditionRule(1, ranges, style3, ComparisonOperators.greaterThan, "2000/01/01", "");
    sheet.conditionalFormats.addRule(rule3);

    sheet.resumePaint();

    var sheet2 = spread.sheets[1];
    initOultineColumnFilter(sheet2);
    sheet2.name("outlineColumnFilter");
}


function prepareFilterItems(sheet, headers) {
    var filter = sheet.rowFilter(),
        range = filter.range,
        startColumn = range.col;

    var inputs = document.querySelectorAll("#tableColumnsContainer input");
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].style.marginRight = "6px";
    }

    var labels = document.querySelectorAll("#tableColumnsContainer label");
    for (var i = 0; i < labels.length; i++) {
        labels[i].style.marginRight = "20px";
    }

    var checkBoxs = document.querySelectorAll("#tableColumnsContainer input[type='checkbox']");

    for (var i = 0; i < checkBoxs.length; i++) {
        checkBoxs[i].addEventListener('change', function () {

            var id = this.id, checked = this.checked,
                index = +id.substr(0, id.indexOf("_"));

            if (filter) {
                filter.filterButtonVisible(index, checked);
            }
        });
    }
}

function initOultineColumnFilter(sheet) {
    sheet.setColumnWidth(2, 120);
    sheet.rowFilter(new GC.Spread.Sheets.Filter.HideRowFilter(new GC.Spread.Sheets.Range(-1, 0, -1, 1)));
    sheet.suspendPaint();
    sheet.setColumnWidth(0, 200);
    sheet.setRowCount(12);
    sheet.outlineColumn.options({
        columnIndex: 0,
        showIndicator: true,
    });

    var sd = data;
    sheet.setDataSource(sd);
    sheet.bindColumn(0, "name");
    sheet.setColumnCount(3);
    sheet.setColumnWidth(0, 300);
    for (var r = 0; r < sd.length; r++) {
        var level = sd[r].level;
        sheet.getCell(r, 0).textIndent(level);
    }
    sheet.showRowOutline(false);
    sheet.outlineColumn.refresh();
    sheet.resumePaint();
}
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"), { sheetCount: 2 });
initSpread(spread);
changeButton();