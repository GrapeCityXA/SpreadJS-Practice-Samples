### 问题：SpreadJS如何监听公式单元格值的变化

***

#### 背景：

很多小伙伴在使用SpreadJ的公式部分时，会遇到这样的问题：当公式单元格值变动的时候，无法通过CellChanged 事件来监听到值的变化情况，那么想要监控到该公式单元格值的变化情况应该怎么操作呢？

#### 实现方案1：

SpreadJS在从V13开始，添加了公式追踪的特性，这个问题就可以通过公式追踪来解决。具体操作如下：首先我们结合示例来学习公式追踪相关的两个方法：getDependents() 和 getPrecedents() 。
**示例：**
在单元格B1设置公式：’=A1+A2+A3‘，A1、A2、A3的值分别为：1、2、3。
[getDependents()](https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet#getdependents) ：可以判断这个单元格被哪些公式依赖。
参数为这个单元格的行列索引，返回引用该单元格的公式的信息 。如下图所示:
![162516kw9fzhhc8788zl2r](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/162516kw9fzhhc8788zl2r.7156c8.png?width=400)
有了以上公式追踪的方法，我们就可以结合[ValueChanged](https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Events#valuechanged)事件，监听引用的单元格区域的值，一旦发生变化，使用getValue 获取公式值变化情况。

```javascript
spread.bind(GC.Spread.Sheets.Events.ValueChanged, function (e, info) {
    let dependents = info.sheet.getDependents(info.row, info.col);
    let _spread = info.sheet.getParent()
    dependents.forEach(dep => {
        let _sheet = _spread.getSheetFromName(dep.sheetName)
        let _oldVal = _sheet.getValue(dep.row, dep.col)
        dep.oldVal = _oldVal
    })
    setTimeout(() => {
        dependents.forEach(dep => {
            let _sheet = _spread.getSheetFromName(dep.sheetName)
            let _newVal = _sheet.getValue(dep.row, dep.col)
            dep.newVal = _newVal

            console.log(`公式位置：${dep.row}, ${dep.col}, 值变化：${dep.oldVal} —> ${dep.newVal}`)
        })
                
    }, 0);
});
```

这里要注意：使用setTimeout函数才能获取到变化后的公式值，如果不使用获取到的是旧值。
最终效果如下：
![](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/GIF%202026-3-26%2011-19-23-20260326.503a4f.gif?width=400)

### 在线Demo（[全屏打开](https://jscodemine.grapecity.com/share/e5HaL2JcVk__PNazwu_zbg/){:target="_blank"}）
