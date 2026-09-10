## 一、Demo 概述

本示例演示了如何在 SpreadJS 中通过自定义按钮实现复制和粘贴功能。通过调用 SpreadJS 的命令管理器（CommandManager），开发者可以在表格外部添加自定义的复制粘贴按钮，为用户提供更灵活的操作方式，特别适用于需要自定义工具栏或特殊交互场景的应用。

## 二、解决的问题

* 在某些应用场景中，用户可能需要通过自定义按钮而非快捷键来执行复制粘贴操作
* 为不熟悉快捷键的用户提供更直观的操作方式
* 在自定义工具栏或特殊 UI 布局中集成复制粘贴功能

## 三、实现思路

### 3.1 核心技术点

#### 命令管理器的使用

SpreadJS 提供了 `commandManager()` 方法来执行内置命令。通过调用 `execute()` 方法并传入命令配置对象，可以触发复制和粘贴操作。

```javascript
spread.commandManager().execute({
    cmd: "copy",
    sheetName: activeSheet.name(),
    ignoreClipboard: true
})
```

关键参数说明：

* `cmd`: 指定要执行的命令名称（"copy" 或 "paste"）
* `sheetName`: 指定操作的工作表名称
* `ignoreClipboard`: 控制是否忽略系统剪贴板（复制时设为 true，粘贴时设为 false）

#### 自定义按钮事件绑定

使用 jQuery 为 HTML 按钮绑定点击事件，在事件处理函数中调用命令管理器：

```javascript
$("#btnCopy").click(function() {
    var activeSheet = spread.getActiveSheet();
    spread.commandManager().execute({
        cmd: "copy",
        sheetName: activeSheet.name(),
        ignoreClipboard: true
    })
})

$("#btnPaste").click(function() {
    var activeSheet = spread.getActiveSheet();
    spread.commandManager().execute({
        cmd: "paste",
        sheetName: activeSheet.name(),
        ignoreClipboard: false
    })
})
```

#### 命令扩展机制

代码中展示了如何扩展内置命令的执行逻辑：

```javascript
var oldCopy = GC.Spread.Sheets.Commands.copy.execute;
GC.Spread.Sheets.Commands.copy.execute = function(event, options) {
    oldCopy.apply(this, arguments);
}
```

这种模式允许开发者在保留原有功能的基础上，添加自定义的前置或后置处理逻辑。

### 3.2 技术栈

* SpreadJS 15.0.0：核心表格组件
* jQuery 3.6.1：DOM 操作和事件处理
* SystemJS：模块加载器
* TypeScript 4.1.2：类型支持

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 在 SpreadJS 表格中选中一个或多个单元格
2. 点击页面上方的 "Copy" 按钮，将选中内容复制到内部剪贴板
3. 选择目标单元格位置
4. 点击 "Paste" 按钮，将内容粘贴到目标位置

## 五、功能特点

### 5.1 优点

* 实现简单，代码量少，易于理解和维护
* 通过命令管理器调用内置功能，保证了操作的稳定性和一致性
* 支持命令扩展，可以在复制粘贴前后添加自定义逻辑
* 适用于需要自定义 UI 的场景

### 5.2 局限性与扩展建议

* 当前实现仅支持基本的复制粘贴，可以扩展支持剪切、特殊粘贴等功能
* 可以添加按钮状态管理（如选中内容后才启用复制按钮）
* 可以结合自定义右键菜单或工具栏，提供更完整的编辑功能

## 六、关键代码片段

### 复制功能实现

```javascript
$("#btnCopy").click(function() {
    var activeSheet = spread.getActiveSheet();
    spread.commandManager().execute({
        cmd: "copy",
        sheetName: activeSheet.name(),
        ignoreClipboard: true  // 不使用系统剪贴板
    })
})
```

### 粘贴功能实现

```javascript
$("#btnPaste").click(function() {
    var activeSheet = spread.getActiveSheet();
    spread.commandManager().execute({
        cmd: "paste",
        sheetName: activeSheet.name(),
        ignoreClipboard: false  // 使用系统剪贴板
    })
})
```

## 七、总结

本示例展示了如何通过 SpreadJS 的命令管理器实现自定义复制粘贴按钮，这是一个简单但实用的功能扩展方案。开发者可以从中学到：

* SpreadJS 命令管理器的基本使用方法
* 如何将内置命令与自定义 UI 集成
* 命令扩展机制的应用方式

该方案适用于需要自定义工具栏、特殊交互设计或为特定用户群体优化操作体验的场景，具有良好的扩展性和实用价值。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
