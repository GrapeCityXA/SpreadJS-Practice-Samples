## 一、Demo 概述

本示例展示了如何通过继承 SpreadJS 内置的 FileUpload 单元格类型，自定义文件上传单元格的视觉样式。通过重写 `paint` 方法，实现了带圆角、虚线边框、粉色背景和居中文本的自定义上传区域，提升了用户界面的美观性和品牌一致性。 

## 二、解决的问题

* 默认的文件上传单元格样式无法满足特定的 UI 设计需求
* 需要在保留文件上传功能的同时，自定义单元格的外观表现
* 实现更符合业务场景的视觉风格，如特定的颜色、边框和文本提示

## 三、实现思路

### 3.1 继承内置单元格类型

通过原型链继承 `GC.Spread.Sheets.CellTypes.FileUpload`，创建自定义单元格类型 `CustomCellType`，保留原有的文件上传功能：

```javascript
function CustomCellType() {
    this.typeName = "CustomCellType";
}
CustomCellType.prototype = new GC.Spread.Sheets.CellTypes.FileUpload();
```

### 3.2 重写 paint 方法实现自定义绘制

保存原始的 `paint` 方法引用，然后重写该方法以实现自定义样式。当单元格无值时绘制自定义样式，有值时调用原始方法显示文件信息：

```javascript
var oldPaint = GC.Spread.Sheets.CellTypes.FileUpload.prototype.paint;
CustomCellType.prototype.paint = function (ctx, value, x, y, w, h, style, context) {
    if (!ctx) return;
    ctx.save();
    ctx.restore();
    
    if (!value) {
        // 自定义绘制逻辑
        var x = x + 5;
        var y = y + 5;
        var w = w - 10;
        var h = h - 10;
        var r = 15; // 圆角半径
        
        // 绘制圆角矩形路径
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r); // 右上圆角
        ctx.arcTo(x + w, y + h, x, y + h, r); // 右下圆角
        ctx.arcTo(x, y + h, x, y, r); // 左下圆角
        ctx.arcTo(x, y, x + w, y, r); // 左上圆角
        ctx.closePath();
        
        // 填充粉色背景
        ctx.fillStyle = "pink";
        ctx.fill();
        
        // 绘制灰色虚线边框
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'gray';
        ctx.setLineDash([10, 5]); // 虚线样式
        ctx.stroke();
        
        // 绘制居中文本
        ctx.font = '20px simsun';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const textX = x + w / 2;
        const textY = y + h / 2;
        ctx.fillText('点击上传文件', textX, textY);
    } else {
        // 有文件时使用原始绘制方法
        oldPaint.apply(this, [ctx, value, x, y, w, h, style, context]);
    }
};
```

### 3.3 应用自定义单元格类型

创建自定义单元格类型实例并应用到指定单元格，同时设置合适的行高和列宽：

```javascript
var customCellType = new CustomCellType();
sheet.setCellType(1, 1, customCellType);
sheet.setColumnWidth(1, 400);
sheet.setRowHeight(1, 200);
```

### 3.4 技术栈

* SpreadJS 17.1.10（核心表格组件）
* SpreadJS Designer 17.1.10（设计器组件）
* SystemJS 0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，在 B2 单元格（第 1 行第 1 列）可以看到自定义样式的文件上传区域
2. 点击该单元格，会触发文件选择对话框
3. 选择文件后，单元格会显示文件信息（使用原始样式）
4. 清空单元格内容后，会重新显示自定义的上传样式

## 五、功能特点

### 5.1 优点

* 完全保留了 FileUpload 单元格的原有功能
* 通过 Canvas API 实现了高度自定义的视觉效果
* 代码结构清晰，易于扩展和修改样式参数
* 支持空值和有值两种状态的不同展示方式

### 5.2 局限性与扩展建议

* 当前样式参数（颜色、圆角、虚线样式等）硬编码在代码中，可以考虑通过构造函数参数或配置对象传入
* 可以添加更多交互状态的样式，如 hover、focus 等
* 文本内容可以支持国际化配置

## 六、关键代码片段

Canvas 圆角矩形绘制的核心逻辑：

```javascript
// 使用 arcTo 方法绘制圆角
ctx.beginPath();
ctx.moveTo(x + r, y); // 起始点：左上角右侧
ctx.arcTo(x + w, y, x + w, y + h, r); // 右上圆角
ctx.arcTo(x + w, y + h, x, y + h, r); // 右下圆角
ctx.arcTo(x, y + h, x, y, r); // 左下圆角
ctx.arcTo(x, y, x + w, y, r); // 左上圆角
ctx.closePath();
```

虚线边框的设置方法：

```javascript
ctx.lineWidth = 2;
ctx.strokeStyle = 'gray';
ctx.setLineDash([10, 5]); // 第一个参数为虚线长度，第二个为间隔
ctx.stroke();
```

## 七、总结

本示例展示了 SpreadJS 单元格类型的扩展能力，开发者可以学到：

* 如何通过原型链继承内置单元格类型
* 如何重写 `paint` 方法实现自定义渲染
* Canvas API 的基础绘图技巧（圆角矩形、虚线、文本居中）
* 如何在保留原有功能的基础上增强视觉效果

该方案适用于需要自定义单元格外观但保留内置功能的场景，具有良好的可扩展性，可以应用到其他单元格类型的样式定制中。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
