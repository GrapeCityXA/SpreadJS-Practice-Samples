## 一、Demo 概述

本示例展示了如何通过重写 SpreadJS 的表角（Corner）单元格类型的 `paint` 方法来实现自定义表角样式。示例在表格左上角的表角区域绘制了一个橙色五角星图案，替代了默认的空白表角样式。 

该功能适用于需要在表格左上角展示品牌标识、特殊图标或自定义视觉元素的场景。

## 二、解决的问题

* **个性化表格外观**：默认的表角区域是空白的，通过自定义绘制可以增强表格的视觉识别度
* **品牌标识展示**：可以在表角区域绘制公司 Logo 或特定图标，提升产品辨识度
* **扩展 SpreadJS 渲染能力**：演示如何通过重写内置单元格类型的绘制方法来实现深度定制

## 三、实现思路

### 3.1 重写表角单元格的 paint 方法

SpreadJS 的表角区域使用 `CellTypes.Corner` 类型渲染。通过重写其原型链上的 `paint` 方法，可以完全控制表角的绘制逻辑。

```javascript
GC.Spread.Sheets.CellTypes.Corner.prototype.paint = function (ctx, value, x, y, w, h, style, context) {
    if (!ctx) {
        return;
    }
    ctx.save();
    // draw inside the cell's boundary
    ctx.rect(x, y, w, h);
    ctx.clip();
    // 自定义绘制逻辑...
    ctx.restore();
}
```

关键参数说明：

* `ctx`：Canvas 2D 渲染上下文
* `x, y, w, h`：表角单元格的位置和尺寸
* `style`：单元格样式对象
* `context`：SpreadJS 上下文信息

### 3.2 使用 Canvas API 绘制五角星

通过 Canvas 的路径绘制 API 实现五角星图形：

```javascript
ctx.fillStyle = "orange";
let size = 10;
var dx = x + w / 2;  // 计算中心点 x 坐标
var dy = y + h / 2;  // 计算中心点 y 坐标
ctx.beginPath();
var dig = Math.PI / 5 * 4;  // 五角星每个顶点的角度间隔
ctx.moveTo(dx + Math.sin(0 * dig) * size, dy + Math.cos(0 * dig) * size);
for (var i = 1; i < 5; i++) {
    ctx.lineTo(dx + Math.sin(i * dig) * size, dy + Math.cos(i * dig) * size);
}
ctx.closePath();
ctx.fill();
```

绘制原理：

* 五角星有 5 个顶点，每个顶点之间的角度为 `4π/5`（144°）
* 使用三角函数计算每个顶点的坐标
* 通过 `lineTo` 连接各顶点形成五角星路径

### 3.3 技术栈

* SpreadJS v16.0.1：核心表格控件库
* SystemJS v0.19.22：模块加载器
* TypeScript v4.1.2：类型支持（配置环境）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 使用本地服务器打开 index.html
# 例如使用 VS Code 的 Live Server 插件，或者：
npx http-server .
```

### 4.2 操作步骤

1. 在浏览器中打开 `index.html`
2. 查看表格左上角的表角区域
3. 可以看到一个橙色五角星图案替代了默认的空白表角

## 五、功能特点

### 5.1 优点

* **实现简单**：只需重写一个方法即可完全控制表角样式
* **灵活性高**：可以使用 Canvas 的所有绘图 API，支持绘制任意图形、图片或文字
* **性能良好**：直接使用 Canvas 绘制，无需额外的 DOM 元素

### 5.2 扩展建议

* 可以绘制图片（使用 `ctx.drawImage`）来展示公司 Logo
* 可以根据工作簿状态动态改变表角样式（如只读状态显示锁图标）
* 可以添加鼠标交互事件，使表角成为可点击的功能按钮

## 六、关键代码片段

完整的表角重写代码（src/app.js:4-27）：

```javascript
GC.Spread.Sheets.CellTypes.Corner.prototype.paint = function (ctx, value, x, y, w, h, style, context) {
    if (!ctx) {
        return;
    }
    ctx.save();
    // 设置裁剪区域，确保绘制不超出单元格边界
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.beginPath();
    ctx.fillStyle = "orange";
    let size = 10;
    var dx = x + w / 2;
    var dy = y + h / 2;
    ctx.beginPath();
    var dig = Math.PI / 5 * 4;
    ctx.moveTo(dx + Math.sin(0 * dig) * size, dy + Math.cos(0 * dig) * size);
    for (var i = 1; i < 5; i++) {
        ctx.lineTo(dx + Math.sin(i * dig) * size, dy + Math.cos(i * dig) * size);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}
```

## 七、总结

本示例展示了 SpreadJS 的深度定制能力，通过重写内置单元格类型的绘制方法，开发者可以实现完全自定义的表角样式。开发者可以从中学到：

* 如何重写 SpreadJS 内置单元格类型的 `paint` 方法
* Canvas 2D API 的基本使用方法
* 如何在 SpreadJS 中实现自定义视觉元素

该方案适用于需要在表格中展示品牌元素或特殊标识的场景，具有良好的扩展性，可以根据实际需求绘制任意图形、图片或文字。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
