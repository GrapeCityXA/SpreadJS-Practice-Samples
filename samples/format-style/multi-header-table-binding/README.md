# multi-header-table-binding

#### 背景：

数据绑定可以将数据源中的数据展示在指定的绑定区域中，并且因为双向绑定，可以进行数据的获取与变更。
而现实中会有很多像下面这样的多层表头的表格：
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/d2fe542f-9aa3-4dd5-9fb7-3daa9c6afcf4/image-20260305.55576e.png?width=400)
那么在SpreadJS中该如何给这样的表格模板做数据绑定呢？ 需要使用技巧对绑定用的模板做一些改造。

#### 实现方法

##### Step1、首先用设计器打开这个Excel模板

接下来，保留表头，然后删除需要绑定数据的相关表格，这里我们需要通过表格绑定重新建立
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/d2fe542f-9aa3-4dd5-9fb7-3daa9c6afcf4/image-20260305.d9e085.png?width=400)

##### Step2、之后，按照上面的表格列插入一个对应的空白表格

![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/d2fe542f-9aa3-4dd5-9fb7-3daa9c6afcf4/image-20260305.870a67.png?width=400)

##### Step3、由于最后一行是整体的合计，需要我们将汇总行也设置出来

![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/d2fe542f-9aa3-4dd5-9fb7-3daa9c6afcf4/image-20260305.873b93.png?width=400)

##### Step4、利用汇总行设置汇总公式

![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/d2fe542f-9aa3-4dd5-9fb7-3daa9c6afcf4/image-20260305.fea667.png?width=400)

##### Step5、之后利用模板功能，设置表格绑定，最后两列为公式计算结果所以不设置绑定项

拖拽右侧的树至表格建立绑定关系(如果需要改变调整每列的绑定关系，可以点击下图红框所示的向下箭头按钮在其中进行调整)
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/d2fe542f-9aa3-4dd5-9fb7-3daa9c6afcf4/image-20260305.454716.png?width=400)

##### Step6、为了保证样式的统一，我们清空表格样式

![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/d2fe542f-9aa3-4dd5-9fb7-3daa9c6afcf4/image-20260305.d3ef69.png?width=400)

##### Step7、勾掉标题行隐藏标题行

![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/d2fe542f-9aa3-4dd5-9fb7-3daa9c6afcf4/image-20260305.3ca443.png?width=400)

##### Step8、然后删除上方的空白行

![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/d2fe542f-9aa3-4dd5-9fb7-3daa9c6afcf4/image-20260305.2e5d3b.png?width=400)
这样表格模板就完成了
之后我们模拟一个数据源进行数据绑定，接下来通过代码将数据源绑定到表格中，在绑定之前，别忘了处理后两列的公式，将其设置为列公式：

```auto
sheet.tables.all().forEach(table => {
    let range = table.dataRange()
    for (let col = range.col; col < range.col + range.colCount; col++) {
        let formula = sheet.getFormula(range.row, col)
        if (formula) {
            table.setColumnDataFormula(col - range.col, formula)
        }
    }
})

var source = new GC.Spread.Sheets.Bindings.CellBindingSource(data);
sheet.setDataSource(source);
```

最终效果如下：
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/d2fe542f-9aa3-4dd5-9fb7-3daa9c6afcf4/image-20260305.5cab42.png?width=400)

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
