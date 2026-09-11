# control-designer-button-available

### 问题：表单保护下如何动态控制工具栏按钮是否禁用？

***

#### 背景

在表单保护中，表头的工具栏可用性会跟随保护属性同步状态。如当表单中部分单元格处于锁定状态，部分单元格未锁定时，此时设置表单保护，并允许设置单元格格式（sheet.options.protectionOptions.formatCells=true）时，会导致无论选中的是否是锁定单元格，工具栏上方合并单元格的按钮都是不可用的，这一点其实与Excel中的行为是一致的。
但在web端，客户想要的效果其实是根据单元格的状态（如锁定、位置、背景色、单元格文字等各种信息），动态的去控制顶部工具栏按钮的可用性。

#### 实现方案

借助事件监听和命令重写，动态的去更新表单保护时的相关属性。

```auto
let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))
let mergeCenter = GC.Spread.Sheets.Designer.getCommand("mergeCenter")
mergeCenter.enableContext = "customAllowMerge || " + mergeCenter.enableContext
config.commandMap = config.commandMap || {}
config.commandMap.mergeCenter = mergeCenter
designer.setConfig(config)

sheet.bind(GC.Spread.Sheets.Events.SelectionChanged, function(e, info) {
    console.log(info)
    let flag = true
    info.newSelections.forEach(r => {
        if(r.intersect(1, 1, 10, 3)) {
            flag = false
        }
    })
    designer.setData("customAllowMerge", flag)
})
```

重要提示：当前示例中，是用区域选择事件来做的，但是在实际客户操作中，会有不少的区域设置，这时需要考虑换用其它的监听事件方式。SpreadJS中提供的事件可以参考：[事件列表](https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Events#class-events)。同时，涉及区域选中或多选区时，如果既包含锁定单元格，又包含非锁定单元格，需要如何设置工具栏状态，也需要根据业务考虑。
最终效果，请关注工具栏的“合并后居中”功能：
![](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/GIF%202026-3-23%2017-30-01-20260323.a68b17.gif?width=400)

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
