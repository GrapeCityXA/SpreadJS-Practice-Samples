# add-excel-like-dialog-when-sort

### 问题：如何在排序时实现和Excel一样的提示

***

#### 背景：

在Excel中如果排序选中的单元格区域周围存在数据，那么在点击升序或者降序的时候系统会给予提示，例如下图所示：当选中区域的周围存在其他数据时，这个时候点击排序按钮，Excel会给出“发现在选定区域旁边还有数据。该数据未被选择，将不参与排序。”的提示弹窗。
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260313.b36423.png?width=400)
如何在SpreadJS中也实现类似的功能

#### 解决方案：

SpreadJS中源生是没有这样的提示的，但是SpreadJS本身的强大扩展功能支持用户通过二次开发来实现这样的需求。
以在线表格编辑器为例：
首先我们找到在线表格编辑器中排序对应的command

```auto
let sortAZData = GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.SortAZData);
```

然后我们将sortAZData的execute方法以变量形式保存起来，该方法中存放的就是SpreadJS源生的排序实现逻辑。

```auto
let oldSortAZExecute = sortAZData.execute;
```

之后我们需要重写execute方法，在方法中加入逻辑判断并给予对话框提示，具体代码如下：

```auto
sortAZData.execute = function (context, propertyName) {
	let activeSheet = context.getWorkbook().getActiveSheet();
	let flag = false;
	let selection = activeSheet.getSelections()[0];

	for (let i = selection.row; i < selection.row + selection.rowCount; i++) {
		if (selection.col > 0) {
			let valueLeft = activeSheet.getValue(i, selection.col - 1);
			if (valueLeft != null) {
				flag = true;
				break;
			}
		}
		if ((selection.col + selection.colCount) < activeSheet.getColumnCount()) {
			let valueRight = activeSheet.getValue(i, selection.col + selection.colCount);
			if (valueRight != null) {
				flag = true;
				break;
			}
		}

	}

	if (flag) {
		GC.Spread.Sheets.Designer.showMessageBox("发现在选定区域旁边还有数据。该数据未被选择，将不参与排序。", "提示", GC.Spread.Sheets.Designer.MessageBoxIcon.warning, function () {
			oldSortAZExecute.call(this, context, propertyName);
		});
	} else {
		oldSortAZExecute.call(this, context, propertyName);
	}
};
```

这里面主要是判断方法，根据选中的区域判断它的左右两侧是否存在数据。如果存在数据弹出提示，在提示结束后调用之前保存的源生排序逻辑进行排序。
最终效果如下：
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260313.7599e5.png)

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
