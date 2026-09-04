### 问题：如何给在下方显示的Sheet标签页也加上滚轮滚动功能

#### 背景

SpreadJS表单标签的位置默认是在下方，通过**tabStripPosition**选项来改变表单标签相对于工作簿的位置，来显示在到左边或者右边。
当表单标签在工作簿左边或者右边时，SpreadJS可以支持用户可以通过鼠标滚动表单标签。
但是如你在[学习指南](https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/features/workbook/tab-strip/purejs)中看到的，目前表单标签在上方或下方时尚不支持鼠标滚轮滚动标签
对于一些用户来说，希望SpreadJS和WPS一样，在表单标签默认显示在下方时，也能通过鼠标滚轮滚动。

>type=note
> 请注意，这是临时的解决方案，随着版本的更新，SpreadJS的元素id可能发生变化，请在做了完整测试后再在正式环境使用。

#### 解决方案

首先，标签以及其导航按钮这部分区域实际是一个canvas，在spreadjs中id为“ss\_tabStrip”,如果是在desinger中的话，id是“null\_tabStrip”

![image](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/image.1f274b.png)
所以我们需要做的就是给这个canvas绑定上mousewheel事件，在其中通过代码控制标签页滚动

```javascript
document.getElementById("ss_tabStrip").onmousewheel = function (args) {
      //判断tab标签页位置是在上方或者下方，避免影响原有的左右两侧的滚动逻辑
      if (workbook.options.tabStripPosition == GC.Spread.Sheets.TabStripPosition.bottom||workbook.options.tabStripPosition == GC.Spread.Sheets.TabStripPosition.top) {
            //判断滚动方向
            if (args.deltaY > 0 && workbook.startSheetIndex() < workbook.getSheetCount() - 1) {
                  console.log("右移");
                  //调用startSheetIndex改变第一个标签的index
                  workbook.startSheetIndex(workbook.startSheetIndex() + 1);
            } else if (args.deltaY < 0 && workbook.startSheetIndex() > 0) {
                  console.log("左移");
                  workbook.startSheetIndex(workbook.startSheetIndex() - 1);
            }
      }
}
```

最终效果：
![](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/GIF%202026-3-23%2014-04-53-20260323.26f66c.gif?width=400)

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/-2X-TgmEwk6Lq0bQII7l1Q/){:target="_blank"}）
