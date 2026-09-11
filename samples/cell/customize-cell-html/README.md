## 一、Demo 概述

本示例展示了如何在 SpreadJS 中创建自定义单元格类型，实现在单元格内渲染 HTML 内容的功能。通过继承 `GC.Spread.Sheets.CellTypes.Text` 并重写 `paint` 方法，利用 SVG 的 `foreignObject` 元素将 HTML 内容转换为图像，最终在 Canvas 上绘制，从而实现在表格单元格中显示富文本格式（如标题、上标、删除线、颜色等 HTML 样式）。 

该示例适用于需要在电子表格中展示复杂格式文本的场景，例如显示带有特殊样式的公式、多层级标题或富文本内容。

## 二、解决的问题

* **富文本渲染需求**：标准单元格类型无法直接支持 HTML 标签和样式，该方案通过自定义单元格类型实现了 HTML 内容的渲染
* **样式多样性**：支持 HTML 的各种样式属性（颜色、字体、删除线、上标等），满足复杂格式展示需求
* **Canvas 绘制限制**：Canvas API 不直接支持 HTML 渲染，通过 SVG + foreignObject 的技术方案巧妙解决了这一限制

## 三、实现思路

### 3.1 自定义单元格类型

通过原型链继承 `GC.Spread.Sheets.CellTypes.Text`，创建自定义的 `HTMLCellType`：

```javascript
function HTMLCellType() { }
HTMLCellType.prototype = new GC.Spread.Sheets.CellTypes.Text;
```

这种方式继承了文本单元格的基础功能，同时允许重写 `paint` 方法来实现自定义渲染逻辑。

### 3.2 HTML 转 SVG 转图像

核心技术是利用 SVG 的 `foreignObject` 元素包裹 HTML 内容，然后将 SVG 转换为 Blob URL，最后通过 Image 对象加载：

```javascript
var svgPattern = '<svg xmlns="http://www.w3.org/2000/svg" width="{0}" height="{1}">' +
    '<foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="font:{2}">{3}</div></foreignObject></svg>';

var data = svgPattern.replace("{0}", w).replace("{1}", h).replace("{2}", style.font).replace("{3}", value);
var doc = document.implementation.createHTMLDocument("");
doc.write(data);
data = (new XMLSerializer()).serializeToString(doc.body.children[0]);

img = new Image();
var svg = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
var url = DOMURL.createObjectURL(svg);
img.src = url;
```

这段代码将 HTML 内容嵌入到 SVG 的 `foreignObject` 中，通过 `createHTMLDocument` 和 `XMLSerializer` 确保 HTML 格式正确，最后创建 Blob URL 供 Image 对象加载。

### 3.3 缓存机制与异步渲染

使用单元格的 `tag` 属性缓存已生成的图像对象，避免重复转换：

```javascript
var cell = context.sheet.getCell(context.row, context.col);
var img = cell.tag();
if (img) {
    try {
        ctx.save();
        ctx.rect(x, y, w, h);
        ctx.clip();
        ctx.drawImage(img, x + 2, y + 2)
        ctx.restore();
        cell.tag(null);
        return;
    } catch (err) {
        // 错误处理
    }
}
```

图像加载完成后触发 `onload` 事件，调用 `sheet.repaint()` 重新绘制单元格：

```javascript
img.onload = function () {
    context.sheet.repaint(new GC.Spread.Sheets.Rect(x, y, w, h));
};
```

### 3.4 技术栈

* SpreadJS 15.0.0：电子表格核心库
* SystemJS：模块加载器
* TypeScript 4.1.2：开发语言（编译为 JavaScript）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行示例。

### 4.2 操作步骤

1. 打开页面后，可以看到单元格 B2（第 1 行第 1 列）显示了包含多种 HTML 样式的内容
2. 内容包括：带删除线的 h1 标题、带上标的公式、彩色斜体文字、带阴影效果的文本等
3. 单元格会自动根据内容高度和宽度进行渲染

## 五、功能特点

### 5.1 优点

* **灵活性高**：支持任意 HTML 标签和 CSS 样式，可实现复杂的富文本效果
* **性能优化**：通过缓存机制避免重复转换，提升渲染性能
* **兼容性好**：基于标准的 SVG 和 Canvas API，浏览器兼容性良好

### 5.2 局限性与扩展建议

* **图像加载延迟**：首次渲染时需要等待图像加载完成，可能出现短暂的空白或闪烁
* **交互限制**：渲染后的内容是静态图像，无法响应鼠标事件或进行文本选择
* **扩展建议**：
    * 可以添加加载状态提示，改善用户体验
    * 对于需要交互的场景，可以考虑使用 DOM 覆盖层方案
    * 可以实现更完善的错误处理机制，例如显示降级的纯文本内容

## 六、关键代码片段

### 自定义单元格类型的应用

```javascript
var spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'), {
    sheetCount: 1
});
var sheet = spread.getActiveSheet();
sheet.setColumnWidth(1, 300);
sheet.setRowHeight(1, 150);
sheet.getCell(1, 1).cellType(new HTMLCellType()).value('<h1 style="text-decoration: line-through;">Hello SpreadJS!</h1><h3>E=mc<sup>2</sup></h3><h2><em style="color:red">I</em> like ' +
    '<span style="color:white; text-shadow:0 0 2px blue;">' +
    'Javascript</span></h2><p>aaaa</p>').wordWrap(true);
```

这段代码创建了 SpreadJS 工作簿实例，设置单元格尺寸，并应用自定义的 `HTMLCellType`，传入包含多种 HTML 标签和样式的字符串作为单元格值。

## 七、总结

本示例展示了 SpreadJS 自定义单元格类型的强大扩展能力，通过 SVG + foreignObject 的技术方案实现了在 Canvas 中渲染 HTML 内容的功能。开发者可以从中学到：

* 如何继承和扩展 SpreadJS 的内置单元格类型
* SVG foreignObject 在跨技术栈渲染中的应用
* Canvas 绘图中的缓存优化策略
* 异步渲染与重绘机制的实现

该方案适用于需要在电子表格中展示富文本内容的场景，具有良好的扩展性，可以根据实际需求进一步优化和定制。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
