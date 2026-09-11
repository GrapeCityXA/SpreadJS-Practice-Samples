# add-customize-dialog

### 问题：如何创建自定义对话框

***

#### 背景：部分用户需要自定义对话框来实现一些需求。

#### 实现方法：

首先需要创建一个模板实例，创建一个名为”打印“的dialog页。

```auto
let richSheetTagTemplate = {
  title: "自定义打印",
  content: [
    {
      type: "TabControl",
      width: 400,
      height: 300,
      bindingPath: "dialogOption",
      children: [
        {
          key: "printTab",
          text: "打印",
          children: [CreateId],
        },
      ],
    },
  ],
};
```

然后，通过API registerTemplate注册该模板。
`GC.Spread.Sheets.Designer.registerTemplate("newTab", richSheetTagTemplate);`
可以看到模板中有一个children为CreateID，这个就是对话框中，显示的内容。使用了Flex、Column布局。并且写了对应的bindingPath，会在命令中用到。

```auto
let CreateId = {
  type: "FlexContainer",
  margin: "10px",
  children: [
    {
      type: "FlexContainer",
      children: [
        {
          type: "Radio",
          items: [
            {
              text: "横向打印",
              value: "horizontal",
        .......
```

**以上就完成了对话框模板的注册，但我们还需要一个地方来触发打开对话框这个事件。**
所以我们需要在工具栏上添加一个按钮，点击后的核心逻辑是打开对话框：

```auto
let ribbonTabCommands  = {
    text: "页面设置",
    iconClass: "ribbon-button-sheetgeneral",
    bigButton: true,
    commandName: "ribbonTabCommands ",
    execute: async (context) => {
      let spread = context.getWorkbook();
      let sheet = spread.getActiveSheet();

      let option = {
        tag: sheet.tag(),
        direction: "vertical",
        showBorder: true,
        dialogOption: {
          activeTab: "Test2",
          showTabList: ["DefaultFormat", "Test2"],
        },
      };
      // 打开对话框
      GC.Spread.Sheets.Designer.showDialog("newTab", option, (result) => {
        // 当对话框被关闭时的回调函数
        let printInfo = sheet.printInfo();
        console.log(result);
        ... 
      });
    },
}

let ribbonPivotConfig1 = {
  label: "打印",
  thumbnailClass: "ribbon-thumbnail-spreadsettings",
  commandGroup: {
    children: [
      {
        direction: "vertical",
        commands: ["ribbonTabCommands"],
      },
    ],
  },
};

let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))
if(!config.commandMap) {
    config.commandMap = {}
}
config.commandMap["ribbonTabCommands "] = ribbonTabCommands;
config.ribbon[2].buttonGroups.push(ribbonPivotConfig1)
```

最终效果：
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260313.74928b.png?width=400)

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
