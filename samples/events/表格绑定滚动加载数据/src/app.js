import * as GC from "@grapecity-software/spread-sheets";


var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));

spread.options.scrollbarMaxAlign = true;
spread.options.scrollbarShowMax = true;
var sheet = spread.getActiveSheet();
sheet.setRowCount(5);
var data = {
    bindPath_table: [{
        f1: 1,
        f2: 2,
        f3: 3
    }, {
        f1: "a",
        f2: "b",
        f3: "c"
    }, {
        f1: 1,
        f2: 2,
        f3: 3
    }, {
        f1: "a",
        f2: "b",
        f3: "c"
    }, {
        f1: 1,
        f2: 2,
        f3: 3
    }, {
        f1: "a",
        f2: "b",
        f3: "c"
    }, {
        f1: 1,
        f2: 2,
        f3: 3
    }, {
        f1: "a",
        f2: "b",
        f3: "c"
    }, {
        f1: 1,
        f2: 2,
        f3: 3
    }, {
        f1: "a",
        f2: "b",
        f3: "c"
    }, {
        f1: 1,
        f2: 2,
        f3: 3
    }, {
        f1: "a",
        f2: "b",
        f3: "c"
    }, {
        f1: 1,
        f2: 2,
        f3: 3
    }, {
        f1: "a",
        f2: "b",
        f3: "c"
    }, {
        f1: 1,
        f2: 2,
        f3: 3
    }, {
        f1: "a",
        f2: "b",
        f3: "c"
    }, {
        f1: 1,
        f2: 2,
        f3: 3
    }, {
        f1: "a",
        f2: "b",
        f3: "c"
    }]
};
// 表格绑定和单元格绑定数据源，需要用SpreadJS的CellBindingSource包装一下
var dataSource = new GC.Spread.Sheets.Bindings.CellBindingSource(data);
// 在指定位置添加一个表格
var table = sheet.tables.add("Table1", 3, 0, 1, 3, GC.Spread.Sheets.Tables.TableThemes.light6);
table.autoGenerateColumns(false);
table.expandBoundRows(true);
// 添加字段映射，这里的作用在于把表格的列名和数据源的字段名关联起来
var tableColumn1 = new GC.Spread.Sheets.Tables.TableColumn(1);
tableColumn1.name("字段1");
tableColumn1.dataField("f1");
var tableColumn2 = new GC.Spread.Sheets.Tables.TableColumn(2);
tableColumn2.name("字段2");
tableColumn2.dataField("f2");
var tableColumn3 = new GC.Spread.Sheets.Tables.TableColumn(3);
tableColumn3.name("字段3");
tableColumn3.dataField("f3");
// 把关联好的字段绑定到表格上
table.bindColumns([tableColumn1, tableColumn2, tableColumn3]);
// 设定绑定路径，实际上就是指定table绑定数据源的哪个字段
table.bindingPath("bindPath_table");
sheet.setDataSource(dataSource);

// 无限滚动行事件
sheet.bind(GC.Spread.Sheets.Events.TopRowChanged, function (sender, args) {
    var sheet = args.sheet;
    var rowCount = sheet.getRowCount();
    var bottomRow = sheet.getViewportBottomRow(1);
    if (bottomRow === rowCount - 1) {
        if (rowCount < 10000) {
            setTimeout(function(){
                data.bindPath_table.push({
                    f1: rowCount,
                    f2: rowCount,
                    f3: rowCount
                });
                data.bindPath_table.push({
                    f1: "a",
                    f2: "b",
                    f3: "c"
                });
                //通过使用bindingPath更新表格
                table.bindingPath("bindPath_table");
            },50)
        }
    }
});