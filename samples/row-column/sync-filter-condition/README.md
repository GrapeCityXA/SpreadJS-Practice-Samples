## 一、Demo 概述

本示例演示了如何在两个独立的 SpreadJS 工作簿之间同步筛选条件。通过点击"同步"按钮，可以将第一个工作簿中设置的行筛选条件应用到第二个工作簿中，实现跨工作簿的筛选状态同步。

该功能适用于需要在多个工作表或工作簿之间保持数据视图一致性的场景，例如数据对比分析、多视图联动展示等。

## 二、解决的问题

在实际业务中，经常需要在多个工作簿中查看相同结构的数据，并希望它们的筛选状态保持一致。本示例解决了以下问题：

* 如何在不同的 SpreadJS 工作簿实例之间传递筛选条件
* 如何获取和应用行筛选器的筛选项
* 如何实现用户手动触发的筛选同步操作

## 三、实现思路

### 3.1 创建多个工作簿实例

示例创建了两个独立的 SpreadJS 工作簿实例，分别绑定到不同的 DOM 容器：

```javascript
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let spread1 = new GC.Spread.Sheets.Workbook(document.getElementById("ss1"));
let sheet = spread.getActiveSheet();
let sheet1 = spread1.getActiveSheet();
```

两个工作簿使用相同的数据结构进行初始化，确保数据一致性。

### 3.2 配置行筛选器

为两个工作表设置行筛选器，筛选范围覆盖所有行和前两列：

```javascript
var range = new GC.Spread.Sheets.Range(-1, 0, -1, 2);
sheet.rowFilter(new GC.Spread.Sheets.Filter.HideRowFilter(range));
sheet1.rowFilter(new GC.Spread.Sheets.Filter.HideRowFilter(range));
```

`Range(-1, 0, -1, 2)` 中的 `-1` 表示覆盖所有行，`0` 表示从第一列开始，`2` 表示包含两列。

### 3.3 同步筛选条件

核心逻辑通过按钮点击事件触发，从源工作表获取筛选条件并应用到目标工作表：

```javascript
document.getElementById("button").onclick = function(){
    var filterItems = sheet.rowFilter().getFilterItems(0);
    if(filterItems.length > 0){
        for(var i=0;i<filterItems.length;i++){
            var filterItem = filterItems[i];
            sheet1.rowFilter().addFilterItem(0, filterItem);
        }
        sheet1.rowFilter().filter(0);
    }
}
```

关键步骤：

1. 使用 `getFilterItems(0)` 获取第一列的所有筛选项
2. 遍历筛选项，通过 `addFilterItem()` 添加到目标工作表
3. 调用 `filter(0)` 应用筛选条件

### 3.4 技术栈

* @grapecity/spread-sheets: 16.1.0
* SystemJS: 0.19.22（模块加载器）
* TypeScript: 4.1.2

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，可以看到两个并排的工作簿，每个工作簿包含两列数据
2. 在第一个工作簿中，点击列头的筛选按钮，设置筛选条件（例如只显示特定数值）
3. 点击页面顶部的"同步"按钮
4. 观察第二个工作簿，其筛选状态将与第一个工作簿保持一致

## 五、功能特点

### 5.1 优点

* 实现简单，代码逻辑清晰易懂
* 支持跨工作簿实例的筛选状态传递
* 用户可控的同步时机，避免不必要的性能开销

### 5.2 局限性与扩展建议

当前实现仅支持单列筛选同步，且需要手动触发。可以考虑以下扩展：

* 支持多列筛选条件的批量同步
* 实现自动同步机制（监听筛选变化事件）
* 支持双向同步（任一工作簿的筛选变化都能同步到另一个）
* 添加筛选条件的清除和重置功能

## 六、关键代码片段

### 获取和应用筛选条件

```javascript
// 获取源工作表的筛选项
var filterItems = sheet.rowFilter().getFilterItems(0);

// 将筛选项添加到目标工作表
for(var i=0; i<filterItems.length; i++){
    var filterItem = filterItems[i];
    sheet1.rowFilter().addFilterItem(0, filterItem);
}

// 应用筛选
sheet1.rowFilter().filter(0);
```

## 七、总结

本示例展示了 SpreadJS 中跨工作簿同步筛选条件的基本实现方法。开发者可以从中学到：

* 如何创建和管理多个 SpreadJS 工作簿实例
* 行筛选器（HideRowFilter）的配置和使用
* 筛选条件的获取、传递和应用方法
* 跨实例数据状态同步的实现思路

该方案适用于需要多视图联动的数据分析场景，可以根据实际需求扩展为更复杂的同步机制，例如支持多列筛选、自动同步、双向同步等功能。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
