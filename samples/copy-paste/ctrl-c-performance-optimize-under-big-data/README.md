# ctrl-c-performance-optimize-under-big-data

### 问题：Ctrl+C复制卡死问题优化

***

#### 背景：

我们在SpreadJS中，很多客户保留了在Excel中的操作习惯，比如想全选后复制粘贴整个表单，但是当数据量比较大的情况下，
容易出现浏览器崩溃的情况。

#### 解决方案：

基于这样的情景，有如下三个方法我们不妨试一试：
1、如果只是SpreadJS内部的复制，可以将allowCopyPasteExcelStyle设置为false,可以很大的提高复制性能
`spread.options.allowCopyPasteExcelStyle = false;`
2、设置GC.Spread.Sheets.CopyPasteHeaderOptions为noHeaders
`spread.options.copyPasteHeaderOptions = GC.Spread.Sheets.CopyPasteHeaderOptions.noHeaders;`
3、如果我们的客户希望让最终用户避免性能问题，则有一种变通方法，当最终用户复制过多单元格（例如，10000个）时，可以重写复制命令，并且不执行复制操作，或者提示用户数据量过大复制会耗时较长：

```auto
let oldExecute = GC.Spread.Sheets.Commands.copy.execute;
GC.Spread.Sheets.Commands.copy.execute = function (context, options) {
    let sheet = context.getSheetFromName(options.sheetName);
    let selections = sheet.getSelections();
    let count = 0;
    for (let range of selections) {
        let rowCount = range.rowCount;
        if (range.row === -1) {
            rowCount = sheet.getRowCount();
        }
        let colCount = range.colCount;
        if (range.col === -1) {
            colCount = sheet.getColumnCount();
        }
        count += rowCount * colCount;
    }
    if (count > 100) {
        alert("复制失败，单元格数量过多")
        throw new Error("Copy too many cells maybe very slow.")
    }
    return oldExecute(context, options);
};
```

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
