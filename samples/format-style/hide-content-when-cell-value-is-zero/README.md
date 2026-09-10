## 一、Demo 概述

本示例演示了如何在 SpreadJS 中实现当单元格内容为数字 0 时自动隐藏显示的功能。通过重写单元格类型的 paint 方法，实现了对值为 0 的单元格进行特殊渲染处理，使其在界面上不显示任何内容，从而提升数据展示的简洁性和可读性。

## 二、解决的问题

在实际业务场景中，表格数据中经常会出现大量的 0 值，这些 0 值可能会干扰用户对有效数据的关注。本示例解决了以下问题：

* 提升数据可读性：隐藏无意义的 0 值，让用户更专注于非零数据
* 优化视觉体验：减少表格中的视觉噪音，使数据展示更加清爽
* 符合业务习惯：某些财务或统计报表中，习惯性地不显示 0 值

## 三、实现思路

### 3.1 核心技术点

#### 重写单元格类型的 paint 方法

通过重写 `GC.Spread.Sheets.CellTypes.Text.prototype.paint` 方法，在单元格渲染时拦截值为 0 的情况，将其替换为空字符串进行绘制。

```javascript
var oldPaint = GC.Spread.Sheets.CellTypes.Text.prototype.paint;

GC.Spread.Sheets.CellTypes.Text.prototype.paint = function(ctx, value, x, y, w, h, style, context) {
    if (value === 0) {
        oldPaint.apply(this, [ctx, "", x, y, w, h, style, context])
    } else {
        oldPaint.apply(this, [ctx, value, x, y, w, h, style, context])
    }
}
```

实现原理：

* 保存原始的 paint 方法引用到 `oldPaint` 变量
* 重写 paint 方法，在渲染前检查 value 是否严格等于 0
* 如果值为 0，则将空字符串传递给原始 paint 方法进行渲染
* 如果值不为 0，则正常传递原始值进行渲染

### 3.2 技术栈

* SpreadJS 15.0.0：核心表格组件库
* jQuery 3.6.1：用于 DOM 操作和事件处理
* SystemJS：模块加载器
* TypeScript 4.1.2：开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，会看到一个空白的 SpreadJS 表格
2. 在任意单元格中输入数字 0
3. 按回车键或点击其他单元格，观察刚才输入 0 的单元格
4. 可以看到该单元格不显示任何内容（0 被隐藏）
5. 输入其他非 0 数值，可以正常显示

## 五、功能特点

### 5.1 优点

* 实现简单：仅需重写一个方法即可实现全局效果
* 性能高效：在渲染层面处理，不影响数据存储和计算
* 全局生效：对所有工作表和单元格自动生效
* 不影响数据：单元格实际值仍为 0，仅改变显示效果

### 5.2 局限性与扩展建议

当前实现的局限性：

* 仅对文本类型单元格生效，如果单元格设置了其他类型（如数字格式），可能需要额外处理
* 使用严格相等判断（===），只能隐藏数字 0，不能隐藏字符串 "0"

扩展建议：

* 可以扩展为支持自定义隐藏规则（如隐藏空字符串、null 等）
* 可以通过配置项控制是否启用该功能
* 可以针对特定工作表或单元格区域应用该规则

## 六、关键代码片段

### 原型方法重写

```javascript
// 保存原始 paint 方法
var oldPaint = GC.Spread.Sheets.CellTypes.Text.prototype.paint;

// 重写 paint 方法实现 0 值隐藏
GC.Spread.Sheets.CellTypes.Text.prototype.paint = function(ctx, value, x, y, w, h, style, context) {
    if (value === 0) {
        // 值为 0 时，传递空字符串进行渲染
        oldPaint.apply(this, [ctx, "", x, y, w, h, style, context])
    } else {
        // 其他值正常渲染
        oldPaint.apply(this, [ctx, value, x, y, w, h, style, context])
    }
}
```

### 工作簿初始化

```javascript
$(document).ready(function() {
    var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"), {
        sheetCount: 2
    });
});
```

## 七、总结

本示例展示了 SpreadJS 中通过重写单元格类型原型方法来实现自定义渲染逻辑的技术方案。开发者可以从中学到：

* 如何通过原型链重写实现全局功能扩展
* SpreadJS 单元格渲染机制的工作原理
* 如何在不影响数据存储的前提下改变显示效果

该方案适用于需要对特定值进行显示控制的场景，具有良好的扩展性，可以根据实际需求调整判断条件和渲染逻辑。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
