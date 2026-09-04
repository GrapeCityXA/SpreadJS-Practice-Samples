## 一、Demo 概述

本示例展示了如何在 SpreadJS 中自定义表头筛选菜单的弹出框内容。通过重写 `HideRowFilter.prototype.openFilterDialog` 方法，开发者可以针对特定列实现自定义的筛选界面，而其他列仍使用默认的筛选弹出框。该示例实现了一个基于最小值和最大值范围的数值筛选功能，用户可以通过输入数值范围来过滤数据。

## 二、解决的问题

- **自定义筛选交互**：默认的筛选菜单可能无法满足特定业务场景的需求，通过自定义筛选弹出框，可以提供更符合业务逻辑的筛选方式
- **范围筛选需求**：对于数值类型的列，提供最小值和最大值的范围筛选比逐项勾选更加高效和直观
- **混合筛选模式**：在同一个表格中，部分列使用自定义筛选，部分列使用默认筛选，满足不同列的筛选需求

## 三、实现思路

### 3.1 核心技术点

#### 自定义筛选对话框类

创建一个 `customFilterDialog` 类来管理自定义筛选弹出框的生命周期，包括初始化、打开、关闭和执行筛选操作。

```javascript
function customFilterDialog(sheet, filterHitInfo) {
    this._sheet = sheet;
    this._filterHitInfo = filterHitInfo;
    this._container = null;
    this.init();
}

customFilterDialog.prototype.init = function() {
    var $overlay = $("<div><div style='position: absolute;width:180px; border: 1px solid;background-color: #fff;height:100px;'><label style='position: absolute;top:5px;left:5px;'>最小值</label><input id='min' style='position: absolute;left: 60px;top: 5px;width:100px;height:20px' /><label style='position: absolute;top:35px;left:5px;'>最大值</label><input id='max' style='position: absolute;width:100px;left: 60px;height:20px;top:35px;' /><button id='filter' style='position: absolute;width:100px; height:30px;top:66px;left:50px;'>确定</button></div></div>");
    $overlay.css("z-index", 100000);
    $overlay.css("position", "absolute");
    this._container = $overlay[0];
    $overlay.appendTo($(document.body));
}
```

该类通过 jQuery 动态创建包含最小值、最大值输入框和确定按钮的自定义 UI，并将其添加到页面中。

#### 重写 openFilterDialog 方法

通过重写 `HideRowFilter.prototype.openFilterDialog` 方法，拦截筛选按钮的点击事件，根据列索引决定使用自定义筛选还是默认筛选。

```javascript
var oldOpenFilterDialog = GC.Spread.Sheets.Filter.HideRowFilter.prototype.openFilterDialog;
GC.Spread.Sheets.Filter.HideRowFilter.prototype.openFilterDialog = function(filterButtonHitInfo) {
    var sheet = GC.Spread.Sheets.findControl("ss").getActiveSheet();
    if (filterButtonHitInfo.col == 4) { // 第四列自定义筛选弹框
        var filterDialog = new customFilterDialog(sheet, filterButtonHitInfo);
        filterDialog.open();
    } else {
        oldOpenFilterDialog.apply(this, [filterButtonHitInfo]);
    }
}
```

这里保存了原始的 `openFilterDialog` 方法引用，当列索引为 4（第五列，即 ComPct 列）时使用自定义筛选，其他列调用原始方法使用默认筛选。

#### 条件筛选逻辑实现

使用 SpreadJS 的条件格式化 API 构建复合筛选条件，实现基于最小值和最大值的范围筛选。

```javascript
customFilterDialog.prototype.doFilter = function() {
    var colIndex = this._filterHitInfo.col;
    var drf = this._filterHitInfo.rowFilter;
    drf.removeFilterItems(colIndex);

    let minCondition = new ns.ConditionalFormatting.Condition(ns.ConditionalFormatting.ConditionType.cellValueCondition, {
        compareType: ns.ConditionalFormatting.GeneralComparisonOperators.greaterThan,
        expected: document.getElementById("min").value
    });
    let maxCondition = new ns.ConditionalFormatting.Condition(ns.ConditionalFormatting.ConditionType.cellValueCondition, {
        compareType: ns.ConditionalFormatting.GeneralComparisonOperators.lessThan,
        expected: document.getElementById("max").value
    });
    let relationCondition = new ns.ConditionalFormatting.Condition(ns.ConditionalFormatting.ConditionType.relationCondition, {
        compareType: ns.ConditionalFormatting.LogicalOperators.and,
        item1: minCondition,
        item2: maxCondition
    });
    drf.addFilterItem(colIndex, relationCondition);

    this._sheet.suspendPaint(true);
    drf.filter(colIndex);
    this._sheet.resumePaint(false);
}
```

该方法首先移除该列的现有筛选条件，然后创建大于最小值和小于最大值的两个条件，通过逻辑与操作符组合成复合条件，最后应用筛选并刷新视图。

### 3.2 技术栈

- **@grapecity/spread-sheets**: 15.0.0 - SpreadJS 核心库
- **jQuery**: 3.6.1 - 用于 DOM 操作和事件处理
- **SystemJS**: 0.19.22 - 模块加载器
- **TypeScript**: 4.1.2 - 开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

安装完成后，在浏览器中打开 `index.html` 文件即可运行示例。

### 4.2 操作步骤

1. 打开示例页面，可以看到一个包含销售数据的表格，表头行显示筛选按钮
2. 点击 E2 单元格（ComPct 列）的筛选按钮，会弹出自定义的筛选对话框，包含最小值和最大值输入框
3. 在输入框中输入数值范围，例如最小值 0.12，最大值 0.16
4. 点击"确定"按钮，表格会根据输入的范围筛选数据，只显示 ComPct 值在该范围内的行
5. 点击 F2 或 G2 单元格的筛选按钮，会显示 SpreadJS 默认的筛选菜单，可以进行常规的筛选操作

## 五、功能特点

### 5.1 优点

- **灵活的扩展性**：通过重写原型方法，可以在不修改 SpreadJS 源码的情况下实现自定义功能
- **混合筛选模式**：支持在同一表格中对不同列使用不同的筛选方式，满足多样化的业务需求
- **用户体验优化**：对于数值范围筛选场景，自定义的输入框比默认的多选列表更加直观和高效
- **代码复用性**：自定义筛选对话框类可以轻松扩展和复用到其他列或项目中

### 5.2 局限性与扩展建议

- **输入验证缺失**：当前实现未对用户输入进行验证，建议添加数值格式校验和范围合理性检查
- **UI 样式固定**：自定义对话框的样式通过内联 CSS 硬编码，建议抽离到独立的样式文件中便于维护
- **扩展建议**：可以进一步扩展为支持日期范围筛选、文本模糊匹配等更多自定义筛选类型

## 六、总结

本示例展示了 SpreadJS 中自定义表头筛选菜单的实现方法，通过重写 `openFilterDialog` 方法和创建自定义对话框类，开发者可以灵活地为特定列实现符合业务需求的筛选交互。该方案的核心价值在于：

- 掌握 SpreadJS 原型方法重写技术，实现深度定制
- 理解条件筛选 API 的使用，包括单条件、复合条件的构建
- 学习如何在 SpreadJS 中集成自定义 UI 组件

该方案适用于需要特殊筛选交互的业务场景，如数值范围筛选、日期区间筛选等，具有良好的扩展性和实用性。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/i3ntNSJ7REqCu-d2ZQezfQ/)）
