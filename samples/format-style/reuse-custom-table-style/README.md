# reuse-custom-table-style

### 需求：SpreadJS之自定义table样式复用

***

#### 背景：

用户希望将某一个table中设置的样式序列化存储，以便于后续在其他table中使用，如何实现呢？

#### 思路：

1、如果是SpreadJS内置的table样式，那其实不存在序列化复用的概念，在需要使用该table样式时，传入对应的参数即可。
如下：

```javascript
let tableStyle = GC.Spread.Sheets.Tables.TableThemes.light1;
let table = sheet.tables.add('table1', 0, 0, 4, 4, tableStyle);
```

2、如果是通过代码自定义的table样式，那可以在自定义该样式时就将其存储，以便于其他table使用。

```javascript
let border = new GC.Spread.Sheets.LineBorder();
let styleInfo = new GC.Spread.Sheets.Tables.TableStyle(
  "red",
  "black",
  "10px arial",
  border,
  border,
  border,
  border,
  border,
  border
);
let tableStyle = new GC.Spread.Sheets.Tables.TableTheme();
tableStyle.name("tableStyle1");
tableStyle.headerRowStyle(styleInfo);
table.style(tableStyle);
```

3、如果用户用designer通过UI操作自定义了table样式，那需要参考下文，通过序列化实现。
步骤如下：
首先先获取下table的style，通过toJSON方法进行序列化：

```javascript
let table1 = sheet.tables.findByName("Table1")
let tableStyleJson = JSON.parse(JSON.stringify(table1.style().toJSON()));
```

在新的table中应用该style：

```auto
let table2 = sheet.tables.findByName('Table2');
let tableStyle2 = new GC.Spread.Sheets.Tables.TableTheme();
tableStyle2.fromJSON(tableStyleJson);
table2.style(tableStyle2)
```

效果如下图：
![](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/GIF%202026-3-17%2011-19-18-20260317.755573.gif?width=400)

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
