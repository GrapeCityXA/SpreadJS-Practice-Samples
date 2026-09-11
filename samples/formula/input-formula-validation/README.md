# input-formula-validation

### 需求：如何实现对用户输入的公式进行校验

***

#### 实现方案：

SpreadJS V16支持[allowInvalidFormula](https://demo.grapecity.com.cn/spreadjs/help/api/interfaces/GC.Spread.Sheets.IWorkbookOptions#allowinvalidformula)方法，允许用户提交非法的公式。（计算结果为#Value或者DIV0的公式并不属于非法的公式，只是计算参数类型错误或者结果无法显示）。

```javascript
spread.options.allowInvalidFormula = true;
```

在UI上就是对于该选项的勾选：
![image](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/image.5a76de.png?width=400)
输入的非法公式将直接显示输入内容而不会按照公式内容进行计算
![115729k89jww8n4pwnpnfw](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/115729k89jww8n4pwnpnfw.33c46c.png)

如果需要验证验证输入的公式是否非法，可以使用[formulaToExpression](https://demo.grapecity.com.cn/spreadjs/help/api/modules/GC.Spread.Sheets.CalcEngine#formulatoexpression)尝试将用户输入的公式尝试解析，如果解析抛异常，则说明是非法的公式，提示用户重新输入。

```javascript
try {
  GC.Spread.Sheets.CalcEngine.formulaToExpression(
    sheet,
    inputFormula,
    0,
    0,
    spread.options.referenceStyle ===
      GC.Spread.Sheets.CalcEngine.ReferenceStyle.r1c1
  );
} catch (err) {}
```

这个验证可以放到[EditEnding](https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Events#editending)事件里直接做，如果输入错误cancel掉退出，让用户继续输入。
同时V16在EditEnding事件参数中增加了committed属性，用于判断是否提交编辑，当按esc取消编辑而退出编辑状态时，这个属性的值时false

```javascript
spread.bind(GC.Spread.Sheets.Events.EditEnding, function (e, info) {
    if (info.committed && info.editingText) {
        let sheet = info.sheet,
            spread = sheet.getParent();
        try {
            let expression = GC.Spread.Sheets.CalcEngine.formulaToExpression(
                sheet,
                info.editingText,
                0,
                0,
                spread.options.referenceStyle === GC.Spread.Sheets.CalcEngine.ReferenceStyle.r1c1
            );
        } catch (err) {
            alert("公式出现错误")
        }
    }
});
```

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
