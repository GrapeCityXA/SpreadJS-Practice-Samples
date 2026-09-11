# more-flexible-permission-control

传统的权限控制是通过单元格锁定+表单保护实现的，这种方式虽然简单，但是也有很多不足之处，例如：

* 表单保护对整个sheet生效，设计器的很多功能无法使用
* 只能控制用户能否编辑单元格，但是无法控制编辑的方式

以上痛点，都可以这个demo中得到解决。具体的解决思路是通过SpreadJS丰富的监听函数，来实现对用户行为的控制，举个例子，如果你不想用户通过下拉填充改变单元格的值，那么你就可以监听下拉填充的事件：

```auto
sheet.bind(GC.Spread.Sheets.Events.DragFillBlock, function (e, args) {
    args.cancel = true
});
```

这样用户的下拉填充就不会生效了，类似的，我们可以禁止用户粘贴、编辑、拖拽移动单元格、删除等等。
那对不同的单元格做不同的行为控制又该如何实现呢？其实大家不同关心demo内部的具体实现，demo的核心组件对外暴露了一个函数，直接创建一个实例，并注册就好了，一看便知：

```auto
let authContoller = new AuthController()
authContoller.register(spread, sheet, function (row, col, type) {
    if (col == 0) {
        return type != "EditStarting"
    } else if (col == 1) {
        return type != "ClipboardPasting"
    } else {
        return true
    }
})
```

以上代码的意思是：第一列禁止直接编辑，第二列禁止粘贴，其他单元格可以随意编辑。因为register方法的第三个参数是一个回调函数，我们可以得知用户正在操作的单元格行列信息以及操作的方式，所以可以很方便地控制用户的行为，只需要返回一个布尔值即可。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
