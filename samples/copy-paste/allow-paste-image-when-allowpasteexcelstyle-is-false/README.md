# allow-paste-image-when-allowpasteexcelstyle-is-false

### 问题：SpreadJS如何设置只允许粘贴值的同时允许粘贴图片

***

#### 背景

用户从外部 Excel 复制一些单元格，粘贴到 SpreadJS 时，只允许粘贴值，不允许粘贴格式等。
这时候可以设置：
`spread.options.allowCopyPasteExcelStyle = false`
设置此行代码后，发现从 Excel 中复制图片后，无法在 SpreadJS 中进行粘贴。
如果此时既想保持只复制值，又想可以粘贴图片，可以参考此demo中的实现方式。

#### 解决方案

主要思路是在window对象上添加paste事件监听，获取粘贴流，判断此时是否包含图片，如果是的话，将其进行转化，用SpreadJS进行添加图片

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
