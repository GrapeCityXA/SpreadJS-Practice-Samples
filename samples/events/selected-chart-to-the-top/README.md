## 一、Demo 概述

本示例演示了如何在 SpreadJS 中实现多个图表重叠时，将当前选中的图表自动置于最顶层显示的功能。当工作表中存在多个图表且位置有重叠时，通过监听图表选中事件并动态调整 zIndex 属性，确保用户选中的图表始终显示在最前面，提升用户交互体验。

## 二、解决的问题

在实际应用中，当工作表中包含多个图表且存在位置重叠时，用户可能无法清晰地查看或操作被遮挡的图表。本示例通过以下方式解决这一问题：

* 自动检测用户选中的图表对象
* 动态调整图表的层级关系（zIndex）
* 确保选中的图表始终显示在最顶层
* 其他未选中的图表保持在较低层级

## 三、实现思路

### 3.1 初始化工作表和数据

首先创建 SpreadJS 工作簿实例，并准备浏览器市场份额的示例数据：

```javascript
let spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'));
let sheet = spread.getActiveSheet();

sheet.suspendPaint();
// 准备数据
let dataArray = [
    ["", 'Chrome', 'FireFox', 'IE', 'Safari', 'Edge', 'Opera', 'Other'],
    ["2015", 0.5651, 0.1734, 0.1711, 0.427, 0, 0.184, 0.293],
    ["2016", 0.6230, 0.1531, 0.1073, 0.464, 0.311, 0.166, 0.225],
    ["2017", 0.6360, 0.1304, 0.834, 0.589, 0.443, 0.223, 0.246]
];
sheet.setArray(0, 0, dataArray);
sheet.resumePaint();
```

使用 `suspendPaint()` 和 `resumePaint()` 方法可以在批量操作时提升性能，避免多次重绘。

### 3.2 添加多个图表

在工作表中添加两个不同类型的图表，并设置它们的位置使其部分重叠：

```javascript
// 添加柱状图
sheet.charts.add('Chart1', GC.Spread.Sheets.Charts.ChartType.columnClustered, 0, 100, 400, 200, "A1:H4");
// 添加饼图
sheet.charts.add('Chart2', GC.Spread.Sheets.Charts.ChartType.pie, 0, 250, 400, 200, "A1:H4");
```

两个图表的垂直位置分别为 100 和 250 像素，宽度均为 400 像素，因此在水平方向上会产生重叠。

### 3.3 监听图表选中事件并调整层级

核心功能通过监听 `FloatingObjectSelectionChanged` 事件实现，当用户选中图表时自动调整 zIndex：

```javascript
sheet.bind(GC.Spread.Sheets.Events.FloatingObjectSelectionChanged, function(e, info) {
    // typeName为2 表示为chart
    if (info.floatingObject.typeName == '2') {
        // 获取选择的chart的name
        let Selname = info.floatingObject.name();
        // 设置选择的chart的zindex为998（置顶）
        sheet.charts.zIndex(Selname, 998);
        
        // 遍历所有chart，将其他chart的zIndex设置为较低值
        let charts = sheet.charts.all();
        for (let i = 0; i < charts.length; i++) {
            let name = charts[i].name();
            if (name == Selname) {
                continue; // 跳过当前选中的图表
            }
            // 设置其他chart的zIndex为600
            sheet.charts.zIndex(name, 600);
        }
    }
});
```

关键技术点：

* `typeName == '2'` 用于判断浮动对象是否为图表类型
* `zIndex()` 方法用于设置图表的堆叠顺序，数值越大越靠前
* 通过遍历所有图表，确保只有选中的图表处于最高层级

### 3.4 技术栈

* @grapecity/spread-sheets: 15.0.0（核心表格组件）
* @grapecity/spread-sheets-charts: 15.0.0（图表功能模块）
* TypeScript: ^4.1.2（开发语言）
* SystemJS: ^0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，工作表中会显示两个图表（柱状图和饼图）
2. 点击任意一个图表进行选中
3. 观察选中的图表会自动显示在最顶层
4. 切换选中不同的图表，验证层级关系的动态调整

## 五、功能特点

### 5.1 优点

* 实现简单，代码量少，易于理解和维护
* 自动化处理，无需用户手动调整图表层级
* 适用于任意数量的图表对象
* 性能良好，事件响应迅速

### 5.2 扩展建议

* 可以将 zIndex 的具体数值设置为可配置参数
* 可以扩展到其他浮动对象类型（如图片、形状等）
* 可以添加动画效果，使层级切换更加平滑

## 六、关键代码片段

完整的事件监听和层级调整逻辑：

```javascript
sheet.bind(GC.Spread.Sheets.Events.FloatingObjectSelectionChanged, function(e, info) {
    if (info.floatingObject.typeName == '2') {
        let Selname = info.floatingObject.name();
        sheet.charts.zIndex(Selname, 998);
        
        let charts = sheet.charts.all();
        for (let i = 0; i < charts.length; i++) {
            let name = charts[i].name();
            if (name == Selname) {
                continue;
            }
            sheet.charts.zIndex(name, 600);
        }
    }
});
```

## 七、总结

本示例展示了如何通过监听 SpreadJS 的浮动对象选中事件，动态调整图表的 zIndex 属性，实现选中图表自动置顶的功能。开发者可以从中学到：

* SpreadJS 图表的创建和配置方法
* 浮动对象事件的监听机制
* zIndex 属性在图表层级管理中的应用
* 如何通过遍历图表集合批量修改属性

该方案适用于需要在同一工作表中展示多个图表且存在位置重叠的场景，通过简单的事件处理即可显著提升用户体验。代码结构清晰，易于扩展到其他类型的浮动对象管理需求。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
