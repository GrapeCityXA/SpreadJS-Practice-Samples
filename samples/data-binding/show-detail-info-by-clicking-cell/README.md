## 一、Demo 概述

本示例展示了如何使用 SpreadJS 实现三级联动的数据展示系统。通过在主表格中选择不同的数据项，可以在第二个工作簿中展示汇总信息，点击"明细"按钮后在第三个工作簿中展示详细数据。该示例适用于需要分层展示数据的业务场景，如 GDP 数据分析、财务报表钻取等。 

## 二、解决的问题

* 实现多层级数据的逐级展示，用户可以从概览逐步深入到详细数据
* 通过可视化的分组列和复选框，让用户灵活选择需要查看的数据维度
* 在同一页面中协调多个工作簿的数据联动，避免页面跳转带来的操作割裂感
* 支持动态数据源绑定和列配置，适应不同数据结构的展示需求

## 三、实现思路

### 3.1 三工作簿布局与初始化

示例创建了三个独立的 SpreadJS 工作簿实例，分别承担不同的展示职责：

```javascript
// 初始化三个工作簿
intSpread1();  // 主表格：分组数据选择
intSpread2();  // 汇总表：展示选中项的汇总信息
intSpread3();  // 明细表：展示详细数据

function intSpread1() {
    var spread1 = new GC.Spread.Sheets.Workbook(document.getElementById("ss1"), {
        sheetCount: 1
    });
    var sheet1 = spread1.getActiveSheet();
    spread1.options.tabStripVisible = false;  // 隐藏工作表标签
    sheet1.options.rowHeaderVisible = false;  // 隐藏行头
    // ...
}
```

通过 CSS 布局将三个工作簿分为左右两栏，左侧为主表格，右侧上下排列汇总表和明细表。

### 3.2 分组列与复选框实现

使用 SpreadJS 的 `outlineColumn` 功能实现带复选框的分组列，支持自定义展开/折叠图标：

```javascript
sheet1.outlineColumn.options({
    columnIndex: 0,
    showCheckBox: true,
    expandIndicator: 'https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=3093987223,43057195&fm=26&gp=0.jpg',
    collapseIndicator: 'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1387005891,2751632088&fm=26&gp=0.jpg'
});

// 通过 textIndent 实现层级缩进效果
for (var r = 0; r < data.length; r++) {
    var level = data[r].level;
    sheet1.getCell(r, 0).textIndent(level);
}
```

数据源中的 `level` 字段控制缩进层级，配合 `textIndent` 方法实现视觉上的分组效果。

### 3.3 单元格点击事件与数据联动

通过监听 `CellClick` 事件，遍历所有行的复选框状态，动态拼接数据源并更新第二个工作簿：

```javascript
sheet1.bind(GC.Spread.Sheets.Events.CellClick, function (sender, args) {
    var dataSourceAll = [];
    var rc = sheet1.getRowCount();
    for (var i = 0; i < rc; i++) {
        var checkStatus = sheet1.outlineColumn.getCheckStatus(i);
        if (checkStatus) {
            if (i == 5) {
                dataSourceAll = dataSourceAll.concat(dataSource1);
            } else if (i == 6) {
                dataSourceAll = dataSourceAll.concat(dataSource2);
            }
        }
    }
    changeDataSource(dataSourceAll);
});
```

### 3.4 动态列绑定与数据源切换

第二个工作簿使用 `bindColumns` 方法实现自定义列配置，第三个工作簿根据选中数据动态生成列：

```javascript
function changeDataSource(dataSource) {
    let spread2 = GC.Spread.Sheets.findControl(document.getElementById('ss2'));
    let sheet2 = spread2.getActiveSheet();
    sheet2.autoGenerateColumns = false;  // 禁用自动生成列
    sheet2.setDataSource(dataSource);
    
    var colInfos = [{
        name: "name",
        displayName: "指标名称",
        size: 250
    }, {
        name: "id",
        displayName: "指标ID",
        size: 100
    }
    // ...更多列配置
    ];
    sheet2.bindColumns(colInfos);
}
```

第三个工作簿通过遍历数据源动态构建列配置：

```javascript
for (var i = 0; i < names.length; i++) {
    colInfos.push({
        name: "name" + (i + 1),
        displayName: names[i],
        size: 220
    });
}
sheet3.bindColumns(colInfos);
```

### 3.5 按钮触发明细展示

通过原生 DOM 事件监听，点击"明细"按钮时获取第二个工作簿的数据源并传递给第三个工作簿：

```javascript
document.getElementById('dataInfo').addEventListener("click", function () {
    let spread2 = GC.Spread.Sheets.findControl(document.getElementById('ss2'));
    let sheet2 = spread2.getActiveSheet();
    let dataSource = sheet2.getDataSource();
    changeDataSource2(dataSource);
});
```

### 3.6 技术栈

* SpreadJS 15.0.0：核心表格组件
* TypeScript 4.1.2：开发语言
* SystemJS 0.19.22：模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，左侧显示 GDP 数据的分组列表
2. 点击绿色或橙色单元格（第 5、6 行），右侧上方工作簿会显示对应的汇总数据
3. 可以同时勾选多个项目，数据会自动合并展示
4. 点击右侧的"明细"按钮，下方工作簿会展示详细的数值数据

## 五、功能特点

### 5.1 优点

* 三级联动设计清晰，用户可以逐层深入查看数据
* 使用分组列和复选框提供直观的交互方式
* 支持多选和数据合并，灵活性高
* 动态列绑定机制可适应不同数据结构

### 5.2 局限性与扩展建议

* 当前数据源是硬编码的常量，实际应用中应改为从后端 API 获取
* 行索引判断逻辑（`if (i == 5)`）不够灵活，建议使用数据项的唯一标识符（如 ID）进行匹配
* 可以增加加载状态提示和错误处理机制
* 建议为第三个工作簿添加分页或虚拟滚动，以支持大数据量展示

## 六、关键代码片段

### 获取复选框状态并拼接数据源

```javascript
var dataSourceAll = [];
var rc = sheet1.getRowCount();
for (var i = 0; i < rc; i++) {
    var checkStatus = sheet1.outlineColumn.getCheckStatus(i);
    if (checkStatus) {
        if (i == 5) {
            dataSourceAll = dataSourceAll.concat(dataSource1);
        } else if (i == 6) {
            dataSourceAll = dataSourceAll.concat(dataSource2);
        }
    }
}
```

### 动态生成列配置

```javascript
let names = [];
for (var i = 0; i < dataSource.length; i++) {
    names.push(dataSource[i].name);
}

let colInfos = [{ name: "id", displayName: "序号", size: 50 }];
for (var i = 0; i < names.length; i++) {
    colInfos.push({
        name: "name" + (i + 1),
        displayName: names[i],
        size: 220
    });
}
sheet3.bindColumns(colInfos);
```

## 七、总结

本示例展示了 SpreadJS 在多工作簿联动场景下的应用能力，开发者可以学到：

* 如何使用 `outlineColumn` 实现带复选框的分组列
* 如何通过事件监听实现多个工作簿之间的数据联动
* 如何使用 `bindColumns` 实现自定义列配置和动态列生成
* 如何通过 `textIndent` 实现层级缩进效果

该方案适用于需要分层展示数据的报表系统、数据分析平台等场景，通过合理的数据结构设计和事件处理，可以扩展为更复杂的多级钻取系统。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
