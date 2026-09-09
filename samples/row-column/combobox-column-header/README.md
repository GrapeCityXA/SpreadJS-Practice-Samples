## 一、Demo 概述

本示例展示了如何在 SpreadJS 的列头区域实现自定义下拉框功能。通过继承 `ColumnHeader` 单元格类型并重写其核心方法，实现了在列头单元格中嵌入可交互的下拉选择器，用户可以点击列头右侧的下拉按钮选择不同的选项值。

该功能适用于需要在列头进行快速筛选、分类切换或配置选择的场景，例如数据视图切换、列属性配置等。

## 二、解决的问题

- 在列头区域提供交互式下拉选择功能，突破默认列头只能显示静态文本的限制
- 实现列头单元格的自定义渲染和事件响应机制
- 通过 Tag 机制存储和管理列头的状态数据
- 提供可复用的自定义列头单元格类型，方便在多个列头应用相同的交互模式

## 三、实现思路

### 3.1 自定义列头单元格类型

通过继承 `GC.Spread.Sheets.CellTypes.ColumnHeader` 创建自定义单元格类型 `DrowdownHeaderCellType`，并定义下拉框的数据源和按钮宽度：

```javascript
function DrowdownHeaderCellType() {
    this.BUTTON_WIDTH = 17;
    this.ITEMS = [{
        text: "text1",
        value: "value1"
    }, {
        text: "text2",
        value: "value2"
    }, {
        text: "text3",
        value: "value3"
    }, {
        text: "text4",
        value: "value4"
    }];
    GC.Spread.Sheets.CellTypes.ColumnHeader.apply(this);
}
DrowdownHeaderCellType.prototype = new GC.Spread.Sheets.CellTypes.ColumnHeader();
```

### 3.2 自定义绘制下拉按钮

重写 `paint` 方法，在列头单元格右侧绘制一个三角形下拉按钮图标：

```javascript
DrowdownHeaderCellType.prototype.paint = function(ctx, value, x, y, w, h, style, context) {
    GC.Spread.Sheets.CellTypes.ColumnHeader.prototype.paint.apply(this, arguments);
    var btnWidth = this.BUTTON_WIDTH;
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.fillStyle = 'black';
    ctx.moveTo(x + w - btnWidth + 3, y + (h - 2) / 2 - 2.5);
    ctx.lineTo(x + w - btnWidth + 6, y + (h - 2) / 2 + 3.5);
    ctx.lineTo(x + w - btnWidth + 9, y + (h - 2) / 2 - 2.5);
    ctx.fill();
    ctx.restore();
    ctx.restore();
};
```

该方法首先调用父类的 `paint` 方法绘制默认列头内容，然后使用 Canvas API 在右侧绘制一个向下的三角形箭头。

### 3.3 定义点击热区

重写 `getHitInfo` 方法，判断鼠标点击位置是否在下拉按钮区域：

```javascript
DrowdownHeaderCellType.prototype.getHitInfo = function(x, y, cellStyle, cellRect, context) {
    var x2 = cellRect.x + cellRect.width;
    var sheetArea = context.sheetArea,
        sheet = context.sheet;
    var info = {
        x: x,
        y: y,
        row: context.row,
        col: context.col,
        cellStyle: cellStyle,
        cellRect: cellRect,
        sheetArea: sheetArea,
        sheet: sheet
    };

    if (x2 - this.BUTTON_WIDTH <= x && x < x2) {
        info.isReservedLocation = true;
    }
    return info;
};
```

当点击位置在单元格右侧 17 像素范围内时，标记 `isReservedLocation` 为 `true`，表示点击了下拉按钮区域。

### 3.4 处理鼠标点击事件

重写 `processMouseUp` 方法，当点击下拉按钮时显示下拉选择器：

```javascript
DrowdownHeaderCellType.prototype.processMouseUp = function(hitInfo) {
    if (hitInfo.isReservedLocation) {
        var sheet = hitInfo.sheet;
        var tag = sheet.getTag(hitInfo.row, hitInfo.col, hitInfo.sheetArea);
        if (!tag) {
            tag = {
                dropDown: {
                    items: undefined,
                    value: undefined
                }
            }
        }
        var host = sheet.getParent().getHost();
        var offset = {
            top: host.offsetTop,
            left: host.offsetLeft
        }
        this._showDropdown(host, offset, hitInfo.cellRect, tag.dropDown.items || this.ITEMS, tag.dropDown.value, hitInfo);
    }
};
```

该方法从单元格的 Tag 中读取配置数据，然后调用 `_showDropdown` 方法显示下拉框。

### 3.5 动态创建下拉选择器

`_showDropdown` 方法动态创建 HTML `<select>` 元素并定位到列头单元格位置：

```javascript
DrowdownHeaderCellType.prototype._showDropdown = function(host, offset, cellRect, items, value, hitInfo) {
    if (!this._dropdownElement) {
        var span = document.createElement("div");
        span.style.position = "absolute";
        span.style.background = "#EEEEEE";
        span.style.border = "1px solid black";
        span.style.fontSize = "14px";
        host.insertBefore(span, null);
        this._dropdownElement = span;

        var mySelect = document.createElement("select");
        mySelect.id = "mySelect";
        mySelect.style.width = cellRect.width + "px";
        mySelect.style.height = cellRect.height + "px";
        for (var i = 0; i < items.length; i++) {
            mySelect.options.add(new Option(items[i].text, items[i].value));
        }
        if (value) {
            mySelect.value = value;
        }
        span.appendChild(mySelect);

        var self = this;
        mySelect.focus();
        mySelect.addEventListener("blur", function() {
            self._closeDropdown(host);
        });
        mySelect.addEventListener("change", function() {
            console.log(this.value)
            self._setTagValue(this.value, hitInfo);
        });
    }
    var tipElement = this._dropdownElement;
    var spanStyle = tipElement.style;
    spanStyle.top = (offset.top + cellRect.y) + "px";
    spanStyle.left = (offset.left + cellRect.x) + "px";
    spanStyle.width = cellRect.width + "px";
    spanStyle.height = cellRect.height + "px";
};
```

下拉框失去焦点时自动关闭，选择值变化时通过 `_setTagValue` 方法将新值保存到单元格的 Tag 中。

### 3.6 使用 Tag 存储状态

通过 SpreadJS 的 Tag 机制存储列头下拉框的配置和选中值：

```javascript
sheet.getCell(0, 1, GC.Spread.Sheets.SheetArea.colHeader).tag({
    dropDown: {
        items: undefined,  // 可自定义下拉项，undefined 则使用默认 ITEMS
        value: 'value3'    // 初始选中值
    }
})
```

### 3.7 技术栈

- SpreadJS 15.2.0：核心表格控件库
- SystemJS 0.19.22：模块加载器
- TypeScript 4.1.2：类型支持（项目配置）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，可以看到第二列（列 B）的列头右侧有一个下拉箭头图标
2. 点击下拉箭头，会弹出一个下拉选择框
3. 从下拉框中选择不同的选项（text1、text2、text3、text4）
4. 选择后下拉框自动关闭，选中的值会保存在列头单元格的 Tag 中
5. 可以通过浏览器控制台查看选中值的输出

## 五、功能特点

### 5.1 优点

- 扩展了 SpreadJS 列头的交互能力，实现了自定义 UI 组件嵌入
- 使用 Tag 机制实现状态持久化，数据与视图分离
- 通过原型继承复用了 ColumnHeader 的基础功能，代码简洁
- 下拉框位置自动计算，适配不同的单元格尺寸和位置

### 5.2 局限性与扩展建议

- 当前实现使用原生 HTML `<select>` 元素，样式定制能力有限，可以考虑使用第三方 UI 组件库（如 Ant Design、Element UI）替换
- 下拉框的数据源是静态定义的，可以扩展为支持异步加载或动态更新
- 可以添加下拉框值变化的事件回调，实现与其他业务逻辑的联动（如根据选中值过滤数据）

## 六、关键代码片段

### 保存选中值到 Tag

```javascript
DrowdownHeaderCellType.prototype._setTagValue = function(value, hitInfo) {
    var sheet = hitInfo.sheet;
    var tag = sheet.getTag(hitInfo.row, hitInfo.col, hitInfo.sheetArea);
    if (!tag) {
        tag = {
            dropDown: {
                items: undefined,
                value: undefined
            }
        }
    }
    if (!tag.dropDown) {
        tag.dropDown = {}
    }
    tag.dropDown.value = value;
    sheet.setTag(hitInfo.row, hitInfo.col, tag, hitInfo.sheetArea);
}
```

该方法确保 Tag 结构的完整性，然后将选中的值保存到 `tag.dropDown.value` 中。

### 关闭下拉框

```javascript
DrowdownHeaderCellType.prototype._closeDropdown = function(host) {
    if (this._dropdownElement) {
        try {
            host.removeChild(this._dropdownElement);
        } catch {}
        this._dropdownElement = undefined;
    }
};
```

从 DOM 中移除下拉框元素，并清空引用，确保下次点击时重新创建。

## 七、总结

本示例展示了 SpreadJS 自定义单元格类型的高级用法，通过继承 `ColumnHeader` 并重写 `paint`、`getHitInfo`、`processMouseUp` 等核心方法，实现了列头区域的自定义交互功能。

开发者可以从中学到：

1. 如何创建自定义列头单元格类型
2. 使用 Canvas API 绘制自定义 UI 元素
3. 实现鼠标事件的精确捕获和响应
4. 通过 Tag 机制存储和管理单元格状态
5. 动态创建和定位 HTML 元素实现复杂交互

该方案适用于需要在列头进行配置选择、快速筛选等场景，具有良好的扩展性，可以根据实际需求定制下拉框的样式、数据源和交互逻辑。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/LYnDTLXQc0mbsuNXdLKyPA/)）
