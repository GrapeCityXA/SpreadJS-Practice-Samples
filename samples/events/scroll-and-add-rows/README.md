## 一、Demo 概述

本示例演示了如何在 SpreadJS 中实现滚动到表格底部时自动添加新行的功能。当用户滚动到工作表的最后一行时，系统会自动增加 10 行新行，并在特定行添加红色背景标记，实现类似无限滚动的效果。这种方式可以优化大数据量场景下的性能表现，避免一次性加载过多行数据。

## 二、解决的问题

* **按需加载数据**：避免初始化时加载大量行数据，减少内存占用和渲染时间
* **优化用户体验**：用户滚动到底部时自动扩展表格，无需手动添加行
* **性能控制**：通过设置最大行数限制（10000 行），防止无限扩展导致的性能问题

## 三、实现思路

### 3.1 核心技术点

#### 滚动条配置

通过配置 `scrollbarMaxAlign` 和 `scrollbarShowMax` 属性，使滚动条能够准确反映当前表格的实际行数：

```javascript
spread.options.scrollbarMaxAlign = true;
spread.options.scrollbarShowMax = true;
```

* `scrollbarMaxAlign`：滚动条最大值与实际行数对齐
* `scrollbarShowMax`：显示滚动条的最大范围

#### TopRowChanged 事件监听

监听 `TopRowChanged` 事件，当用户滚动表格时触发检测逻辑：

```javascript
sheet1.bind(GC.Spread.Sheets.Events.TopRowChanged, function(sender, args) {
    var rowCount = sheet1.getRowCount();
    var bottomRow = sheet1.getViewportBottomRow(1);
    if (bottomRow == rowCount - 1) {
        if (rowCount < 10000) {
            sheet1.setRowCount(rowCount + 10);
        }
        if (rowCount > 200) {
            sheet1.getRange(rowCount, 1, 1, 1).backColor('red')
        }
    }
});
```

**实现逻辑**：

1. 获取当前表格总行数 `rowCount`
2. 获取视口底部可见的最后一行索引 `bottomRow`
3. 判断是否滚动到最后一行（`bottomRow == rowCount - 1`）
4. 如果未达到上限（10000 行），则增加 10 行
5. 当行数超过 200 时，在新增行的第一列添加红色背景标记

#### 视觉标记

在初始化和动态添加行时，使用红色背景标记特定行，便于观察滚动效果：

```javascript
sheet1.getRange(5, 1, 1, 1).backColor('red')  // 初始标记第 5 行
sheet1.getRange(rowCount, 1, 1, 1).backColor('red')  // 标记新增行
```

### 3.2 技术栈

* **@grapecity/spread-sheets**: 15.0.0（核心表格组件）
* **SystemJS**: 0.19.22（模块加载器）
* **TypeScript**: 4.1.2（开发语言支持）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 使用本地服务器打开 index.html
# 例如使用 Live Server 或其他 HTTP 服务器
```

### 4.2 操作步骤

1. 打开页面后，可以看到表格初始状态，第 5 行第 1 列有红色背景标记
2. 使用鼠标滚轮或拖动滚动条向下滚动
3. 当滚动到表格底部时，系统会自动添加 10 行新行
4. 继续滚动，重复上述过程，直到达到 10000 行上限
5. 观察红色标记的位置变化（每次超过 200 行后会在新增行添加标记）

## 五、功能特点

### 5.1 优点

* **性能优化**：按需加载行数据，避免初始化时的性能开销
* **用户体验流畅**：自动扩展表格，无需手动操作
* **可控性强**：通过最大行数限制防止内存溢出
* **实现简单**：核心代码不到 20 行，易于理解和维护

### 5.2 局限性与扩展建议

**局限性**：

* 固定每次增加 10 行，无法根据实际需求动态调整
* 红色标记逻辑较为简单，仅用于演示

**扩展建议**：

* 可以根据数据源动态加载实际数据，而不是空行
* 增加加载指示器，提示用户正在加载新数据
* 支持配置每次增加的行数和最大行数限制
* 结合后端 API 实现真正的分页加载

## 六、关键代码片段

### 完整初始化代码

```javascript
import * as GC from "@grapecity/spread-sheets";

var spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'), {
    sheetCount: 1
});

// 配置滚动条行为
spread.options.scrollbarMaxAlign = true;
spread.options.scrollbarShowMax = true;

var sheet1 = spread.getActiveSheet();

// 初始标记
sheet1.getRange(5, 1, 1, 1).backColor('red');

// 监听滚动事件
sheet1.bind(GC.Spread.Sheets.Events.TopRowChanged, function(sender, args) {
    var rowCount = sheet1.getRowCount();
    var bottomRow = sheet1.getViewportBottomRow(1);
    
    // 滚动到底部时添加新行
    if (bottomRow == rowCount - 1) {
        if (rowCount < 10000) {
            sheet1.setRowCount(rowCount + 10);
        }
        if (rowCount > 200) {
            sheet1.getRange(rowCount, 1, 1, 1).backColor('red');
        }
    }
});
```

## 七、总结

本示例展示了 SpreadJS 中实现动态行扩展的简洁方案，通过监听 `TopRowChanged` 事件和判断视口位置，实现了类似无限滚动的效果。开发者可以从中学到：

1. 如何使用 `TopRowChanged` 事件监听表格滚动
2. 如何通过 `getViewportBottomRow()` 获取视口底部行索引
3. 如何动态调整表格行数（`setRowCount()`）
4. 如何配置滚动条行为以优化用户体验
5. 按需加载数据的基本思路和实现方式

该方案适用于需要展示大量数据但又希望优化初始加载性能的场景，可以结合实际业务需求进行扩展，例如集成后端分页 API、添加数据缓存机制等。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
