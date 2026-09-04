### 需求：如何自定义状态栏图标

***

#### 背景：

在在线表格编辑器中如何对状态栏实现图标自定义？

#### 解决方案：

在线表格编辑器中，实际上也是给workbook绑定了一个StatusBar状态栏实例对象
通过findControl接口，就可以获取状态栏实例了。获取到这个实例之后，可以继续根据自己的需求进行定制。
接下来我们看下如何实现设计器上状态栏的自定义。

1. 查找状态栏的实例

```auto
let statusBar = GC.Spread.Sheets.StatusBar.findControl(document.getElementsByClassName("gc-statusBar")[0]);
```

如果未使用设计器，则需要自行初始化：

```auto
let statusBar = new GC.Spread.Sheets.StatusBar.StatusBar(document.querySelector("#statusbar"))
statusBar.bind(spread)
```

2. 通过自定义状态项 GC.Spread.Sheets.StatusBar.StatusItem 类的onCreateItemView方法， 为状态条创建项目元素。这个方法可以被复写以自定制对应的状态项UI。

```auto
let StatusItem = GC.Spread.Sheets.StatusBar.StatusItem;
function Popup() {
    return StatusItem.apply(this, arguments);
}
Popup.prototype = new StatusItem();
Popup.prototype.onCreateItemView = function (container) {
    let item = document.createElement('div');
    item.style.padding = "0 3px";
    item.innerHTML = `<img src='data:image/png;base64,iV...></img>`;
    container.appendChild(item);
    container.addEventListener('click', function () {
        alert('我是图标按钮');
    })
};
statusBar.add(new Popup('Popup', { menuContent: 'popup item', tipText: 'popup' }));
```

在上面的代码中，我们通过innerHTML插入img标签，同时为这个容器添加了点击事件。
最后，再将其添加到statusBar中

```auto
statusBar.add(new Popup('Popup', { menuContent: 'popup item', tipText: 'popup' }));
```

最终效果如下：
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260313.2ecf48.png?width=400)

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/oWp9B5hfOEayi-FjKI3Gug/){:target="_blank"}）


[开](https://jscodemine.grapecity.com/share/oWp9B5hfOEayi-FjKI3Gug){:target="_blank"}）