## 一、Demo 概述

本示例演示了在 SpreadJS Designer 中启用表单保护后，如何通过自定义配置使特定的工具栏按钮和右键菜单项保持可用状态。默认情况下，当工作表被保护时，大部分工具栏按钮和菜单项会被禁用，但在某些业务场景中，我们需要允许用户在保护状态下仍能执行特定操作（如文字加粗、背景色填充、插入单元格等）。

该示例通过修改 SpreadJS Designer 的命令配置，实现了在表单保护状态下保留部分编辑功能的需求。

## 二、解决的问题

* **精细化权限控制**：在表单保护场景下，需要对用户操作权限进行更细粒度的控制，而不是简单的"全部禁用"或"全部启用"
* **提升用户体验**：允许用户在保护模式下执行部分格式化操作，避免频繁切换保护状态
* **业务场景适配**：满足特定业务需求，例如允许用户修改单元格样式但不允许修改数据结构

## 三、实现思路

### 3.1 核心技术点

#### 自定义 Designer 配置

通过深拷贝 `DefaultConfig` 并修改命令的 `enableContext` 属性来控制按钮的启用状态：

```javascript
let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))
const ENABLEUSE = 'enableUse'

// 设置需要可用的按钮显示状态 - 工具栏文字变粗
GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.FontWeight).enableContext = ENABLEUSE
// 设置需要可用的按钮显示状态 - 工具栏背景色填充可用
GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.BackColor).enableContext = ENABLEUSE
// 右键菜单-插入菜单可用
GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.InsertDialog).enableContext = ENABLEUSE
```

#### 注册修改后的命令

将修改后的命令注册到配置的 `commandMap` 中：

```javascript
config.commandMap = {
    [GC.Spread.Sheets.Designer.CommandNames.FontWeight]: GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.FontWeight),
    [GC.Spread.Sheets.Designer.CommandNames.BackColor]: GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.BackColor),
    [GC.Spread.Sheets.Designer.CommandNames.InsertDialog]: GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.InsertDialog)
}
```

#### 应用自定义上下文数据

创建 Designer 实例后，通过 `setData` 方法设置自定义的上下文标识：

```javascript
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", config)
designer.setData(ENABLEUSE, true)
designer.refresh()
```

####

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
