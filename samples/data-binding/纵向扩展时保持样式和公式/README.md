### 需求：SpreadJS 表格绑定引发的纵向扩展能否按照保持样式进行

***

#### 背景：

用户在使用 SpreadJS 设计模板时，其中模板中间区域可能会存在一个表格数据绑定，如下所示：
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260305.58514d.png?width=400)
当绑定好数据源之后，有可能数据源的记录数远远多于现在展示的表的行数，可能会出现如下展示效果：
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260305.bd7701.png?width=400)

#### 代码实现：

为解决上述问题，可以使用表格的expandBoundRows()方法，该方法用来设置或获取表格绑定时是否扩展行信息。
如果改方法传参为true,则表格记录增加时会对应的增加行。
具体代码为：

```auto
let sheet = spread.getSheetFromName('Sheet2')
let table1 = sheet.tables.findByName('gcTable0')
table1.expandBoundRows(true)
```

有用户不知道自己在使用设计器进行表格绑定时，生成的表格名称时什么，可以在设计器中点击表格，左上方就会出现表格的名称，如下所示：
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260305.428cc0.png?width=400)
这里建议用户自行更改表格名称，注意，表名称不能重复。
设置完成扩展行之后，显示效果如下：
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260305.ac17dd.png?width=400)
细心的同学会看到，虽然表格不再影响下方数据了，但扩展行上其它区域对应的样式并没有正常显示，此时，我们可以使用copyTo方法来将其它区域的样式、公式、合并信息等复制下来
这里以复制样式为例，具体代码如下：

```auto
function copyTableStyle(sheet, table) {
    let range = table.dataRange()
    let tableCols = isTableArea(range)
    for (let i = 0; i < range.rowCount - 1; i++) {
        for (let j = 0; j < sheet.getColumnCount(); j++) {
            //判断是否在表格内
            if (tableCols.indexOf(j) == -1) {
                sheet.copyTo(range.row + i, j, range.row + i + 1, j, 1, 1, GC.Spread.Sheets.CopyToOptions.style)
            }
        }
    }
}

function isTableArea(range) {
  //生成表格列范围数组
  let cols = [];
  for (let i = 0; i < range.colCount; i++) {
    cols.push(range.col + i);
  }
  return cols;
}
```

设置完成后，显示如图：
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260305.6cdbcf.png?width=400)
此时显示已经正常了，如果有用户同时想拷贝其它元素，可以浏览 [copyTo](https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet#copyto) 方法的API说明文档，
如果复制逻辑相同，`copyTo` 方法最后一个参数不同拷贝项之间可以用‘\|’分隔，如果复制逻辑不同，那针对不同的复制项，重新写 `copyTo` 方法即可。
表格扩展时，我们也会希望公式一并扩展下去，所以我们将表格第一行的公式直接设置为表格列公式：

```auto
function copyFormula() {
    let sheet = spread.getActiveSheet();
    sheet.tables.all().forEach(table => {
        let range = table.dataRange()
        for (let col = range.col; col < range.col + range.colCount; col++) {
            let formula = sheet.getFormula(range.row, col)
            if (formula) {
                table.setColumnDataFormula(col - range.col, formula)
            }
        }
    })
}
```

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/FwmDmRO1qUe5HnYzW6zZmQ/){:target="_blank"}）
