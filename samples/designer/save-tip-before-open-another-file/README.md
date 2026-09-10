# save-tip-before-open-another-file

### 问题：如何在导入新文件之前，提示用户保存现有文件？

***

#### 背景：

有很多用户在使用编辑器的时候修改了部分单元格的内容，修改之后，需要重新导入新的表单并且不需要保存。
因为我们的弹窗默认是保存成ssjson，对于不懂技术的业务人员来说，保存成ssjson对他们的意义并不大，因此这部分弹窗就不再需要了，但是导入Excel是很常见的需求，这里并没有弹框提醒，我们今天就在导入Excel时添加这个提醒。

#### 实现思路：

在设计器中，有这样一个状态叫做`isFileModified`，也就是说，当我们表单的内容发生变化后，无论是否撤销。这个状态都会置为true，上述这个弹窗也主要是根据这个状态来控制是否弹出。因此，想要关闭上述弹窗，就可以通过将这个`isFileModified`的状态置为false即可。
我们需要重写`GC.Spread.Sheets.Designer.CommandNames.FileMenuPanel`这个命令，如果是想要在“文件”模板里面加一些按钮逻辑，都是要通过重写`FileMenuPanel`命令的execute实现。
通过下面的代码重写这个命令即可，核心就是通过setData来改变这个状态。

```javascript
let fileMenuPanelCommand = GC.Spread.Sheets.Designer.getCommand(
    GC.Spread.Sheets.Designer.CommandNames.FileMenuPanel
);
let oldExecuteFn = fileMenuPanelCommand.execute;

fileMenuPanelCommand.execute = function (designer, propertyName, newValue) {
    // 请在F12中查看该参数
    console.log(arguments)
    if(propertyName == "button_import_excel" && designer.getData("isFileModified")) {
        let result = confirm("该文件已经被修改，导入新Excel文件后将丢失，是否需要先保存？")
        if(result) {
            // 进行保存操作
            // ...
            // 然后将isFileModified设置为false
            designer.setData("isFileModified", false);
        } else {
            oldExecuteFn.call(this, designer, propertyName, newValue);
        }
    } else {
        oldExecuteFn.call(this, designer, propertyName, newValue);
    }
};
```

最后再将其加到commandMap里面即可：

```javascript
let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig));
config.commandMap = {
    fileMenuPanel: fileMenuPanelCommand,
};
```

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
