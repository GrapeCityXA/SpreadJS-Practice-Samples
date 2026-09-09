### 需求：如何通过重写命令获取表格删除行的信息

#### 背景：

SpreadJS对于用在UI的操作都是通过Commands机制驱动的。例如在Table上点击右键菜单，选择删除行，会调用tableDeleteRowsForContextMenu命令。
如果需要在点击执行前进行一些操作，如何实现呢？

#### 实现方式：

可以通过重写命令execute方法的方式来实现，操作做完后调用原有逻辑即可。
下面代码演示了在删除数据之前，获取要删除内容。

```javascript
let deletTableRows = GC.Spread.Sheets.Commands.tableDeleteRowsForContextMenu.execute;

GC.Spread.Sheets.Commands.tableDeleteRowsForContextMenu.execute = function (
  content,
  options,
  isUndo
) {
  console.log(options);
  if (isUndo) {
    console.log("undoAction");
  } else {
    let sheet = content.getSheetFromName(options.sheetName);
    let table = sheet.tables.findByName(options.tableName)
    let changeRows = options.selections;
    console.log(
      sheet.getArray(
        changeRows[0].row,
        0,
        changeRows[0].rowCount,
        table.dataRange().colCount
      )
    );
  }
  return deletTableRows.apply(this, arguments);
};
```

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/Bqtcy-eoXk6MRh3qdR15_A/){:target="_blank"}）
