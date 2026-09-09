### 问题：如何给工具栏添加更多字号

***

#### 背景：

同Excel一样，组件化编辑器工具栏也有默认的字号列表，用户可以通过简单的UI操作实现改变单元格字体大小。但默认的字号范围为 8至72，对一些用户来说，不能满足实际的需要。

#### 实现步骤：

1、首先获取编辑器的默认config

```auto
let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig));
```

2、接下来学习一下默认的字号列表的结构

```auto
GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.FontSize)
```

![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260313.2ecf18.png?width=400)
可以看到，dropdownList为字号列表信息的数组。
所以如果想添加新字号，在此数组里添加相应的元素即可。
3、添加字号“6”

```auto
fontSizeCommand.dropdownList.unshift({
    text: "6",
    value: "6"
});

// 使新命令生效
if(!config.commandMap) {
    config.commandMap = {};
}
config.commandMap[GC.Spread.Sheets.Designer.CommandNames.FontSize] = fontSizeCommand;
```

4、测试是否添加成功
将修改后的designerConfig作为参数来初始化designer。

```auto
designer = new GC.Spread.Sheets.Designer.Designer("designer-container", config)
```

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/XuRuI77axkSVJIkvSFf8Fw/){:target="_blank"}）
