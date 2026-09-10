# rewrite-insert-chart-command

### 问题：如何重写插入图表

***

#### 背景：

在使用designer的插入图表功能时，有这样的业务需求：只有当用户选中两列数据时，点击插入图表按钮，允许插入图表；当用户选中的列数不等于2时，不能正常插入图表。

#### 解决方案：

插入图表按钮对应的 command 为 insetChart，通过getCommand方法可以获取到这个 command 是什么：
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260310.64a855.png?width=400)
重写其中的excute方法，获取当前选择的区域信息，判断如果为列数为2，正常执行原逻辑；如果不为2，则弹窗提醒。

```auto
let newInsertChartCommand = GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.InsertChart);
if (newInsertChartCommand) {
  let oldExecute = newInsertChartCommand.execute;
  newInsertChartCommand.execute = function (context, propertyName, args) {
    //添加confirm逻辑
    console.log("重写插入图表逻辑"); // 判断当前选择区域的列数
    let activeSheet = context.getWorkbook().getActiveSheet();
    let sel = activeSheet.getSelections()[0];
    if (sel.colCount == 2) {
      oldExecute.call(this, context, propertyName, args);
    } else {
      alert("数据不为2列，禁止插入");
    }
  };
}
```

将修改后的command重新注册，并传入设计器的初始化方法中：

```auto
let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))
config.commandMap = {};
config.commandMap[GC.Spread.Sheets.Designer.CommandNames.InsertChart] = newInsertChartCommand;
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", config)
```

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
