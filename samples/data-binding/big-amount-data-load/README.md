## 一、Demo 概述

本示例展示了如何在 SpreadJS 中高效加载和渲染大规模数据集。通过生成 10 万条包含 20 个字段的模拟数据，演示了在电子表格中处理大数据量时的性能优化技术，包括暂停/恢复绘制、数据源绑定、批量样式设置以及行过滤器的应用。该示例适用于需要在前端展示和操作大量表格数据的业务场景，如数据分析、报表系统、数据导入预览等。 

## 二、解决的问题

* **大数据量渲染性能问题**：直接向表格中加载数万行数据会导致页面卡顿甚至崩溃，需要优化渲染策略
* **批量样式设置效率**：为大量单元格逐个设置样式会触发多次重绘，严重影响性能
* **数据过滤需求**：大数据集需要提供筛选功能，方便用户快速定位目标数据
* **行变更监听**：在数据操作过程中需要监听行的变化（如删除操作），以便进行后续处理

## 三、实现思路

### 3.1 使用 suspendPaint/resumePaint 优化渲染性能

在进行大量数据操作时，通过暂停绘制可以避免每次操作都触发重绘，所有操作完成后一次性渲染，显著提升性能。

```javascript
$("#click").click(function() {
    spread.suspendPaint();  // 暂停绘制
    sheet.setDataSource(datasource);  // 绑定数据源
    for (var i = 0; i < datasource.length; i++) {
        sheet.getCell(i, 0).backColor(datasource[i].color);  // 批量设置样式
    }
    var range = new GC.Spread.Sheets.Range(-1, 0, -1, sheet.getColumnCount());
    var rowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(range);
    sheet.rowFilter(rowFilter);  // 添加行过滤器
    spread.resumePaint();  // 恢复绘制，一次性渲染所有变更
});
```

### 3.2 生成大规模模拟数据

通过循环生成 10 万条数据记录，每条记录包含 ID、18 个随机数字段和 1 个颜色标识字段，模拟真实业务场景中的大数据集。

```javascript
var datasource = [];
for (var i = 0; i < 100000; i++) {
    var temp = {}
    temp.id = i;
    temp.c1 = Math.random();
    temp.c2 = Math.random();
    // ... c3 到 c18 字段
    if (i % 4 == 0) {
        temp.color = "red";
    } else if (i % 4 == 1) {
        temp.color = "blue";
    } else if (i % 4 == 2) {
        temp.color = "yellow";
    } else if (i % 4 == 3) {
        temp.color = "green";
    }
    datasource.push(temp);
}
```

### 3.3 数据源绑定与样式设置

使用 `setDataSource()` 方法将数据数组绑定到工作表，然后根据数据中的颜色字段批量设置第一列单元格的背景色，实现数据可视化。

```javascript
sheet.setDataSource(datasource);
for (var i = 0; i < datasource.length; i++) {
    sheet.getCell(i, 0).backColor(datasource[i].color);
}
```

### 3.4 添加行过滤器

通过 `HideRowFilter` 为表格添加筛选功能，用户可以通过列头的下拉菜单对数据进行过滤，快速定位目标数据。

```javascript
var range = new GC.Spread.Sheets.Range(-1, 0, -1, sheet.getColumnCount());
var rowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(range);
sheet.rowFilter(rowFilter);
```

### 3.5 监听行变更事件

绑定 `RowChanging` 事件监听器，当用户删除行时捕获被删除的行数据并输出到控制台，便于进行数据同步或日志记录。

```javascript
sheet.bind(GC.Spread.Sheets.Events.RowChanging, function(e, info) {
    if (info.propertyName = "deleteRows") {
        var deleteRow = sheet.getArray(info.row, 0, 1, sheet.getColumnCount());
        console.log("delteRows:" + deleteRow);
    }
});
```

### 3.6 技术栈

* SpreadJS 15.0.0：核心电子表格组件
* jQuery 3.6.1：DOM 操作和事件处理
* SystemJS 0.19.22：模块加载器
* TypeScript 4.1.2：类型支持（配置环境）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，会看到一个空白的 SpreadJS 表格和一个 "click" 按钮
2. 点击 "click" 按钮，系统会加载 10 万条数据到表格中
3. 加载完成后，第一列会根据数据显示不同的背景色（红、蓝、黄、绿）
4. 可以使用列头的筛选按钮对数据进行过滤
5. 尝试删除某一行，控制台会输出被删除行的数据

## 五、功能特点

### 5.1 优点

* **高性能渲染**：通过 suspendPaint/resumePaint 机制，10 万行数据的加载和样式设置可以在秒级完成
* **内存优化**：SpreadJS 采用虚拟滚动技术，只渲染可视区域的单元格，有效控制内存占用
* **完整的交互功能**：支持筛选、排序、删除等标准表格操作，用户体验接近桌面 Excel
* **事件监听机制**：提供丰富的事件钩子，方便开发者在数据变更时执行自定义逻辑

### 5.2 局限性与扩展建议

* **初始数据生成耗时**：10 万条数据的生成在客户端进行，可能需要 1-2 秒，建议改为从后端 API 分页加载
* **样式设置效率**：逐行设置背景色仍有优化空间，可以考虑使用条件格式（Conditional Formatting）替代
* **扩展方向**：
    * 实现虚拟滚动加载（按需从服务器获取数据）
    * 添加数据导出功能（导出为 Excel 或 CSV）
    * 集成图表组件，对大数据进行可视化分析

## 六、关键代码片段

### 初始化工作表并设置容量

```javascript
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
var sheet = spread.getActiveSheet();
sheet.setRowCount(50000);  // 设置行数
sheet.setColumnCount(30);  // 设置列数
```

### 性能优化的核心模式

```javascript
spread.suspendPaint();  // 开始批量操作前暂停绘制
// ... 执行大量数据操作 ...
spread.resumePaint();   // 操作完成后恢复绘制
```

## 七、总结

本示例展示了 SpreadJS 在处理大规模数据时的性能优化最佳实践。开发者可以从中学到：

1. 使用 suspendPaint/resumePaint 优化批量操作性能
2. 通过 setDataSource 方法高效绑定数据源
3. 利用 HideRowFilter 实现数据筛选功能
4. 通过事件监听机制捕获用户操作
5. 合理设置工作表容量以适应大数据场景

该方案适用于需要在浏览器中展示和操作大量表格数据的场景，如 BI 报表、数据导入预览、在线数据分析工具等。通过合理使用 SpreadJS 的性能优化 API，可以在前端实现接近桌面应用的大数据处理能力。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
