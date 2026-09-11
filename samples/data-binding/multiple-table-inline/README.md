## 一、Demo 概述

本示例演示了在 SpreadJS 中如何在同一行创建多个 Table 并实现数据绑定。当工作表中存在多个 Table 且位于同一行时，直接绑定数据会导致 Table 区域重叠或数据显示异常。该示例通过在绑定数据前动态调整 Table 的行数范围，解决了多个 Table 同时绑定数据时的布局冲突问题。 

## 二、解决的问题

在 SpreadJS 中使用 Table 数据绑定功能时，如果同一行存在多个 Table，会遇到以下问题：

* Table 绑定数据时会通过 insert rows 方式动态插入行，导致相邻 Table 的区域发生冲突
* 多个 Table 绑定不同长度的数据源时，无法自动调整各自的行数范围
* 直接绑定会导致 Table 区域重叠，数据显示错乱

该示例提供了一种通过预先调整 Table 区域大小的方式，确保多个 Table 可以正确绑定各自的数据源。

## 三、实现思路

### 3.1 创建多个 Table 并配置列映射

在同一行创建两个 Table，并为每个 Table 配置独立的列映射关系：

```javascript
// 在第 6 行创建两个 Table
var table = sheet.tables.add("tableRecords_1", 6, 6, 1, 3, spreadNS.Tables.TableThemes.light6);
var table2 = sheet.tables.add("tableRecords_2", 6, 1, 1, 4, spreadNS.Tables.TableThemes.light6);

// 关闭自动生成列
table.autoGenerateColumns(false);
table2.autoGenerateColumns(false);

// 为 table 配置列映射
var tableColumn1 = new spreadNS.Tables.TableColumn(1);
tableColumn1.name("字段1");
tableColumn1.dataField("f1");
// ... 配置其他列
table.bindColumns([tableColumn1, tableColumn2, tableColumn3]);

// 为 table2 配置列映射
var c1 = new spreadNS.Tables.TableColumn(1);
c1.name("列1");
c1.dataField("c1");
// ... 配置其他列
table2.bindColumns([c1, c2, c3, c4]);
```

### 3.2 使用 CellBindingSource 包装数据源

使用 SpreadJS 的 `CellBindingSource` 包装数据对象，支持嵌套路径的数据绑定：

```javascript
var dbData = {
    bindPath_table1: [{
        f1: 1, f2: 2, f3: 3
    }, {
        f1: "a", f2: "b", f3: "c"
    }],
    bindPath_table2: [{
        c1: 1, c2: 2, c3: 3, c4: 4
    }, {
        c1: "a", c2: "b", c3: "c", c4: "d"
    }]
};

var dataSource = new spreadNS.Bindings.CellBindingSource(dbData);
sheet.setDataSource(dataSource);
```

### 3.3 动态调整 Table 区域后绑定数据

核心解决方案：在调用 `bindingPath` 前，根据数据源长度动态调整 Table 的行数范围：

```javascript
$("#bind").click(function() {
    // 获取数据源长度
    let len1 = dbData.bindPath_table1.length;
    let len2 = dbData.bindPath_table2.length;
    
    // 调整 table 的区域大小
    let range1 = table.range();
    range1.rowCount = len1 + 1; // +1 是把表头行算上
    sheet.tables.resize(table, range1);
    
    // 调整 table2 的区域大小
    let range2 = table2.range();
    range2.rowCount = len2 + 1;
    sheet.tables.resize(table2, range2);
    
    // 调整完区域后再绑定数据路径
    table2.bindingPath("bindPath_table2");
    table.bindingPath("bindPath_table1");
});
```

### 3.4 自定义表头显示

隐藏 Table 默认表头行，使用合并单元格创建自定义表头：

```javascript
// 隐藏第 6 行（Table 默认表头）
sheet.setRowVisible(6, false);

// 在第 5 行创建自定义表头
sheet.addSpan(5, 6, 1, 3);  // table 表头合并单元格
sheet.addSpan(5, 1, 1, 4);  // table2 表头合并单元格
sheet.getCell(5, 6).hAlign(GC.Spread.Sheets.HorizontalAlign.center).value("table");
sheet.getCell(5, 1).hAlign(GC.Spread.Sheets.HorizontalAlign.center).value("table2");
```

### 3.5 技术栈

* @grapecity/spread-sheets: 15.0.0
* jQuery: 3.6.1
* SystemJS: 0.19.22
* TypeScript: 4.1.2

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，可以看到两个空的 Table（table 和 table2）位于同一行
2. 点击"绑定"按钮
3. 观察两个 Table 分别填充了各自的数据源内容，且布局正常无重叠

## 五、功能特点

### 5.1 优点

* 解决了同一行多个 Table 数据绑定时的区域冲突问题
* 支持动态数据源长度，自动调整 Table 行数
* 使用 CellBindingSource 支持嵌套路径的数据绑定
* 可自定义表头样式，隐藏默认表头

### 5.2 局限性与扩展建议

当前实现需要手动触发绑定操作，如果需要自动绑定，可以考虑：

* 在数据源加载完成后自动计算 Table 区域并绑定
* 监听数据源变化事件，动态调整 Table 区域
* 封装成通用方法，支持任意数量的 Table 同时绑定

## 六、关键代码片段

### 核心绑定逻辑

```javascript
// 绑定前先调整 Table 区域大小
let len1 = dbData.bindPath_table1.length;
let len2 = dbData.bindPath_table2.length;

let range1 = table.range();
range1.rowCount = len1 + 1; // +1 包含表头行
sheet.tables.resize(table, range1);

let range2 = table2.range();
range2.rowCount = len2 + 1;
sheet.tables.resize(table2, range2);

// 调整完区域后再设置绑定路径
table2.bindingPath("bindPath_table2");
table.bindingPath("bindPath_table1");
```

## 七、总结

本示例展示了在 SpreadJS 中处理同一行多个 Table 数据绑定的实用技巧。开发者可以从中学到：

* Table 数据绑定的基本流程和 API 使用
* CellBindingSource 的嵌套路径绑定机制
* 使用 `tables.resize()` 方法动态调整 Table 区域
* 解决多个 Table 布局冲突的核心思路：先调整区域，再绑定数据
* 自定义 Table 表头的实现方式

该方案适用于需要在同一行展示多个独立数据集的场景，如对比报表、多维度数据展示等。通过预先计算并调整 Table 区域，可以确保数据绑定的稳定性和布局的正确性。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
