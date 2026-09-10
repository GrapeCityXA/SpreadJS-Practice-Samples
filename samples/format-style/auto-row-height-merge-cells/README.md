## 一、Demo 概述

本示例演示了如何在 SpreadJS 中实现合并单元格的自适应行高功能。当合并单元格中的文本内容发生变化时，系统会自动计算所需的实际高度，并将高度平均分配到合并区域的各行中，确保文本完整显示且不会被截断。

该功能解决了 SpreadJS 原生 `autoFitRow()` 方法无法直接处理合并单元格的问题，通过创建临时工作表进行高度计算，实现了合并单元格的智能行高调整。

## 二、解决的问题

在 SpreadJS 中使用合并单元格时，开发者经常遇到以下问题：

* **原生自适应失效**：SpreadJS 的 `autoFitRow()` 方法无法正确计算合并单元格的高度，因为合并单元格跨越多行，标准的行高计算逻辑不适用
* **文本显示不全**：当合并单元格中输入较长文本并启用自动换行时，如果行高不足，文本会被截断或无法完整显示
* **手动调整繁琐**：用户需要手动拖动行高来适应内容，影响使用体验和工作效率

## 三、实现思路

### 3.1 临时工作表计算法

核心思路是利用临时工作表来计算合并单元格的真实高度需求。具体步骤：

1. 创建一个临时工作表
2. 在临时工作表中创建一个普通单元格，宽度设置为合并单元格的总宽度
3. 将合并单元格的内容复制到临时单元格
4. 对临时单元格执行 `autoFitRow()` 获取真实高度
5. 将计算出的高度分配到原合并单元格的各行

```javascript
// 创建临时工作表
spread.addSheet(1);
let tempSheet = spread.getSheet(1);

// 计算合并单元格的总宽度
let span = sheet.getSpan(2, 1);
let spanWidth = 0;
for (let c = span.col; c < span.col + span.colCount; c++) {
    spanWidth += sheet.getColumnWidth(c);
}

// 在临时工作表中模拟相同宽度的单元格
tempSheet.setColumnWidth(0, spanWidth);
tempSheet.setValue(0, 0, sheet.getValue(2, 1));
tempSheet.getCell(0, 0).wordWrap(true);
tempSheet.autoFitRow(0);

// 获取真实高度
let realHeight = tempSheet.getRowHeight(0);
```

### 3.2 高度平均分配策略

计算出真实高度后，需要将增加的高度平均分配到合并区域的各行：

```javascript
// 计算当前合并区域的总高度
let spanHeight = 0;
for (let r = span.row; r < span.row + span.rowCount; r++) {
    spanHeight += sheet.getRowHeight(r);
}

// 计算每行需要增加的高度
let increaseHeight = parseFloat((realHeight - spanHeight) / span.rowCount);

// 平均分配到每一行
for (let r = span.row; r < span.row + span.rowCount; r++) {
    sheet.setRowHeight(r, sheet.getRowHeight(r) + increaseHeight);
}
```

### 3.3 事件监听与性能优化

使用 `ValueChanged` 事件监听单元格内容变化，并通过 `suspendPaint()` 和 `resumePaint()` 优化渲染性能：

```javascript
sheet.bind(GC.Spread.Sheets.Events.ValueChanged, function () {
    spread.suspendPaint();  // 暂停渲染
    
    // 执行高度计算和调整逻辑
    // ...
    
    spread.removeSheet(1);  // 移除临时工作表
    spread.resumePaint();   // 恢复渲染
});
```

### 3.4 技术栈

* **@grapecity/spread-sheets**: 15.0.0（核心表格组件）
* **SystemJS**: 0.19.22（模块加载器）
* **TypeScript**: 4.1.2（开发语言支持）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
# 或使用本地服务器（推荐）
npx http-server -p 8080
```

### 4.2 操作步骤

1. 打开页面后，可以看到一个 3x3 的合并单元格（位于 B3:D5），其中已填充了一段较长的文本
2. 单元格已启用自动换行功能
3. 修改合并单元格中的内容（增加或减少文字）
4. 系统会自动触发 `ValueChanged` 事件，重新计算并调整行高
5. 观察合并单元格的行高变化，确保文本完整显示

## 五、功能特点

### 5.1 优点

* **自动化处理**：无需手动调整行高，内容变化时自动适配
* **精确计算**：通过临时工作表模拟，确保高度计算准确
* **性能优化**：使用 `suspendPaint()` 避免多次重绘，提升响应速度
* **通用性强**：适用于任意大小的合并单元格区域

### 5.2 局限性与扩展建议

**当前局限性**：

* 仅处理固定位置的合并单元格（B3:D5），未实现通用化
* 仅监听 `ValueChanged` 事件，不支持列宽变化时的自动调整
* 临时工作表的创建和销毁会产生一定的性能开销

**扩展建议**：

* 封装为通用函数，支持任意合并单元格的自适应
* 监听 `ColumnWidthChanged` 事件，实现列宽变化时的自动调整
* 使用缓存机制，避免频繁创建临时工作表
* 支持批量处理多个合并单元格

## 六、关键代码片段

### 6.1 初始化合并单元格

```javascript
let spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'));
let sheet = spread.getActiveSheet();

// 创建 3x3 的合并单元格（从 B3 开始）
sheet.addSpan(2, 1, 3, 3);
sheet.setValue(2, 1, "哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈");
sheet.getCell(2, 1).wordWrap(true);  // 启用自动换行
```

### 6.2 完整的自适应逻辑

```javascript
sheet.bind(GC.Spread.Sheets.Events.ValueChanged, function () {
    spread.suspendPaint();
    spread.addSheet(1);
    let tempSheet = spread.getSheet(1);

    let span = sheet.getSpan(2, 1);
    let spanWidth = 0;
    
    // 计算合并后的总宽度
    for (let c = span.col; c < span.col + span.colCount; c++) {
        spanWidth += sheet.getColumnWidth(c);
    }
    
    // 在临时工作表中模拟相同宽度的单元格
    tempSheet.setColumnWidth(0, spanWidth);
    tempSheet.setValue(0, 0, sheet.getValue(2, 1));
    tempSheet.getCell(0, 0).wordWrap(true);
    tempSheet.autoFitRow(0);
    
    // 获取真实高度
    let realHeight = tempSheet.getRowHeight(0);

    // 计算当前合并区域的总高度
    let spanHeight = 0;
    for (let r = span.row; r < span.row + span.rowCount; r++) {
        spanHeight += sheet.getRowHeight(r);
    }
    
    // 平均分配增加的高度
    let increaseHeight = parseFloat((realHeight - spanHeight) / span.rowCount);
    for (let r = span.row; r < span.row + span.rowCount; r++) {
        sheet.setRowHeight(r, sheet.getRowHeight(r) + increaseHeight);
    }
    
    // 清理临时工作表
    spread.removeSheet(1);
    spread.resumePaint();
});
```

## 七、总结

本示例提供了一个巧妙的解决方案来处理 SpreadJS 中合并单元格的自适应行高问题。通过临时工作表模拟计算的方式，绕过了原生 API 的限制，实现了合并单元格的智能高度调整。

**学习价值**：

* 掌握 SpreadJS 合并单元格的创建和操作方法
* 理解如何通过临时工作表进行复杂计算
* 学习事件监听机制在表格应用中的实践
* 了解性能优化技巧（`suspendPaint`/`resumePaint`）
* 掌握行高和列宽的动态计算方法

**适用场景**：

* 需要动态调整合并单元格高度的报表系统
* 用户可编辑的表格应用，要求内容自适应显示
* 复杂表格布局中的自动排版需求

该方案可作为基础框架，根据实际业务需求进行扩展和优化，例如支持多个合并单元格的批量处理、响应列宽变化等场景。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
