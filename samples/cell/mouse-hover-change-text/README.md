## 一、Demo 概述

本示例展示了如何通过自定义单元格类型（Custom Cell Type）实现鼠标悬浮时动态改变单元格显示文字的功能。当鼠标移入单元格时，单元格会显示存储在 Tag 中的备用文本，并改变文字颜色为红色；鼠标移出后恢复原始显示。这种交互方式适用于需要在不改变单元格实际值的情况下，临时展示额外信息的场景，例如显示提示信息、备注内容或翻译文本等。 

## 二、解决的问题

* **临时信息展示**：在不修改单元格实际数据的前提下，通过鼠标悬浮展示额外信息
* **交互式数据查看**：提供更友好的用户交互体验，避免单元格内容过于拥挤
* **视觉反馈增强**：通过颜色变化和文本切换，让用户清晰感知到交互状态

## 三、实现思路

### 3.1 自定义单元格类型

通过继承 `GC.Spread.Sheets.CellTypes.Text` 创建自定义单元格类型，重写关键方法以实现鼠标交互功能：

```javascript
function customCellType() { }

customCellType.prototype = new GC.Spread.Sheets.CellTypes.Text()
```

### 3.2 重写 paint 方法实现动态渲染

在 `paint` 方法中根据鼠标状态动态改变显示内容和样式：

```javascript
customCellType.prototype.paint = function (ctx, value, x, y, width, height, style, context) {
    if (this._mouseEnter) {
        let tag = context.sheet.getTag(context.row, context.col)
        if (tag) {
            arguments[1] = tag  // 替换显示值为 Tag 内容
            let style = new GC.Spread.Sheets.Style()
            style.foreColor = "red"  // 设置文字颜色为红色
            arguments[6] = style
        }
    }
    GC.Spread.Sheets.CellTypes.Text.prototype.paint.apply(this, arguments);
}
```

### 3.3 实现鼠标事件处理

通过 `getHitInfo`、`processMouseEnter` 和 `processMouseLeave` 方法处理鼠标交互：

```javascript
// 获取单元格匹配信息
customCellType.prototype.getHitInfo = function (x, y, cellStyle, cellRect, context) {
    if (context) {
        return {
            x: x,
            y: y,
            row: context.row,
            col: context.col,
            cellRect: cellRect,
            cellStyle: cellStyle,
            sheetArea: context.sheetArea,
            isReservedLocation: true,
            sheet: context.sheet,
            context: context
        };
    }
    return null;
}

// 鼠标进入
customCellType.prototype.processMouseEnter = function (hitInfo) {
    this._mouseEnter = true;
    let sheet = hitInfo.sheet;
    sheet.repaint(new GC.Spread.Sheets.Rect(hitInfo.cellRect.x, hitInfo.cellRect.y, hitInfo.cellRect.width, hitInfo.cellRect.height));
}

// 鼠标离开
customCellType.prototype.processMouseLeave = function (hitInfo) {
    this._mouseEnter = false;
    let sheet = hitInfo.sheet;
    sheet.repaint(new GC.Spread.Sheets.Rect(hitInfo.cellRect.x, hitInfo.cellRect.y, hitInfo.cellRect.width, hitInfo.cellRect.height));
}
```

### 3.4 应用自定义单元格类型

将自定义单元格类型应用到整个工作表，并设置单元格的值和 Tag：

```javascript
let sheet = spread.getActiveSheet()
sheet.getRange(-1, -1, -1, -1).cellType(new customCellType())  // 应用到所有单元格
sheet.setValue(0, 0, 'Hello')  // 设置显示值
sheet.setTag(0, 0, "123")  // 设置 Tag 作为悬浮时的显示内容
```

### 3.5 技术栈

* SpreadJS 16.0.1
* SystemJS 0.19.22
* TypeScript 4.1.2

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，可以看到 A1 单元格显示 "Hello"
2. 将鼠标移入 A1 单元格
3. 观察单元格文字变为 "123"（Tag 中存储的值），颜色变为红色
4. 将鼠标移出 A1 单元格
5. 单元格恢复显示 "Hello"，颜色恢复默认

## 五、功能特点

### 5.1 优点

* **非侵入式**：不修改单元格实际数据，通过 Tag 存储额外信息
* **高度可定制**：可以自由控制悬浮时的显示内容、样式和交互逻辑
* **性能优化**：仅重绘当前单元格区域，避免全表刷新
* **易于扩展**：可以在此基础上添加更多交互效果，如工具提示、动画等

### 5.2 局限性与扩展建议

* **当前实现仅支持文本替换**：可以扩展为支持图标、图片或富文本显示
* **样式固定为红色**：可以将样式配置化，支持通过参数自定义颜色、字体等
* **建议扩展**：可以结合 Tooltip 功能，在悬浮时显示更丰富的信息面板

## 六、关键代码片段

### 状态管理与重绘机制

通过 `_mouseEnter` 标志位管理鼠标状态，并使用 `sheet.repaint()` 触发局部重绘：

```javascript
customCellType.prototype.processMouseEnter = function (hitInfo) {
    this._mouseEnter = true;  // 设置鼠标进入状态
    let sheet = hitInfo.sheet;
    // 仅重绘当前单元格区域，提升性能
    sheet.repaint(new GC.Spread.Sheets.Rect(hitInfo.cellRect.x, hitInfo.cellRect.y, hitInfo.cellRect.width, hitInfo.cellRect.height));
}
```

## 七、总结

本示例展示了 SpreadJS 自定义单元格类型的强大能力，通过重写 `paint`、`getHitInfo`、`processMouseEnter` 和 `processMouseLeave` 方法，实现了鼠标悬浮时的动态文本切换和样式变化。开发者可以从中学到：

1. 如何继承和扩展 SpreadJS 内置单元格类型
2. 自定义单元格类型的核心方法及其作用
3. 鼠标事件处理和局部重绘机制
4. 使用 Tag 存储额外数据的技巧

该方案适用于需要在表格中提供临时信息展示、交互式数据查看等场景，具有良好的扩展性和实用价值。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
