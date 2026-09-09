## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现自定义状态栏项，用于实时显示数据筛选结果的统计信息。当用户对表格数据进行筛选操作时，状态栏会自动显示"在 X 条记录中找到 Y 个"的提示信息，帮助用户快速了解筛选效果。该功能通过扩展 StatusBar API 和监听 RangeFiltered 事件实现，适用于需要向用户反馈筛选结果的数据分析场景。

## 二、解决的问题

在使用 SpreadJS 进行数据筛选时，用户往往需要了解筛选后剩余的数据量，以便评估筛选条件是否合理。默认的 SpreadJS 状态栏不提供筛选结果统计功能，本示例通过自定义状态栏项解决了以下问题：

- 实时反馈筛选结果数量，避免用户手动计数
- 提供清晰的筛选状态提示，增强用户体验
- 自动显示/隐藏状态栏项，避免无筛选时的冗余信息

## 三、实现思路

### 3.1 自定义状态栏项

通过继承 `GC.Spread.Sheets.StatusBar.StatusItem` 类创建自定义状态栏项 `FilterItem`，重写 `onUpdate` 方法实现动态更新：

```javascript
function FilterItem(name, options) {
    StatusItem.call(this, name, options);
}
FilterItem.prototype = new StatusItem();
FilterItem.prototype.onUpdate = function (visible, value) {
    if (value != null) {
        this.value = value;
    }
    if (visible != null) {
        this.visible = visible;
    }
    StatusItem.prototype.onUpdate.call(this, this.value);
};
```

创建实例并添加到状态栏：

```javascript
var filterItem = new FilterItem('selectInfoItem', {
    menuContent: '筛选结果',
    tipText: '此工作表中应用了一个筛选',
    visible: false,
    showStatusInContexMenu: false,
    value: ''
});
statusBar.add(filterItem);
```

### 3.2 监听筛选事件

通过绑定 `RangeFiltered` 事件监听筛选操作，在筛选发生时计算未被过滤的行数并更新状态栏：

```javascript
spread.bind(GC.Spread.Sheets.Events.RangeFiltered, function (e, info) {
    var filterRowCount = info.sheet.rowFilter().range.rowCount;
    var unfilteredCount = getFilterResult(info.sheet);
    if (filterRowCount != unfilteredCount) {
        filterItem.onUpdate(true, "在" + filterRowCount + "条记录中找到" + unfilteredCount + "个");
    } else {
        filterItem.onUpdate(false, "");
    }
});
```

### 3.3 计算筛选结果

通过遍历筛选范围内的所有行，使用 `isRowFilteredOut` 方法判断行是否被过滤，统计未被过滤的行数：

```javascript
function getFilterResult(sheet) {
    var rowFilter = sheet.rowFilter();
    var range = rowFilter.range;
    var unfilteredCount = 0;
    for (var i = 0; i < range.rowCount; i++) {
        var row = range.row + i;
        if (!rowFilter.isRowFilteredOut(row)) {
            unfilteredCount++;
        }
    }
    return unfilteredCount;
}
```

### 3.4 技术栈

- SpreadJS 16.0.1（核心表格组件）
- SpreadJS Designer 16.0.1（设计器组件）
- SystemJS 0.19.22（模块加载器）
- TypeScript 4.1.2（开发语言）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开示例页面，表格中已预填充 10 行测试数据（数值为 1-4）
2. 点击第一列的筛选按钮，选择筛选条件（例如只显示数值为 2 的行）
3. 观察页面底部状态栏，会显示"在 10 条记录中找到 4 个"的提示信息
4. 清除筛选条件，状态栏提示自动隐藏

## 五、功能特点

### 5.1 优点

- 实时反馈：筛选操作立即触发状态栏更新，无延迟
- 自动管理：根据筛选状态自动显示/隐藏状态栏项，避免冗余信息
- 扩展性强：通过继承 StatusItem 类实现，可轻松扩展其他自定义状态栏功能
- 用户友好：提供清晰的中文提示信息，符合国内用户习惯

### 5.2 局限性与扩展建议

当前实现仅统计行数，未考虑多列筛选的复杂场景。可扩展的方向包括：

- 支持显示具体的筛选条件（例如"筛选条件：列 A = 2"）
- 支持多工作表筛选状态的独立管理
- 提供筛选历史记录功能，方便用户回溯操作

## 六、关键代码片段

### 初始化筛选器

```javascript
let filter = new GC.Spread.Sheets.Filter.HideRowFilter(
    new GC.Spread.Sheets.Range(1, 0, 10, 1)
);
sheet.rowFilter(filter);
```

创建 `HideRowFilter` 实例并应用到工作表，范围为第 2 行到第 11 行（共 10 行数据）。

### 获取状态栏实例

```javascript
let statusBar = GC.Spread.Sheets.StatusBar.findControl(
    document.getElementsByClassName("gc-statusBar")[0]
);
```

通过 DOM 查询获取 SpreadJS Designer 自动生成的状态栏控件实例。

## 七、总结

本示例展示了 SpreadJS 状态栏扩展的核心技术，开发者可以从中学到：

- 如何通过继承 StatusItem 类创建自定义状态栏项
- 如何监听 RangeFiltered 事件响应筛选操作
- 如何使用 rowFilter API 获取筛选状态和统计数据
- 如何动态控制状态栏项的显示/隐藏

该方案适用于需要向用户实时反馈数据操作结果的场景，例如数据分析工具、报表系统等。通过类似的扩展思路，还可以实现其他自定义状态栏功能，如选区统计、公式计算结果显示等。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/dqLhUpIkZECm6SXHGBNsmQ/)）
