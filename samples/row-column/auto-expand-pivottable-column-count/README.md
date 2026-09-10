# auto-expand-pivottable-column-count

### 需求：如何实现透视表自动扩展列

***

#### 背景：

在使用透视表时，如果将透视表摆放位置放在靠近边缘的地方，例如最后一列，此时会导致显示不正确的问题，如下图：
![image](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/image.702b2d.png?width=1000)
我们可以很明显看到，我们勾选的数据透视表的字段有1、2、3、4、5、6但是因为表格列数一共就5列，不够，导致显示不全

#### 解决方案：

为了避免该问题，我们应该让数据透视表在增加显示字段时，动态的去添加工作表的列数，我们可以监听PivotTableChanged事件来根据情况添加列，参考如下代码：

```js
spread.bind(GC.Spread.Sheets.Events.PivotTableChanged, function () {
    let sheet = spread.getActiveSheet()
    let all = sheet.pivotTables.all();
    all.forEach((element) => {
        let range = element.getRange();
        let lastColIndex = range.content.col + range.content.colCount;
        if (sheet.getColumnCount() < lastColIndex) {
            sheet.setColumnCount(sheet.getColumnCount() + (lastColIndex - sheet.getColumnCount()));
        }
    });
});
```

最终实现效果如下：
![](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/GIF%202026-3-19%2011-57-39-20260319.a61cad.gif?width=400)

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
