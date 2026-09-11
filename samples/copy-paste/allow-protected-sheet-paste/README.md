## 一、Demo 概述

本示例演示了如何在 SpreadJS 中实现一个被保护的工作表（Sheet）仍然允许用户执行粘贴操作的功能。通过自定义命令和快捷键重写机制，在保持工作表保护状态的同时，临时解除保护以完成粘贴操作，然后立即恢复保护状态。这种方案适用于需要限制用户编辑权限，但又需要允许特定操作（如粘贴）的业务场景。

## 二、解决的问题

在实际业务中，工作表保护是一种常见的权限控制手段，但默认的保护机制会阻止所有编辑操作，包括粘贴。本示例解决了以下问题：

* 如何在保护状态下允许用户执行粘贴操作
* 如何在不破坏保护机制的前提下临时解除保护
* 如何通过自定义命令重写系统默认行为

## 三、实现思路

### 3.1 核心技术点

#### 创建被保护的工作表

通过设置 `isProtected` 属性将工作表设置为保护状态：

```javascript
let protectedSheet = new GC.Spread.Sheets.Worksheet("被锁定的sheet")
protectedSheet.options.isProtected = true
spread.addSheet(1, protectedSheet);
```

#### 自定义粘贴命令

通过命令管理器注册自定义命令，重写默认的粘贴行为。核心逻辑是在粘贴前临时解除保护，粘贴完成后立即恢复保护：

```javascript
var commandV = {
    canUndo: false,
    execute: function (context, options, isUndo) {
        let sheet = context.getActiveSheet()
        if(sheet.options.isProtected) {
            sheet.options.isProtected = false
            setTimeout(() => {
                sheet.options.isProtected = true
            }, 0);
        }
        spread.commandManager().execute({ cmd: "paste" });
    }
};
spread.commandManager().register("myPaste", commandV);
```

#### 绑定快捷键

将自定义命令绑定到 Ctrl+V 快捷键，替换系统默认的粘贴行为：

```javascript
spread.commandManager().setShortcutKey("myPaste", GC.Spread.Commands.Key.v, true, false, false, false);
```

参数说明：`Key.v` 表示 V 键，第一个 `true` 表示需要按下 Ctrl 键，后续三个 `false` 分别表示不需要 Shift、Alt 和 Meta 键。

### 3.2 技术栈

* @grapecity/spread-sheets: 16.0.1
* SystemJS: 0.19.22
* TypeScript: 4.1.2

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开示例页面，可以看到两个工作表：默认的 Sheet1 和被保护的"被锁定的 sheet"
2. 在 Sheet1 中选中包含数据的单元格（A1:A5）
3. 按 Ctrl+C 复制数据
4. 切换到"被锁定的 sheet"工作表
5. 选中目标单元格，按 Ctrl+V 粘贴
6. 观察到即使工作表处于保护状态，粘贴操作仍然成功执行

## 五、功能特点

### 5.1 优点

* 保持工作表保护状态的同时允许粘贴操作
* 通过 `setTimeout` 异步机制确保粘贴操作在解除保护后立即执行
* 实现简洁，不影响其他保护功能
* 用户体验良好，无需手动切换保护状态

### 5.2 局限性与扩展建议

当前实现仅支持粘贴操作，如果需要允许其他操作（如删除、格式化等），可以参考相同的模式注册更多自定义命令。此外，可以考虑添加权限验证逻辑，根据用户角色决定是否允许执行特定操作。

## 六、关键代码片段

### 临时解除保护的核心逻辑

```javascript
if(sheet.options.isProtected) {
    sheet.options.isProtected = false
    setTimeout(() => {
        sheet.options.isProtected = true
    }, 0);
}
spread.commandManager().execute({ cmd: "paste" });
```

这段代码的关键在于使用 `setTimeout(..., 0)` 将恢复保护的操作放入事件队列的末尾，确保粘贴命令先执行完毕。这种异步处理方式避免了保护状态在粘贴过程中被提前恢复。

## 七、总结

本示例展示了如何通过 SpreadJS 的命令管理器和快捷键机制实现灵活的权限控制。开发者可以从中学到：

* 如何使用 `commandManager` 注册和重写系统命令
* 如何通过 `setShortcutKey` 自定义快捷键绑定
* 如何利用异步机制实现临时状态切换
* 工作表保护机制的灵活应用

该方案适用于需要精细化权限控制的表格应用场景，可以根据实际需求扩展到其他受限操作的临时授权。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
