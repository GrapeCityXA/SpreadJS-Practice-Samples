## 一、Demo 概述

本示例展示了如何在 SpreadJS 中处理两种常见的日期格式：OADate 格式（如 `/OADate(44382.57994212963)/`）和 Unix 时间戳（如 `1497605107000`）。通过自定义数据转换函数，将这些特殊格式的日期数据统一转换为标准的日期时间格式（`yyyy-MM-dd hh:mm:ss`），并为表格添加排序和筛选功能。

该示例适用于需要处理来自不同数据源的日期格式的场景，特别是在数据迁移、API 对接或历史数据展示时。

## 二、解决的问题

* **多种日期格式兼容**：后端数据可能包含 OADate 格式或 Unix 时间戳，需要在前端统一展示为可读的日期格式
* **日期数据排序**：转换后的日期需要支持正确的排序和筛选功能
* **数据绑定与格式化**：在 SpreadJS 的数据绑定过程中自动完成日期转换，无需手动处理每条数据

## 三、实现思路

### 3.1 OADate 格式解析

OADate 是 OLE Automation Date 的缩写，是一种以浮点数表示日期的格式。核心转换逻辑通过正则表达式匹配并计算：

```javascript
function fromOADate(date) {
    let oaDateReg = new RegExp('^/OADate\\(([-+]?(\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)\\)/\\s*$');
    if (typeof date === "string" && oaDateReg.test(date)) {
        let oadate = parseFloat(date.match(oaDateReg)[1]);
        let ms = (oadate * 86400000 * 1440 - 25569 * 86400000 * 1440 + 
                  new Date((oadate - 25569) * 86400000).getTimezoneOffset() * 86400000) / 1440;
        return new Date(ms);
    } else {
        return date;
    }
}
```

该函数首先使用正则表达式匹配 `/OADate(数字)/` 格式，提取浮点数值后通过公式转换为 JavaScript Date 对象。公式中的 `25569` 是 OADate 与 Unix 时间戳的基准日期差值（1899-12-30 到 1970-01-01）。

### 3.2 数据绑定与列配置

通过 `bindColumns` 方法配置列信息，在 `value` 函数中实现日期转换：

```javascript
let colInfo = [{
    name: 'birthday',
    displayName: '生日',
    formatter: 'yyyy-MM-dd hh:mm:ss',
    value: function (row, value) {
        if (arguments.length === 1 && typeof (row.birthday) === 'string') {
            row.birthday = fromOADate(row.birthday).valueOf();
        } else {
            return new Date(row.birthday);
        }
    }
}];

sheet.setDataSource(datasource);
sheet.bindColumns(colInfo);
```

`value` 函数在数据绑定时被调用两次：

1. 第一次（只有 `row` 参数）：将 OADate 字符串转换为时间戳并存储到 `row.birthday`
2. 第二次（有 `row` 和 `value` 参数）：返回 Date 对象供 SpreadJS 渲染

### 3.3 排序与筛选功能

使用 `HideRowFilter` 为表格添加筛选功能：

```javascript
function setRowFilter(sheet) {
    let rowCount = sheet.getRowCount();
    let colCount = sheet.getColumnCount();
    sheet.rowFilter(new GC.Spread.Sheets.Filter.HideRowFilter(
        new GC.Spread.Sheets.Range(0, 0, rowCount, colCount)
    ));
}
```

同时在保护选项中启用排序和筛选权限：

```javascript
sheet.options.protectionOptions = {
    allowFilter: true,
    allowSort: true,
    allowResizeRows: true,
    allowResizeColumns: true
};
```

### 3.4 技术栈

* @grapecity/spread-sheets: 15.0.0（核心表格组件）
* SystemJS: 0.19.22（模块加载器）
* TypeScript: 4.1.2（开发语言支持）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 使用本地服务器打开 index.html（如 Live Server）
```

### 4.2 操作步骤

1. 打开页面后，表格自动加载包含 OADate 和时间戳的数据
2. 查看"生日"列，所有日期已转换为 `yyyy-MM-dd hh:mm:ss` 格式
3. 点击列头的筛选按钮，可以按日期范围筛选数据
4. 点击列头可对日期列进行升序/降序排序

## 五、功能特点

### 5.1 优点

* **格式兼容性强**：同时支持 OADate 和 Unix 时间戳两种格式
* **自动转换**：通过数据绑定机制自动完成转换，无需手动遍历数据
* **排序准确**：转换后的日期数据支持正确的时间顺序排序
* **代码复用性高**：`fromOADate` 函数可独立提取用于其他项目

## 六、关键代码片段

### 6.1 数据源示例

```javascript
let datasource = [
    { name: 'Alice', age: 27, birthday: '/OADate(44382.57994212963)/', position: 'PM' },
    { name: 'Alice3', age: 27, birthday: 1497605107000, position: 'PM' }
];
```

数据源中混合了两种日期格式，通过统一的转换机制处理。

### 6.2 样式配置

```javascript
function resetDefaultStyle(sheet) {
    sheet.defaults.rowHeight = 26;
    sheet.defaults.colHeaderRowHeight = 30;
    sheet.defaults.colWidth = 200;
    let defaultStyle = sheet.getDefaultStyle();
    defaultStyle.foreColor = "#666666";
    defaultStyle.vAlign = GC.Spread.Sheets.VerticalAlign.center;
    defaultStyle.hAlign = GC.Spread.Sheets.HorizontalAlign.center;
    sheet.setDefaultStyle(defaultStyle);
}
```

## 七、总结

本示例展示了 SpreadJS 在处理复杂日期格式时的灵活性，开发者可以学到：

1. 如何解析和转换 OADate 格式的日期数据
2. 如何在 `bindColumns` 的 `value` 函数中实现自定义数据转换
3. 如何为表格添加排序和筛选功能
4. 如何配置表格的默认样式和保护选项

该方案适用于需要处理多种日期格式的数据展示场景，通过自定义转换函数可以轻松扩展支持其他特殊格式。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
