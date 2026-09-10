## 一、Demo 概述

本示例展示了如何在 SpreadJS 中自定义工作表 Tab 的右键菜单删除功能。通过继承 `ContextMenu` 类并注册自定义命令，实现了对默认删除工作表菜单项的文本修改和命令拦截，允许开发者在删除工作表前执行自定义逻辑（如权限验证、日志记录等），然后再调用原生删除命令完成操作。

该示例适用于需要对工作表删除操作进行额外控制或监听的场景，例如企业级应用中的权限管理、操作审计等需求。

## 二、解决的问题

* **自定义右键菜单文本**：将默认的"删除工作表"菜单项文本修改为自定义文本（如"自定义右键菜单-删除"）
* **拦截删除操作**：在执行删除工作表前插入自定义逻辑，实现操作前的验证或日志记录
* **保持原生功能**：在执行自定义逻辑后，仍然调用 SpreadJS 原生的删除命令完成实际删除操作

## 三、实现思路

### 3.1 注册自定义命令

通过 `commandManager` 注册一个自定义命令 `deleteSheetCommand`，该命令在执行时会先执行自定义逻辑，然后调用原生的 `gc.spread.contextMenu.deleteSheet` 命令：

```javascript
var deleteSheetCommand = {
    canUndo: true,
    name: "deleteSheetCommand",
    execute: function (context, options, isUndo) {
        options.cmd = "gc.spread.contextMenu.deleteSheet";
        console.log("do Some thing here~", options)
        context.commandManager().execute(options);
        options.cmd = "deleteSheetCommand";
        return true;
    }
};

spread.commandManager().register("deleteSheetCommand", deleteSheetCommand);
```

关键点：

* `canUndo: true` 表示该命令支持撤销操作
* 在 `execute` 方法中，先将 `options.cmd` 修改为原生删除命令，执行后再改回自定义命令名
* 可以在 `console.log` 处添加任意自定义逻辑

### 3.2 自定义右键菜单

通过继承 `GC.Spread.Sheets.ContextMenu.ContextMenu` 类并重写 `onOpenMenu` 方法，实现对菜单项的自定义：

```javascript
function MyContextMenu() { }
MyContextMenu.prototype = new GC.Spread.Sheets.ContextMenu.ContextMenu(spread);
MyContextMenu.prototype.onOpenMenu = function (menuData, itemsDataForShown, hitInfo, spread) {
    itemsDataForShown.forEach(function (item, index) {
        if (item && item.name === "gc.spread.deleteSheet") {
            item.text = "自定义右键菜单-删除"
            item.command = "deleteSheetCommand"
        }
    });
};
var contextMenu = new MyContextMenu();
spread.contextMenu = contextMenu;
```

实现原理：

* 遍历 `itemsDataForShown` 数组，找到名称为 `gc.spread.deleteSheet` 的菜单项
* 修改菜单项的 `text` 属性为自定义文本
* 将菜单项的 `command` 属性指向自定义命令 `deleteSheetCommand`
* 将自定义菜单对象赋值给 `spread.contextMenu`

### 3.3 技术栈

* SpreadJS 15.0.0
* TypeScript 4.1.2
* SystemJS 0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行示例。

### 4.2 操作步骤

1. 打开示例页面，可以看到一个包含数据的工作表
2. 右键点击工作表 Tab（底部的工作表标签）
3. 在弹出的右键菜单中，可以看到"自定义右键菜单-删除"选项（原本是"删除工作表"）
4. 点击该选项，控制台会输出自定义日志信息，然后执行删除操作
5. 可以通过撤销操作（Ctrl+Z）恢复删除的工作表

## 五、功能特点

### 5.1 优点

* **灵活的拦截机制**：可以在删除操作前执行任意自定义逻辑，如权限验证、二次确认、日志记录等
* **保持原生功能**：自定义命令最终调用原生删除命令，确保删除操作的完整性和可靠性
* **支持撤销操作**：通过 `canUndo: true` 配置，自定义命令支持撤销/重做功能
* **易于扩展**：可以基于此方案扩展其他右键菜单项的自定义功能

### 5.2 局限性与扩展建议

* **当前实现仅修改了文本和命令**：如需添加新的菜单项或修改菜单结构，需要进一步扩展 `onOpenMenu` 方法
* **扩展建议**：可以在自定义命令中添加异步操作（如调用后端 API 验证权限），需要注意处理异步逻辑和用户体验

## 六、关键代码片段

### 命令注册与执行流程

```javascript
// 1. 定义自定义命令
var deleteSheetCommand = {
    canUndo: true,
    name: "deleteSheetCommand",
    execute: function (context, options, isUndo) {
        // 2. 执行自定义逻辑
        console.log("do Some thing here~", options)
        
        // 3. 调用原生删除命令
        options.cmd = "gc.spread.contextMenu.deleteSheet";
        context.commandManager().execute(options);
        
        // 4. 恢复命令名称
        options.cmd = "deleteSheetCommand";
        return true;
    }
};

// 5. 注册命令
spread.commandManager().register("deleteSheetCommand", deleteSheetCommand);
```

### 右键菜单自定义

```javascript
// 1. 创建自定义菜单类
function MyContextMenu() { }
MyContextMenu.prototype = new GC.Spread.Sheets.ContextMenu.ContextMenu(spread);

// 2. 重写 onOpenMenu 方法
MyContextMenu.prototype.onOpenMenu = function (menuData, itemsDataForShown, hitInfo, spread) {
    itemsDataForShown.forEach(function (item, index) {
        if (item && item.name === "gc.spread.deleteSheet") {
            item.text = "自定义右键菜单-删除"  // 修改文本
            item.command = "deleteSheetCommand"  // 绑定自定义命令
        }
    });
};

// 3. 应用自定义菜单
var contextMenu = new MyContextMenu();
spread.contextMenu = contextMenu;
```

## 七、总结

本示例展示了 SpreadJS 中自定义右键菜单和命令的核心技术，开发者可以从中学到：

1. 如何通过 `commandManager` 注册和执行自定义命令
2. 如何继承 `ContextMenu` 类并重写 `onOpenMenu` 方法实现菜单自定义
3. 如何在自定义命令中调用原生命令，实现功能增强而非替换
4. 如何实现支持撤销/重做的自定义操作

该方案适用于需要对 SpreadJS 内置操作进行监听、验证或增强的场景，具有良好的扩展性，可以应用于其他右键菜单项或工具栏命令的自定义。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
