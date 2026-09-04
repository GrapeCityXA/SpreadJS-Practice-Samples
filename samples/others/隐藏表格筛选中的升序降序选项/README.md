### 问题：如何隐藏表格筛选中的升序降序选项？

#### 背景：

点击表格（table）筛选按钮时，你会在打开的筛选框中看到 升序降序选项。
![image](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/image.f3b8c9.png?width=400)
如果想将升序降序选项隐藏，应该如何实现呢？

#### 实现方式：

首先获取table的筛选，在filer中有一个filterDialogVisibleInfo方法，可以用来获取或设置行筛选的可见信息。
所以可以根据实际需求将sortByValue属性设置为false。
下为示例代码：

```javascript
let filter = sheet.tables.all()[0].rowFilter();
filter.filterDialogVisibleInfo({
  sortByValue: false, //SortByValue item is visible.
});
```

效果图如下：
![image](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/image.aea982.png?width=400)

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/feE06BzuZkqEhBFZLmrwFQ/){:target="_blank"}）
