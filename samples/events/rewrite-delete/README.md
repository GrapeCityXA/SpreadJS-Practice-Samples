## 一、Demo 概述

本示例展示了如何在 SpreadJS 中重写 Del 键的默认删除行为。通过自定义命令和快捷键绑定，实现在删除单元格内容前先获取并显示被删除的数据，从而满足需要在删除操作前进行数据记录、日志追踪或二次确认的业务场景。

## 二、解决的问题

在实际应用中，直接删除单元格内容可能导致数据丢失或无法追溯。该示例解决了以下问题：

* 删除前数据追踪：在执行删除操作前捕获即将被删除的数据内容
* 操作日志记录：为审计和数据恢复提供基础支持
* 用户确认机制：通过弹窗提示用户即将删除的内容，避免误操作1

## 三、实现思路

### 3.1 自定义命令对象

通过创建符合 SpreadJS 命令规范的对象，重写 Del 键的执行逻辑：

```javascript
var command = {
    canUndo: false,
    execute: function (context, options, isUndo) {
        var Commands = GC.Spread.Sheets.Commands;
        if (isUndo) {
            Commands.undoTransaction(context, options);
            return true;
        } else {
            Commands.startTransaction(context, options);
            var selection = sheet.getSelections()[0];
            var r = selection.row;
            var c = selection.col;
            var rc = selection.rowCount;
            var cc = selection.colCount;
            // 获取删除前单元格(区域)的value
            var arr = sheet.getArray(r, c, rc, cc);
            console.log(arr)
            alert("被删除的内容为：" + JSON.stringify(arr))
            // 执行删除命令
            sheet.clear(r, c, rc, cc, GC.Spread.Sheets.SheetArea.viewport, GC.Spread.Sheets.StorageType.data);

            Commands.endTransaction(context, options);
            return true;
        }
    }
};
```

命令对象包含两个关键属性：

* `canUndo`：设置为 false，表示该命令不支持撤销操作
* `execute`：命令执行函数，包含删除前的数据获取和删除逻辑

### 3.2 命令注册与快捷键绑定

将自定义命令注册到 SpreadJS 命令管理器，并绑定到 Del 键：

```javascript
spread.commandManager().register("deleteCommand", command);
spread.commandManager().setShortcutKey("deleteCommand", GC.Spread.Commands.Key.del, false, false, false, false);
```

* `register()`：注册自定义命令，命名为 "deleteCommand"
* `setShortcutKey()`：将 Del 键绑定到该命令，后四个参数分别表示是否需要 Ctrl、Shift、Alt、Meta 键配合

### 3.3 技术栈

* SpreadJS：16.0.1
* TypeScript：^4.1.2
* SystemJS：^0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 在表格中选中一个或多个单元格
2. 输入一些内容
3. 按下 Del 键
4. 观察弹出的提示框，显示被删除的内容
5. 确认后单元格内容被清空

## 五、功能特点

### 5.1 优点

* 数据安全性：删除前可记录数据，便于审计和恢复
* 灵活扩展：可在 execute 方法中添加更多业务逻辑（如服务器日志、权限校验）
* 用户友好：通过弹窗提示避免误删操作
* 支持区域删除：不仅支持单个单元格，也支持选中区域的批量删除

### 5.2 局限性与扩展建议

当前实现的局限性：

* 不支持撤销操作（`canUndo: false`）
* 使用 alert 弹窗可能影响用户体验

扩展建议：

* 实现撤销功能：将 `canUndo` 设置为 true，并在 execute 中处理 undo 逻辑
* 优化提示方式：使用自定义对话框替代 alert，提供更好的交互体验
* 添加服务器日志：将删除记录发送到后端进行持久化存储
* 权限控制：根据用户权限决定是否允许删除操作

## 六、关键代码片段

### 获取选中区域数据

```javascript
var selection = sheet.getSelections()[0];
var r = selection.row;
var c = selection.col;
var rc = selection.rowCount;
var cc = selection.colCount;
var arr = sheet.getArray(r, c, rc, cc);
```

`getArray()` 方法返回指定区域的二维数组，包含所有单元格的值。

### 清除单元格内容

```javascript
sheet.clear(r, c, rc, cc, GC.Spread.Sheets.SheetArea.viewport, GC.Spread.Sheets.StorageType.data);
```

`clear()` 方法的参数说明：

* 前四个参数：起始行、起始列、行数、列数
* `SheetArea.viewport`：指定操作区域为视口区域
* `StorageType.data`：仅清除数据，保留样式和公式

## 七、总结

本示例展示了 SpreadJS 命令系统的灵活性和可扩展性。通过自定义命令和快捷键绑定，开发者可以轻松重写内置操作的行为，满足特定业务需求。

开发者可以从中学到：

* SpreadJS 命令管理器的使用方法
* 自定义命令对象的结构和实现
* 快捷键绑定机制
* 事务管理（startTransaction/endTransaction）的使用
* 单元格数据的批量获取和清除操作

该方案适用于需要对用户操作进行监控、记录或二次确认的场景，如财务系统、数据审计平台等。通过扩展 execute 方法，可以轻松集成更多业务逻辑，实现复杂的数据管理需求。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
