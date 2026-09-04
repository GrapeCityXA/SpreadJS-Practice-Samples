# 表格绑定插入列时更新数据透视表

## Content

### 问题：如何在表格绑定的数据源动态插入列时更新对应的数据透视表

***

#### 背景：

很多应用数据透视表的用户会遇到这样要给问题，数据透视表引用了表格区域，并且表格区域可能会新增一些列，这个表格是通过数据绑定来实现的。这个时候就需要分别更新表格的数据源以及数据透视表。

#### 解决办法：

对于这样一个背景，我们可以分成两个部分来讨论。分别是给表格绑定新增表格列以及更新数据透视表及其面板。
第一个部分，表格绑定新增表格列。首先还是比较常规的部分，进行表格绑定。
![image](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/image.19769a.png)
绑定完成之后，增加一个数据透视表。
![image](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/image.36ffe6.png)
实现之后我们可以看到带有绑定数据源的table以及一个数据透视表
![image](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/image.76f4bd.png)
![image](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/image.3b5f06.png?width=600)
接下来执行插入列的操作，我们可以通过表格的insertColumns接口来实现表格新增列，需要注意第三个参数，是一个布尔值，表示在指定列索引的前面插入还是后面插入。

```js
table.insertColumns(2, 1, true);
```

插入完成之后，我们可以更新数据源或者我们直接返回的就是一个带有多一个cost属性的数据源也是可以的。因为表格绑定会根据绑定路径与数据源对应上，如果没有对应的，那么在绑定之后不会显示出来。
![image](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/image.527891.png)
我们处理多出来的列的方法就是new一个TableColumn，并为其指定name以及绑定路径，然后将其添加到我们前面绑定时所构建的tableColumns数组中。最后再通过setDataSouce将新的数据源进行绑定。

```js
var tableColumnNew = new spreadNS.Tables.TableColumn();
tableColumnNew.name("cost");
tableColumnNew.dataField("cost");
tableColumns.push(tableColumnNew);

table.bindColumns(tableColumns);
table.bindingPath("sales");
source = new GC.Spread.Sheets.Bindings.CellBindingSource(newdata);
sheet.setDataSource(source);
```

以上是实现了table绑定时动态添加列。
table数据源更新了，透视表也需要进行同步更新。我们可以通过updateSource更新透视表的数据源，然后通过add方法为透视表的值字段加上一个cost字段。

```js
myPivotTable.updateSource();
myPivotTable.add(
  "cost",
  "Cost",
  GC.Spread.Pivot.PivotTableFieldType.valueField
);
```

最终的效果就是表格中多了一列，并且数据透视表也做了更新
![image](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/image.d964ad.png)
![image](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/image.0007a7.png?width=600)

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/ZIcoLe_jok61ll8BpEYxug/){:target="_blank"}）
