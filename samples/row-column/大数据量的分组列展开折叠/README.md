## 一、Demo 概述

本示例展示了如何在 SpreadJS 中处理大数据量（5000 行 × 25 列）场景下的分组列展开折叠功能，并通过性能优化技术实现流畅的用户交互体验。示例使用了 outlineColumn（大纲列）功能配合可视区域计算，仅对当前可见的行进行展开/折叠操作，避免了全量数据处理导致的性能问题。

该方案适用于需要在电子表格中展示层级结构数据（如组织架构、分类目录、多级汇总等）且数据量较大的场景。

## 二、解决的问题

在处理大数据量的分组列展开折叠时，传统的全量操作方式会导致以下问题：

- **性能瓶颈**：对 5000 行数据全部执行展开/折叠操作会造成明显的卡顿和延迟
- **用户体验差**：滚动时需要等待所有行的状态更新完成才能看到结果
- **资源浪费**：用户实际只能看到屏幕可视区域内的 20-30 行，却要处理全部数据

本示例通过"按需处理"的策略，仅对可视区域内的行进行操作，将性能开销降低到可接受范围，实现了大数据量下的流畅交互。

## 三、实现思路

### 3.1 大纲列配置与数据初始化

使用 SpreadJS 的 `outlineColumn` API 配置分组列的显示样式和层级结构：

```javascript
activeSheet.outlineColumn.options({
    columnIndex: 0,           // 大纲列位置（第一列）
    showImage: true,          // 显示图标
    showCheckBox: true,       // 显示复选框
    images: ['star2.png', 'box4.png', 'rating4.png'],  // 自定义图标
    maxLevel: 6               // 最大层级深度
});
activeSheet.showRowOutline(false);  // 隐藏默认的行大纲
```

通过 `textIndent` 属性设置每行的缩进层级（1-6 级），模拟树形结构：

```javascript
for (let r = 0; r < rowCount - 1; r++) {
    for (let c = 0; c < colCount - 1; c++) {
        activeSheet.setValue(r, c, `r${r}c${c}`)
        activeSheet.getRange(r, c, 1, 1).textIndent(1 + (r % 6));  // 循环设置 1-6 级缩进
    }
}
```

### 3.2 可视区域计算

通过 `getViewportTopRow` 和 `getViewportBottomRow` 计算当前屏幕可见的行数：

```javascript
let topRow = activeSheet.getViewportTopRow(1)
let bottomRow = activeSheet.getViewportBottomRow(1)
let visibleLines = bottomRow - topRow
```

监听缩放事件，动态更新可视行数：

```javascript
activeSheet.bind(GC.Spread.Sheets.Events.ViewZoomed, function (e, info) {
    let topRow = info.sheet.getViewportTopRow(1)
    let bottomRow = info.sheet.getViewportBottomRow(1)
    visibleLines = bottomRow - topRow
});
```

### 3.3 按需展开折叠核心逻辑

`handleCollapse` 函数实现了仅处理可视区域的展开/折叠逻辑：

```javascript
function handleCollapse(sheet, tr) {
    let topRow = tr || sheet.getViewportTopRow(1)
    let outlineColumn = sheet.outlineColumn
    
    // 如果顶部行不是一级节点且需要折叠，向上查找最近的一级节点
    if (sheet.getRange(topRow, 0, 1, 1).textIndent != 1 && collapsed) {
        for (let r = topRow; r >= 0; r--) {
            if (sheet.getRange(r, 0, 1, 1).textIndent() == 1) {
                outlineColumn.setCollapsed(r, collapsed)
                topRow = r
                break
            }
        }
    }
    
    // 仅处理可视区域内的行
    let count = 0
    let curRow = topRow
    while (count < visibleLines && sheet.getRowCount() > curRow) {
        if (sheet.getRange(curRow, 0, 1, 1).textIndent() == 1 
            && outlineColumn.getCollapsed(curRow) != collapsed) {
            outlineColumn.setCollapsed(curRow, collapsed)  // 切换折叠状态
        }
        if (sheet.getRowVisible(curRow)) {
            count++  // 只统计可见行
        }
        curRow++
    }
    sheet.showCell(topRow, 0)  // 确保顶部行可见
}
```

### 3.4 滚动事件优化

监听 `TopRowChanged` 事件，在滚动时动态更新可视区域的折叠状态：

```javascript
activeSheet.bind(GC.Spread.Sheets.Events.TopRowChanged, function (sender, args) {
    spread.suspendPaint()   // 暂停绘制
    spread.suspendEvent()   // 暂停事件触发
    
    handleCollapse(args.sheet, args.newTopRow)
    
    spread.resumeEvent()    // 恢复事件
    spread.resumePaint()    // 恢复绘制
});
```

使用 `suspendPaint` 和 `suspendEvent` 批量处理操作，避免频繁重绘。

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行（需要本地 Web 服务器支持 ES Modules）。

### 4.2 操作步骤

1. 页面加载后会自动生成 5000 行 × 25 列的测试数据，每行根据行号设置不同的缩进层级（1-6 级循环）
2. 点击页面顶部的"展开/折叠"按钮，可以切换当前可视区域内所有一级节点的展开/折叠状态
3. 滚动表格时，新进入可视区域的行会自动应用当前的折叠状态
4. 可以通过浏览器缩放功能测试不同可视区域大小下的性能表现

## 五、功能特点

### 5.1 优点

- **高性能**：仅处理可视区域内的 20-30 行数据，避免全量操作的性能开销
- **流畅交互**：使用 `suspendPaint/resumePaint` 批量处理，减少重绘次数
- **智能定位**：滚动到非一级节点时，自动向上查找最近的父节点进行折叠
- **动态适配**：监听缩放事件，自动调整可视行数计算

### 5.2 局限性与扩展建议

**局限性**：
- 当前实现假设一级节点（`textIndent == 1`）为可折叠节点，不支持任意层级的独立折叠
- 滚动速度过快时，可能出现短暂的状态不一致（新进入区域的行尚未更新）

**扩展建议**：
- 可以引入虚拟滚动技术，进一步优化超大数据量（10 万行以上）的场景
- 支持记忆每个节点的折叠状态，实现更精细的状态管理
- 添加节点搜索和快速定位功能

## 六、关键代码片段

### 可视区域边界处理

```javascript
// 确保顶部行是一级节点，避免折叠后出现孤立的子节点
if (sheet.getRange(topRow, 0, 1, 1).textIndent != 1 && collapsed) {
    for (let r = topRow; r >= 0; r--) {
        if (sheet.getRange(r, 0, 1, 1).textIndent() == 1) {
            outlineColumn.setCollapsed(r, collapsed)
            topRow = r
            break
        }
    }
}
```

### 性能优化包装

```javascript
spread.suspendPaint()   // 暂停绘制，避免中间状态闪烁
spread.suspendEvent()   // 暂停事件，避免级联触发

// 执行批量操作
handleCollapse(sheet)

spread.resumeEvent()    // 恢复事件监听
spread.resumePaint()    // 一次性重绘
```

## 七、总结

本示例展示了在 SpreadJS 中处理大数据量分组列展开折叠的最佳实践，核心思想是"按需处理"——仅对用户可见的区域进行操作。开发者可以从中学到：

- 如何使用 `outlineColumn` API 实现分组列功能
- 通过 `getViewportTopRow/BottomRow` 计算可视区域的技巧
- 使用 `suspendPaint/resumePaint` 优化批量操作性能
- 监听滚动和缩放事件实现动态更新的策略

该方案适用于需要展示层级结构数据且数据量较大的场景，通过局部更新策略将性能开销控制在可接受范围内。在实际项目中，可以根据业务需求扩展为支持任意层级折叠、状态持久化等功能。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/Z4ItMhWG1UK3emwukx14kA/)）
