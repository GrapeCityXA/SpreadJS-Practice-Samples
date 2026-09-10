## 一、Demo 概述

本示例演示了如何在 SpreadJS 中实现强制删除行功能，即使工作表处于保护状态也能执行删除操作。通过自定义命令和拦截右键菜单，实现了绕过工作表保护限制的行删除功能。该示例适用于需要在保护工作表的前提下，允许用户执行特定删除操作的场景。

## 二、解决的问题

在实际业务场景中，工作表保护是常见的数据安全措施，但有时需要在保护状态下允许用户执行特定操作。本示例解决了以下问题：

* 工作表保护后，即使设置了 `allowDeleteRows` 权限，某些场景下仍需要更灵活的删除控制
* 需要自定义删除行为，绕过默认的保护机制
* 希望通过右键菜单提供用户友好的删除操作入口

## 三、实现思路

### 3.1 自定义删除行命令

核心实现是通过 SpreadJS 的命令管理器注册一个自定义命令 `forceDeleteRows`，该命令可以无视工作表保护状态直接执行删除操作：

```javascript
let forceDeleteRowsCommand = {
    canUndo: true,
    name: "forceDeleteRows",
    execute: function (context, options, isUndo) {
        let Commands = GC.Spread.Sheets.Commands;
        if (isUndo) {
            Commands.undoTransaction(context, options);
            return true;
        } else {
            Commands.startTransaction(context, options);
            let sheet = context.getSheetFromName(options.sheetName);
            sheet.suspendPaint();
            if (options.selections && options.selections.length) {
                let row = options.selections[0].row;
                let rowCount = options.selections[0].rowCount;
                sheet.deleteRows(row, rowCount);
            }
            sheet.resumePaint();
            Commands.endTransaction(context, options);
            return true;
        }
    },
};

spread.commandManager().register("forceDeleteRows", forceDeleteRowsCommand);
```

该命令的关键点：

* 支持撤销/重做功能（`canUndo: true`）
* 使用事务机制（`startTransaction`/`endTransaction`）确保操作的原子性
* 通过 `suspendPaint`/`resumePaint` 优化渲染性能
* 直接调用 `sheet.deleteRows()` 方法，绕过保护检查

### 3.2 拦截右键菜单

通过重写 `spread.contextMenu.onOpenMenu` 方法，将默认的删除行命令替换为自定义的 `forceDeleteRows` 命令：

```javascript
let oldOpenMenu = spread.contextMenu.onOpenMenu;
spread.contextMenu.onOpenMenu = function (menuData, itemsDataForShown, hitInfo, spread) {
    oldOpenMenu.apply(this, arguments);
    for (const element of itemsDataForShown) {
        const item = element;
        if (item.name == "gc.spread.contextMenu.deleteRows"||item.name == "gc.spread.deleteRows") {
            item.command = "forceDeleteRows";
        }
    }
};
```

这段代码遍历右键菜单项，找到删除行相关的菜单项（兼容不同版本的菜单项名称），并将其命令替换为自定义的 `forceDeleteRows`。

### 3.3 工作表保护配置

示例中设置了工作表保护，并允许删除行权限（用于对比测试）：

```javascript
sheet.setValue(1, 0, "←此sheet已被保护，请右键行头删除行测试")
sheet.options.isProtected = true
sheet.options.protectionOptions.allowDeleteRows = true
```

### 3.4 技术栈

* SpreadJS 17.0.8：核心表格控件
* SystemJS 0.19.22：模块加载器
* systemjs-plugin-babel 0.0.25：ES6 语法转译

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开示例页面，可以看到工作表已被保护，第一行显示提示文字
2. 右键点击任意行头（行号区域）
3. 在右键菜单中选择"删除行"选项
4. 观察删除操作成功执行，即使工作表处于保护状态

## 五、功能特点

### 5.1 优点

* 灵活的权限控制：可以在保护工作表的同时允许特定的删除操作
* 支持撤销/重做：自定义命令完整支持 SpreadJS 的撤销重做机制
* 用户体验友好：通过右键菜单提供直观的操作入口
* 性能优化：使用 `suspendPaint`/`resumePaint` 避免不必要的重绘

### 5.2 局限性与扩展建议

* 当前实现绕过了工作表保护机制，在生产环境中需要结合业务逻辑添加额外的权限验证
* 可以扩展为支持更多操作类型（如插入行、删除列等）
* 建议添加操作日志记录，便于审计和追溯

## 六、关键代码片段

### 命令注册与菜单拦截完整流程

```javascript
// 1. 定义自定义命令
let forceDeleteRowsCommand = {
    canUndo: true,
    name: "forceDeleteRows",
    execute: function (context, options, isUndo) {
        let Commands = GC.Spread.Sheets.Commands;
        if (isUndo) {
            Commands.undoTransaction(context, options);
            return true;
        } else {
            Commands.startTransaction(context, options);
            let sheet = context.getSheetFromName(options.sheetName);
            sheet.suspendPaint();
            if (options.selections && options.selections.length) {
                let row = options.selections[0].row;
                let rowCount = options.selections[0].rowCount;
                sheet.deleteRows(row, rowCount);
            }
            sheet.resumePaint();
            Commands.endTransaction(context, options);
            return true;
        }
    },
};

// 2. 注册命令
spread.commandManager().register("forceDeleteRows", forceDeleteRowsCommand);

// 3. 拦截右键菜单
let oldOpenMenu = spread.contextMenu.onOpenMenu;
spread.contextMenu.onOpenMenu = function (menuData, itemsDataForShown, hitInfo, spread) {
    oldOpenMenu.apply(this, arguments);
    for (const element of itemsDataForShown) {
        const item = element;
        if (item.name == "gc.spread.contextMenu.deleteRows"||item.name == "gc.spread.deleteRows") {
            item.command = "forceDeleteRows";
        }
    }
};
```

## 七、总结

本示例展示了 SpreadJS 中自定义命令和菜单拦截的高级用法，开发者可以从中学到：

* 如何使用 `commandManager` 注册自定义命令
* 如何实现支持撤销/重做的命令
* 如何拦截和修改右键菜单行为
* 如何在保护工作表的前提下实现特定操作

该方案适用于需要精细化权限控制的场景，可以根据业务需求扩展为更复杂的权限管理系统。在实际应用中，建议结合后端权限验证，确保操作的安全性和可追溯性。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
