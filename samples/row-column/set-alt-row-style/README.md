# set-alt-row-style

### 问题1：如何用条件规则实现交替行样式效果

***

#### **背景：**

表格中默认存在交替行样式显示，需求在非表格（table）区域也希望实现此效果。

#### **解决方案：**

一行一行添加添加是一种解决方案，另外我们可以通过添加公式条件规则实现这个需求。
想要实现这种效果则需要两个公式。一个是ISODD，一个是ROW。ISODD用于判断数字是否是奇数，ROW用于返回引用的行号。具体代码如下：

```auto
let style = new GC.Spread.Sheets.Style();
style.backColor = "red";
let ranges = [new GC.Spread.Sheets.Range(0, 0, 10, 5)];
sheet.conditionalFormats.addFormulaRule("=ISODD(ROW(A1))", style, ranges);
```

实现效果：
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260313.8ce28a.png?width=250)

### 问题2：如何在SpreadJS中实现过滤后始终显示交替行样式

***

#### 背景：

在Gird或者Sheet表格中如果需要展示大量的行数据时，往往需要拖动垂直滚动条。
如果每条行数据本身又比较类似，每行的背景色相同，使用人员很容易找不到数据对应的具体是哪一行。
交替行样式在这个时候可以让表格变的更加易读，因此很多Gird或者Sheet类的表格控件大都支持交替行样式设置。
在SpreadJS中如何实现呢交替行效果呢？

#### 解决方案：

Table 表格本身提供了交替行样式，通过设置 table.bandRows(true);即可给 Table 设置交替行样式，且在过滤后样式仍然可以保持。
有时候，我们需要在非表格区域也实现交替行样式，可以通过上面介绍的添加公式条件规则实现这个需求，也可以采用一行一行添加的方式去设置。
下面代码是在初始化事件中给非表格区域设置交替行样式，注意通过暂停和继续渲染来优化性能：

```auto
function setAltStyle(sheet) {
    sheet.suspendPaint()
    let i = 0
    for (let r = 0; r < sheet.getRowCount(); r++) {
        if (sheet.getRowVisible(r)) {
            i++;
            if (i % 2 == 0) {
                sheet.getRange(r, -1, 1, -1).backColor('#EEEEF8');
            } else {
                sheet.getRange(r, -1, 1, -1).backColor('white');
            }
        }
    }
    sheet.resumePaint()
}
```

设置后效果如下：
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260313.e0e9ab.png?width=250)
但是如果我们添加了行过滤器，在过滤后此前设置的交替行样式可能就没法保持了。
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260313.d22996.png)
此时，可以通过RangeFiltered事件，在每次筛选后重新设置样式，即可保持交替行样式。
参考代码如下：

```auto
sheet.bind(GC.Spread.Sheets.Events.RangeFiltered, function (e, info) {
    setAltStyle(sheet)
});
```

值得注意的是，交替行样式实质上是直接设置的单元格背景色，因此如果是载入了带单元格样式的workbook，再设置上述代码，会覆盖原有的单元格背景色。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
