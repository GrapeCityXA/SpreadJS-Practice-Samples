### 需求：如何为数据透视表设置公式条件样式

***

#### 背景：

在很多数据透视表使用的场景中，如果需要对数据做一些分析后进行可视化的对比展示。那么条件格式是一个很好的选择
SpreadJS支持对数据透视表设置条件格式，具体的应用可用参考：[https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/features/pivot-table/pivot-conditional-rules/purejs](https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/features/pivot-table/pivot-conditional-rules/purejs)
和给数据透视表设置普通样式类似，最终是将条件规则添加到定义出的pivotArea中，所以即使透视表的行列值字段发生变化导致透视表的布局已经变化时。该条件规则仍然是可用随之变化应用于对应的单元格。

#### 解决方案：

在excel中，公式条件规则是条件格式中使用非常广泛的一种，相对于其他的条件规则来说，更加灵活，能以非当前单元格来设置条件规则，也可用设置多个条件
举一个简单的例子:当B1>10且C1>20时，给A1单元格设置特定格式。那么可用很简单的设置公式规则为"=AND(B1>10,C1>20)"
在透视表中，由于行列是动态变化的，再通过上述单元格地址引用，并不合理，SpreadJS中，提供了一个GETPIVOTDATA函数，我们可以通过这个函数动态定义公式。
下面的一个例子说明了如何在透视表中设置公式条件格式
我们先创建一个类似下图的数据透视表为基础。可用导入这个ssjson即可看到
![image](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/image.a02a96.png?width=400)
在这个透视表表中，横向列为汽车品牌，纵向列为销售人员。以此统计每个销售人员销售的每种车的数量
我们有下面的需求：
高亮显示出这些销售人员：其Audi和BMW两个品牌车辆销售业绩都在20辆以上。
针对上述需求，通过下面的代码来设置条件格式即可，先给出代码和最终效果

```js
let sheet = spread.getActiveSheet();
let style = new GC.Spread.Sheets.Style();
style.backColor = "red";
sheet.conditionalFormats.addFormulaRule(
    "=AND(GETPIVOTDATA(\"quantity\",$A$3,\"salesperson\",A5,\"car\",\"Audi\")>20,GETPIVOTDATA(\"quantity\",$A$3,\"salesperson\",A5,\"car\",\"BMW\")>20)",
    style,
    [new GC.Spread.Sheets.Range(4, 0, 5, 1)]
);
```

![image](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/image.bdf05a.png)
上述代码中，关于样式的定义，以及设置条件规则的目标区域定义，在上述链接的示例中都有介绍。这边就不再做详细解读。
在添加的规则中，我们设置的规则类型为**GC.Spread.Sheets.ConditionalFormatting.RuleType.formulaRule**（公式条件）,
在最后一个参数，公式字符串中，定义了\*\*'AND(GETPIVOTDATA("quantity",$A$3,"salesperson",A5,"car","Audi")>20,GETPIVOTDATA("quantity",$A$3,"salesperson",A5,"car","BMW")>20)'\*\*
这一段公式字符串中，核心的地方在于，通过GETPIVOTDATA函数动态的获取到了字段的统计值。
**公式语法:=GETPIVOTDATA(data\_field, pivot\_table, [field1, item1, field2, item2], ...)**

| 参数 | 描述 |
| --- | --- |
| data\_field | 包含要检索的数据的数据透视表字段的名称。这需要用双引号引起来。 |
| pivot\_table | 对数据透视表中任何单元格、单元格区域或命名单元格区域的引用。此信息用于确定哪个数据透视表包含您要检索的数据。 |
| field1, item1, field2, item2.. | [可选] 最多 126 对描述要检索的数据的字段名称和项目名称。这些对可以按任何顺序排列。 |

比如**GETPIVOTDATA("quantity",$A$3,"salesperson",A5,"car","Audi")**，这里获取到的是salesperson为A5(相对引用)，car为Audi这两个条件所对应的透视合计值，然后以此结果再和20进行比较。后一个关于BMW的条件也是同样的道理
上述条件规则最终判断出的就是Audi和BMW两个品牌车辆销售业绩都在20辆以上的数据行。我们将此数据条件设置给定义的targetRange ，即销售人员列
上述示例展示了一个简单的多条件公式规则设置。实际应用中，我们可用设置更为复杂的条件来进行条件样式设置

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/t8zFWudRfUKepxWbtc4mBA/){:target="_blank"}）
