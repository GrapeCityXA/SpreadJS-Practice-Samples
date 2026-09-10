## 一、Demo 概述

本示例展示了如何在 SpreadJS 中创建自定义单元格类型，实现在单个单元格内渲染多个可交互按钮的功能。通过继承 `CellTypes.Base` 基类并重写关键方法，开发者可以完全自定义单元格的渲染逻辑和交互行为。该示例在一个单元格中绘制了三个橙色按钮，每个按钮显示不同的数值，点击不同按钮会触发不同的响应事件。 

## 二、解决的问题

* 在表格单元格中实现复杂的自定义 UI 组件，突破标准单元格类型的限制
* 在单个单元格内集成多个可交互元素，提升空间利用率
* 实现精确的鼠标点击区域检测，支持单元格内的多区域交互
* 为业务场景提供灵活的自定义渲染能力，如操作按钮组、状态指示器等

## 三、实现思路

### 3.1 自定义单元格类型定义

通过继承 `GC.Spread.Sheets.CellTypes.Base` 创建自定义单元格类型，并定义按钮的基本属性：

```javascript
function FivePointedStarCellType() {
    this.texts = ["1532.1", "233", "5555"];  // 三个按钮的文本内容
    this._color = "orange";                   // 按钮背景色
    this._margin = 10;                        // 按钮间距
}
FivePointedStarCellType.prototype = new spreadNS.CellTypes.Base();
```

### 3.2 自定义渲染逻辑

重写 `paint` 方法实现自定义绘制，使用 Canvas API 在单元格中绘制三个按钮：

```javascript
FivePointedStarCellType.prototype.paint = function(ctx, value, x, y, w, h, style, options) {
    if (!ctx) {
        return;
    }
    ctx.save();
    var width = (w - 60) / 3;   // 计算每个按钮的宽度
    var height = (h - 60) / 3;  // 计算按钮高度
    var texts = this.texts;
    
    // 绘制三个矩形按钮
    for (var i = 0; i < texts.length; i++) {
        ctx.rect(x + this._margin * (i + 1) + width * (i), y + this._margin, width, height);
        ctx.fillStyle = this._color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fill();
    }

    // 在按钮上绘制文本
    for (var i = 0; i < texts.length; i++) {
        ctx.fillStyle = "black";
        ctx.font = "20px 宋体";
        ctx.fillText(texts[i], x + this._margin * (i + 1) + width * (i) + width / 2, 
                     y + this._margin + height / 2);
    }
};
```

### 3.3 点击区域检测

重写 `getHitInfo` 方法实现精确的点击区域判断，识别用户点击了哪个按钮：

```javascript
FivePointedStarCellType.prototype.getHitInfo = function(x, y, cellStyle, cellRect, context) {
    var info = {
        x: x,
        y: y,
        row: context.row,
        col: context.col,
        cellRect: cellRect,
        sheetArea: context.sheetArea,
        isReservedLocation: false,
        reservedLocation: -1  // 用于标识点击的按钮索引
    };
    
    var width = (cellRect.width - 60) / 3;
    var height = (cellRect.height - 60) / 3;
    var margin = this._margin;
    var startx = cellRect.x;
    var starty = cellRect.y;
    
    // 遍历三个按钮区域，判断点击位置
    for (var i = 0; i < texts.length; i++) {
        if ((startx + margin * (i + 1) + width * i) <= x && 
            x <= (startx + margin * (i + 1) + width * (i + 1))) {
            if (starty + margin <= y && y <= (starty + margin + width)) {
                info.reservedLocation = i + 1;  // 记录点击的按钮编号
            }
        }
    }
    return info;
};
```

### 3.4 鼠标事件处理

重写 `processMouseDown` 方法处理点击事件，根据 `reservedLocation` 执行不同的业务逻辑：

```javascript
FivePointedStarCellType.prototype.processMouseDown = function(hitInfo) {
    if (hitInfo.reservedLocation == 1) {
        alert("first button");
    }
    if (hitInfo.reservedLocation == 2) {
        alert("second button");
    }
    if (hitInfo.reservedLocation == 3) {
        alert("third button");
    }
};
```

### 3.5 应用自定义单元格类型

在工作表初始化时，将自定义单元格类型应用到指定单元格：

```javascript
function initSpread(spread) {
    var sheet = spread.getSheet(0);
    sheet.suspendPaint();
    sheet.setColumnWidth(0, 400);   // 设置列宽以容纳三个按钮
    sheet.setRowHeight(0, 200);     // 设置行高
    var b1 = new FivePointedStarCellType();
    sheet.setCellType(0, 0, b1, GC.Spread.Sheets.SheetArea.viewport);
    sheet.resumePaint();
}
```

### 3.6 技术栈

* SpreadJS 15.0.0：核心表格控件库
* SystemJS 0.19.22：模块加载器
* TypeScript 4.1.2：开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，可以看到第一个单元格（A1）中显示三个橙色按钮
2. 每个按钮上分别显示数值："1532.1"、"233"、"5555"
3. 点击第一个按钮，弹出提示 "first button"
4. 点击第二个按钮，弹出提示 "second button"
5. 点击第三个按钮，弹出提示 "third button"

## 五、功能特点

### 5.1 优点

* 完全自定义的渲染能力：通过 Canvas API 可以绘制任意复杂的 UI 元素
* 精确的交互控制：通过 `getHitInfo` 实现像素级的点击区域检测
* 高度可扩展：可以轻松修改按钮数量、样式、文本内容和交互逻辑
* 性能优化：使用 `suspendPaint` 和 `resumePaint` 避免不必要的重绘

### 5.2 局限性与扩展建议

* 当前实现使用固定的按钮数量和布局，可以改进为通过构造函数参数动态配置
* 按钮样式较为简单，可以增加悬停效果、按下状态等视觉反馈
* 可以扩展支持更多鼠标事件（如 `processMouseMove`、`processMouseUp`）实现更丰富的交互
* 建议将按钮文本和回调函数作为配置项传入，提高组件的通用性

## 六、总结

本示例展示了 SpreadJS 自定义单元格类型的核心开发模式，开发者可以学到：

* 如何继承 `CellTypes.Base` 创建自定义单元格类型
* 使用 Canvas API 实现自定义渲染逻辑
* 通过 `getHitInfo` 实现复杂的点击区域检测
* 处理自定义单元格的鼠标交互事件
* 在单元格内实现多个可交互元素的布局和事件分发

该方案适用于需要在表格单元格中嵌入自定义控件的场景，如操作按钮组、评分组件、状态指示器等，具有很强的扩展性和实用价值。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
