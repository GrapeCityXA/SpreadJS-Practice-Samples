### 背景

***

根据项目主题设计要求，需要修改单元格编辑状态的默认蓝色边框，如下所示：
![image](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/image.4ad2ef.png)

### 实现思路

为了实现这个需求，可以重写单元格类型上的activeEditor方法，该方法中第一个参数代表的是编辑状态时动态添加的DOM结构，根据该DOM，爬取上两级父级DOM，添加边框相关的方法即可。
核心代码如下所示：

```javascript
GC.Spread.Sheets.CellTypes.Text.prototype.activateEditor = function (
  editorContext,
  cellStyle,
  cellRect,
  context
) {
  editorContext.parentNode.parentNode.style.border = "2px solid red";
};
```

![image](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/image.84d388.png)

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/d1uFjmmgdECYYwk9ofp77Q/){:target="_blank"}）
