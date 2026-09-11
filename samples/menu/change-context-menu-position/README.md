## 一、Demo 概述

本示例演示如何在 SpreadJS Designer 中自定义右键菜单的显示位置。通过修改命令的 `visibleContext` 属性，可以将原本在特定区域显示的菜单项移动到其他区域。示例以"保护工作表"功能为例，将该菜单项从工作表标签区域（sheetTab）移动到表格视图区域（viewport），使用户可以在表格内容区域右键点击时访问该功能。

## 二、解决的问题

在实际应用中，开发者可能需要根据业务需求调整 SpreadJS Designer 的右键菜单布局，使其更符合用户的操作习惯。默认情况下，某些功能菜单项只在特定区域显示，例如"保护工作表"仅在工作表标签上右键时出现。通过本示例的方法，可以灵活调整菜单项的显示位置，提升用户体验。

## 三、实现思路

### 3.1 核心技术点

#### 获取默认配置并深拷贝

首先需要获取 SpreadJS Designer 的默认配置对象，并进行深拷贝以避免直接修改原始配置：

```javascript
let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))
```

使用 `JSON.parse(JSON.stringify())` 进行深拷贝，确保对配置的修改不会影响全局默认配置。

#### 修改命令的 visibleContext

通过 `getCommand` 方法获取目标命令对象，然后修改其 `visibleContext` 属性：

```javascript
let ptotectSheetComd = GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.ProtectSheet)
ptotectSheetComd.visibleContext = "ClickViewport && !IsProtected"
```

* 原始的 `visibleContext` 为 `TabStripSelected && !IsProtected`（在工作表标签选中且未保护时显示）
* 修改后的 `visibleContext` 为 `ClickViewport && !IsProtected`（在视图区域点击且未保护时显示）

#### 应用自定义配置

将修改后的命令添加到配置的 `commandMap` 中，并使用该配置初始化 Designer：

```javascript
config.commandMap = {
    [GC.Spread.Sheets.Designer.CommandNames.ProtectSheet]: ptotectSheetComd
}

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", config)
```

### 3.2 技术栈

* SpreadJS v16.0.1：核心电子表格组件
* SpreadJS Designer v16.0.1：设计器组件，提供完整的表格编辑界面
* SystemJS：模块加载器，用于动态加载 ES6 模块

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

安装完成后，使用本地服务器打开 `index.html` 文件（例如使用 Live Server 或其他 HTTP 服务器）。

### 4.2 操作步骤

1. 打开示例页面，会看到一个完整的 SpreadJS Designer 界面
2. 在工作表标签区域右键点击，查看原本的菜单项（"保护工作表"已不在此处）
3. 在表格内容区域（viewport）右键点击，可以看到"保护工作表"菜单项已出现在此处
4. 点击"保护工作表"菜单项，可以正常使用该功能

## 五、功能特点

### 5.1 优点

* 灵活的菜单定制：可以根据业务需求自由调整菜单项的显示位置
* 非侵入式修改：通过配置对象修改，不影响 SpreadJS 的核心功能
* 易于扩展：同样的方法可以应用于其他命令的 `visibleContext` 修改

### 5.2 局限性与扩展建议

当前示例仅演示了单个命令的位置调整。在实际应用中，可能需要批量修改多个命令的 `visibleContext`，建议封装一个配置函数来统一管理菜单项的显示规则。此外，还可以结合自定义命令功能，实现更复杂的菜单定制需求。

## 六、关键代码片段

完整的菜单位置修改逻辑：

```javascript
// 1. 深拷贝默认配置
let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))

// 2. 获取目标命令并修改 visibleContext
let ptotectSheetComd = GC.Spread.Sheets.Designer.getCommand(
    GC.Spread.Sheets.Designer.CommandNames.ProtectSheet
)
ptotectSheetComd.visibleContext = "ClickViewport && !IsProtected"

// 3. 将修改后的命令添加到配置的 commandMap
config.commandMap = {
    [GC.Spread.Sheets.Designer.CommandNames.ProtectSheet]: ptotectSheetComd
}

// 4. 使用自定义配置初始化 Designer
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", config)
```

## 七、总结

本示例展示了如何通过修改 SpreadJS Designer 命令的 `visibleContext` 属性来调整右键菜单的显示位置。开发者可以从中学到：

* 如何获取和修改 SpreadJS Designer 的默认配置
* `visibleContext` 属性的作用和使用方法
* 如何通过 `commandMap` 应用自定义命令配置

该方案适用于需要自定义 Designer 界面布局的场景，具有良好的扩展性，可以根据实际需求调整任意命令的显示规则。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
