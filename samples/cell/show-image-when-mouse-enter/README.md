## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现鼠标悬停单元格时动态显示图片的交互效果。通过自定义单元格类型（CellType）并重写其鼠标事件处理方法，实现了当鼠标移入单元格时在单元格内显示图片，移出时图片消失的功能。该示例适用于需要在表格中提供视觉反馈或提示信息的场景。 

## 二、解决的问题

* 提供单元格级别的交互式视觉反馈，增强用户体验
* 在不占用额外空间的情况下展示辅助信息（如图标、提示标识）
* 实现类似 Excel 中鼠标悬停效果的自定义交互逻辑

## 三、实现思路

### 3.1 自定义单元格类型

通过继承 `spreadNS.CellTypes.Text` 创建自定义单元格类型 `SortHearderCellType`，并维护一个状态对象 `pars` 来记录每个单元格的鼠标悬停状态：

```javascript
function SortHearderCellType() {
    this.pars = {};
}
SortHearderCellType.prototype = new spreadNS.CellTypes.Text();
```

### 3.2 重写绘制方法

重写 `paint` 方法，根据单元格的悬停状态决定是否绘制图片。当 `pars` 对象中对应单元格的状态为 `true` 时，设置背景图片并调整绘制位置：

```javascript
SortHearderCellType.prototype.paint = function (ctx, value, x, y, width, height, style, context) {
    spreadNS.CellTypes.Text.prototype.paint.apply(this, arguments);
    if (this.pars[context.row + "." + context.col]) {
        style.backgroundImage = src;
        x = x + width / 2 + 70 / 2;
        y = y + (height - 16) / 2;
        width = 16;
        height = 16;
        value = "";
        spreadNS.CellTypes.Text.prototype.paint.apply(this, arguments);
    }
}
```

图片尺寸固定为 16x16 像素，位置计算使其居中偏右显示。

### 3.3 鼠标事件处理

实现 `processMouseEnter` 和 `processMouseLeave` 方法来响应鼠标进入和离开事件：

```javascript
SortHearderCellType.prototype.processMouseEnter = function (hitInfo) {
    this.pars[hitInfo.row + "." + hitInfo.col] = true;
    var sheet = hitInfo.sheet;
    sheet.repaint();
}

SortHearderCellType.prototype.processMouseLeave = function (hitInfo) {
    this.pars[hitInfo.row + "." + hitInfo.col] = false;
    var sheet = hitInfo.sheet;
    sheet.repaint();
}
```

通过 `sheet.repaint()` 触发重绘，使图片的显示和隐藏立即生效。

### 3.4 命中测试

重写 `getHitInfo` 方法，确保单元格能够正确响应鼠标事件：

```javascript
SortHearderCellType.prototype.getHitInfo = function (x, y, cellStyle, cellRect, context) {
    if (context) {
        return {
            x: x,
            y: y,
            row: context.row,
            col: context.col,
            cellRect: cellRect,
            cellStyle: cellStyle,
            sheetArea: context.sheetArea,
            isReservedLocation: true,
            sheet: context.sheet,
            context: context
        };
    }
    return null;
}
```

### 3.5 数据绑定

使用 `setDataSource` 和 `bindColumns` 方法将自定义单元格类型应用到列：

```javascript
var columnInfo = [{
    name: 'result',
    cellType: new SortHearderCellType(),
    size: 200
}]
sheet.setDataSource(source);
sheet.bindColumns(columnInfo);
```

### 3.6 技术栈

* @grapecity/spread-sheets: 15.0.0
* TypeScript: ^4.1.2
* SystemJS: ^0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，表格会显示一列名为 "result" 的数据列
2. 将鼠标移动到任意单元格上
3. 观察单元格内右侧出现的图片图标
4. 移开鼠标，图片消失

## 五、功能特点

### 5.1 优点

* 实现简洁，通过继承和重写方法即可完成自定义交互
* 性能良好，仅在鼠标事件触发时重绘，不影响整体性能
* 扩展性强，可以轻松修改图片内容、位置和显示逻辑

### 5.2 局限性与扩展建议

* 当前图片使用 Base64 编码嵌入代码，对于大量图片场景建议改用外部图片资源
* 图片位置和尺寸固定，可以扩展为根据单元格大小动态调整
* 可以进一步扩展为支持不同单元格显示不同图片，或根据单元格值动态选择图片

## 六、总结

本示例展示了 SpreadJS 自定义单元格类型的强大能力，通过重写绘制和事件处理方法，开发者可以实现丰富的交互效果。该方案适用于需要在表格中提供动态视觉反馈的场景，如排序指示器、状态图标、操作按钮等。开发者可以从中学习到：

* 如何创建自定义单元格类型
* 如何处理单元格的鼠标事件
* 如何在单元格中动态绘制图形元素
* 如何使用数据绑定应用自定义单元格类型

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
