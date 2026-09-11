# data-binding-basic-demo

### 问题：把 JSON 格式的表单字段内容，全部保存到数据库表

对于用户的需求，如果是整个表单，通过 `JSON.stringify(spreead.toJSON())` 可以获取到一个 JSON 的实例，然后发送这个 JSON 到服务端处理，具体保存数据库还是直接保存文件都是可以实现的，从V16开始，还支持sjs格式文件的导入导出。
加载的时候也是直接从数据库或者文件中读取 JSON 返回客户端。 
通过 `spread.fromJSON(JSON.parse(jsonString))` 即可加载。

#### 详细的Demo具体步骤：

##### 1、设计模板

设计模板可以使用桌面或[在线设计器](https://demo.grapecity.com.cn/SpreadJS/WebDesigner/)，在数据菜单下，选择工作表绑定，可以设置数据源，此例子中用了一个table和一些文本，将其拖拽至表单对应位置即可。
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260309.788095.png?width=400)
将模板导出为js或ssjson、sjs文件，**该文件后续就可以作为模板文件重复使用**。

##### 2、打开模板

通过js代码，将模板从服务端拉取后，就可以将模板在SpreadJS中打开了，这里我们使用fromJSON方法打开该文件。

```auto
spread.fromJSON(myTemplate);
```

##### 3、设置数据绑定

```auto
let dataSource = new GC.Spread.Sheets.Bindings.CellBindingSource(dbSource);
sheet.setDataSource(dataSource);
```

其中，dbSource就是一个数据源，可以来自于后端，也可以从前端自行构建。

##### 4、获取数据源

进入页面可以看到数据已显示在模板中，修改数据，点击获取数据源，可以看到控制台已打印出更新后的数据，可以已完成填报的数据存储至数据库中。
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260309.b4c5d7.png?width=400)

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
