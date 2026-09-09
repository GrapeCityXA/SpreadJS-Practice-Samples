### 需求：SpreadJS如何给表格某一列设置ComboBox

#### 背景：

用户有这样一个需求：创建一个表格，给表格某一列设置组合框ComboBox。

#### 实现方式：

目前有两种方案，我们以具体的demo为例来详细介绍这两种方案：

##### 方案1：

在设计器里设计好模板，然后绑定数据源。
我们先在设计器里设计好一个表格模板，给最后一列设置组合框。如下图：
![115156wdqefzoykolnffmd](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/115156wdqefzoykolnffmd.ac0e15.png)
![115229mvmpasv2drv7bmnr](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/115229mvmpasv2drv7bmnr.4c34a3.png)
将模板导出为js文件，引入到demo中，绑定数据源。

```js
let dataSource = {
  person: [
    { name: "lily", age: "15", girl: "1" },
    { name: "mary", age: "12", girl: "1" },
    { name: "tom", age: "17", girl: "0" },
    { name: "dong", age: "14", girl: "0" },
    { name: "luna", age: "15", girl: "1" },
    { name: "aimi", age: "12", girl: "1" },
  ],
};
let datasource = new GC.Spread.Sheets.Bindings.CellBindingSource(dataSource);
sheet.setDataSource(datasource);
```

这个时候我们会发现，ComboBox所在表格列显示的 0 或 1，并不是我们期待的 ”是或否“。
![115314nveueuu7ib7mve7x](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/115314nveueuu7ib7mve7x.969630.png)
这是因为使用了setDataSource,会更新这个模板的内容，原先的设置就没有了，所以我们要给表格这列重新设置ComboBox。

```js
var table = sheet.tables.all()[0];
var row = table.dataRange().row;
var col = table.dataRange().col;
var rowCount = table.dataRange().rowCount;
var colCount = table.dataRange().colCount;

var combo = sheet.getCellType(row,colCount-1);
combo.editorValueType(GC.Spread.Sheets.CellTypes.EditorValueType.value);
//给表格最后一列设置组合框
sheet.getRange(row,colCount-1,rowCount,1).cellType(combo);
```

好了，现在就可以正常显示ComboBox的值了。
![115355m31g668by1k8bbx6](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/115355m31g668by1k8bbx6.43c2dc.png)
这个时候又出现了新的问题，当我们给表格插入/删除行时会发现ComboBox所在列显示不正常。
![115418yf31dh9pz3qh873i](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/115418yf31dh9pz3qh873i.2c6195.png)
有一个解决方式，那就是监听TableRowsChanged事件，当表格行数改变时，重新给组合框列设置ComboBox。

```js
spread.bind(GC.Spread.Sheets.Events.TableRowsChanged, function (e, data) {
  let newTable = sheet.tables.all()[0];
  let newRow = table.dataRange().row;
  let newCol = table.dataRange().col;
  let newRowCount = table.dataRange().rowCount;
  let newColCount = table.dataRange().colCount;
  if (newRowCount > rowCount) {
    //增加表格行时，重新给表格列设置组合框
    sheet
      .getRange(newRow, newCol + newColCount - 1, newRowCount, 1)
      .cellType(combo);
  } else {
    //删除表格行时，删除表格外组合框
    sheet.getRange(newRow, newCol + newColCount - 1, newRowCount, 1).cellType(combo);
    sheet.getRange(newRow + newRowCount, newCol + newColCount - 1, rowCount - newRowCount, 1)
      .cellType(null);
  }
});
```

现在插入/删除表格行就没有问题了。附件有本例demo，可以查看具体的代码。

##### 方案2：

不通过模板设计，通过代码绑定表格字段。

```js
let dataSource = {
  person: [
    { name: "lily", age: "15", girl: "1" },
    { name: "mary", age: "12", girl: "1" },
    { name: "tom", age: "17", girl: "0" },
    { name: "dong", age: "14", girl: "0" },
    { name: "luna", age: "15", girl: "1" },
    { name: "aimi", age: "12", girl: "1" },
  ],
};
let combo = new GC.Spread.Sheets.CellTypes.ComboBox();
combo
  .items([
    { text: "是", value: "1" },
    { text: "否", value: "0" },
  ])
  .editorValueType(GC.Spread.Sheets.CellTypes.EditorValueType.value);

let table = sheet.tables.add("person", 0, 0, 2, 3);
let tableColumn1 = new GC.Spread.Sheets.Tables.TableColumn(1, "name", "NAME");
let tableColumn2 = new GC.Spread.Sheets.Tables.TableColumn(2, "age", "AGE");
let tableColumn3 = new GC.Spread.Sheets.Tables.TableColumn(
  3,
  "girl",
  "GIRL",
  null,
  combo
); //在这里绑定了ComboBox

table.autoGenerateColumns(false);
table.bind([tableColumn1, tableColumn2, tableColumn3], "person", dataSource);
```

这种方式因为是直接将ComboBox设置在表格列上，所以可以正常的插入/删除行。
不过这种方式下表格字段只能通过代码绑定，所以当字段过多时没有模板设计来的方便。
大家可以根据需要自行选择。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/hnkO-lp7j0uSlYxCIoMxPA){:target="_blank"}）
