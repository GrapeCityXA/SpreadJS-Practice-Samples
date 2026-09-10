## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现单元格内文本的分散对齐效果。通过自定义单元格类型（Custom Cell Type），重写单元格的绘制逻辑，将文本中的每个字符均匀分布在单元格宽度范围内，实现类似 Word 中"分散对齐"的排版效果。该功能特别适用于需要精确控制文本排版的场景，如表格标题、证书文本等。

## 二、解决的问题

在实际业务中，常常需要让文本在单元格内均匀分布，而不是简单的左对齐、居中或右对齐。例如：

* 表格标题需要字符间距均匀分布，提升视觉美观度
* 证书、合同等正式文档中的文本排版要求
* 特定格式的报表需要文本分散填充整个单元格宽度

SpreadJS 默认的文本对齐方式无法实现这种效果，因此需要通过自定义单元格类型来实现文本的分散对齐。

## 三、实现思路

### 3.1 自定义单元格类型

通过继承 `GC.Spread.Sheets.CellTypes.Text` 创建自定义单元格类型，重写 `paint` 方法实现自定义绘制逻辑：

```javascript
function CustomCellType() {
    this.typeName = "CustomCellType"
}
CustomCellType.prototype = new spreadNS.CellTypes.Text();
```

### 3.2 核心绘制算法

在 `paint` 方法中实现分散对齐的核心逻辑：

```javascript
CustomCellType.prototype.paint = function(ctx, value, x, y, w, h, style, options) {
    if (!ctx) {
        return;
    }
    // 先绘制单元格背景
    GC.Spread.Sheets.CellTypes.Text.prototype.paint.call(this, ctx, "", x, y, w, h, style, options);
    
    if (value) {
        ctx.save();
        ctx.font = style.font;
        ctx.fillStyle = style.foreColor;

        var charLength = value.length;
        var valueWidth = ctx.measureText(value).width;
        var charWidth = valueWidth / charLength;
        var spaceWidth = (w - valueWidth) / (charLength - 1);

        // 字符宽度比单元格宽，默认方式展示
        if (valueWidth > w) {
            GC.Spread.Sheets.CellTypes.Text.prototype.paint.call(this, ctx, value, x, y, w, h, style, options);
        } else {
            ctx.textAlign = "start";
            ctx.textBaseline = "middle";

            for (var i = 0; i < charLength; i++) {
                ctx.fillText(value[i], x + (charWidth + spaceWidth) * i, y + h / 2);
            }
        }
        ctx.restore();
    }
};
```

算法关键点：

1. 计算文本总宽度 `valueWidth` 和字符数量 `charLength`
2. 计算平均字符宽度 `charWidth = valueWidth / charLength`
3. 计算字符间需要填充的空白宽度 `spaceWidth = (w - valueWidth) / (charLength - 1)`
4. 逐个字符绘制，每个字符的 x 坐标为 `x + (charWidth + spaceWidth) * i`
5. 当文本宽度超过单元格宽度时，回退到默认绘制方式

### 3.3 应用自定义单元格类型

将自定义单元格类型应用到指定单元格：

```javascript
var cellType = new CustomCellType();
sheet.getCell(1, 1).cellType(cellType).value("举杯邀明月")
    .font("30px 微软雅黑").foreColor("red")
```

### 3.4 技术栈

* SpreadJS 15.0.0：核心表格控件
* TypeScript 4.1.2：开发语言
* SystemJS 0.19.22：模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开 `index.html` 文件
2. 页面会自动加载 SpreadJS 表格控件
3. 在 B2 单元格（第 1 行第 1 列）中可以看到"举杯邀明月"文本以分散对齐方式显示
4. 文本的每个字符均匀分布在单元格宽度范围内

## 五、功能特点

### 5.1 优点

* 实现了类似 Word 分散对齐的效果，提升文档排版质量
* 通过自定义单元格类型，代码结构清晰，易于复用
* 自动处理文本溢出情况，当文本宽度超过单元格时回退到默认显示方式
* 支持自定义字体、颜色等样式属性

### 5.2 局限性与扩展建议

* 当前实现仅支持单行文本，不支持换行文本的分散对齐
* 未考虑文本方向（从右到左）的情况
* 可以扩展支持垂直方向的分散对齐
* 可以添加配置参数，允许用户自定义字符间距的计算方式

## 六、关键代码片段

### 字符间距计算逻辑

```javascript
var charLength = value.length;
var valueWidth = ctx.measureText(value).width;
var charWidth = valueWidth / charLength;
var spaceWidth = (w - valueWidth) / (charLength - 1);
```

这段代码是分散对齐的核心：

* `charLength`：字符总数
* `valueWidth`：文本在当前字体下的实际宽度
* `charWidth`：平均每个字符的宽度
* `spaceWidth`：字符之间需要填充的空白宽度，通过 `(单元格宽度 - 文本宽度) / (字符数 - 1)` 计算得出

### 逐字符绘制

```javascript
for (var i = 0; i < charLength; i++) {
    ctx.fillText(value[i], x + (charWidth + spaceWidth) * i, y + h / 2);
}
```

通过循环逐个绘制字符，每个字符的 x 坐标递增 `charWidth + spaceWidth`，实现均匀分布效果。

## 七、总结

本示例展示了 SpreadJS 自定义单元格类型的强大能力，通过重写 `paint` 方法实现了文本分散对齐的特殊排版效果。开发者可以从中学到：

* 如何创建和使用自定义单元格类型
* Canvas 2D 绘图 API 的使用方法
* 文本测量和布局计算技巧
* 如何处理边界情况（文本溢出）

该方案适用于需要精确控制文本排版的场景，具有良好的扩展性，可以根据实际需求进一步定制字符间距计算逻辑或支持更复杂的排版需求。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
