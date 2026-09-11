# remove-the-space-copied-from-styled-excel

### 问题：复制Excel带样式的空单元格到SpreadJS中会出现空格

#### 背景：

当从 Excel 中复制一个带样式的空单元格到 SpreadJS 中时，SpreadJS 的单元格中会多出来一个空格。
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260309.c4024b.png?width=400)
这个问题实际上是目前一个浏览器的限制，如果将复制的内容粘贴到一个div元素中，会发现这个div也会存在一个空格。
那么应该如何解决这个问题呢？
我们可以通过监听浏览器的粘贴事件`paste`和SpreadJS粘贴事件`ClipboardPasted`，并重写粘贴后的行为来实现去除空格的目的。
具体代码请查看demo。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
