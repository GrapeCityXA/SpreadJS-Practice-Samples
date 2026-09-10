# cell-input-limited-in-numbers

### 问题：如何限制单元格只可以输入数字？

#### 背景：

在某些情况下，需要对某些单元格限定输入的值的类型，如只能输入数字等。

#### 解决方案：

这里介绍两种解决方案。

#### 通过监听editEnding事件

editEnding事件可以在结束单元格编辑的时候触发，并且可以取消这次编辑，我们可以在事件内部判断当前用户输入的是不是一个合法的内容，如果不是的话，就取消输入，并弹窗提醒：

```auto
sheet1.bind(GC.Spread.Sheets.Events.EditEnding, function (sender, args) {
    console.log(args)
    if(args.row != 1 || args.col != 1) {
        return
    }
    var text = args.editingText;
    if (!Number(text)) {
        alert("请输入数字！")
        args.cancel = true
    }
});
```

#### 通过数据验证的方式实现

SpreadJS数据验证的能力和Excel中的数据验证是相同的，可以设定输入的数据类型、数据范围等，还可以设置输入错误时的提示词，是一种更加高阶的方式，但是它的提醒功能需要在设计器中才可以使用，单纯使用SpreadJS是不行的。

```auto
// 高亮验证不通过的单元格
spread.options.highlightInvalidData = true; 
let dv = GC.Spread.Sheets.DataValidation.createNumberValidator(GC.Spread.Sheets.ConditionalFormatting.ComparisonOperators.between, 0, 100, false);
// 是否显示提示信息
dv.showInputMessage(true); 
// 提示信息的提示文字
dv.inputMessage("数字应该在0到100之间"); 
// 提示信息的标题
dv.inputTitle("tip"); 
// 报错信息的标题
dv.errorTitle("输入出错");
// 报错信息的内容
dv.errorMessage("请输入0到100之间的数字");
// 报错的样式：warning是给出警告，但可以继续；stop是给出警告，且无法继续，强制用户修改为正确的值
dv.errorStyle(GC.Spread.Sheets.DataValidation.ErrorStyle.warning); 
sheet2.setDataValidator(1, 1, 1, 1, dv, GC.Spread.Sheets.SheetArea.viewport);
```

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
