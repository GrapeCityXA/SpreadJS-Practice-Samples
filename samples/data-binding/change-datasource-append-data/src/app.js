import * as GC from "@grapecity-software/spread-sheets";
GC.Spread.Sheets.LicenseKey = "";
var spreadNS = GC.Spread.Sheets;
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
//Get sheet instance
spread.suspendPaint();
var sheet = spread.sheets[0];

// 数据源，可以从后台请求拿到
var dataSource = {
  // 注意这里加了一层bindPath，用于映射表格的绑定路径
  bindPath_table2: [
    {
      c1: 1,
      c2: 2,
      c3: 3,
      c4: 4,
    },
    {
      c1: Math.floor(Math.random() * 50),
      c2: Math.floor(Math.random() * 50),
      c3: Math.floor(Math.random() * 50),
      c4: Math.floor(Math.random() * 50),
    },
    {
      c1: Math.floor(Math.random() * 50),
      c2: Math.floor(Math.random() * 50),
      c3: Math.floor(Math.random() * 50),
      c4: Math.floor(Math.random() * 50),
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
    c1: Math.floor(Math.random() * 50),
    c2: Math.floor(Math.random() * 50),
    c3: Math.floor(Math.random() * 50),
    c4: Math.floor(Math.random() * 50),
  },
  {
    c1: Math.floor(Math.random() * 50),
    c2: Math.floor(Math.random() * 50),
    c3: Math.floor(Math.random() * 50),
    c4: Math.floor(Math.random() * 50),
  },
  {
    c1: Math.floor(Math.random() * 50),
    c2: Math.floor(Math.random() * 50),
    c3: Math.floor(Math.random() * 50),
    c4: Math.floor(Math.random() * 50),
  },
  {
    c1: Math.floor(Math.random() * 50),
    c2: Math.floor(Math.random() * 50),
    c3: Math.floor(Math.random() * 50),
    c4: Math.floor(Math.random() * 50),
  },
];

// 表格绑定和单元格绑定数据源，需要用SpreadJS的CellBindingSource包装一下
var dataSource1 = new spreadNS.Bindings.CellBindingSource(dataSource);
var table2 = sheet.tables.add(
  "tableRecords_2",
  6,
  1,
  1,
  5,
  spreadNS.Tables.TableThemes.light6,
);
table2.showFooter(true);
table2.autoGenerateColumns(false);

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
c4.name("列4");
c4.dataField("c4");
var c5 = new spreadNS.Tables.TableColumn(5);
c5.name("合计");
table2.bindColumns([c1, c2, c3, c4, c5]);
table2.bindingPath("bindPath_table2");
// 设置公式
table2.setColumnDataFormula(4, "=[@列1]+[@列2]+[@列3]+[@列4]");
table2.setColumnFormula(4, "=SUBTOTAL(109,[合计])");

$("#add").click(function () {
  dataSource.bindPath_table2.push({
    c1: Math.floor(Math.random() * 100),
    c2: Math.floor(Math.random() * 10),
    c3: Math.floor(Math.random() * 20),
    c4: Math.floor(Math.random() * 50),
  });
  table2.bindingPath("bindPath_table2");
});

$("#bind").click(function () {
  dataSource.bindPath_table2 = bindPath_table;
  table2.bindingPath("bindPath_table2");
});

// 设置允许单元格的内容超出单元格，与绑定无关
sheet.options.allowCellOverflow = true;
// 绑定dataSource
sheet.setDataSource(dataSource1);
spread.resumePaint();
