### 问题：如何在SpreadJS中使用符号字体

***

#### 背景：

在程序开发以及编写文档时，偶然会遇到一些特殊图形，针对这些图形，可以使用图片，还可以使用特殊的符号字体。相对于图片，矢量符号字符容易控制大小，颜色和位置。
如下图Webdings就是常用的一个符号字体，在SpreadJS在线表格编辑器中，通过在富文本单元格中使用Webdings字体，将字符“4”显示为三角符号“4”。
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260316.212013.png?width=400&verticalAlign=top)
Webdings作为系统自带字体，在网页中可以直接使用，那么如何使用非常规字体，打开网页机器没有安装对应字体该如何处理呢？

#### 解决方案：

以前端常用的font awesome字体图标为例，在网页中使用font awesome 图标时只要在class加入 对应图标的class即可，例如：
`<i class="fa fa-rmb" aria-hidden="true"></i>`
但是在SpreadJS中，并无法使用class。那么将通过字符的方式使用图标。具体步骤如下：
1\. 网页引用font awesome css样式文件，在页面中引入font awesome，可以直接使用cdn：
`<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN" crossorigin="anonymous">`
css中会通过使用@font-face自动加载字体到浏览器，无需用户安装font awesome字体
2\. 获取图标字符
在该页面找到你想使用的图标：[FontAwesome V4 图标列表](https://fontawesome.com/v4/icons/)
例如Bath图标的名称是fa-bath：
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260316.8dd11f.png?width=400)
打开上一步的css文件，搜索”fa-bath"，发现其对应的unicode码是f2cd
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260316.b9bf11.png?width=400)
打开浏览器的控制台，输入：

```auto
String.fromCharCode(parseInt("f2cd",16));
```

![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260316.68136a.png)
你会得到一个空的字符串，这就是我们要用的图标了，复制该字符串，在代码或者SpreadJS单元格中粘贴即可。
3\.  SpreadJS设置font awesome字体
`sheet.getRange(0, 0, 2, 2).font("24px FontAwesome")`
未设置字体则显示方框，也可在SpreadJS在线表格编辑器的富文本单元格编辑框中直接粘贴该字符，就可以正常显示了：
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260316.ef8f2d.png?width=400)

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/jvRDGCqgtE_XoIS3FlIb3A/){:target="_blank"}）
