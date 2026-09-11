## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现多个工作簿之间的同步编辑功能。通过命令管理器（Command Manager）和自定义事件监听机制，当在一个工作簿中执行操作时，可以自动同步到另一个工作簿的对应位置，实现多工作簿的联动编辑效果。

该示例创建了两个独立的 Workbook 实例，并通过自定义命令和事件监听器实现了操作的实时同步，适用于需要多视图同步编辑、协同编辑预览等场景。

## 二、解决的问题

* **多工作簿联动编辑**：在多个工作簿实例之间实现操作同步，一个工作簿的修改能够自动反映到其他工作簿
* **自定义命令扩展**：通过 SpreadJS 的命令管理器机制，实现自定义的可撤销/重做操作
* **事件驱动的同步机制**：利用事件监听器实现松耦合的工作簿间通信

## 三、实现思路

### 3.1 核心技术点

#### 自定义命令注册

通过 SpreadJS 的命令管理器注册自定义命令，实现可撤销的单元格背景色修改功能：

```javascript
let command = {
    canUndo: true,
    execute: function (context, options, isUndo) {
        let Commands = GC.Spread.Sheets.Commands;
        if (isUndo) {
            Commands.undoTransaction(context, options);
            return true;
        } else {
            Commands.startTransaction(context, options);
            let sheet = context.getSheetFromName(options.sheetName);
            let cell = sheet.getCell(options.row, options.col);
            cell.backColor(options.backColor);
            Commands.endTransaction(context, options);
            return true;
        }
    }
};

commandManager.register("changeBackColor", command);
commandManager1.register("changeBackColor", command);
```

该命令支持事务管理，通过 `startTransaction` 和 `endTransaction` 包裹操作，确保可以正确撤销和重做。

#### 事件监听实现同步

通过监听 `anyscLicenser` 事件，将第一个工作簿的操作同步到第二个工作簿：

```javascript
spread.commandManager().addListener("anyscLicenser", function () {
    for (let i = 0; i < arguments.length; i++) {
        let cmd = arguments[i].command;
        if (cmd.clipboardText) {
            cmd.fromSheet = null;
            cmd.fromRanges = null;
        }
        commandManager1.execute(cmd)
    }
});
```

当第一个工作簿触发 `anyscLicenser` 事件时，监听器会遍历所有命令参数，并在第二个工作簿的命令管理器中执行相同的命令，从而实现同步效果。

#### 命令执行触发

通过按钮点击事件触发自定义命令的执行：

```javascript
document.getElementById("backcolor").onclick = function () {
    let selections = sheet.getSelections();
    for (let i = 0; i < selections.length; i++) {
        let row = selections[i].row;
        let col = selections[i].col;
        commandManager.execute({ 
            cmd: "changeBackColor", 
            sheetName: sheet.name(), 
            row: row, 
            col: col, 
            backColor: "#ffcc99" 
        });
    }
};
```

### 3.2 技术栈

* **@grapecity/spread-sheets**: 15.0.0 - SpreadJS 核心库
* **systemjs**: ^0.19.22 - 模块加载器
* **typescript**: ^4.1.2 - TypeScript 支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，会看到两个垂直排列的工作簿实例
2. 在第一个工作簿中选择一个或多个单元格
3. 点击"设置背景色"按钮
4. 观察两个工作簿中对应单元格的背景色都变为橙色（#ffcc99）
5. 可以使用 Ctrl+Z 撤销操作，两个工作簿会同步撤销

## 五、功能特点

### 5.1 优点

* **命令模式设计**：使用命令管理器实现操作的封装，支持撤销/重做功能
* **松耦合架构**：通过事件监听机制实现工作簿间的通信，各工作簿保持独立性
* **可扩展性强**：可以轻松注册更多自定义命令，实现更复杂的同步逻辑
* **事务管理**：通过 `startTransaction` 和 `endTransaction` 确保操作的原子性

### 5.2 局限性与扩展建议

* **单向同步**：当前实现只支持从第一个工作簿同步到第二个工作簿，如需双向同步需要添加反向监听器
* **功能单一**：示例仅演示了背景色修改，实际应用中可以扩展到更多操作类型（如数据编辑、格式设置等）
* **扩展建议**：
    * 实现双向同步机制
    * 添加更多自定义命令（如字体、边框、数据验证等）
    * 支持多个工作簿（3个以上）的同步
    * 添加同步开关，允许用户控制是否启用同步

## 六、关键代码片段

### 命令管理器获取与注册

```javascript
let commandManager = spread.commandManager();
let commandManager1 = spread1.commandManager();
commandManager.register("changeBackColor", command);
commandManager1.register("changeBackColor", command);
```

### 剪贴板数据处理

```javascript
if (cmd.clipboardText) {
    cmd.fromSheet = null;
    cmd.fromRanges = null;
}
```

在同步命令时，需要清除剪贴板相关的引用信息，避免跨工作簿的引用错误。

## 七、总结

本示例展示了 SpreadJS 命令管理器的强大功能，通过自定义命令和事件监听机制实现了多工作簿的同步编辑。开发者可以从中学到：

* SpreadJS 命令管理器的使用方法
* 自定义可撤销命令的实现方式
* 事件驱动的工作簿间通信机制
* 事务管理在操作中的应用

该方案适用于需要多视图同步、协同编辑预览、数据对比等场景，具有良好的扩展性，可以根据实际需求添加更多自定义命令和同步逻辑。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
