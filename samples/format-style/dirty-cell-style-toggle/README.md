## 一、Demo 概述

本示例演示了如何在 SpreadJS 中使用 Cell States API 来标记和管理单元格的"脏数据"状态。通过两个按钮控制，用户可以为所有已编辑的单元格添加黄色背景样式（开启脏数据标记），或清除这些标记（关闭脏数据标记）。这是一个典型的数据变更追踪场景，帮助用户直观地识别哪些单元格的数据被修改过。

## 二、解决的问题

在实际的表格应用中，用户经常需要追踪哪些单元格的数据被修改过，特别是在以下场景：

* 数据审核：在批量编辑数据后，需要快速定位哪些单元格被修改过
* 协同编辑：多人编辑同一份表格时，需要标记出变更的单元格
* 数据对比：将当前数据与原始数据进行对比，高亮显示差异部分
* 撤销提示：在提交数据前，让用户确认哪些数据发生了变更

## 三、实现思路

### 3.1 核心技术点

#### 使用 Cell States API 标记脏数据

SpreadJS 提供了 `cellStates` API 来管理单元格的状态标记。通过 `cellStates.add()` 方法，可以为指定范围的单元格添加特定类型的状态样式：

```javascript
var style = new GC.Spread.Sheets.Style();
style.backColor = "yellow";

sheet.cellStates.add(
    new GC.Spread.Sheets.Range(
        0,
        0,
        sheet.getRowCount(),
        sheet.getColumnCount()
    ),
    GC.Spread.Sheets.CellStatesType.dirty,
    style
);
```

这段代码创建了一个黄色背景样式，并将其应用到整个工作表的所有单元格上，标记类型为 `dirty`（脏数据）。

#### 清除单元格状态标记

使用 `cellStates.clear()` 方法可以清除指定范围内的状态标记：

```javascript
sheet.cellStates.clear(
    new GC.Spread.Sheets.Range(
        0,
        0,
        sheet.getRowCount(),
        sheet.getColumnCount()
    ),
    GC.Spread.Sheets.SheetArea.viewport
);
sheet.repaint();
```

清除后需要调用 `repaint()` 方法刷新视图，确保样式变更立即生效。

### 3.2 UI 交互流程

用户在单元格中输入数据 → 点击"开启"按钮 → 所有单元格显示黄色背景（脏数据标记） → 点击"关闭"按钮 → 黄色背景消失

### 3.3 技术栈

* SpreadJS v17.0.8：核心表格组件
* SystemJS v0.19.22：模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，在表格中随机输入一些数值或文本
2. 点击页面顶部的"开启"按钮，观察所有单元格是否显示黄色背景
3. 点击"关闭"按钮，黄色背景应该消失
4. 可以多次切换开启/关闭状态，测试功能稳定性

## 五、功能特点

### 5.1 优点

* 实现简单：仅需几行代码即可实现脏数据标记功能
* 性能高效：Cell States API 是 SpreadJS 内置的高性能状态管理机制
* 样式可定制：可以自定义脏数据的标记样式（颜色、边框等）
* 范围灵活：可以针对特定范围或整个工作表进行标记

### 5.2 局限性与扩展建议

当前实现对所有单元格统一标记，实际应用中可以扩展为：

* 仅标记实际被修改过的单元格（通过监听 `CellChanged` 事件）
* 支持多种状态类型（如 `invalid`、`readonly` 等）
* 添加状态持久化功能，保存和恢复标记状态
* 结合数据验证，自动标记不符合规则的单元格

## 六、关键代码片段

### 初始化 SpreadJS 工作簿

```javascript
import * as GC from "@grapecity/spread-sheets";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();
```

### 开启脏数据标记

```javascript
document.querySelector("#button1").addEventListener("click", function () {
    var style = new GC.Spread.Sheets.Style();
    style.backColor = "yellow";

    sheet.cellStates.add(
        new GC.Spread.Sheets.Range(
            0,
            0,
            sheet.getRowCount(),
            sheet.getColumnCount()
        ),
        GC.Spread.Sheets.CellStatesType.dirty,
        style
    );
});
```

### 关闭脏数据标记

```javascript
document.querySelector("#button2").addEventListener("click", function () {
    sheet.cellStates.clear(
        new GC.Spread.Sheets.Range(
            0,
            0,
            sheet.getRowCount(),
            sheet.getColumnCount()
        ),
        GC.Spread.Sheets.SheetArea.viewport
    );
    sheet.repaint();
});
```

## 七、总结

本示例展示了 SpreadJS 中 Cell States API 的基本用法，开发者可以从中学到：

* 如何使用 `cellStates.add()` 为单元格添加状态标记
* 如何使用 `cellStates.clear()` 清除状态标记
* 如何创建和应用自定义样式到单元格状态
* 如何通过 `Range` 对象指定操作范围

该方案适用于需要追踪数据变更的场景，可以扩展为更复杂的数据审核、版本对比等功能。通过结合事件监听和条件判断，可以实现更精细化的脏数据管理机制。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
