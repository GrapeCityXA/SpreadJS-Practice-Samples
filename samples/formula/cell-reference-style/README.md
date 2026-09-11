## 一、Demo 概述

本示例展示了如何利用 SpreadJS 的公式追踪功能实现单击单元格时自动标注其公式引用信息。当用户点击包含公式的单元格时，系统会自动识别该公式引用的所有前导单元格（precedents），并为每个引用单元格添加不同颜色的边框，直观地展示公式的数据来源关系。

该功能适用于需要快速理解复杂公式依赖关系的场景，帮助用户追踪数据流向，提升电子表格的可读性和可维护性。

## 二、解决的问题

* **公式依赖关系可视化**：在包含复杂公式的工作表中，用户往往难以快速识别某个计算结果依赖哪些单元格的数据，本示例通过颜色边框标注解决了这一痛点
* **数据审计与追踪**：在财务报表、数据分析等场景中，需要追溯计算结果的数据来源，该功能提供了直观的可视化追踪方式
* **提升用户体验**：通过简单的单击操作即可查看公式引用关系，无需手动查找或记忆公式内容

## 三、实现思路

### 3.1 核心技术点

#### 使用 getPrecedents 方法获取公式前导单元格

SpreadJS 提供了 `getPrecedents()` 方法用于获取指定单元格的所有前导单元格（即该单元格公式中引用的其他单元格）。该方法返回一个数组，包含所有引用单元格的位置信息。

```javascript
var childNodes = sheet.getPrecedents(args.row, args.col);
```

返回的 `childNodes` 数组中每个元素包含：

* `row`：引用单元格的行索引
* `col`：引用单元格的列索引
* `rowCount`：引用区域的行数
* `colCount`：引用区域的列数

#### 监听单元格点击事件

通过绑定 `CellClick` 事件，在用户点击单元格时触发公式追踪逻辑：

```javascript
sheet.bind(GC.Spread.Sheets.Events.CellClick, function (sender, args) {
    var childNodes = sheet.getPrecedents(args.row, args.col);
    // 处理逻辑...
});
```

#### 动态设置单元格边框样式

为引用单元格添加不同颜色的边框，使用预定义的颜色数组实现多色标注：

```javascript
var color = ["#0055FF", "#008000", "#B300CC", "#800000", "#00CC33"];

for (var i = 0; i < childNodes.length; i++) {
    sheet.getRange(
        childNodes[i].row, 
        childNodes[i].col, 
        childNodes[i].rowCount, 
        childNodes[i].colCount, 
        GC.Spread.Sheets.SheetArea.viewport
    ).setBorder(
        new GC.Spread.Sheets.LineBorder(color[i], GC.Spread.Sheets.LineStyle.medium), 
        { all: true }
    );
}
```

#### 性能优化：暂停和恢复绘制

在批量修改单元格样式时，使用 `suspendPaint()` 和 `resumePaint()` 方法避免多次重绘，提升性能：

```javascript
spread.suspendPaint();
// 批量修改边框样式
spread.resumePaint();
```

#### 清除边框标注

当点击非公式单元格时，清除所有边框标注，恢复工作表原始状态：

```javascript
if (childNodes.length > 0) {
    // 添加边框
} else {
    spread.suspendPaint();
    sheet.getRange(0, 0, sheet.getRowCount(), sheet.getColumnCount(), GC.Spread.Sheets.SheetArea.viewport)
        .setBorder(new GC.Spread.Sheets.LineBorder(GC.Spread.Sheets.LineStyle.empty), { all: true });
    spread.resumePaint();
}
```

### 3.2 技术栈

* **@grapecity/spread-sheets**: 17.0.8 - SpreadJS 核心库，提供电子表格功能和公式追踪 API
* **SystemJS**: 0.19.22 - 模块加载器，用于动态加载 ES6 模块
* **systemjs-plugin-babel**: 0.0.25 - Babel 插件，支持 ES6 语法转译

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
# 或使用本地服务器（如 Live Server）运行
```

### 4.2 操作步骤

1. 打开页面后，工作表中已预设一个求和公式：A1 单元格包含公式 `=SUM(C2,D2,E2,F2,G2)`
2. C2 到 G2 单元格分别填充了数值 1 到 5
3. 单击 A1 单元格，系统会自动为 C2、D2、E2、F2、G2 五个引用单元格添加不同颜色的边框（蓝色、绿色、紫色、褐色、浅绿色）
4. 单击其他非公式单元格，所有边框标注会被清除

## 五、功能特点

### 5.1 优点

* **直观可视化**：通过颜色边框直观展示公式引用关系，无需查看公式内容即可理解数据依赖
* **交互简单**：仅需单击操作即可触发追踪，学习成本低
* **性能优化**：使用 suspendPaint/resumePaint 机制，即使在大量单元格标注时也能保持流畅
* **多色区分**：支持最多 5 种颜色标注不同的引用单元格，便于区分多个数据源

### 5.2 局限性与扩展建议

* **颜色数量限制**：当前仅支持 5 种颜色，如果公式引用超过 5 个单元格或区域，颜色会循环使用，可能导致混淆。建议扩展颜色数组或使用其他视觉标识（如数字标签）
* **仅支持前导追踪**：当前仅实现了 `getPrecedents()` 方法追踪公式引用的单元格，未实现反向追踪（即查看哪些单元格引用了当前单元格）。可通过 `getDependents()` 方法实现双向追踪
* **边框样式单一**：所有边框使用相同的 medium 线型，可考虑根据引用层级或类型使用不同线型（虚线、点线等）增强表现力

## 六、关键代码片段

### 完整的单元格点击事件处理逻辑

```javascript
sheet.bind(GC.Spread.Sheets.Events.CellClick, function (sender, args) {
    var childNodes = sheet.getPrecedents(args.row, args.col);

    if (childNodes.length > 0) {
        // 有前导单元格，添加彩色边框
        spread.suspendPaint();
        for (var i = 0; i < childNodes.length; i++) {
            sheet.getRange(
                childNodes[i].row, 
                childNodes[i].col, 
                childNodes[i].rowCount, 
                childNodes[i].colCount, 
                GC.Spread.Sheets.SheetArea.viewport
            ).setBorder(
                new GC.Spread.Sheets.LineBorder(color[i], GC.Spread.Sheets.LineStyle.medium), 
                { all: true }
            );
        }
        spread.resumePaint();
    } else {
        // 无前导单元格，清除所有边框
        spread.suspendPaint();
        sheet.getRange(0, 0, sheet.getRowCount(), sheet.getColumnCount(), GC.Spread.Sheets.SheetArea.viewport)
            .setBorder(new GC.Spread.Sheets.LineBorder(GC.Spread.Sheets.LineStyle.empty), { all: true });
        spread.resumePaint();
    }
});
```

### 初始化工作表数据

```javascript
var sheet = spread.getActiveSheet();
sheet.setFormula(0, 0, "=SUM(C2,D2,E2,F2,G2)");
sheet.getRange("C2").value(1);
sheet.getRange("D2").value(2);
sheet.getRange("E2").value(3);
sheet.getRange("F2").value(4);
sheet.getRange("G2").value(5);
sheet.clearSelection();
```

## 七、总结

本示例展示了 SpreadJS 公式追踪功能的实际应用，通过简洁的代码实现了公式引用关系的可视化标注。开发者可以从中学到：

* SpreadJS 公式追踪 API（`getPrecedents`）的使用方法
* 单元格事件监听与处理机制
* 动态修改单元格样式（边框）的技巧
* 性能优化技术（suspendPaint/resumePaint）

该方案适用于需要数据审计、公式调试、用户培训等场景，可进一步扩展为支持多层级追踪、反向依赖查询、导出追踪报告等高级功能。通过结合 SpreadJS 的其他 API（如 `getDependents`、条件格式、自定义函数等），可以构建更强大的公式分析工具。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
