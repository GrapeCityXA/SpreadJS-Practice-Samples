import * as GC from "@grapecity-software/spread-sheets";
/**
 * 实现表格绑定根据业务需求动态增加列数据
 */
let spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'));
let sheet = spread.getActiveSheet();
let _lines = ["Computers", "Washers", "Stoves"];
let _colors = ["Red", "Green", "Blue", "White"];
let _ratings = ["Terrible", "Bad", "Average", "Good", "Great", "Epic"];
//创建一个Product类
function Product(id, line, color, name, price, cost, weight, discontinued, rating) {
    this.id = id;
    this.line = line;
    this.color = color;
    this.name = name;
    this.price = price;
    this.cost = cost;
    this.weight = weight;
    this.discontinued = discontinued;
    this.rating = rating;
}
//mock数据源
function getProducts(count) {
    let dataList = [];
    for (let i = 1; i <= count; i++) {
        let line = _lines[parseInt(Math.random() * 3)];
        dataList[i - 1] = new Product(i,
            line,
            _colors[parseInt(Math.random() * 4)],
            line + " " + line.charAt(0) + i,
            parseInt(Math.random() * 5001) / 10.0 + 500,
            parseInt(Math.random() * 6001) / 10.0,
            parseInt(Math.random() * 10001) / 100.0, !!(Math.random() > 0.5),
            _ratings[parseInt(Math.random() * 6)]);
    }
    return dataList;
}

let data = { records: getProducts(10) };
let lineList = ["A1", "A2", "A3"]

//设置列宽
sheet.setColumnWidth(1, 100)
sheet.setColumnWidth(2, 100)
sheet.setColumnWidth(3, 100)

//数据绑定
let columnsInfo;
let table = sheet.tables.add("tableRecordds", 1, 1, 2, 3, GC.Spread.Sheets.Tables.TableThemes.light6);
table.autoGenerateColumns(false);
table.allowAutoExpand(false);
table.bindingPath("records");
table.expandBoundRows(true);

//创建一个多选按钮，用于选择新增哪些列
let combo = new GC.Spread.Sheets.CellTypes.ComboBox();
combo.items(['id', 'line', 'color', 'name', 'price', 'cost', 'weight', 'discontinued', 'rating'])
combo.editable(true);
sheet.setCellType(1, 4, combo)

//添加一个按钮到表单并监听点击事件
let button = new GC.Spread.Sheets.CellTypes.Button();
button.text("Add");
sheet.getCell(1, 5).cellType(button).value("addColumn")
//根据选择的字段为表格动态添加列并绑定数据源
spread.bind(GC.Spread.Sheets.Events.ButtonClicked, function (s, e) {
    let sheet = e.sheet, row = e.row, col = e.col;
    let cell = sheet.getCell(row, col);
    if (cell.value() === "addColumn") {
        let newColumnValue = sheet.getValue(row, col - 1);
        if (newColumnValue) {
            table.insertColumns(columnsInfo.length - 1, 1, true)
            let tableColumn = new GC.Spread.Sheets.Tables.TableColumn();
            tableColumn.name(newColumnValue.toUpperCase());
            tableColumn.dataField(newColumnValue);
            columnsInfo.push(tableColumn)
            table.bindColumns(columnsInfo);
            let dataSource = new GC.Spread.Sheets.Bindings.CellBindingSource(data);
            sheet.setDataSource(dataSource)
        }
    }
})
//值发生更新时触发
spread.bind(GC.Spread.Sheets.Events.ValueChanged, function (s, e) {
    let sheet = e.sheet, row = e.row, col = e.col;
    let cell = sheet.getCell(row, col), value = cell.value();
    if (value == "" || value == null) {
        return;
    }
    //获取指定单元格的table
    let table = sheet.tables.find(row, col);
    if (table) {
        let range = table.range();
        //对表格第一列单元格的值对应更新其后两列的值
        if (col === range.col) {
            if (lineList.indexOf(value) >= 0) {
                sheet.setValue(row, col + 1, value + "B");
                sheet.setValue(row, col + 2, value + "C");
            }
        }
    }
});

//插入或删除行时触发
spread.bind(GC.Spread.Sheets.Events.TableRowsChanged, function (s, e) {
    if (e.propertyName = "tableInsertRows") {
        let sheet = e.sheet, table = e.table;
        updateTable(sheet, table);
    }
});
//当用户拖放单元格区域时触发
spread.bind(GC.Spread.Sheets.Events.DragDropBlock, function (s, e) {
    //拖动(1,1)单元格时执行逻辑
    if (!(e.rowCount === 1 && e.colCount === 1)) {
        return;
    }
    let sheet = e.sheet, fromRow = e.fromRow, fromCol = e.fromCol;
    let table = sheet.tables.find(fromRow, fromCol);
    if (table) {
        let range = table.range();
        if (fromRow !== range.row) {
            return;
        }
        e.cancel = true;
        setTimeout(function () {
            sheet.setValue(fromRow, fromCol, sheet.getValue(fromRow, fromCol) + "2")
        }, 10)
    }
});

//初始化页面
let tableColumn1 = new GC.Spread.Sheets.Tables.TableColumn();
tableColumn1.name("Line");
tableColumn1.dataField("line");
// tableColumn2.cellType(combo) //表格列可以直接绑定celltype，Demo里通过事件另外动态设置
let tableColumn2 = new GC.Spread.Sheets.Tables.TableColumn();
tableColumn2.name("COLOR");
tableColumn2.dataField("color");
let tableColumn3 = new GC.Spread.Sheets.Tables.TableColumn();
tableColumn3.name("Name");
tableColumn3.dataField("name");
columnsInfo = [tableColumn1, tableColumn2, tableColumn3]
table.bindColumns(columnsInfo);

let dataSource = new GC.Spread.Sheets.Bindings.CellBindingSource(data);
sheet.setDataSource(dataSource);
updateTable(sheet, table);

document.getElementById("getData").onclick = function () {
    alert("获取成功，请打开F12在控制台查看")
    console.log(JSON.stringify(sheet.getDataSource().getSource()))
}
document.getElementById("getColumnsInfo").onclick = function () {
    alert("获取成功，请打开F12在控制台查看")
    console.log(JSON.stringify(columnsInfo))
}
//将第一列下拉单元格的值应用到新增的行上
function updateTable(sheet, table) {
    let range = table.range();
    let combo = new GC.Spread.Sheets.CellTypes.ComboBox();
    combo.items(lineList)
    combo.editable(true);
    sheet.getRange(range.row + 1, range.col, range.rowCount - 1, 1).cellType(combo)
}