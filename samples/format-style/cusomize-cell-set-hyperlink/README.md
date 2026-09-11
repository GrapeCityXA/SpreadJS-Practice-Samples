## 一、Demo 概述

本示例展示了如何在 SpreadJS 中创建自定义单元格类型，实现在单元格中同时显示格式化数值、文本标记、可点击超链接以及上下标文本的功能。通过继承 `CellTypes.Text` 并重写绘制方法，实现了复杂的单元格内容布局和交互效果。

该示例适用于需要在单元格中展示多种信息元素的场景，例如财务报表中的注释标记、数据来源链接、单位说明等。

## 二、解决的问题

* **多元素混合显示**：在单元格中同时展示数值、文本标记、超链接和上下标，满足复杂的数据展示需求
* **可交互超链接**：实现单元格内部分区域可点击跳转到指定单元格或自定义名称位置
* **自定义布局控制**：精确控制各元素的位置、样式和对齐方式，实现专业的视觉效果

## 三、实现思路

### 3.1 自定义单元格类型

通过继承 `GC.Spread.Sheets.CellTypes.Text` 创建自定义单元格类型 `ShowTagCellType`，重写关键方法实现自定义渲染和交互逻辑：

```javascript
function ShowTagCellType() {
    this.typeName = "ShowTagCellType";
    this._cellTagStartCache = undefined
    this._cellTagEndCache = undefined
    this._textWidth = undefined
    this._textHeight = undefined
}

ShowTagCellType.prototype = new GC.Spread.Sheets.CellTypes.Text();
```

### 3.2 自定义绘制逻辑

重写 `paintContent` 方法，实现多元素的分段绘制。通过 `tag` 属性存储元素配置，按顺序绘制文本标记、超链接、数值和上下标：

```javascript
ShowTagCellType.prototype.paintContent = function (ctx, value, x, y, w, h, style, context) {
    var tag = context.sheet.getTag(context.row, context.col);
    if (tag == '' || tag == null || tag === undefined) {
        GC.Spread.Sheets.CellTypes.Text.prototype.paintContent.call(this, ctx, value, x, y, w, h, style, context)
        return;
    }
    
    // 绘制前置标记和超链接
    for (var i = 0; i < tag.cellTagStart.length; i++) {
        var node = tag.cellTagStart[i];
        if (node.type === 'text') {
            // 绘制普通文本
            style.foreColor = foreColor
            style.textDecoration = textDecoration
            GC.Spread.Sheets.CellTypes.Text.prototype.paintContent.call(this, ctx, cellText, x + startTextWidth, y, w - startTextWidth, h, style, context)
        }
        else if (node.type === 'link') {
            // 绘制超链接（蓝色下划线）
            style.foreColor = "blue"
            style.textDecoration = GC.Spread.Sheets.TextDecorationType.underline;
            GC.Spread.Sheets.CellTypes.Text.prototype.paintContent.call(this, ctx, linkText, x + startTextWidth + 2, y, w - startTextWidth, h, style, context)
        }
    }
    
    // 绘制上下标
    if (tag.cellTagEnd) {
        style.vAlign = GC.Spread.Sheets.VerticalAlign.bottom;
        GC.Spread.Sheets.CellTypes.Text.prototype.paintContent.call(this, ctx, supText, x + w - endTextWidth - 5, y, endTextWidth + 5, h / 2, style, context)
        
        style.vAlign = GC.Spread.Sheets.VerticalAlign.top;
        GC.Spread.Sheets.CellTypes.Text.prototype.paintContent.call(this, ctx, subText, x + w - endTextWidth - 5, y + h / 2, endTextWidth + 5, h / 2, style, context)
    }
    
    // 绘制主数值（加粗右对齐）
    style.font = "bold " + style.font
    style.hAlign = GC.Spread.Sheets.HorizontalAlign.right;
    GC.Spread.Sheets.CellTypes.Text.prototype.paintContent.call(this, ctx, value, x, y, w - endTextWidth - 3, h, style, context)
};
```

### 3.3 超链接交互实现

通过重写 `getHitInfo`、`processMouseUp` 和 `processMouseMove` 方法实现超链接的点击和悬停效果：

```javascript
ShowTagCellType.prototype.getHitInfo = function (x, y, cellStyle, cellRect, context) {
    var info = { x: x, y: y, row: context.row, col: context.col, cellRect: cellRect, sheetArea: context.sheetArea, isReservedLocation: false, reservedLocation: -1 };
    
    // 检测鼠标是否在超链接区域
    for (var i = 0; i < this._cellTagStartCache.length; i++) {
        var item = this._cellTagStartCache[i];
        if (item) {
            var startX = item.startX;
            if (x - startX > 0 && x < startX + item.textWidth) {
                info.isReservedLocation = true;
                info.reservedLocation = i;
                break;
            }
        }
    }
    return info;
};

ShowTagCellType.prototype.processMouseUp = function (hitInfo) {
    var sheet = hitInfo.sheet, self = this;
    if (sheet && hitInfo.isReservedLocation && hitInfo.reservedLocation >= 0) {
        setTimeout(function () {
            var expStr = self._cellTagStartCache[hitInfo.reservedLocation].formula;
            var range = GC.Spread.Sheets.CalcEngine.formulaToRange(sheet, expStr, 0, 0);
            sheet.setActiveCell(range.row, range.col);
            sheet.showCell(range.row, range.col, GC.Spread.Sheets.VerticalPosition.top, GC.Spread.Sheets.HorizontalPosition.left);
        }, 10);
        return true;
    }
    return false;
};

ShowTagCellType.prototype.processMouseMove = function (hitInfo) {
    var canvas = div.querySelector("#" + canvasId);
    if (sheet && hitInfo.isReservedLocation) {
        canvas.style.cursor = 'pointer';
        return true;
    } else {
        canvas.style.cursor = 'default';
    }
    return false;
};
```

### 3.4 自定义名称支持

支持超链接指向自定义名称，通过 `getFormulaFromCustomerName` 方法将自定义名称转换为单元格引用：

```javascript
ShowTagCellType.prototype.getFormulaFromCustomerName = function (sheet, customName) {
    var nameInfo = sheet.getCustomName(customName);
    var expression = nameInfo.getExpression();
    var expStr = GC.Spread.Sheets.CalcEngine.expressionToFormula(sheet, expression, 0, 0);
    var range = GC.Spread.Sheets.CalcEngine.formulaToRange(sheet, expStr, 0, 0);
    expStr = GC.Spread.Sheets.CalcEngine.rangeToFormula(range, 0, 0, GC.Spread.Sheets.CalcEngine.RangeReferenceRelative.allRelative, false)
    return expStr;
}
```

### 3.5 自动适应宽高

重写 `getAutoFitWidth` 和 `getAutoFitHeight` 方法，确保单元格能够自动调整大小以容纳所有内容：

```javascript
ShowTagCellType.prototype.getAutoFitWidth = function (value, text, cellStyle, zoomFactor, context) {
    if (this._textWidth) {
        cellStyle.font = "bold " + cellStyle.font
        return 5 + this._textWidth + GC.Spread.Sheets.CellTypes.Text.prototype.getAutoFitWidth.call(this, value, text, cellStyle, zoomFactor, context);
    } else
        return GC.Spread.Sheets.CellTypes.Text.prototype.getAutoFitWidth.call(this, value, text, cellStyle, zoomFactor, context)
}

ShowTagCellType.prototype.getAutoFitHeight = function (value, text, cellStyle, zoomFactor, context) {
    if (this._textHeight) {
        return this._textHeight;
    }
    else {
        return GC.Spread.Sheets.CellTypes.Text.prototype.getAutoFitHeight.call(this, value, text, cellStyle, zoomFactor, context)
    }
}
```

### 3.6 技术栈

* SpreadJS 15.2.0 — 核心表格控件
* TypeScript 4.1.2 — 类型支持
* SystemJS 0.19.22 — 模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行示例。

### 4.2 操作步骤

1. 打开页面后，可以看到 B2 和 B3 单元格显示了自定义格式的内容
2. 单元格左侧显示文本标记和蓝色超链接
3. 中间显示格式化的数值（货币格式）
4. 右上角显示上标文本，右下角显示下标文本
5. 鼠标悬停在超链接上时，光标变为手型
6. 点击超链接可跳转到对应的单元格位置

## 五、功能特点

### 5.1 优点

* **高度灵活**：通过 tag 配置可以自由组合文本、超链接和上下标元素
* **交互友好**：超链接支持悬停提示和点击跳转，用户体验良好
* **自动布局**：支持自动计算宽高，适应不同内容长度
* **样式可控**：可以独立设置各元素的颜色、字体和对齐方式

### 5.2 局限性与扩展建议

* **垂直对齐固定**：当前实现强制单元格垂直居中，如需支持其他对齐方式需要修改绘制逻辑
* **性能考虑**：大量使用自定义单元格类型时，建议缓存计算结果以提升性能
* **扩展方向**：可以增加更多元素类型（如图标、徽章），或支持多行布局

## 六、总结

本示例展示了 SpreadJS 自定义单元格类型的强大能力，通过继承基础单元格类型并重写关键方法，可以实现复杂的单元格内容布局和交互效果。开发者可以从中学到：

* 如何创建自定义单元格类型并重写绘制方法
* 如何在单元格中实现多元素混合布局
* 如何处理单元格内部的鼠标交互事件
* 如何使用 SpreadJS 的公式引擎 API 处理单元格引用
* 如何实现自动适应宽高的自定义单元格

该方案适用于需要在单元格中展示复杂信息结构的场景，具有良好的扩展性和可维护性。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
