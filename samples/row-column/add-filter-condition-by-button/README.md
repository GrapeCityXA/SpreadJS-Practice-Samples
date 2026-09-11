## 一、Demo 概述

本示例演示了如何在 SpreadJS 中通过按钮动态添加和移除行筛选功能，并实现了自定义右键菜单命令，使得在筛选区域插入行时能够自动扩展筛选范围。该示例展示了 SpreadJS 的筛选 API、自定义命令系统以及右键菜单扩展机制的综合应用。

## 二、解决的问题

* 提供用户友好的筛选控制方式，通过按钮快速添加或移除筛选条件
* 解决在筛选区域插入行时筛选范围不自动更新的问题
* 演示如何扩展 SpreadJS 的右键菜单功能，实现自定义业务逻辑

## 三、实现思路

### 3.1 初始化筛选功能

使用 `HideRowFilter` 为指定区域添加筛选功能，并初始化示例数据：

```javascript
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
var sheet = spread.getActiveSheet();
sheet.setArray(0, 0, [
    [1, 3, 2, 4],
    [2, 3, 2, 5],
    [2, 5, 3, 2]
]);
sheet.rowFilter(new GC.Spread.Sheets.Filter.HideRowFilter(new GC.Spread.Sheets.Range(0, 0, 3, 4)));
```

### 3.2 自定义命令实现筛选范围自动扩展

注册自定义命令 `insertRowsWithFilter`，在插入行时自动扩展筛选范围：

```javascript
var insertRowsWithFilter = {
    canUndo: true,
    name: "insertRowsWithFilter",
    execute: function (context, options, isUndo) {
        var Commands = GC.Spread.Sheets.Commands;
        if (isUndo) {
            Commands.undoTransaction(context, options);
            return true;
        } else {
            Commands.startTransaction(context, options);
            var sheet = context.getSheetFromName(options.sheetName);
            
            // 执行原始插入行命令
            options.cmd = "gc.spread.contextMenu.insertRows"
            context.commandManager().execute(options);
            options.cmd = "insertRowsWithFilter"

            // 扩展筛选范围
            var rowFilter = sheet.rowFilter(),
                range = rowFilter.range;
            rowFilter.range = new GC.Spread.Sheets.Range(
                range.row - 1, 
                range.col, 
                range.rowCount + 1, 
                range.colCount
            );

            sheet.invalidateLayout();
            sheet.repaint();
            Commands.endTransaction(context, options);
            return true;
        }
    }
};
commandManager.register("insertRowsWithFilter", insertRowsWithFilter);
```

### 3.3 自定义右键菜单

通过继承 `ContextMenu` 类并重写 `onOpenMenu` 方法，在筛选区域的第一行右键时替换默认的插入行命令：

```javascript
function MyContextMenu() { }
MyContextMenu.prototype = new GC.Spread.Sheets.ContextMenu.ContextMenu(spread);
MyContextMenu.prototype.onOpenMenu = function (menuData, itemsDataForShown, hitInfo, spread) {
    var sheet = spread.getActiveSheet(),
        rowFilter = sheet.rowFilter();

    if (rowFilter) {
        var selections = sheet.getSelections(),
            range = rowFilter.range;

        selections.forEach(function (item, index) {
            if (item && item.row === range.row) {
                itemsDataForShown.forEach(function (item, index) {
                    if (item && item.name === "gc.spread.insertRows") {
                        item.command = "insertRowsWithFilter"
                    }
                });
                return;
            }
        });
    }
};
```

### 3.4 按钮事件处理

实现添加和移除筛选的按钮点击事件：

```javascript
$("#addFilter").click(function () {
    var sheet = spread.getActiveSheet();
    var selections = sheet.getSelections();
    if (selections.length > 1) {
        alert("不能多选");
        return false;
    }
    var selection = selections[0];
    if (!sheet.rowFilter()) {
        sheet.rowFilter(new GC.Spread.Sheets.Filter.HideRowFilter(selection));
    }
});

$("#removeFilter").click(function () {
    var sheet = spread.getActiveSheet();
    if (sheet.rowFilter()) {
        sheet.rowFilter().unfilter();
        sheet.rowFilter(null);
    }
});
```

### 3.5 技术栈

* SpreadJS 15.0.0
* jQuery 3.6.1
* SystemJS 0.19.22
* TypeScript 4.1.2

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 页面加载后会显示一个包含初始数据和筛选功能的表格
2. 选择任意区域后点击 "add filter" 按钮可为该区域添加筛选
3. 点击 "remove filter" 按钮可移除当前的筛选
4. 在筛选区域的第一行右键选择"插入行"，筛选范围会自动扩展

## 五、功能特点

### 5.1 优点

* 提供直观的按钮操作方式，降低用户使用门槛
* 自动处理筛选范围扩展，避免手动调整的繁琐
* 支持撤销/重做功能，保证操作的可逆性
* 通过自定义命令和右键菜单扩展，展示了 SpreadJS 的高度可定制性

### 5.2 局限性与扩展建议

* 当前仅处理插入行场景，可扩展支持删除行、插入列等操作
* 可以添加更多的筛选条件设置选项，如按值筛选、按颜色筛选等
* 可以考虑添加筛选状态的持久化存储功能

## 六、关键代码片段

### 命令注册与事务管理

```javascript
var commandManager = spread.commandManager();
commandManager.register("insertRowsWithFilter", insertRowsWithFilter);
```

通过 `commandManager.register()` 注册自定义命令，使用 `startTransaction` 和 `endTransaction` 确保操作的原子性和可撤销性。

### 右键菜单应用

```javascript
var contextMenu = new MyContextMenu();
contextMenu.menuView = new CustomMenuView();
spread.contextMenu = contextMenu;
```

将自定义的右键菜单实例赋值给 `spread.contextMenu`，替换默认的右键菜单行为。

## 七、总结

本示例展示了 SpreadJS 在筛选功能方面的灵活性和可扩展性。开发者可以学到：

* 如何使用 `HideRowFilter` 实现行筛选功能
* 如何注册和实现自定义命令，扩展 SpreadJS 的内置功能
* 如何通过继承 `ContextMenu` 类自定义右键菜单行为
* 如何使用事务管理确保操作的原子性和可撤销性

该方案适用于需要动态控制筛选功能、自定义用户交互流程的业务场景，具有良好的扩展性，可以根据实际需求进一步定制筛选逻辑和 UI 交互。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
