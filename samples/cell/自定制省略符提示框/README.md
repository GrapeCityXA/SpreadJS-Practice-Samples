## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现自定义的省略符提示框功能。当单元格内容因宽度限制而显示省略号时，鼠标悬停在单元格上会显示一个自定义的提示框，展示完整的单元格内容。该功能通过继承 SpreadJS 的 Text 单元格类型并重写其绘制和鼠标事件处理方法来实现。

## 二、解决的问题

在实际应用中，单元格内容经常会因为列宽限制而无法完整显示，系统默认会显示省略号。虽然 SpreadJS 提供了内置的 tooltip 功能，但在某些场景下，开发者可能需要：

- 自定义提示框的样式和位置
- 控制提示框的显示时机和条件
- 实现更灵活的交互效果

本示例通过自定义单元格类型，实现了完全可控的省略符提示框功能。

## 三、实现思路

### 3.1 自定义单元格类型

通过继承 `GC.Spread.Sheets.CellTypes.Text` 创建自定义单元格类型，这是实现自定义行为的基础：

```javascript
function CustomEllipsisCellType() { }
CustomEllipsisCellType.prototype = new GC.Spread.Sheets.CellTypes.Text();
```

### 3.2 重写绘制方法

重写 `paint` 方法，在单元格绘制时判断是否需要显示提示框：

```javascript
CustomEllipsisCellType.prototype.paint = function (ctx, value, x, y, width, height, style, context) {
    // 调用父类绘制方法
    GC.Spread.Sheets.CellTypes.Text.prototype.paint.apply(this, arguments);
    
    // 判断是否需要显示省略号
    if (this._mouseEnter && this.isEllipsisNeeded(context.row, context.col, context.sheet)) {
        // 创建自定义 tooltip
        var tooltip = document.createElement("div");
        tooltip.style.position = "absolute";
        tooltip.style.background = "#fff";
        tooltip.style.border = "1px solid #ccc";
        tooltip.style.padding = "4px 8px";
        tooltip.style.zIndex = "9999";
        tooltip.innerHTML = value;
        
        // 设置 tooltip 位置
        var rect = context.sheet.getCellRect(context.row, context.col);
        tooltip.style.left = (rect.width + x + 20) + "px";
        tooltip.style.top = (rect.height + y + 20) + "px";
        
        document.body.appendChild(tooltip);
        this._tooltip = tooltip;
    }
};
```

### 3.3 判断是否需要显示省略号

通过 `getAutoFitWidth` 方法计算内容所需宽度，与实际单元格宽度对比：

```javascript
CustomEllipsisCellType.prototype.isEllipsisNeeded = function (row, col, sheet) {
    let instance = new GC.Spread.Sheets.CellTypes.Text();
    let needWidth = instance.getAutoFitWidth(
        sheet.getValue(row, col),
        sheet.getText(row, col),
        sheet.getActualStyle(row, col),
        sheet.zoom(),
        {
            "sheet": sheet,
            "row": row,
            "col": col,
            "sheetArea": GC.Spread.Sheets.SheetArea.viewport
        }
    );
    let cellWidth = sheet.getCellRect(row, col).width;
    return needWidth >= cellWidth;
};
```

### 3.4 鼠标事件处理

实现鼠标进入和离开事件，控制提示框的显示和隐藏：

```javascript
CustomEllipsisCellType.prototype.processMouseEnter = function (hitInfo) {
    this._mouseEnter = true;
    hitInfo.sheet.repaint();
};

CustomEllipsisCellType.prototype.processMouseLeave = function (hitInfo) {
    this._mouseEnter = false;
    if (this._tooltip) {
        this._tooltip.remove();
        this._tooltip = null;
    }
    hitInfo.sheet.repaint();
};
```

### 3.5 技术栈

- SpreadJS 17.0.8：核心表格组件
- SystemJS 0.19.22：模块加载器
- systemjs-plugin-babel 0.0.25：ES6 转译支持

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，可以看到单元格 B2 中显示了一段较长的文本
2. 由于列宽限制，文本末尾会显示省略号
3. 将鼠标悬停在该单元格上，会在单元格右侧显示一个白色背景的提示框
4. 提示框中显示完整的单元格内容
5. 移开鼠标后，提示框自动消失

## 五、功能特点

### 5.1 优点

- 完全自定义的提示框样式，可以根据需求调整外观
- 智能判断是否需要显示提示框，避免不必要的显示
- 提示框位置可控，可以根据单元格位置动态调整
- 实现简洁，易于扩展和维护

### 5.2 局限性与扩展建议

当前实现存在以下局限性：

- 提示框位置固定在单元格右侧，可能在边界位置显示不全
- 提示框样式硬编码在代码中，不够灵活

扩展建议：

- 添加边界检测，当提示框超出视口时自动调整位置
- 将提示框样式配置化，支持通过参数自定义
- 支持多行文本的格式化显示
- 添加动画效果，提升用户体验

## 六、关键代码片段

### 6.1 应用自定义单元格类型

```javascript
// 设置单元格样式，启用省略号显示
let style = new GC.Spread.Sheets.Style();
style.showEllipsis = true;
sheet.setStyle(1, 1, style);

// 创建并应用自定义单元格类型
let customCellType = new CustomEllipsisCellType();
sheet.getCell(1, 1).cellType(customCellType);

// 设置单元格值
sheet.setValue(1, 1, "你的童年我的童年好像都一样，小小肩膀大大书包上呀上学堂");
```

### 6.2 获取命中信息

```javascript
CustomEllipsisCellType.prototype.getHitInfo = function (x, y, style, cellRect, context) {
    if (context) {
        return {
            x: x,
            y: y,
            row: context.row,
            col: context.col,
            cellRect: cellRect,
            cellStyle: style,
            sheetArea: context.sheetArea,
            isReservedLocation: false,
            sheet: context.sheet,
            context: context
        };
    }
};
```

## 七、总结

本示例展示了如何通过继承 SpreadJS 的内置单元格类型来实现自定义的交互功能。开发者可以从中学到：

- 自定义单元格类型的创建方法
- 重写单元格绘制和事件处理方法
- 使用 `getAutoFitWidth` 方法计算内容宽度
- 动态创建和管理 DOM 元素
- 单元格样式和属性的设置方法

该方案适用于需要自定义单元格交互行为的场景，具有良好的扩展性。通过类似的方法，开发者可以实现更多自定义的单元格功能，如自定义编辑器、自定义渲染效果等。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/zSvU1PjW60qutYvIc02BJg/)）
