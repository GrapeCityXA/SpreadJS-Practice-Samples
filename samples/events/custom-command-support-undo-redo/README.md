## 一、Demo 概述

本示例展示了如何在 SpreadJS 中创建支持撤销（Undo）和重做（Redo）功能的自定义命令。通过注册自定义命令 `fillNow`，实现了在选中单元格中填充当前日期的功能，并且该操作可以被撤销和重做。示例还演示了如何为自定义命令设置快捷键（Ctrl + ;），以及如何通过按钮触发命令执行、撤销和重做操作。

该示例的核心价值在于展示了 SpreadJS 命令管理器（CommandManager）的使用方式，以及如何通过事务机制（Transaction）确保自定义操作能够正确地集成到 SpreadJS 的撤销/重做栈中。

## 二、解决的问题

* **自定义操作的可撤销性**：在实际业务中，用户经常需要执行自定义的批量操作，但这些操作如果不能撤销，会给用户带来困扰。本示例展示了如何让自定义操作支持撤销和重做。
* **命令的统一管理**：通过 CommandManager 注册自定义命令，可以将自定义操作与 SpreadJS 内置命令统一管理，支持快捷键绑定和程序化调用。
* **单元格保护与操作限制**：示例中展示了如何在保护工作表的情况下，只允许对未锁定的单元格执行操作，确保数据安全。

## 三、实现思路

### 3.1 启用撤销功能

在 SpreadJS 中，默认情况下撤销功能是关闭的，需要通过 `allowUndo` 选项显式启用：

```javascript
// 设置允许撤销操作
spread.options.allowUndo = true;
```

启用后，SpreadJS 会自动记录用户的操作历史，支持通过 `undoManager` 进行撤销和重做。

### 3.2 注册自定义命令

使用 `commandManager().register()` 方法注册名为 `fillNow` 的自定义命令，该命令的核心逻辑是在选中的单元格中填充当前日期：

```javascript
spread.commandManager().register("fillNow", {
    canUndo: true,
    execute: function(context, options, isUndo) {
        var Commands = GC.Spread.Sheets.Commands;
        // 在此加cmd名称
        options.cmd = "fillNow";
        if (isUndo) {
            // isUndo 为true时，调用undoTransaction
            Commands.undoTransaction(context, options);
            return true;
        } else {
            // 开始事务
            Commands.startTransaction(context, options);
            var sheet = options.sheet;
            var ranges = options.ranges;
            if (ranges.length > 0) {
                var range = ranges[0];
                var cell = sheet.getCell(range.row, range.col);
                if (!cell.locked()) {
                    sheet.setValue(range.row, range.col, new Date());
                }
            }
            // 结束事务
            Commands.endTransaction(context, options);
            return true;
        }
    }
});
```

关键点说明：

* `canUndo: true`：声明该命令支持撤销
* `isUndo` 参数：用于区分是正常执行还是撤销操作
* `startTransaction` 和 `endTransaction`：通过事务机制包裹操作，确保操作可以被正确记录到撤销栈中
* `undoTransaction`：在撤销时调用，自动恢复到操作前的状态

### 3.3 设置快捷键

为自定义命令绑定快捷键 Ctrl + ;（分号键的键码为 186）：

```javascript
// 设置快捷键：Ctrl + ;
// 参数含义：commandName, key, isCtrl, isShift, isAlt, isMeta
spread.commandManager().setShortcutKey(
    "fillNow", 186, true, false, false, false
);
```

### 3.4 程序化调用命令

通过按钮点击事件触发命令执行：

```javascript
$("#btn1").click(function() {
    var sheet = spread.getActiveSheet();
    // 调用命令执行
    spread.commandManager().execute({
        cmd: "fillNow",
        sheet: sheet,
        ranges: sheet.getSelections(),
        sheetName: sheet.name()
    });
});
```

### 3.5 撤销和重做操作

通过 `undoManager` 实现撤销和重做：

```javascript
$("#btn2").click(function() {
    // 调用代码撤销
    var undoManager = spread.undoManager();
    undoManager.undo();
});

$("#btn3").click(function() {
    // 重做
    var undoManager = spread.undoManager();
    undoManager.redo();
});
```

### 3.6 单元格保护机制

示例中设置了工作表保护，并将第 2 列和第 2 行锁定（显示为红色），其他单元格默认为解锁状态：

```javascript
// 锁定表格
sheet.options.isProtected = true;
// 设置单元格默认样式为解锁状态
var ds = sheet.getDefaultStyle();
ds.locked = false;
sheet.setDefaultStyle(ds);
// 设置锁定行、列
sheet.getRange(-1, 1).backColor("red").locked(true);
sheet.getRange(1, -1).backColor("red").locked(true);
```

在命令执行时，会检查单元格是否被锁定，只对未锁定的单元格执行操作：

```javascript
var cell = sheet.getCell(range.row, range.col);
if (!cell.locked()) {
    sheet.setValue(range.row, range.col, new Date());
}
```

### 3.7 技术栈

* SpreadJS 15.0.0：核心表格控件
* jQuery 3.1.1：用于 DOM 操作和事件绑定
* SystemJS：模块加载器
* TypeScript 4.1.2：开发语言（编译为 JavaScript）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，可以看到一个 SpreadJS 表格，其中第 2 列和第 2 行显示为红色（已锁定）
2. 选中任意未锁定的单元格（非红色区域）
3. 点击"执行"按钮或按下 Ctrl + ; 快捷键，当前单元格会填充当前日期
4. 重复步骤 2-3，在多个单元格中填充日期
5. 点击"回滚"按钮，最后一次操作会被撤销
6. 点击"重新执行"按钮，被撤销的操作会被重做
7. 尝试选中红色区域的单元格并执行命令，会发现操作被阻止（因为单元格已锁定）

## 五、功能特点

### 5.1 优点

* **完整的撤销/重做支持**：自定义命令通过事务机制完美集成到 SpreadJS 的撤销栈中，用户体验与内置命令一致
* **灵活的命令调用方式**：支持快捷键、按钮点击、程序化调用等多种方式触发命令
* **安全的单元格保护**：在保护工作表的情况下，自定义命令会自动尊重单元格的锁定状态，避免误操作
* **易于扩展**：开发者可以参考本示例的模式，快速实现其他支持撤销的自定义命令

### 5.2 局限性与扩展建议

* **单单元格操作**：当前实现只处理选区中的第一个单元格，可以扩展为批量处理所有选中的单元格
* **固定的填充内容**：当前只能填充当前日期，可以扩展为支持自定义填充内容或填充规则
* **扩展建议**：
    * 支持批量填充多个选中单元格
    * 添加参数化支持，允许传入自定义的填充值
    * 实现更复杂的撤销逻辑，例如批量操作的部分撤销

## 六、关键代码片段

### 6.1 事务机制的使用

事务机制是实现撤销/重做的核心，必须在操作前后分别调用 `startTransaction` 和 `endTransaction`：

```javascript
// 开始事务
Commands.startTransaction(context, options);

// 执行实际操作
var sheet = options.sheet;
var ranges = options.ranges;
if (ranges.length > 0) {
    var range = ranges[0];
    var cell = sheet.getCell(range.row, range.col);
    if (!cell.locked()) {
        sheet.setValue(range.row, range.col, new Date());
    }
}

// 结束事务
Commands.endTransaction(context, options);
```

### 6.2 撤销操作的处理

在 `execute` 方法中，通过 `isUndo` 参数判断是否为撤销操作，如果是则调用 `undoTransaction`：

```javascript
if (isUndo) {
    // isUndo 为true时，调用undoTransaction
    Commands.undoTransaction(context, options);
    return true;
}
```

`undoTransaction` 会自动根据事务记录恢复到操作前的状态，开发者无需手动编写撤销逻辑。

## 七、总结

本示例展示了 SpreadJS 自定义命令的完整实现流程，特别是如何通过事务机制实现撤销/重做功能。开发者可以从中学到：

* 如何使用 `commandManager` 注册和管理自定义命令
* 如何通过 `startTransaction` 和 `endTransaction` 实现可撤销的操作
* 如何为自定义命令设置快捷键和程序化调用
* 如何在保护工作表的情况下安全地执行自定义操作
* 如何使用 `undoManager` 实现撤销和重做功能

该方案适用于需要实现复杂业务逻辑且要求操作可撤销的场景，例如批量数据处理、自定义格式化、数据导入等。通过将业务逻辑封装为自定义命令，可以提升代码的可维护性和用户体验。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
