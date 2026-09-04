## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现自定义命令系统，并结合撤销（Undo）和重做（Redo）功能。通过自定义命令封装条件格式的设置和修改操作，使这些操作能够被 SpreadJS 的 UndoManager 管理，从而实现完整的撤销重做功能。

该示例演示了如何将业务逻辑（条件格式操作）封装为可撤销的命令，这是构建复杂电子表格应用时的重要技术模式。

## 二、解决的问题

- **自定义操作的撤销重做支持**：SpreadJS 内置的撤销重做机制只能管理标准操作，当需要对自定义业务逻辑（如条件格式的批量设置）提供撤销重做支持时，需要通过自定义命令实现
- **事务性操作管理**：将多个原子操作组合成一个可撤销的事务单元，确保操作的原子性和一致性
- **命令模式实践**：通过命令模式将操作请求封装为对象，实现操作的参数化、队列化和可撤销化

## 三、实现思路

### 3.1 自定义命令注册机制

核心是通过 `commandManager.register()` 注册自定义命令，并实现 `execute` 方法来处理正常执行和撤销逻辑：

```javascript
function registerCommand(cmdName, operateFun, params) {
    var sheet = spread.getActiveSheet();
    // 注册命令的调用方法
    if (!spread.commandManager()[cmdName]) {
        spread.commandManager().register(cmdName, {
            canUndo: true,
            execute: function(context, options, isUndo) {
                var Commands = GC.Spread.Sheets.Commands;
                options.cmd = cmdName;
                if (isUndo) {
                    // isUndo 为true时，调用undoTransaction
                    Commands.undoTransaction(context, options);
                    return true;
                } else {
                    Commands.startTransaction(context, options);
                    operateFun(options.sheet, options.ranges, options.rule, options.style)
                    Commands.endTransaction(context, options);
                    return true;
                }
            }
        });
    }
}
```

关键点：
- `canUndo: true` 标记该命令支持撤销
- `startTransaction` 和 `endTransaction` 包裹实际操作，形成事务边界
- `isUndo` 参数区分正常执行和撤销执行
- `undoTransaction` 自动恢复到操作前的状态

### 3.2 撤销重做管理器的使用

通过 `undoManager` 实现撤销和重做操作：

```javascript
// 设置允许撤销操作
spread.options.allowUndo = true;

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

### 3.3 条件格式操作封装

将条件格式的设置逻辑封装为可复用的函数，通过自定义命令调用：

```javascript
var condition = function(sheet, sels, rule, style) {
    let cfs = sheet.conditionalFormats;
    let operator = 2 // 大于
    style.textDecoration = 3;
    let value1 = 2 || '';
    let value2 = undefined || '';
    let doubleValue1 = parseFloat(value1);
    let doubleValue2 = parseFloat(value2);
    cfs.addCellValueRule(operator, isNaN(doubleValue1) ? value1 : doubleValue1, 
                         isNaN(doubleValue2) ? value2 : doubleValue2, style, sels);
}
```

通过不同的命令名称和样式参数，实现条件格式的设置和修改：

```javascript
$("#btn4").click(function() {
    // 设置条件格式（红色背景）
    registerCommand('setCondiiton', (sheet, sels, rule, style) => {
        condition(sheet, sels, rule, style);
    }, [])
});

$("#btn5").click(function() {
    // 修改条件格式（黄色背景）
    registerCommand('changeCondiiton', (sheet, sels, rule, style) => {
        condition(sheet, sels, rule, style);
    }, [])
});
```

### 3.4 技术栈

- SpreadJS 15.0.0：核心电子表格引擎
- jQuery 3.1.1：UI 交互处理
- SystemJS：模块加载器
- TypeScript 4.1.2：开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 使用本地服务器打开 index.html（如 Live Server）
```

### 4.2 操作步骤

1. 打开页面后，表格中已预填充 10x3 的数据矩阵（值从 1 到 12）
2. 点击 "1_SetCR" 按钮，为选中区域添加条件格式（大于 2 的单元格显示红色背景）
3. 点击 "2_ModifyCR" 按钮，修改条件格式样式（改为黄色背景）
4. 点击 "3_Undo*2" 按钮两次，依次撤销上述两个操作
5. 点击 "4_Redo*2" 按钮两次，重新执行被撤销的操作

## 五、功能特点

### 5.1 优点

- **完整的撤销重做支持**：自定义操作与内置操作享有同等的撤销重做能力
- **事务性保证**：通过 transaction 机制确保复杂操作的原子性
- **可扩展性强**：命令注册机制可轻松扩展到其他业务逻辑
- **代码复用**：将业务逻辑与命令管理分离，提高代码可维护性

### 5.2 局限性与扩展建议

- **参数传递限制**：当前实现中 `params` 参数未被充分利用，可以扩展为传递更多配置信息
- **命令重复注册检查**：虽然有 `if (!spread.commandManager()[cmdName])` 检查，但在动态场景下可能需要更完善的命令生命周期管理
- **扩展建议**：可以将命令注册逻辑抽象为装饰器或工厂模式，进一步简化自定义命令的创建流程

## 六、关键代码片段

### 命令执行流程

```javascript
spread.commandManager().execute({
    cmd: cmdName,
    sheet: sheet,
    params: params,
    ranges: sheet.getSelections(),
    style: style,
    sheetName: sheet.name()
});
```

该方法触发命令执行，传入的 `options` 对象会被传递到 `execute` 方法中，包含了执行所需的所有上下文信息。

### 初始化配置

```javascript
var spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'), {
    sheetCount: 1
});
var sheet = spread.getActiveSheet();
sheet.setArray(0, 0, [
    [1, 2, 3],
    [2, 3, 4],
    // ... 更多数据
]);
sheet.setSelection(0, 0, 10, 3);
sheet.options.isProtected = true;
var ds = sheet.getDefaultStyle();
ds.locked = false;
sheet.setDefaultStyle(ds);
```

通过 `isProtected = true` 和 `locked = false` 的组合，实现了工作表保护但单元格可编辑的效果。

## 七、总结

本示例展示了 SpreadJS 自定义命令系统的核心用法，开发者可以从中学到：

- 如何通过 `commandManager.register()` 注册自定义命令
- 如何使用 `startTransaction` 和 `endTransaction` 实现事务性操作
- 如何通过 `undoManager` 实现撤销重做功能
- 如何将业务逻辑封装为可撤销的命令单元

该方案适用于需要对复杂业务操作提供撤销重做支持的场景，如批量数据处理、格式化操作、自定义函数执行等。通过命令模式的应用，可以构建更加健壮和用户友好的电子表格应用。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/5VP_JxQ9ekq65Zw3aMIFaw/)）
