## 一、Demo 概述

本示例演示了如何在 SpreadJS 中监听滚动事件并判断表格是否已滚动到最右侧或最底部。通过监听 `LeftColumnChanged` 和 `TopRowChanged` 事件，计算当前可视区域的位置，并在滚动到边界时触发提示。该功能适用于需要在用户浏览大型表格时提供边界提示或触发特定业务逻辑的场景。

## 二、解决的问题

在实际应用中，当用户操作包含大量数据的表格时，可能需要在滚动到特定位置时执行某些操作，例如：

* 在滚动到表格末尾时加载更多数据（类似无限滚动）
* 提示用户已到达数据边界，避免误操作
* 在特定滚动位置触发数据统计或分析功能
* 实现自定义的滚动导航提示

本示例提供了一种精确判断表格是否滚动到最右侧或最底部的解决方案，同时兼容像素滚动和单元格滚动两种模式。

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 启用滚动条最大对齐模式

通过设置 `scrollbarMaxAlign` 选项，确保滚动条可以滚动到表格的最右侧和最底部：

```javascript
spread.options.scrollbarMaxAlign = true;
```

这个配置是实现精确边界判断的前提，它允许滚动条滚动到内容的真实边界位置。

#### 3.1.2 计算表格总宽度和总高度

在监听滚动事件之前，需要预先计算表格的总宽度和总高度：

```javascript
// 计算总宽度
let totalWidth = 0;
for (let i = 0; i < sheet.getColumnCount(); i++) {
    totalWidth += sheet.getColumnWidth(i);
}

// 计算总高度
let totalHeight = 0;
for (let i = 0; i < sheet.getRowCount(); i++) {
    totalHeight += sheet.getRowHeight(i);
}
```

这些总值将作为后续边界判断的基准数据。

#### 3.1.3 监听水平滚动事件并判断是否到达最右侧

通过监听 `LeftColumnChanged` 事件，在每次水平滚动时计算已滚动的宽度，并判断是否到达右边界：

```javascript
sheet.bind(GC.Spread.Sheets.Events.LeftColumnChanged, function (sender, args) {
    let leftColumn = args.newLeftCol;
    let width = 0;
    for (let i = 0; i < leftColumn; i++) {
        width += sheet.getColumnWidth(i);
    }
    
    // 22为滚动条宽度
    if (spread.options.scrollByPixel) {
        let columnIndex = sheet.hitTest(
            sheet.getColumnWidth(0, GC.Spread.Sheets.SheetArea.rowHeader) + 1, 
            sheet.getRowHeight(0, GC.Spread.Sheets.SheetArea.columnHeader) + 1
        ).col;
        if ((totalWidth - width) - (spread.getHost().clientWidth - 
            sheet.getColumnWidth(0, GC.Spread.Sheets.SheetArea.rowHeader) - 22 + 
            sheet.getColumnWidth(columnIndex)) <= 0) {
            alert("到最右啦！");
        }
    } else {
        if ((totalWidth - width) - (spread.getHost().clientWidth - 
            sheet.getColumnWidth(0, GC.Spread.Sheets.SheetArea.rowHeader) - 22) <= 0) {
            alert("到最右啦！");
        }
    }
});
```

关键计算逻辑：

* `width`：左侧已滚动过的宽度
* `totalWidth - width`：右侧剩余宽度
* `spread.getHost().clientWidth`：可视区域宽度
* 当剩余宽度小于等于可视区域宽度时，表示已滚动到最右侧

#### 3.1.4 监听垂直滚动事件并判断是否到达最底部

通过监听 `TopRowChanged` 事件，在每次垂直滚动时计算已滚动的高度，并判断是否到达底部边界：

```javascript
sheet.bind(GC.Spread.Sheets.Events.TopRowChanged, function (sender, args) {
    let topRow = args.newTopRow;
    let height = 0;
    for (let i = 0; i < topRow; i++) {
        height += sheet.getRowHeight(i);
    }
    
    // 22为滚动条宽度
    if (spread.options.scrollByPixel) {
        let rowIndex = sheet.hitTest(
            sheet.getRowHeight(0, GC.Spread.Sheets.SheetArea.rowHeader) + 1, 
            sheet.getRowHeight(0, GC.Spread.Sheets.SheetArea.columnHeader) + 1
        ).row;
        if ((totalHeight - height) - (spread.getHost().clientHeight - 
            sheet.getRowHeight(0, GC.Spread.Sheets.SheetArea.rowHeader) - 22 + 
            sheet.getRowHeight(rowIndex)) <= 0) {
            alert("到底啦！");
        }
    } else {
        if ((totalHeight - height) - (spread.getHost().clientHeight - 
            sheet.getRowHeight(0, GC.Spread.Sheets.SheetArea.rowHeader) - 22) <= 0) {
            alert("到底啦！");
        }
    }
});
```

计算逻辑与水平滚动类似，但针对垂直方向进行判断。

#### 3.1.5 兼容像素滚动和单元格滚动模式

代码中通过 `spread.options.scrollByPixel` 判断当前滚动模式，并采用不同的计算方式：

* **像素滚动模式**：使用 `hitTest` 方法获取当前可视区域第一个单元格的索引，并将该单元格的宽度/高度纳入计算，以实现更精确的边界判断
* **单元格滚动模式**：直接使用可视区域宽度/高度进行计算

这种兼容性设计确保了在不同滚动模式下都能准确判断边界。

### 3.2 技术栈

* SpreadJS v17.0.8：核心表格组件
* SystemJS v0.19.22：模块加载器
* systemjs-plugin-babel v0.0.25：ES6 语法转译

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 在浏览器中打开 `index.html` 文件
2. 拖动水平滚动条向右滚动，观察控制台输出的左侧宽度和右侧宽度
3. 当滚动到最右侧时，会弹出"到最右啦！"提示
4. 拖动垂直滚动条向下滚动，观察控制台输出的上侧高度和下侧高度
5. 当滚动到最底部时，会弹出"到底啦！"提示

## 五、功能特点

### 5.1 优点

* **精确判断**：通过精确计算已滚动距离和剩余距离，准确判断是否到达边界
* **模式兼容**：同时支持像素滚动和单元格滚动两种模式
* **实时反馈**：在控制台输出实时的滚动位置信息，便于调试和监控
* **易于扩展**：可以基于此逻辑实现更复杂的滚动相关功能，如懒加载、分页加载等

### 5.2 局限性与扩展建议

**局限性**：

* 当前使用 `alert` 弹窗提示，可能影响用户体验
* 每次滚动都会触发计算，在大型表格中可能存在性能问题

**扩展建议**：

* 将 `alert` 替换为更友好的 UI 提示（如 Toast 消息）
* 添加防抖或节流机制，减少计算频率
* 结合实际业务需求，在到达边界时触发数据加载或其他业务逻辑
* 支持自定义边界阈值，提前触发边界事件

## 六、总结

本示例展示了如何在 SpreadJS 中实现精确的滚动边界判断功能。通过监听 `LeftColumnChanged` 和 `TopRowChanged` 事件，结合宽度/高度计算和滚动模式判断，开发者可以准确识别用户是否已滚动到表格的边界位置。

开发者可以从中学到：

* SpreadJS 滚动事件的监听和处理机制
* 如何计算表格的总宽度和总高度
* 如何兼容不同的滚动模式（像素滚动和单元格滚动）
* 如何使用 `hitTest` 方法获取特定位置的单元格信息
* 滚动边界判断的计算逻辑和实现方式

该方案适用于需要在大型表格中实现滚动监控、懒加载、分页加载等功能的场景，具有良好的扩展性和实用价值。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
