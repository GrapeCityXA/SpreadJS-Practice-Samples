import * as GC from "@grapecity-software/spread-sheets";
GC.Spread.Sheets.LicenseKey = "";
var spreadNS = GC.Spread.Sheets;
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
initSpread(spread);

function initSpread(spread) {
  //Get sheet instance
  spread.suspendPaint();
  var sheet = spread.sheets[0];

  // 数据源，可以从后台请求拿到
  var dbData = {
    // 注意这里加了一层bindPath，用于映射表格的绑定路径
    bindPath_table1: [
      {
        f1: 1,
        f2: 2,
        f3: 3,
      },
      {
        f1: "a",
        f2: "b",
        f3: "c",
      },
    ],
    bindPath_table2: [
      {
        c1: 1,
        c2: 2,
        c3: 3,
        c4: 4,
      },
      {
        c1: "a",
        c2: "b",
        c3: "c",
        c4: "d",
      },
      {
        c1: "c1",
        c2: "c2",
        c3: "c3",
        c4: "c4",
      },
    ],
  };

  var bindPath_table = [
    {
      c1: 5,
      c2: 6,
      c3: 7,
      c4: 8,
    },
    {
      c1: "q",
      c2: "w",
      c3: "e",
      c4: "r",
    },
    {
      c1: "c5",
      c2: "c6",
      c3: "c7",
      c4: "c8",
    },
    {
      c1: "a5",
      c2: "a6",
      c3: "a7",
      c4: "a8",
    },
    {
      c1: "e5",
      c2: "e6",
      c3: "e7",
      c4: "e8",
    },
  ];

  // 表格绑定和单元格绑定数据源，需要用SpreadJS的CellBindingSource包装一下
  var dataSource = new spreadNS.Bindings.CellBindingSource(dbData);
  // 在指定位置添加一个表格
  var table = sheet.tables.add(
    "tableRecords_1",
    6,
    6,
    1,
    3,
    spreadNS.Tables.TableThemes.light6,
  );
  var table2 = sheet.tables.add(
    "tableRecords_2",
    6,
    1,
    1,
    4,
    spreadNS.Tables.TableThemes.light6,
  );

  // 隐藏表头
  sheet.setRowVisible(6, false);
  // 手动设置自定义表头
  sheet.addSpan(5, 6, 1, 3);
  sheet.addSpan(5, 1, 1, 4);
  sheet
    .getCell(5, 6)
    .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
    .value("table");
  sheet
    .getCell(5, 1)
    .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
    .value("table2");

  table.autoGenerateColumns(false);
  table2.autoGenerateColumns(false);
  // 添加字段映射，这里的作用在于把表格的列名和数据源的字段名关联起来
  var tableColumn1 = new spreadNS.Tables.TableColumn(1);
  tableColumn1.name("字段1");
  tableColumn1.dataField("f1");
  var tableColumn2 = new spreadNS.Tables.TableColumn(2);
  tableColumn2.name("字段2");
  tableColumn2.dataField("f2");
  var tableColumn3 = new spreadNS.Tables.TableColumn(3);
  tableColumn3.name("字段3");
  tableColumn3.dataField("f3");
  // 把关联好的字段绑定到表格上
  table.bindColumns([tableColumn1, tableColumn2, tableColumn3]);
  // 设定绑定路径，实际上就是指定table绑定数据源的哪个字段
  // table.bindingPath("bindPath_table1");

  var c1 = new spreadNS.Tables.TableColumn(1);
  c1.name("列1");
  c1.dataField("c1");
  var c2 = new spreadNS.Tables.TableColumn(2);
  c2.name("列2");
  c2.dataField("c2");
  var c3 = new spreadNS.Tables.TableColumn(3);
  c3.name("列3");
  c3.dataField("c3");
  var c4 = new spreadNS.Tables.TableColumn(4);
  c4.name("列3");
  c4.dataField("c4");
  table2.bindColumns([c1, c2, c3, c4]);
  // table2.bindingPath("bindPath_table2");

  // 因为绑定数据是通过insert rows的方式给table加值
  // 所以绑定数据后会出现这种情况
  // 解决办法也很简单，在bindingPath前先执行table resize操作
  // 具体方法看代码
  $("#bind").click(function () {
    dbData.bindPath_table2 = bindPath_table;
    let len1 = dbData.bindPath_table1.length;
    let len2 = dbData.bindPath_table2.length;
    let range1 = table.range();
    range1.rowCount = len1 + 1; // +1是把表头行算上
    let range2 = table2.range();
    range2.rowCount = len2 + 1;
    sheet.tables.resize(table, range1);
    sheet.tables.resize(table2, range2);
    table2.bindingPath("bindPath_table2");
    table.bindingPath("bindPath_table1");
  });

  // 设置允许单元格的内容超出单元格，与绑定无关
  sheet.options.allowCellOverflow = true;
  // 绑定dataSource
  sheet.setDataSource(dataSource);
  spread.resumePaint();
}
