## 一、Demo 概述

本示例展示了如何在 SpreadJS 表格中实现自定义的中文排序功能。通过监听 RangeSorting 事件并提供自定义比较函数，实现了符合中文拼音顺序的排序规则，解决了默认排序无法正确处理中文字符的问题。示例使用销售人员数据作为演示数据，用户可以通过筛选按钮中的排序功能体验中文排序效果。

## 二、解决的问题

在处理包含中文数据的表格时，默认的排序规则通常基于 Unicode 编码，无法按照中文拼音或笔画顺序进行排序，导致排序结果不符合中文使用习惯。本示例通过自定义排序比较函数，利用 JavaScript 的 `localeCompare` 方法实现了符合中文语言习惯的排序功能，使得包含中文的数据能够按照拼音顺序正确排列。

## 三、实现思路

### 3.1 核心技术点

#### 监听 RangeSorting 事件

通过绑定 `RangeSorting` 事件，在用户触发排序操作时拦截默认行为，并注入自定义的比较函数：

```javascript
sheet.bind(GC.Spread.Sheets.Events.RangeSorting, function (e, info) {
    isAscending = info.ascending;
    info.compareFunction = sortDomain
});
```

事件回调中的 `info` 对象包含排序方向（`ascending`）和比较函数（`compareFunction`）属性，通过替换 `compareFunction` 实现自定义排序逻辑。

#### 自定义中文排序比较函数

使用 JavaScript 原生的 `localeCompare` 方法实现中文排序：

```javascript
function sortDomain(value1, value2) {
    if (value1 && value2) {
        return value1.toString().localeCompare(value2.toString(), 'zh');
    } else if (!value1 && !value2) {
        return 0;
    } else if (value1 && !value2) {
        return isAscending ? -1 : 1;
    } else if (!value1 && value2) {
        return isAscending ? 1 : -1;
    }
}
```

`localeCompare` 方法的第二个参数 `'zh'` 指定了中文语言环境，确保按照中文拼音顺序进行比较。同时处理了空值情况，根据排序方向（升序/降序）返回相应的比较结果。

#### 配置行筛选器

创建 `HideRowFilter` 并应用到数据区域，使用户可以通过筛选按钮访问排序功能：

```javascript
let filter = new GC.Spread.Sheets.Filter.HideRowFilter(
    new GC.Spread.Sheets.Range(2, 1, salesData.length - 1, salesData[0].length)
);
sheet.rowFilter(filter);
```

筛选器应用于数据区域（从第 2 行开始，排除标题行），用户点击列标题的筛选按钮即可触发排序操作。

### 3.2 技术栈

* @grapecity/spread-sheets: 15.0.0（核心表格组件）
* @grapecity/spread-sheets-resources-zh: 15.0.0（中文资源包）
* TypeScript: ^4.1.2（开发语言）
* SystemJS: ^0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

安装完成后，在浏览器中打开 `index.html` 文件即可运行示例。

### 4.2 操作步骤

1. 打开示例页面，表格中显示销售人员数据
2. 点击"SalesPers"列标题右侧的筛选按钮
3. 在筛选菜单中选择"升序排序"或"降序排序"
4. 观察中文名称按照拼音顺序正确排列（如"北京农业"、"北京信息"、"博大精深"等）
5. 可点击页面上方的"点我查看演示视频"按钮观看操作演示

## 五、功能特点

### 5.1 优点

* 符合中文使用习惯：排序结果按照拼音顺序排列，符合中文用户的阅读习惯
* 实现简单：利用 JavaScript 原生 API，无需引入额外的排序库
* 兼容性好：`localeCompare` 方法在现代浏览器中广泛支持
* 处理完善：正确处理空值和边界情况，保证排序稳定性

## 六、关键代码片段

### 事件绑定与比较函数注入

```javascript
let isAscending;

sheet.bind(GC.Spread.Sheets.Events.RangeSorting, function (e, info) {
    isAscending = info.ascending;  // 保存排序方向
    info.compareFunction = sortDomain  // 注入自定义比较函数
});
```

### 中文排序核心逻辑

```javascript
function sortDomain(value1, value2) {
    if (value1 && value2) {
        // 使用 localeCompare 进行中文排序
        return value1.toString().localeCompare(value2.toString(), 'zh');
    } else if (!value1 && !value2) {
        return 0;  // 两个都为空，相等
    } else if (value1 && !value2) {
        return isAscending ? -1 : 1;  // value1 有值，根据排序方向决定位置
    } else if (!value1 && value2) {
        return isAscending ? 1 : -1;  // value2 有值，根据排序方向决定位置
    }
}
```

## 七、总结

本示例展示了如何通过监听 SpreadJS 的 RangeSorting 事件并提供自定义比较函数来实现中文排序功能。开发者可以从中学到：

1. 如何监听和拦截 SpreadJS 的排序事件
2. 如何使用 `localeCompare` 方法实现符合特定语言习惯的排序
3. 如何在自定义比较函数中处理空值和边界情况
4. 如何配置和使用 SpreadJS 的行筛选器功能

该方案适用于所有需要处理中文数据排序的场景，也可以扩展到其他语言环境（如日文、韩文等），只需修改 `localeCompare` 的语言参数即可。对于更复杂的排序需求（如多列排序、自定义排序规则），可以在比较函数中添加更多的逻辑判断。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
