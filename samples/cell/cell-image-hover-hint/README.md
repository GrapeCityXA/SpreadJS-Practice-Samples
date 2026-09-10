## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现自定义单元格类型，在单元格中显示图标，并在鼠标悬停时显示动态提示信息。该示例实现了两种自定义单元格类型：一种是在单元格右侧显示单个警告图标，另一种是显示多个图标并支持鼠标悬停时显示对应图标的详细信息。 

## 二、解决的问题

* 在单元格中嵌入图标，提供视觉化的状态提示
* 实现鼠标悬停时的动态提示框，增强用户交互体验
* 支持单元格内多个图标的独立交互，每个图标可显示不同的提示信息
* 提供可扩展的自定义单元格类型实现方案

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 自定义单元格类型基础

通过继承 SpreadJS 的内置单元格类型来创建自定义单元格类型。示例中创建了两种自定义类型：

```javascript
// 警告单元格类型 - 显示单个图标
var WarningCellType = function (icon) {
    this.icon = icon
}
WarningCellType.prototype = new GC.Spread.Sheets.CellTypes.Text();

// 多图标单元格类型 - 支持多个图标和独立提示
var IconCellType = function (icon, count, infos) {
    this.icon = icon;
    this.count = count;
    this.Infos = infos
}
IconCellType.prototype = new GC.Spread.Sheets.CellTypes.Base();
```

#### 3.1.2 自定义绘制逻辑

重写 `paint` 方法实现图标的绘制。WarningCellType 在单元格右侧绘制单个图标：

```javascript
WarningCellType.prototype.paint = function (ctx, value, x, y, w, h, style, context) {
    // 先绘制文本内容
    GC.Spread.Sheets.CellTypes.Text.prototype.paint.call(this, ctx, value, x, y, w, h, style, context);
    // 在右侧绘制图标
    ctx.drawImage(this.icon, x + w - h + 3, y + 3, h - 6, h - 6);
}
```

IconCellType 支持绘制多个图标：

```javascript
IconCellType.prototype.paint = function (ctx, value, x, y, w, h, style, context) {
    GC.Spread.Sheets.CellTypes.Text.prototype.paint.call(this, ctx, value, x, y, w, h, style, context);
    // 循环绘制多个图标
    for (var i = 1; i <= this.count; i++) {
        ctx.drawImage(this.icon, x + w - (h - 3) * i, y + 3, h - 6, h - 6);
    }
}
```

#### 3.1.3 鼠标位置检测

通过 `getHitInfo` 方法计算鼠标悬停在哪个图标上：

```javascript
IconCellType.prototype.getHitInfo = function (x, y, cellStyle, cellRect, context) {
    // 计算鼠标位置对应的图标索引
    var index = x - (cellRect.x + cellRect.width - (cellRect.height - 3) * this.count) > 0 ?
        Math.floor((x - (cellRect.x + cellRect.width - (cellRect.height - 3) * this.count)) / (cellRect.height - 3)) :
        -1;
    return {
        x: x,
        y: y,
        row: context.row,
        col: context.col,
        cellStyle: cellStyle,
        cellRect: cellRect,
        sheetArea: context.sheetArea,
        reservedLocationIndex: index  // 图标索引
    };
}
```

#### 3.1.4 动态提示框实现

通过 `processMouseMove` 和 `processMouseLeave` 方法实现提示框的显示和隐藏：

```javascript
IconCellType.prototype.processMouseMove = function (hitinfo) {
    if (hitinfo.reservedLocationIndex >= 0) {
        if (this._toolTipElement) {
            // 更新已存在的提示框
            $(this._toolTipElement).text("move in " + hitinfo.reservedLocationIndex + " and Info is" + this.Infos[hitinfo.reservedLocationIndex])
                .css("top", hitinfo.y + 15)
                .css("left", hitinfo.x + 15);
        } else {
            // 创建新的提示框
            var div = document.createElement("div");
            $(div).css("position", "absolute")
                .css("border", "1px #C0C0C0 solid")
                .css("box-shadow", "1px 2px 5px rgba(0,0,0,0.4)")
                .css("font", "9pt Arial")
                .css("background", "white")
                .css("padding", 5);
            
            this._toolTipElement = div;
            $(this._toolTipElement).text("Cell [R:" + hitinfo.row + "] : [C:" + hitinfo.col + "]")
                .css("top", hitinfo.y + 15)
                .css("left", hitinfo.x + 15);
            $(this._toolTipElement).hide();
            document.body.insertBefore(this._toolTipElement, null);
            $(this._toolTipElement).show("fast");
        }
    } else {
        // 鼠标移出图标区域，移除提示框
        if (this._toolTipElement) {
            document.body.removeChild(this._toolTipElement);
            this._toolTipElement = null;
        }
    }
};

IconCellType.prototype.processMouseLeave = function (hitinfo) {
    if (this._toolTipElement) {
        document.body.removeChild(this._toolTipElement);
        this._toolTipElement = null;
    }
};
```

#### 3.1.5 应用自定义单元格类型

```javascript
// 创建图标对象（使用 Base64 编码的图片）
var img = new Image();
img.src = 'data:img/jpg;base64,iVBORw0KGgo...';
img.onload = function () {
    sheet.repaint();
}

// 应用 WarningCellType
sheet.getCell(1, 1).value(22).cellType(new WarningCellType(img)).hAlign(0);

// 应用 IconCellType，显示 3 个图标，每个图标对应不同的提示信息
sheet.getCell(2, 1).cellType(new IconCellType(img, 3, ["First", "Second", "Third"]));
```

### 3.2 技术栈

* SpreadJS 15.0.0 - 核心表格组件
* jQuery 3.6.1 - DOM 操作和动画效果
* TypeScript 4.1.2 - 类型支持
* SystemJS - 模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，可以看到两个单元格包含图标
2. 第一个单元格（B2）显示数值 22 和一个警告图标
3. 第二个单元格（B3）显示三个图标
4. 将鼠标悬停在第二个单元格的图标上，会显示对应的提示信息
5. 鼠标移出图标区域，提示框自动消失

## 五、功能特点

### 5.1 优点

* 实现了灵活的自定义单元格类型扩展机制
* 支持单元格内多个交互元素的独立响应
* 提示框样式可自定义，支持动画效果
* 图标使用 Base64 编码，无需额外的图片资源请求

### 5.2 局限性与扩展建议

* 当前提示框位置固定在鼠标右下方，可能在边界位置显示不全，建议增加边界检测和自动调整位置的逻辑
* 图标大小与单元格高度绑定，可以扩展为支持自定义图标尺寸
* 可以进一步扩展为支持不同类型的图标（如不同颜色、形状）
* 提示框内容目前为纯文本，可以扩展为支持 HTML 富文本内容

## 六、总结

本示例展示了 SpreadJS 自定义单元格类型的强大扩展能力。通过继承内置单元格类型并重写关键方法，开发者可以实现丰富的交互效果。该方案适用于需要在单元格中显示状态图标、操作按钮或其他自定义 UI 元素的场景。

开发者可以从中学到：

* 如何创建自定义单元格类型
* 如何使用 Canvas API 在单元格中绘制自定义内容
* 如何实现鼠标交互和位置检测
* 如何动态创建和管理 DOM 元素作为提示框
* 如何处理图片加载和单元格重绘

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
