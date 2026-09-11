## 一、Demo 概述

本示例演示了如何在 SpreadJS 中监听单元格清除操作，并在清除操作发生时自动改变指定单元格的背景颜色。当用户在表格中输入内容后，通过右键菜单清除单元格内容时，A1 单元格的背景会自动变为红色。该功能通过自定义命令和事件监听机制实现，展示了 SpreadJS 的事件驱动编程模式和撤销/重做机制的扩展能力。

## 二、解决的问题

* 需要在用户执行特定操作（清除单元格）时触发自定义逻辑
* 希望将自定义操作集成到 SpreadJS 的撤销/重做系统中
* 需要监听和响应单元格内容变化事件

## 三、实现思路

### 3.1 自定义命令注册

通过 SpreadJS 的命令管理器注册自定义命令，实现可撤销的背景颜色修改操作：

```javascript
var command = {
    canUndo: true,
    execute: function (context, options, isUndo) { 
        let Commands = GC.Spread.Sheets.Commands;
        options.cmd = "test";
        if (isUndo) {
            Commands.undoTransaction(context, options);
            if (flag) {
                flag = false;
                spread.undoManager().undo()
            }
            return true;
        } else {
            Commands.startTransaction(context, options);
            var sheet = context.getSheetFromName(options.sheetName);
            sheet.getCell(0, 0).backColor("red");
            Commands.endTransaction(context, options);
            return true;
        }
    }
};

spread.commandManager().register("test", command);
```

该命令支持撤销功能，通过 `startTransaction` 和 `endTransaction` 包裹操作，确保修改可以被正确记录到撤销栈中。

### 3.2 RangeChanged 事件监听

监听 `RangeChanged` 事件，捕获单元格清除操作并触发自定义命令：

```javascript
sheet.bind(GC.Spread.Sheets.Events.RangeChanged, function (sender, args) {
    console.log('changed')
    if (args.action === GC.Spread.Sheets.RangeChangedAction.clear) {
        spread.commandManager().execute({cmd: "test", sheetName: args.sheet.name()})
    }
});
```

通过判断 `args.action` 是否为 `clear` 类型，精确识别清除操作，并执行自定义命令修改 A1 单元格背景色。

### 3.3 撤销管理器优化

重写撤销管理器的 `undo` 方法，在撤销操作期间暂停事件触发，避免事件循环：

```javascript
var undoManager = spread.undoManager();
var oldUndo = undoManager.undo;
undoManager.undo = function () {
    spread.suspendEvent();
    var result = oldUndo.apply(this, arguments);
    spread.resumeEvent();
    return result;
};
```

使用 `suspendEvent` 和 `resumeEvent` 确保撤销操作不会触发额外的 `RangeChanged` 事件。

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

1. 打开页面后，在任意单元格输入内容
2. 右键点击该单元格，选择"清除内容"
3. 观察 A1 单元格背景变为红色
4. 使用 Ctrl+Z 撤销操作，背景色恢复

## 五、功能特点

### 5.1 优点

* 完整集成撤销/重做机制，用户体验良好
* 事件监听精准，只响应清除操作
* 代码结构清晰，易于扩展为其他自定义逻辑

### 5.2 局限性与扩展建议

* 当前仅修改 A1 单元格背景，可扩展为根据清除位置动态修改
* 可以添加更多操作类型的监听（如插入、删除行列）
* 建议将背景颜色和目标单元格配置化，提高灵活性

## 六、关键代码片段

### 命令执行逻辑

```javascript
execute: function (context, options, isUndo) { 
    let Commands = GC.Spread.Sheets.Commands;
    if (isUndo) {
        // 撤销时回滚事务
        Commands.undoTransaction(context, options);
        if (flag) {
            flag = false;
            spread.undoManager().undo()
        }
        return true;
    } else {
        // 执行时开启事务并修改背景色
        Commands.startTransaction(context, options);
        var sheet = context.getSheetFromName(options.sheetName);
        sheet.getCell(0, 0).backColor("red");
        Commands.endTransaction(context, options);
        return true;
    }
}
```

该代码展示了如何通过事务机制实现可撤销的自定义操作，`flag` 变量用于控制撤销的递归深度。

## 七、总结

本示例展示了 SpreadJS 事件驱动编程和命令系统的核心用法，开发者可以学到：

* 如何注册和执行自定义命令
* 如何监听 `RangeChanged` 事件并识别操作类型
* 如何将自定义逻辑集成到撤销/重做系统
* 如何优化事件处理避免循环触发

该方案适用于需要在用户操作时触发自定义业务逻辑的场景，具有良好的扩展性，可以轻松修改为监听其他事件类型或执行更复杂的操作。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
