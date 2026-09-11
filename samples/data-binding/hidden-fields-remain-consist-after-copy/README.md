# hidden-fields-remain-consist-after-copy

### 需求：希望在数据绑定后，实现隐藏字段随非隐藏字段所在行进行联动

***

#### 背景：

在SpreadJS中，对于实际的数据绑定场景，常常遇到这样的需求：举例来说，数据源里有10个字段，但只需要绑定其中的8个字段，另2个字段隐藏。
以表单绑定为例，默认情况下，我们可以用sheet.bindColumns配置绑定列设置，只绑定指定的部分列。 
但是，尝试后大家会发现，隐藏字段的数据，不会随显示数据的排序、粘贴等操作而联动。
当我们隐藏了比如id之类的标记字段，再执行排序、粘贴等操作后，就会导致数据结构混乱的结果。

#### 解决方案：

通过挂载对应的事件，以及重写相应的命令来处理。

#### 示例：

以下就拿粘贴举例，这里采用了重写命令和接听事件的方式，解决了此问题。
除此之外，还添加了一个功能：把原始数据保存到隐藏字段中，自动对比发生diff的单元格并标红处理。

```javascript
//—————————————————— 开始实现标记diff单元格数据 ————————————————————
// 建立快速查找列名和字段的映射对象
var colInfoNameToKey = {
    "ID" : "id",
    "Name" : "name",
    "Line" : "line",
    "Color" : "color",
    "Price" : "price",
    "Cost" : "cost",
    "Weight" : "weight",
    "Discontinued" : "discontinued",
    "Rating" : "rating"
};

/*
    这里声明了一个新的单元格类型
*/
function ShowDiffCellType() {
}
/*
    新类型继承了SpreadJS原生的Text类型
*/
ShowDiffCellType.prototype = new GC.Spread.Sheets.CellTypes.Text();
/*
    重写Text的paint方法
*/
ShowDiffCellType.prototype.paint = function (ctx, value, x, y, w, h, style, options) {
    // 这里可以用来标记与原始数据不一样的单元格
    const sheet = options.sheet;
    const col = options.col;
    const row = options.row;
    const colName = sheet.getDataColumnName(col);
    const colKey = colInfoNameToKey[colName];
    const dataItem = sheet.getDataItem(row);
    if(dataItem.hideData){
        if(dataItem.hideData.originData[colKey] !== value){
            // 更改渲染样式
            style.backColor = 'red';
        }
    }
    GC.Spread.Sheets.CellTypes.Text.prototype.paint.apply(this, [ctx, value, x, y, w, h, style, options]);
};
// 设置sheet全局生效
var defautStyle = sheet.getDefaultStyle();
defautStyle.cellType = new ShowDiffCellType();
sheet.setDefaultStyle(defautStyle);
//—————————————————— 结束实现标记diff单元格数据 ————————————————————

//—————————————————— 开始实现复制隐藏数据 ——————————————————————————

// 2、重写copy命令
let copyRange;
spread.commandManager().register("myCopy",
{
    canUndo: true,
    execute: function (context, options, isUndo) {
        options.cmd = "copy";
        // 获取复制区域
        const sheet = spread.getSheetFromName(options.sheetName);
        // 这里默认只拷贝第一个区域，如果需要多区域拷贝，自行处理
        copyRange = sheet.getSelections()[0];
        // 执行复制操作
        spread.commandManager().execute(options);
        options.cmd = "myCopy";
    }
});
// 设置快捷键Ctrl + C
spread.commandManager().setShortcutKey(
    "copy", null, false, false, false, false
);
spread.commandManager().setShortcutKey(
    "myCopy", GC.Spread.Commands.Key.c, true, false, false, false
);
sheet.bind(GC.Spread.Sheets.Events.ClipboardPasted, (e, args) => {
    // 粘贴后把源数据带过来：
    const cellRange = args.cellRange;
    const sheet = args.sheet;
    const copyDatas = [];
    for(let i=copyRange.row; i<copyRange.row+copyRange.rowCount; i++){
        copyDatas.push(sheet.getDataItem(i));
    }
    for(let i=cellRange.row; i<cellRange.row+cellRange.rowCount; i++){
        let dataSource = sheet.getDataSource();
        dataSource[i].hideData = copyDatas[i-cellRange.row].hideData;
    }
    sheet.repaint();
});
```

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
