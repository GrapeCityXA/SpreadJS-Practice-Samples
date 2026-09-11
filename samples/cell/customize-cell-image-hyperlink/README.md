## 一、Demo 概述

本示例展示了如何在 SpreadJS 中创建一个自定义单元格类型，实现在单个单元格内同时显示多个图片和超链接的功能。每个图片旁边都配有对应的超链接文本，点击链接可以在新窗口中打开对应的 URL。 

该示例通过继承 `GC.Spread.Sheets.CellTypes.Base` 基类，实现了一个名为 `MutipHyperLinkPictureCellType` 的自定义单元格类型，能够在单元格中垂直排列多组"图片+超链接"的组合，并支持鼠标悬停和点击交互。

## 二、解决的问题

在实际业务场景中，经常需要在表格单元格中展示多个相关资源的链接和预览图，例如：

* 产品目录中展示多个产品图片及其详情页链接
* 文档管理系统中显示附件缩略图和下载链接
* 数据报表中展示多个相关网站的 Logo 和访问入口

标准的 SpreadJS 单元格类型无法同时支持图片显示和超链接功能，本示例通过自定义单元格类型解决了这一需求。

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 自定义单元格类型的定义

通过继承 `GC.Spread.Sheets.CellTypes.Base` 创建自定义单元格类型：

```javascript
function MutipHyperLinkPictureCellType(items, size, isHorizontal) {
    this.typeName = "MutipHyperLinkPictureCellType";
    this._size = size || 22;
    this._isHorizontal = isHorizontal || false;
    this._items = items || [];
    this._valueArr = [];
    this._itemsTextWidth = [];
    this._maxItemTextWidth = 0;
    this._sumItemTextWidth = 0;
    this._zoomCatah = 1;
    this._autofitheight = 0;
    this._autofitwidth = 0;
}
MutipHyperLinkPictureCellType.prototype = new spreadNS.CellTypes.Base();
```

该构造函数初始化了单元格类型的各项属性，包括尺寸、布局方向、数据项等，并通过原型链继承了基类的功能。

#### 3.1.2 自定义绘制逻辑

重写 `paint` 方法实现自定义渲染：

```javascript
MutipHyperLinkPictureCellType.prototype.paint = function (ctx, value, x, y, w, h, style, options) {
    GC.Spread.Sheets.CellTypes.Base.prototype.paint.call(this, '', x, y, w, h, style, options);
    
    var sheet = options.sheet;
    var zoomFactor = sheet.zoom();
    
    ctx.save();
    ctx.rect(x, y, w, h);
    ctx.clip();
    
    // 设置超链接样式
    var hyperStyle = new GC.Spread.Sheets.Style();
    hyperStyle.foreColor = 'blue';
    hyperStyle.font = style.font;
    hyperStyle.textDecoration = GC.Spread.Sheets.TextDecorationType.underline;
    
    // 解析多个 URL（用分号分隔）
    var valueArr = value.split(";");
    
    for (var i = 0; i < valueArr.length; i++) {
        // 绘制图片
        var backgroundImgStyle = new GC.Spread.Sheets.Style();
        backgroundImgStyle.backgroundImage = valueArr[i];
        GC.Spread.Sheets.CellTypes.Text.prototype.paint.call(this, ctx, "", startX, startY + i * 100, 100, 100, backgroundImgStyle, options);
        
        // 绘制超链接文本
        var width = ctx.measureText(valueArr[i]).width;
        GC.Spread.Sheets.CellTypes.Text.prototype.paint.call(this, ctx, valueArr[i], startX + 100 + 10, startY + 50 + i * 100 - size / 2, width + 10, size, hyperStyle, options);
    }
    
    ctx.restore();
};
```

该方法通过 Canvas API 绘制图片和超链接文本，每组内容垂直间隔 100 像素，图片尺寸为 100x100，超链接文本显示在图片右侧。

#### 3.1.3 鼠标交互处理

实现 `getHitInfo` 方法检测鼠标点击位置：

```javascript
MutipHyperLinkPictureCellType.prototype.getHitInfo = function (x, y, cellStyle, cellRect, context) {
    var info = {
        x: x,
        y: y,
        row: context.row,
        col: context.col,
        cellStyle: cellStyle,
        cellRect: cellRect,
        sheetArea: context.sheetArea
    };
    
    for (var i = 0; i < this._valueArr.length; i++) {
        var width = this._valueArr[i].width;
        // 判断鼠标是否在超链接文本区域内
        if (x > cellRect.x + 100 && x < cellRect.x + 100 + width) {
            if (y > cellRect.y + 50 + i * 100 - this._size * this._zoomCatah / 2 && 
                y < cellRect.y + 50 + i * 100 - this._size * this._zoomCatah / 2 + this._size * this._zoomCatah) {
                info.isReservedLocation = true;
                info.reservedLocation = i;
                info.url = this._valueArr[i].value;
                break;
            }
        }
    }
    
    return info;
};
```

实现 `processMouseMove` 和 `processMouseUp` 方法处理鼠标悬停和点击事件：

```javascript
MutipHyperLinkPictureCellType.prototype.processMouseMove = function (hitInfo) {
    var sheet = hitInfo.sheet;
    var div = sheet.getParent().getHost();
    var canvasId = div.id + "vp_vp";
    var canvas = $("#" + canvasId)[0];
    
    if (sheet && hitInfo.isReservedLocation) {
        canvas.style.cursor = 'pointer';  // 鼠标悬停时显示手型光标
        return true;
    } else {
        canvas.style.cursor = 'default';
    }
    return false;
};

MutipHyperLinkPictureCellType.prototype.processMouseUp = function (hitInfo) {
    var sheet = hitInfo.sheet;
    if (sheet && hitInfo.isReservedLocation && hitInfo.reservedLocation >= 0) {
        window.open(hitInfo.url);  // 在新窗口打开链接
        return true;
    }
    return false;
};
```

#### 3.1.4 自动适应单元格尺寸

实现 `getAutoFitHeight` 和 `getAutoFitWidth` 方法，根据内容自动计算单元格所需的高度和宽度：

```javascript
MutipHyperLinkPictureCellType.prototype.getAutoFitHeight = function () {
    return this._autofitheight;  // 高度 = 图片数量 * 100
};

MutipHyperLinkPictureCellType.prototype.getAutoFitWidth = function () {
    return this._autofitwidth;  // 宽度 = 图片宽度 + 文本宽度 + 间距
};
```

### 3.2 技术栈

* SpreadJS 15.0.0：核心电子表格组件
* SystemJS 0.19.22：模块加载器
* TypeScript 4.1.2：开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，可以看到一个 SpreadJS 表格实例
2. 在 B2 单元格中显示了两组图片和超链接（百度和 Google 的 Logo）
3. 将鼠标悬停在超链接文本上，光标会变成手型
4. 点击超链接文本，会在新窗口中打开对应的 URL

### 4.3 数据格式

单元格的值使用分号（`;`）分隔多个图片 URL：

```javascript
cell.value("https://www.baidu.com/img/bd_logo1.png?where=super;https://www.google.com.hk/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png");
```

## 五、功能特点

### 5.1 优点

* 在单个单元格中同时展示多个图片和超链接，节省空间
* 支持鼠标悬停和点击交互，用户体验良好
* 自动计算单元格尺寸，适应不同内容长度
* 支持缩放（zoom）功能，在不同缩放级别下正常显示

### 5.2 局限性与扩展建议

* 当前实现仅支持垂直布局，可以扩展支持水平布局（通过 `isHorizontal` 参数）
* 图片尺寸固定为 100x100，可以改进为支持自定义尺寸
* 超链接样式固定为蓝色下划线，可以扩展为支持自定义样式
* 建议添加图片加载失败时的占位符显示
* 可以添加图片点击事件，实现图片预览功能

## 六、关键代码片段

### 6.1 初始化示例

```javascript
function initSpread(spread) {
    var sheet = spread.getSheet(0);
    sheet.suspendPaint();
    
    // 设置列宽和行高
    sheet.setColumnWidth(1, 270);
    sheet.setRowHeight(1, 200);
    
    // 创建自定义单元格类型实例
    var rbCellType = new MutipHyperLinkPictureCellType();
    
    // 应用到单元格
    var cell = sheet.getCell(1, 1);
    cell.foreColor("green");
    cell.cellType(rbCellType);
    cell.value("https://www.baidu.com/img/bd_logo1.png?where=super;https://www.google.com.hk/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png");
    
    sheet.resumePaint();
}

spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
initSpread(spread);
```

## 七、总结

本示例展示了 SpreadJS 自定义单元格类型的强大扩展能力，通过继承基类并重写关键方法，实现了图片和超链接的组合显示功能。开发者可以从中学到：

* 如何创建自定义单元格类型并继承基类
* 如何使用 Canvas API 实现自定义渲染逻辑
* 如何处理鼠标交互事件（悬停、点击）
* 如何实现单元格尺寸的自动适应

该方案适用于需要在表格中展示多媒体内容和交互链接的场景，具有良好的扩展性，可以根据实际需求进行定制和优化。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
