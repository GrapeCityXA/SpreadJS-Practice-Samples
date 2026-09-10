## 一、Demo 概述

本示例展示了如何在 SpreadJS 中自定义右键菜单功能，实现插入新行时自动复制上方行的样式和行高。通过扩展原生的插入行命令，用户在右键菜单中选择"插入复制行样式"时，新插入的行会自动继承上方行的格式设置（包括前景色、背景色、行高、合并单元格等），从而保持表格样式的一致性。

该示例适用于需要频繁插入行且要求保持格式统一的场景，如数据录入表单、报表模板编辑等。

## 二、解决的问题

* **样式一致性维护**：在表格中插入新行时，原生的插入行功能不会自动复制样式，导致新行与周围行格式不一致，需要手动设置格式。本示例通过自动复制上方行的样式，解决了这一问题。
* **提升操作效率**：用户无需在插入行后再手动设置格式，减少了重复性操作，特别适合需要频繁插入行的数据录入场景。
* **自定义右键菜单**：展示了如何扩展 SpreadJS 的右键菜单功能，为开发者提供了自定义菜单项和命令的实现思路。

## 三、实现思路

### 3.1 自定义命令对象

通过定义一个符合 SpreadJS 命令规范的对象 `insertRowsCopyStyle`，实现插入行并复制样式的功能。该命令对象包含以下关键属性：

```javascript
var insertRowsCopyStyle = {
    canUndo: true,
    name: "insertRowsCopyStyle",
    execute: function (context, options, isUndo) {
        var Commands = GC.Spread.Sheets.Commands;
        if (isUndo) {
            Commands.undoTransaction(context, options);
            return true;
        } else {
            Commands.startTransaction(context, options);
            var sheet = context.getSheetFromName(options.sheetName);
            sheet.suspendPaint();
            // 先执行原生insertRows命令
            options.cmd = "gc.spread.contextMenu.insertRows"
            context.commandManager().execute(options);
            options.cmd = "insertRowsCopyStyle";
            // ... 样式复制逻辑
            sheet.resumePaint();
            Commands.endTransaction(context, options);
            return true;
        }
    }
};
```

* `canUndo: true` 表示该命令支持撤销操作
* `execute` 方法中使用事务机制（`startTransaction` 和 `endTransaction`）确保操作的原子性
* 通过 `suspendPaint()` 和 `resumePaint()` 暂停和恢复绘制，提升性能

### 3.2 样式复制逻辑

在插入行后，遍历所有选中的行区域，将上方行的样式复制到新插入的行：

```javascript
var selections = getSortedRowSelections(options.selections)
for (var i = 0; i < selections.length; i++) {
    var selection = selections[i];
    if (selection.row > 0) {
        for (var row = selection.row + beforeRowCount; row < selection.row + beforeRowCount + selection.rowCount; row++) {
            sheet.copyTo(selection.row + beforeRowCount - 1, -1, row, -1, 1, -1, 
                GC.Spread.Sheets.CopyToOptions.style | GC.Spread.Sheets.CopyToOptions.span);
        }
    }
    beforeRowCount += selection.rowCount;
}
```

* 使用 `copyTo` 方法复制样式，参数 `-1` 表示整行操作
* `CopyToOptions.style | CopyToOptions.span` 指定复制样式和合并单元格信息
* `getSortedRowSelections` 函数对选区按行索引排序，确保多选区插入时的正确性

### 3.3 扩展右键菜单

通过继承 `GC.Spread.Sheets.ContextMenu.ContextMenu` 并重写 `onOpenMenu` 方法，替换原有的插入行菜单项：

```javascript
function MyContextMenu() { }
MyContextMenu.prototype = new GC.Spread.Sheets.ContextMenu.ContextMenu(spread);
MyContextMenu.prototype.onOpenMenu = function (menuData, itemsDataForShown, hitInfo, spread) {
    itemsDataForShown.forEach(function (item, index) {
        if (item && item.name === "gc.spread.insertRows") {
            item.text = "插入复制行样式"
            item.command = "insertRowsCopyStyle"
        }
    });
};

var contextMenu = new MyContextMenu();
spread.contextMenu = contextMenu;
```

* 遍历菜单项，找到原生的 `gc.spread.insertRows` 菜单项
* 修改其显示文本和绑定的命令，将其替换为自定义命令

### 3.4 技术栈

* **@grapecity/spread-sheets**: 15.0.0（核心表格组件）
* **TypeScript**: ^4.1.2（类型支持）
* **SystemJS**: ^0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开示例页面，可以看到一个包含数据的表格，其中第 3 行（索引为 2）设置了蓝色前景色、红色背景色和 50px 行高
2. 在第 4 行（提示文本所在行）点击鼠标右键
3. 在右键菜单中选择"插入复制行样式"
4. 观察新插入的行会自动继承上方行的样式（蓝色文字、红色背景、50px 行高）
5. 可以尝试选中多行后右键插入，验证多行插入时的样式复制效果

## 五、功能特点

### 5.1 优点

* **自动化样式继承**：无需手动设置格式，提升操作效率
* **支持多选区操作**：可以同时在多个位置插入行并复制样式
* **支持撤销重做**：通过事务机制实现，符合用户操作习惯
* **完整的样式复制**：包括前景色、背景色、字体、边框、合并单元格等所有样式信息

### 5.2 局限性与扩展建议

* **仅复制上方行样式**：当前实现只复制紧邻的上方行样式，如果需要更灵活的样式来源（如下方行、指定模板行），需要扩展 `execute` 方法的逻辑
* **第一行插入限制**：代码中 `if (selection.row > 0)` 限制了在第一行之前插入时不复制样式（因为没有上方行），可以考虑添加默认样式或提示
* **扩展建议**：可以进一步扩展为插入列复制样式、插入时弹出样式选择对话框等功能

## 六、关键代码片段

### 选区排序函数

```javascript
function getSortedRowSelections(selections) {
    var sortedRanges = selections;
    for (var i = 0; i < sortedRanges.length - 1; i++) {
        for (var j = i + 1; j < sortedRanges.length; j++) {
            if (sortedRanges[i].row > sortedRanges[j].row) {
                var temp = sortedRanges[i];
                sortedRanges[i] = sortedRanges[j];
                sortedRanges[j] = temp;
            }
        }
    }
    return sortedRanges;
}
```

该函数使用冒泡排序对选区按行索引升序排列，确保在多选区插入时，从上到下依次处理，避免行索引偏移导致的错误。

### 命令注册

```javascript
spread.commandManager().register("insertRowsCopyStyle", insertRowsCopyStyle);
```

将自定义命令注册到 SpreadJS 的命令管理器中，使其可以通过 `commandManager().execute()` 调用。

## 七、总结

本示例展示了 SpreadJS 自定义命令和右键菜单的核心技术，开发者可以从中学到：

1. **自定义命令的实现方式**：包括命令对象结构、事务机制、撤销重做支持
2. **右键菜单的扩展方法**：通过继承和重写实现菜单项的自定义
3. **样式复制 API 的使用**：`copyTo` 方法和 `CopyToOptions` 枚举的应用
4. **性能优化技巧**：使用 `suspendPaint` 和 `resumePaint` 减少重绘次数

该方案适用于需要自定义表格操作行为的场景，具有良好的扩展性。开发者可以基于此思路实现更多自定义命令，如插入列复制样式、删除行前确认、批量格式化等功能，从而打造更符合业务需求的表格应用。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
