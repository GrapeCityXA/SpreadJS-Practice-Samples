# resolve-the-problem-of-full-screen-popup-disappear

### 问题：解决全屏模式下部分弹窗不生效问题

***

#### 背景：

JavaScript有一个全屏API：dom.requestFullscreen()，尝试在一些场景中将Designer组件全屏化后，发现有一部分弹窗（选择颜色弹窗）不再出现，这是为什么呢？

#### 解决思路：

首先打开一个Designer组件，观察下颜色选择器的dom结构：
![image](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/image.d9ffb4.png?width=900)
发现其与Designer的dom节点`gc-designer-container`同在body下，并不是 包含关系。
对话框被设计为附加到 document body 而不是 Designer 的 host(gc-designer-container)。所以，如果仅仅是让 Designer 的 host 全屏显示，它就会覆盖主体中的所有其他元素包括对话框。
那么此时如果将 Designer的dom节点`gc-designer-container`全屏，就会发现颜色选择器将不出现在屏幕中，当退出全屏模式后，发现可以正常显示。
`document.getElementById("gc-designer-container").requestFullscreen();`
为此，解决方案是需要将弹窗的dom放置在全屏dom容器内。
这里的思路是将 Designer 组件放置在 iframe 容器中：

```html
<button id="btn">开启全屏</button>
<iframe id="designer-iframe" src="./iframe.html" />
<script>
    document.getElementById("btn").addEventListener("click", function() {
        document.getElementById("designer-iframe").requestFullscreen() // 开启全屏
    })
</script>
```

在body中创建iframe元素，然后索引指向包含Designer组件的iframe.html ，然后对iframe元素全屏。
接下来是iframe.html：

```javascript
<body>
    <div id="designer-container"></div>
</body>
<script>
let host = document.getElementById("designer-container")
let designer = new GC.Spread.Sheets.Designer.Designer(host)
</script>
```

这样设置后，直接使用iframe元素做全屏，可以用最简单的方式实现全屏的效果。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
