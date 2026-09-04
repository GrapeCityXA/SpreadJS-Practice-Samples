## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现带有自定义背景色的多选下拉框功能。通过自定义单元格类型（CellType），将选中的多个选项以带有不同背景色的色块形式展示在单元格中，每个选项对应一个预定义的颜色，提供了更加直观和美观的数据展示方式。

该示例适用于需要在表格中以可视化方式展示多选标签、分类标记或状态标识的场景，例如任务管理系统中的标签选择、项目分类标记等。

## 二、解决的问题

- 多选下拉框的选中项默认以纯文本形式展示，缺乏视觉区分度
- 需要为不同的选项赋予不同的颜色标识，便于快速识别
- 需要在单元格中以色块形式展示多个选中项，提升用户体验

## 三、实现思路

### 3.1 自定义单元格类型实现色块渲染

通过继承 `GC.Spread.Sheets.CellTypes.Base` 创建自定义单元格类型 `ColorBlockCellType`，重写 `paint` 方法实现色块渲染逻辑。核心思路是将单元格的值按逗号分隔，为每个选项绘制一个带有背景色的色块。

```javascript
function ColorBlockCellType() {}
ColorBlockCellType = function () {
    GC.Spread.Sheets.CellTypes.Base.apply(this, arguments);
    this.typeName = 'ColorBlockCellType'
}

ColorBlockCellType.prototype = new GC.Spread.Sheets.CellTypes.Base();
ColorBlockCellType.prototype.paint = function (ctx, value, x, y, w, h, style, options) {
    // 使用基础文本渲染清空单元格背景
    GC.Spread.Sheets.CellTypes.Text.prototype.paint.call(this, ctx, '', x, y, w, h, style, options);

    // 处理单元格按钮占用的宽度
    if (style.cellButtons && style.cellButtons.length > 0) {
        w = w - 28 * style.cellButtons.length;
    }
    
    var valueArr = value && value.split(','), newH = h, newY = y, newStyle = style.clone(), padding = 4, newX = x;
    var sheet = options.sheet, zoomFactor = sheet.zoom();
    
    if (valueArr && valueArr.length > 0) {
        newH = newH - 4;
        newY = y + 2;
        newStyle.cellButtons = [];

        valueArr.forEach((item, index) => {
            var itemWidth = GC.Spread.Sheets.CellTypes.Text.prototype.getAutoFitWidth(item, item, newStyle, zoomFactor, options) + 4;
            var itemBackground = colorMap[item];
            newStyle.backColor = itemBackground;
            newStyle.foreColor = 'white';
            
            if (newX + itemWidth > x + w) {
                itemWidth = x + w - newX;
            }
            if (itemWidth <= 0) {
                return;
            }
            GC.Spread.Sheets.CellTypes.Text.prototype.paint.call(this, ctx, item, newX, newY, itemWidth, newH, newStyle, options);
            newX += itemWidth + padding;
        });
    }
};
```

### 3.2 颜色映射配置

定义 `colorMap` 对象，为每个选项预设背景色，确保不同选项具有不同的视觉标识。

```javascript
let colorMap = {
    'item1': '#1abc9c',
    'item2': '#2ecc71',
    'item3': '#3498db',
    'item4': '#9b59b6',
    'item5': '#34495e',
    'item6': '#f1c40f',
    'item7': '#e67e22',
    'item8': '#C76DA2',
    'item9': '#e74c3c',
    'item10': '#95a5a6',
};
```

### 3.3 自定义下拉列表生成

通过 `generateThemeColors` 函数动态生成下拉列表的 DOM 元素，每个选项以带有背景色的 div 块展示，用户点击时通过 `colorClicked` 回调函数返回选中的值。

```javascript
function generateThemeColors() {
    return generateColors(10, 0, 16777215)
}

function generateColors(count, start, stop) {
    var div = document.createElement("div");
    div.style.width = "50px";
    var step = (stop - start) / count | 0;

    for (var i = start, index = 0; i < stop && index < count; i += step, index++) {
        var item = document.createElement("div");
        item.style.backgroundColor = colorMap[arr[index]];
        item.style.width = '35px';
        item.style.height = '15px';
        item.style.border = '1px solid #c3c3c3';
        item.style.color = 'white';
        item.style.padding = '2px';
        item.style.margin = '4px';
        item.classList.add("custom-color-block");
        item.innerHTML = arr[index]
        div.appendChild(item);
    }
    return div;
}

function colorClicked(event) {
    var target = event.target;
    if (target && target.classList.contains("custom-color-block")) {
        return target.innerHTML;
    }
}
```

### 3.4 配置多选下拉框样式

通过 `customStyle` 配置单元格的下拉按钮和下拉列表选项，启用 `multiSelect` 支持多选功能。

```javascript
var colorListData = {
    multiSelect: true,
    onItemSelected: colorClicked,
    items: generateThemeColors
};

var customStyle = new GC.Spread.Sheets.Style();
customStyle.cellButtons = [
    {
        imageType: GC.Spread.Sheets.ButtonImageType.dropdown,
        command: "openList",
        width: 20
    },
];
customStyle.dropDowns = [
    {
        type: GC.Spread.Sheets.DropDownType.list,
        option: colorListData
    }
];
```

### 3.5 技术栈

- SpreadJS 17.0.8：核心表格控件
- SystemJS 0.19.22：模块加载器
- systemjs-plugin-babel 0.0.25：ES6 语法转译

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，可以看到 B 列单元格中已预设了不同数量的选中项
2. 点击单元格右侧的下拉按钮，打开下拉列表
3. 在下拉列表中点击不同的色块选项进行多选
4. 选中的选项会以带有背景色的色块形式展示在单元格中
5. 每个色块对应一个选项，颜色与下拉列表中的颜色一致

## 五、功能特点

### 5.1 优点

- 视觉效果直观，通过颜色快速区分不同选项
- 支持多选功能，满足复杂业务场景需求
- 自定义单元格类型实现灵活，可根据需求调整渲染逻辑
- 下拉列表与单元格展示保持一致的视觉风格

### 5.2 局限性与扩展建议

- 当前颜色映射是硬编码的，可以改为从配置文件或 API 动态加载
- 色块宽度根据文本内容自动计算，当单元格宽度不足时会被截断，可以考虑增加换行或滚动功能
- 可以扩展支持自定义图标、边框样式等更丰富的视觉效果

## 六、关键代码片段

### 色块宽度自动计算与溢出处理

```javascript
valueArr.forEach((item, index) => {
    var itemWidth = GC.Spread.Sheets.CellTypes.Text.prototype.getAutoFitWidth(item, item, newStyle, zoomFactor, options) + 4;
    var itemBackground = colorMap[item];
    newStyle.backColor = itemBackground;
    newStyle.foreColor = 'white';
    
    if (newX + itemWidth > x + w) {
        itemWidth = x + w - newX;
    }
    if (itemWidth <= 0) {
        return;
    }
    GC.Spread.Sheets.CellTypes.Text.prototype.paint.call(this, ctx, item, newX, newY, itemWidth, newH, newStyle, options);
    newX += itemWidth + padding;
});
```

该代码段通过 `getAutoFitWidth` 方法计算每个选项的宽度，并在绘制时检查是否超出单元格边界，超出部分会被截断，确保色块不会溢出单元格范围。

## 七、总结

本示例展示了如何通过自定义单元格类型实现带有背景色的多选下拉框功能，为 SpreadJS 提供了更加丰富的数据展示方式。开发者可以从中学到：

- 如何继承 `CellTypes.Base` 创建自定义单元格类型
- 如何重写 `paint` 方法实现自定义渲染逻辑
- 如何配置多选下拉框并自定义下拉列表的 DOM 结构
- 如何处理单元格宽度限制和色块溢出问题

该方案适用于需要在表格中以可视化方式展示多选标签的场景，具有良好的扩展性，可以根据实际需求调整颜色映射、渲染样式等配置。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/eQihBK_1Vkys_YIALSBDvw/)）
