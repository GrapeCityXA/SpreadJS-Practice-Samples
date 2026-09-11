## 一、Demo 概述

本示例展示了如何通过 SpreadJS 的表格数据绑定功能实现图表的动态更新。核心思路是将图表引用整个表格（gcTable0），当表格绑定的数据源发生变化时，图表会自动同步更新，无需手动刷新图表配置。 

该示例适用于需要根据动态数据源实时更新图表展示的场景，例如数据监控面板、实时报表系统等。

## 二、解决的问题

* **图表数据自动同步**：当数据源变化时，图表能够自动更新，避免手动重新配置图表数据范围
* **动态数据行数处理**：支持数据行数不固定的场景，表格和图表能够自动适应数据量的变化
* **简化开发流程**：通过表格绑定机制，开发者只需更新数据源，无需关心图表的更新逻辑

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 表格数据绑定配置

示例使用预先配置好的表格模板（bindFile.js），其中定义了一个名为 "gcTable0" 的表格，包含四列数据字段（day1-day4）：

```javascript
"tables":[{
  "name":"gcTable0",
  "row":3,
  "col":2,
  "rowCount":2,
  "colCount":4,
  "bindingPath":"infos",
  "columns":[
    {"id":4,"name":"星期一","dataField":"day1"},
    {"id":1,"name":"星期二","dataField":"day2"},
    {"id":2,"name":"星期三","dataField":"day3"},
    {"id":3,"name":"星期4","dataField":"day4"}
  ]
}]
```

表格通过 `bindingPath: "infos"` 指定数据绑定路径，后续通过 `CellBindingSource` 绑定数据时，会自动将数据填充到表格中。

#### 3.1.2 图表引用表格范围

图表的数据系列配置直接引用表格的单元格范围，而不是固定的单元格地址：

```javascript
"cat":{
  "strRef":{"f":"Sheet1!$C$4:$F$4"}  // 分类轴引用表头行
},
"val":{
  "numRef":{"f":"Sheet1!$C$5:$F$5"}  // 数值轴引用数据行
}
```

这样配置后，当表格数据行数变化时，图表会自动识别表格范围的变化。

#### 3.1.3 动态数据生成与绑定

通过 `generateData()` 函数生成随机数量和随机值的数据：

```javascript
const generateData = () => {
    let dataCount = Math.ceil(Math.random() * 10 + 1)  // 随机生成1-11行数据
    let data = []
    for(let i=0; i<dataCount;i++){
        let items = {
            "day1": Math.ceil(Math.random() * 200 + 1),
            "day2": Math.ceil(Math.random() * 100 + 1),
            "day3": Math.ceil(Math.random() * 400 + 1),
            "day4": Math.ceil(Math.random() * 500 + 1)
        }
        data.push(items)
    }
    return data
}
```

#### 3.1.4 表格自动扩展与数据源更新

点击按钮时，通过以下步骤更新数据：

```javascript
document.getElementById("changeData").onclick = function(){
    let data = {
        infos: generateData()  // 生成新数据
    }
    let sheet = spread.getActiveSheet()
    sheet.tables.all()[0].expandBoundRows(true)  // 允许表格自动扩展行数
    let source = new GC.Spread.Sheets.Bindings.CellBindingSource(data)
    sheet.setDataSource(source)  // 设置新数据源
}
```

关键 API `expandBoundRows(true)` 允许表格根据数据源的行数自动扩展或收缩，确保所有数据都能正确显示。

### 3.2 UI 交互流程

用户点击"修改绑定数据"按钮 → 生成随机数量的数据（1-11行）→ 表格自动扩展/收缩行数 → 数据填充到表格 → 图表自动更新显示

### 3.3 技术栈

* SpreadJS 17.0.8（核心表格引擎）
* @grapecity/spread-sheets-charts 17.0.8（图表功能）
* @grapecity/spread-sheets-designer 17.0.8（设计器组件）
* SystemJS 0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 使用本地服务器打开 index.html（如 Live Server）
```

### 4.2 操作步骤

1. 打开页面后，会看到一个包含表格和折线图的 SpreadJS 设计器界面
2. 点击页面顶部的"修改绑定数据"按钮
3. 观察表格数据行数和数值的变化
4. 图表会自动更新，反映新的数据内容

## 五、功能特点

### 5.1 优点

* **自动化程度高**：数据变化时图表自动更新，无需手动干预
* **灵活性强**：支持动态行数变化，适应不同数据量场景
* **代码简洁**：通过数据绑定机制，核心逻辑只需几行代码
* **可维护性好**：数据、表格、图表三者解耦，修改数据源不影响图表配置

### 5.2 局限性与扩展建议

* **当前实现仅支持单表格绑定**：如需多表格场景，需要为每个表格单独配置数据源
* **图表类型固定**：示例使用折线图，如需切换图表类型，需要修改 bindFile.js 中的图表配置
* **扩展建议**：可以结合后端 API，实现从服务器动态获取数据并更新图表

## 六、关键代码片段

### 表格自动扩展配置

```javascript
// 获取表格对象并启用自动扩展
let sheet = spread.getActiveSheet()
sheet.tables.all()[0].expandBoundRows(true)
```

`expandBoundRows(true)` 是实现动态行数的关键，设置为 true 后，表格会根据数据源的实际行数自动调整。

### 数据源绑定

```javascript
// 创建数据绑定源并应用到工作表
let source = new GC.Spread.Sheets.Bindings.CellBindingSource(data)
sheet.setDataSource(source)
```

`CellBindingSource` 是 SpreadJS 提供的数据绑定类，支持将 JavaScript 对象绑定到单元格或表格。

## 七、总结

本示例展示了 SpreadJS 表格数据绑定与图表联动的强大功能，开发者可以学到以下知识点：

* SpreadJS 表格数据绑定的配置方法
* `CellBindingSource` 的使用方式
* 表格自动扩展行数的实现（`expandBoundRows`）
* 图表引用表格范围实现自动更新的技巧

该方案特别适合需要频繁更新数据并实时展示图表的应用场景，如数据监控、实时报表、动态仪表盘等。通过表格绑定机制，可以大幅简化开发工作量，提高代码的可维护性。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
