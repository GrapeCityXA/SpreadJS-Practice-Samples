### 问题：如何重写设计器上方工具栏的命令？

***

#### 背景：

我们知道在线表格编辑器中有很多SpreadJS已经提前写好的功能，比如单元格的合并，但是有些场景，客户想在合并单元格前进行一些业务逻辑的处理，比如满足一定条件才能进行合并。
面对这样的需求，我们如何实现呢？
我们知道合并单元格调用的时MergeCenter的命令，那我们就可以对MergeCenter命令进行重写，加入自己的业务逻辑。

```auto
let mergeCenterCommand = GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.MergeCenter);
if (mergeCenterCommand) {
  let oldExecute = mergeCenterCommand.execute;
  mergeCenterCommand.execute = function (context, propertyName, args) {
    // 添加自己的逻辑
    alert("开始合并单元格")
    // 执行原本的逻辑
    oldExecute.apply(this, arguments);
  }
}
let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))
config.commandMap = config.commandMap || {}
config.commandMap[GC.Spread.Sheets.Designer.CommandNames.MergeCenter] = mergeCenterCommand;
designer.setConfig(config)
```

重写命令后合并单元格的效果如下图所示：
![image](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/image.bc27f3.png?width=400)

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/sVt4teacEEWWl9Vl7l-yUg/){:target="_blank"}）
