### 问题：SpreadJS区域大小如何跟随host元素变化

***

#### 背景

SpreadJS的Host元素大小发生变化后，正常来说spreadjs的大小也会随之改变，但是在一些使用了框架的场景中，SpreadJS的大小并不会随之变化。

#### 解决方案

如果需要手动刷新SpreadJS的布局，只需要在相关代码后设置

```js
spread.refresh()
```

如果是在一些框架中动态调整host元素布局。这个调用需要发生在页面布局调整之后，建议加上setTimeout保证页面布局已经完成。

```js
setTimeout(function(){
    spread.refresh();
},700)
```

最终效果：
![](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/GIF%202026-3-23%2014-31-35-20260323.03cd98.gif?width=400)

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/n5iv0mw2sE_ZvTAUobO-eA/){:target="_blank"}）
