# add-custom-function-to-dialog

### 需求：如何在”插入函数“按钮的弹窗中添加自定义公式

***

#### 背景：

在很多场景下某些复杂公式总是一遍一遍设计输入对于用户来说很不友好，特别是一些固定的填报场景，公式往往是固定但是复杂的，如果可以和常用公式一样直接添加将会事半功倍
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260313.e79461.png?width=400)

#### 解决方案：

首先，我们先自定义一个函数，如何自定义函数可以参考学习指南这个demo：[自定义函数 功能示例](https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/features/calculation/custom-functions/purejs){:target="_blank"}

```auto
function FactorialFunction() {
	this.name = "FACTORIAL";
	this.maxArgs = 1;
	this.minArgs = 1;
	this.description = function () {
		return (
			{
				description: "自定义的阶乘函数",
				parameters: [
					{
						name: 'number01',
						repeatable: false,
						optional: false
					}
				]
			}
		)
	}
}
FactorialFunction.prototype = new GC.Spread.CalcEngine.Functions.Function();
FactorialFunction.prototype.evaluate = function (arg) {
	let result = 1;
	if (arguments.length === 1 && !isNaN(parseInt(arg))) {
		for (let i = 1; i <= arg; i++) {
			result = i * result;
		}
		return result;
	}
	return "#VALUE!";
};
let factorial = new FactorialFunction();
GC.Spread.CalcEngine.Functions.defineGlobalCustomFunction("FACTORIAL", new FactorialFunction());
spread.addCustomFunction(factorial)
```

定义完这个函数后，我们需要找这个弹框对应的template。对应的是GC.Spread.Sheets.Designer.TemplateNames.InsertFunctionDialogTemplate
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260313.034604.png?width=250)
我们要添加函数的位置在这个数组中
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260313.803973.png?width=400)
于是我们可以通过bindingPath找到这个位置，并且添加我们的自定义函数对象：

```auto
function customFontFamilyInFormatDialogTemplate(templateNode) {
  if (
    templateNode.bindingPath &&
    templateNode.bindingPath === "functionDesc.allFunction" &&
    templateNode.items
  ) {
    templateNode.items.unshift({ text: "FACTORIAL", value: "FACTORIAL" });

    return;
  }
  let nodes = templateNode.content || templateNode.children;
  if (nodes && nodes instanceof Array) {
    nodes.forEach((subNode) => customFontFamilyInFormatDialogTemplate(subNode));
  }
}
```

最后把这个template注册回去：

```auto
GC.Spread.Sheets.Designer.registerTemplate(GC.Spread.Sheets.Designer.TemplateNames.InsertFunctionDialogTemplate, template);
```

可以看到已经成功加上了：
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260313.71dc99.png?width=250)

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
