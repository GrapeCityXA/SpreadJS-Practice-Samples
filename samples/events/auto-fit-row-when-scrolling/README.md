## 一、Demo 概述

本示例展示了在 SpreadJS 中处理大数据量表格时，如何通过优化行高自动调整策略来提升性能。当表格包含大量行（如 5000 行）且需要自动调整行高时，传统的一次性调整所有行高的方式会导致首次加载耗时过长。该示例采用"按需调整"的策略，仅在用户滚动到可视区域时才动态调整对应行的行高，从而显著缩短初始加载时间，提升用户体验。

## 二、解决的问题

* **首次加载性能瓶颈**：在包含数千行数据且启用自动换行的表格中，一次性调整所有行高会导致页面加载缓慢（示例中从 31 秒优化到 6.4 秒）
* **资源浪费**：用户可能只查看部分数据，提前调整所有不可见行的行高是不必要的计算开销
* **用户体验问题**：长时间的白屏等待会降低应用的可用性

## 三、实现思路

### 3.1 核心优化策略：视口内按需调整

通过监听 `TopRowChanged` 事件，在用户滚动时动态调整当前可视区域的行高，而不是在初始化时调整所有行。

```javascript
function betterFitRows() {
    sheet.bind(GC.Spread.Sheets.Events.TopRowChanged, function (type, args) {
        autoFitViewportArea(args.sheet);
    });
    autoFitViewportArea(sheet);
    console.timeEnd("rowFit") // 6400ms
}
```

### 3.2 避免重复计算

使用 `fitedRows` 对象记录已调整过行高的行索引，防止重复调整同一行，进一步提升性能。

```javascript
let fitedRows = {}

function autoFitViewportArea(sheet) {
    let topRow = sheet.getViewportTopRow(1)
    let bottomRow = sheet.getViewportBottomRow(1);
    sheet.suspendPaint();
    for (let row = topRow; row <= bottomRow; row++) {
        if (!fitedRows[row]) {
            sheet.autoFitRow(row);
            fitedRows[row] = 1
        }
    }
    sheet.resumePaint();
}
```

### 3.3 暂停/恢复绘制优化

在批量操作时使用 `suspendPaint()` 和 `resumePaint()` 减少重绘次数，避免每次调整行高都触发界面刷新。

```javascript
sheet.suspendPaint();
// 批量操作
sheet.resumePaint();
```

### 3.4 技术栈

* SpreadJS 16.0.1
* SystemJS 0.19.22（模块加载）
* TypeScript 4.1.2

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 使用本地服务器打开 index.html（如 Live Server）
```

### 4.2 操作步骤

1. 打开浏览器开发者工具（F12）查看控制台
2. 页面加载后观察 `rowFit` 计时结果（约 6.4 秒）
3. 上下滚动表格，观察行高自动调整效果
4. 可选：修改代码将 `betterFitRows()` 替换为 `defaultFitRows()`，对比性能差异（约 31 秒）

## 五、功能特点

### 5.1 优点

* **显著提升加载速度**：在 5000 行数据场景下，加载时间从 31 秒降至 6.4 秒，性能提升约 80%
* **按需计算**：仅处理可视区域，节省不必要的计算资源
* **用户体验友好**：用户无需等待所有行高调整完成即可开始操作
* **实现简单**：核心逻辑仅需监听滚动事件和维护已处理行的记录

### 5.2 局限性与扩展建议

* **首次滚动可能有轻微延迟**：当快速滚动到未调整过的区域时，可能出现短暂的行高计算延迟，可考虑预加载相邻区域
* **内存占用**：`fitedRows` 对象会持续增长，对于超大数据量（如百万行）可考虑使用 Set 或定期清理
* **扩展方向**：可结合虚拟滚动技术进一步优化超大数据集的渲染性能

## 六、关键代码片段

### 传统方式（性能较差）

```javascript
function defaultFitRows() {
    spread.suspendPaint()
    for (let row = 0; row < 5000; row++) {
        sheet.autoFitRow(row)
    }
    spread.resumePaint()
    console.timeEnd("rowFit")  // 31000ms
}
```

### 优化方式（推荐）

```javascript
function betterFitRows() {
    sheet.bind(GC.Spread.Sheets.Events.TopRowChanged, function (type, args) {
        autoFitViewportArea(args.sheet);
    });
    autoFitViewportArea(sheet);
    console.timeEnd("rowFit") // 6400ms
}
```

## 七、总结

该示例展示了在处理大数据量表格时，通过"懒加载"思想优化行高调整的实践方案。开发者可以从中学到：

1. 使用 `TopRowChanged` 事件监听视口变化
2. 通过缓存机制避免重复计算
3. 利用 `suspendPaint/resumePaint` 优化批量操作性能
4. 在性能优化中权衡首次加载与运行时体验

该方案适用于需要自动调整行高的大数据表格场景，特别是数据量在数千行以上且用户不会一次性查看所有数据的情况。通过按需计算的策略，在保证功能完整性的同时显著提升了应用的响应速度和用户体验。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
