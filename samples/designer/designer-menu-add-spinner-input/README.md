# designer-menu-add-spinner-input

### 问题：如何在设计器添加步进器

***

#### 背景：

部分用户在自定义Template时想要实现Spinner，但具体不知道如何去实现。
![image](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/image.c1fd67.png?width=400)

#### 实现方法：

添加的方法和定义普通的button的类似，需要指定一个type为spinner，并且给定一个commandOptions对象。
里面包含可以配置旋转器的最大最小值以及步长。

```javascript
{
    type: "spinner",
    commandOptions: {
        numberEditorOption: {
            min: -90,
            max: 90,
            step: 5,
        }
    },
}
```

最后处理execute和getState方法，可能有一些用户对getState方法不太理解，可以简单理解为刷新UI时就会触发这个方法，它是为了保证ribbon的状态能够更新。
下面的value是可以获取并调整个旋转器的值。

```javascript
execute: function (context, propertyName, value) {
    let _spread = context.getWorkbook()
    let _sheet = _spread.getActiveSheet()
    _sheet.getSelections().forEach(sel => {
        _sheet.getRange(sel.row, sel.col, sel.rowCount, sel.colCount).textOrientation(value)
    })
},
getState: function (context, propertyName) {
	let _spread = context.getWorkbook()
    let _sheet = _spread.getActiveSheet()
    let row = _sheet.getActiveRowIndex()
    let col = _sheet.getActiveColumnIndex()
    let _style = _sheet.getStyle(row, col)
    if(!_style || !_style.textOrientation) {
        return 0
    }
    return _style.textOrientation
}
```

实现效果如图：
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260325.92ba58.png?width=400)

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
