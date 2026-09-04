## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现打印背景图的功能。由于 SpreadJS 默认的背景图设置在打印时可能无法正常显示，本示例通过自定义单元格类型（Custom CellType）的方式，重写了单元格的绘制逻辑，使背景图能够在打印时正确渲染。示例在 D4 单元格设置了背景图，并提供了打印按钮来验证效果。

## 二、解决的问题

- **打印背景图显示问题**：SpreadJS 标准的 `backgroundImage` 属性在打印时可能不会被渲染，导致背景图在打印预览和实际打印中丢失
- **自定义单元格渲染需求**：需要在保持单元格原有文本显示功能的同时，增强其背景图的打印能力

## 三、实现思路

### 3.1 自定义单元格类型

核心思路是创建一个继承自 `GC.Spread.Sheets.CellTypes.Text` 的自定义单元格类型 `WaterMarkCellType`，通过重写 `paint` 方法来控制单元格的绘制逻辑：

```javascript
function WaterMarkCellType() {
    this.typeName = "WaterMarkCellType"
}
WaterMarkCellType.prototype = new GC.Spread.Sheets.CellTypes.Text();
WaterMarkCellType.prototype.paint = function (ctx, value, x, y, w, h, style, options) {
    // 先移除背景图，绘制文本内容
    var background = style.backgroundImage;
    style.backgroundImage = undefined;
    GC.Spread.Sheets.CellTypes.Text.prototype.paint.apply(this, arguments)
    
    // 再单独绘制背景图
    GC.Spread.Sheets.CellTypes.Text.prototype.paint.call(this, ctx, undefined, x, y, w + 100, h + 100, {
        backgroundImage: background
    }, options)
};
```

**实现原理**：
1. 保存原始的 `backgroundImage` 属性
2. 先将 `backgroundImage` 设为 `undefined`，调用父类的 `paint` 方法绘制文本内容
3. 再次调用父类的 `paint` 方法，传入空值（`undefined`）作为文本内容，仅绘制背景图
4. 通过扩大绘制区域（`w + 100, h + 100`）确保背景图完整显示

### 3.2 应用自定义单元格类型

将自定义的单元格类型应用到目标单元格，并设置背景图：

```javascript
sheet.getCell(3, 3).cellType(new WaterMarkCellType())
    .backgroundImage('https://www.grapecity.com.cn/images/metalsmith/home/logo_spjs.png')
```

### 3.3 打印功能

通过 SpreadJS 的打印 API 实现打印功能：

```javascript
$("#print").click(function () {
    spread.print();
});
```

### 3.4 技术栈

- SpreadJS 15.0.0：核心表格组件
- @grapecity/spread-sheets-print 15.0.0：打印功能模块
- jQuery 3.6.1：DOM 操作和事件绑定
- SystemJS：模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，可以看到一个包含数据的表格，D4 单元格（第 4 行第 4 列）设置了背景图
2. 点击页面顶部的"打印"按钮
3. 在打印预览中可以看到背景图正常显示
4. 可以选择打印或保存为 PDF 来验证效果

## 五、功能特点

### 5.1 优点

- **兼容性好**：通过自定义单元格类型的方式，不破坏 SpreadJS 原有的功能
- **灵活性高**：可以在任意单元格应用该自定义类型，支持多个单元格同时使用
- **打印效果稳定**：通过重写绘制逻辑，确保背景图在打印时能够正确渲染

### 5.2 局限性与扩展建议

- **绘制区域固定**：当前代码中背景图的绘制区域通过 `w + 100, h + 100` 硬编码扩展，可能不适合所有场景。建议根据实际需求动态计算绘制区域
- **性能考虑**：如果大量单元格使用自定义单元格类型，可能会影响渲染性能。建议仅在需要打印背景图的单元格上使用
- **扩展方向**：可以进一步扩展该自定义单元格类型，支持背景图的位置、大小、透明度等属性配置

## 六、关键代码片段

### 自定义单元格类型的完整实现

```javascript
function WaterMarkCellType() {
    this.typeName = "WaterMarkCellType"
}
WaterMarkCellType.prototype = new GC.Spread.Sheets.CellTypes.Text();
WaterMarkCellType.prototype.paint = function (ctx, value, x, y, w, h, style, options) {
    // 保存背景图属性
    var background = style.backgroundImage;
    // 先绘制文本内容（不含背景图）
    style.backgroundImage = undefined;
    GC.Spread.Sheets.CellTypes.Text.prototype.paint.apply(this, arguments)
    // 再绘制背景图（不含文本）
    GC.Spread.Sheets.CellTypes.Text.prototype.paint.call(this, ctx, undefined, x, y, w + 100, h + 100, {
        backgroundImage: background
    }, options)
};
```

### 应用到单元格

```javascript
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
var sheet = spread.getActiveSheet();
// 在 D4 单元格应用自定义单元格类型并设置背景图
sheet.getCell(3, 3).cellType(new WaterMarkCellType())
    .backgroundImage('https://www.grapecity.com.cn/images/metalsmith/home/logo_spjs.png')
```

## 七、总结

本示例提供了一个实用的解决方案，用于解决 SpreadJS 中打印背景图的问题。通过自定义单元格类型并重写 `paint` 方法，开发者可以精确控制单元格的绘制逻辑，确保背景图在打印时正确显示。

**学习价值**：
- 掌握 SpreadJS 自定义单元格类型的创建方法
- 理解单元格绘制机制和 `paint` 方法的工作原理
- 学习如何通过继承和重写来扩展 SpreadJS 的功能
- 了解 SpreadJS 打印功能的使用方式

**适用场景**：
- 需要在打印时显示单元格背景图的场景
- 需要实现水印效果的表格打印
- 需要自定义单元格渲染逻辑的复杂业务需求

该方案具有良好的扩展性，开发者可以在此基础上进一步定制背景图的显示效果，如调整位置、大小、透明度等，以满足更多样化的业务需求。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/kET_2_VK5kitzOCJWJUXAA/)）
