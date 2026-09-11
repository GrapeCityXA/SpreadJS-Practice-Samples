# remove-some-template-page

### 问题：如何删除Template的部分功能

***

#### 背景：

SpreadJS默认提供了很多功能模板，来支撑产品功能。但在实际项目需求中，部分项目需要从一定程度上限制用户行为，因此需要去除功能模板上的部分功能。
本文以格式化单元格对话框为例，去除其部分功能。

#### 实现思路：

正常情况下，右键菜单点击单元格格式，默认样式如下：
![image](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/image.5bc087.png?width=400)
其实，所有的弹框页面都是通过模板（Template）注册的，所以我们只需要修改这个Template，并重新注册就好了。
现在，我们需要去除单元格格式下的所有功能，只保留“数字”：

```javascript
// 获取格式化单元格的模板
let template = GC.Spread.Sheets.Designer.getTemplate(GC.Spread.Sheets.Designer.TemplateNames.FormatDialogTemplate)
// 删除不限要的功能，可以自行查看template中的内容，比较清楚。
template.content[0].children = template.content[0].children.filter(v => {
    return v.key == "Number" // 只保留格式化中的“数字”功能
})
// 修改完成之后，重新注册模板
GC.Spread.Sheets.Designer.registerTemplate(GC.Spread.Sheets.Designer.TemplateNames.FormatDialogTemplate,template)
```

设置完成之后，显示如下：
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260324.f35c51.png?width=400)

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
