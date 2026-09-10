# custom-celltype-copy-paste-issue

### 背景

***

在使用SpreadJS的自定义单元格功能时，会发现复制自定义单元格的时候有时会失败，具体可以分为以下两种场景。

### 场景1：直接复制自定义单元格，在其他地方粘贴无效 

![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260316.273f79.png?width=400)
这是因为我们的单元格没有定义typeName，或者定义了，但是SpreadJS没有找到。

#### 解决方案

在自定义单元格类型的构造函数中定义typeName：

```auto
function FivePointedStarCellType() {
    this.typeName = "FivePointedStarCellType"
}
```

重写getTypeFromString方法：

```auto
GC.Spread.Sheets.getTypeFromString = function (typeStr) {
    if (typeStr === 'FivePointedStarCellType') {
        return FivePointedStarCellType;
    }
}
```

经过以上两步后，这个问题就可以解决了。

### 场景2：在进入编辑状态后，使用Ctrl+C快捷键想要复制的时候发现无效

![image](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/image.a00ba6.png?width=400)

#### 解决方案

这个问题是由于自定义单元格的事件被SpreadJS拦截了。
学习指南的这个Demo，源码中有一段代码如下：

```javascript
FullNameCellType.prototype.isReservedKey = function (e) {
  //cell type handle tab key by itself
  return (
    e.keyCode === GC.Spread.Commands.Key.tab &&
    !e.ctrlKey &&
    !e.shiftKey &&
    !e.altKey
  );
};
```

这里是定义哪些事件是可以由用户自己处理的，只需要将此处改为：

```javascript
FullNameCellType.prototype.isReservedKey = function (e) {
  //cell type handle tab key by itself
  return (
    (e.keyCode === GC.Spread.Commands.Key.tab &&
      !e.ctrlKey &&
      !e.shiftKey &&
      !e.altKey) ||
    (e.keyCode === GC.Spread.Commands.Key.c &&
      e.ctrlKey &&
      !e.shiftKey &&
      !e.altKey)
  );
};
```

这样就不会出现上述问题了。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
