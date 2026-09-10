# change-error-msg-dialog-content

### 问题：如何定制错误信息提示对话框

***

#### 背景：

有用户希望能够定制在线表格编辑器错误信息提示的对话框，一来可以自定制错误信息，更加符合客户的理解。二来可以修改标题，例如“SpreadJS 设计器”这样的标题会暴露系统使用的组件。

#### 实现方法：

以下面这个常见的错误为例说明一下自定制的方法
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260310.fd2c8e.png?width=400)
首先，先定制错误信息。根据使用的语言通过下面的代码获取所有本地化的信息。
`let cnResource = GC.Spread.Common.CultureManager.getResources("zh-cn")`
注意，这里需要同时引入`spread-sheets-resources-zh`包和`spread-sheets-designer-resources-cn`包才可以拿到该变量。
然后在其中找到对应的错误信息：
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260310.edc375.png?width=400)
之后将错误信息修改为想要的信息：
`cnResource.Sheets.Exp_InvalidOperationInProtect = "自定义报错信息：此Sheet已被保护，请解除保护后再试"`
然后重新设置对应语言文字的本地化资源：
`GC.Spread.Common.CultureManager.addCultureInfo("zh-cn", null, cnResource);`
这样错误信息的定制就修改完毕了。
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260310.27fe2a.png?width=400)
对话框的标题是“SpreadJS 设计器”，不符合白标的设计，于是也需要对标题也进行自定制，步骤整体和上面差不多，但是一定要注意，这里的resource和上面的不一样，不要用混了：

```auto
let resource = GC.Spread.Sheets.Designer.getResources();
resource.title = "xxx 设计器";
GC.Spread.Sheets.Designer.setResources(resource)
```

最终效果如下：
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260310.668a08.png?width=400)

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
