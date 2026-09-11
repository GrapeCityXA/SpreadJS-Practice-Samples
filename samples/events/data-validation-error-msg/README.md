# data-validation-error-msg

### 问题：运行时如何实现数据验证失败弹框

***

#### 背景：

Excel 中添加数据验证后，当数据验证不通过时，可以选择将不合法信息以弹框的形式弹出。如下所示：
![image](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/image.963a30.png?width=400)

将该文件导入在线表格编辑器（设计器），也就是包含工具栏的组件中，数据验证失败时，弹框会正常显示，如下所示：
![image](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/image.8405f8.png?width=400)

但是如果将该文件导入SpreadJS运行时中，数据验证失败时，这个弹框就不会再弹出了，这是因为这种弹框在SpreadJS中，属于专门为在线表格编辑器而设计的，而只是使用SpreadJS运行时的时候，是没有内置这些弹框的，并不属于产品bug，是一种设计思想。

但是，当客户使用SpreadJS运行时，依旧想要在数据验证失败时，弹出对应的错误时，是否有其它方案可以实现呢？

答案是可以的，因为文件本身数据验证的这些错误提示信息都是能获得的，只需要当用户在目标单元格输入内容时，使用API去判断数据验证是否通过，如不通过时，使用alert或者其它模态框将错误信息提示出来即可。

详细代码如下：

```javascript
spread.bind(GC.Spread.Sheets.Events.ValueChanged, function (sender, args) {
    let { row, col, newValue, oldValue, sheet } = args
    // 如果当前单元格有数据验证
    if (sheet.getCell(row, col).validator()) {
        //判断数据验证是否通过
        let isValid = sheet.isValid(row, col, newValue)
        if (!isValid) {
            //数据验证失败时 弹出错误信息
            alert(sheet.getCell(row, col).validator().errorMessage());
            //清空单元格内容
            sheet.setValue(row, col, oldValue)
        }
    }
})
```

最终效果：
![](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/GIF%202026-3-24%2016-14-22-20260324.5a98ca.gif?width=400)

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
