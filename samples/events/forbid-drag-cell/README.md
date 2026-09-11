# forbid-drag-cell

### 问题：如何禁止单元格移动/拖动

#### 背景：

在某些情况下，想要禁用单元格拖动的事件，要怎么实现呢？

#### 解决方案：

目前有两种方法可以实现：

##### 方法1：监听DragDropBlock事件

通过监听DragDropBlock事件，来判断哪些情况下需要禁用单元格的拖动，例如当拖动的列的索引值大于等于1时，就禁止拖动。这种方式更加灵活，可以动态地根据拖动单元格的目标和起始位置，判断是否允许拖动。

```auto
sheet.bind(GC.Spread.Sheets.Events.DragDropBlock, function (e, args) {
    if (args.fromCol >= 1) {
        args.cancel = true;
    }
});
```

##### 方法2：设置全局 option, 禁止拖动

`spread.options.allowUserDragDrop = false;`
在这种方式下，SpreadJS 全局都不能进行拖动操作（不会显示单元格被选择时的十字箭头）。这种方式更简单，但是灵活性稍差。
参考链接：

* [allowUserDragDrop](https://demo.grapecity.com.cn/spreadjs/help/api/interfaces/GC.Spread.Sheets.IWorkBookDefaultOptions#allowuserdragdrop){:target="_blank"}
* [DragDropBlock](https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Events#dragdropblock){:target="_blank"}

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
