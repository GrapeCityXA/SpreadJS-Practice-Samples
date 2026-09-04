### 背景：下拉列表如何增加滚动条

***

在实际开发过程中，定制的下拉列表的项比较多，有可能会超出视图区域。
这时候的需求就是希望下拉列表能出现滚动条，那么有没有办法可以实现呢？
![image](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/image.7c45b8.png?width=400)

### 实现思路

我们知道一个DOM元素设定高度之后，当内容超出高度后，设置 `overflow:scroll;` 属性就能出现滚动条。
那么SpreadJS也一样，修改下拉列表的CSS样式即可。

```css
.gc-list-control{
    max-height: 300px;
    overflow:scroll;
}
```

实现效果如图：
![image](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/image.fc53ce.png?width=400)

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/kbDZT1mmX0aig2ypNWpD1A/){:target="_blank"}）
