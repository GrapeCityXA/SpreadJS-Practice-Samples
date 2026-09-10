## 一、Demo 概述

本示例展示了如何在 SpreadJS Designer（设计器）中实现自定义的多层级右键菜单功能。通过扩展设计器的默认配置和上下文菜单，实现了三级菜单结构，并通过 DOM 操作解决了 SpreadJS 原生不支持三级菜单导致的二级菜单重复高亮问题。

该示例适用于需要在设计器中提供复杂菜单结构的场景，例如为用户提供分类清晰的功能入口，或者需要在右键菜单中展示层级化的操作选项。

## 二、解决的问题

* **扩展设计器菜单功能**：SpreadJS Designer 默认提供的右键菜单可能无法满足特定业务需求，需要添加自定义菜单项
* **实现多层级菜单结构**：业务场景中常需要将相关功能分组展示，通过二级、三级菜单提升用户体验
* **解决原生限制**：SpreadJS 本身不支持三级菜单，直接配置会导致二级菜单项在鼠标悬停时出现重复高亮的视觉问题
* **菜单显示控制**：需要在特定上下文（如点击视口区域）时才显示自定义菜单

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 扩展设计器配置并注册自定义命令

通过克隆 `DefaultConfig` 并修改 `contextMenu` 和 `commandMap` 来添加自定义菜单项：

```javascript
let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))

let customCommand = {
    text: "自定义菜单",
    commandName: "customCommand",
    visibleContext: "ClickViewport",
    subCommands: [subCustomCommand1, subCustomCommand2]
}

// 追加自定义命令到上下文菜单
config.contextMenu.unshift("customCommand")
config.commandMap = {
    customCommand,
}

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", config)
```

`visibleContext: "ClickViewport"` 确保菜单仅在点击视口区域时显示。

#### 3.1.2 定义多层级子命令结构

通过 `subCommands` 属性构建菜单层级关系：

```javascript
let subCustomCommand1_1 = {
    text: "子级菜单1-1",
    commandName: "subCustomCommand1_1",
    execute: (context) => {
        console.log("sub 1-1")
    }
}

let subCustomCommand1 = {
    text: "子级菜单1",
    commandName: "subCustomCommand1",
    subCommands: [subCustomCommand1_1, subCustomCommand1_2],
    execute: (context) => {
        console.log("sub 1")
    }
}
```

每个命令对象包含 `text`（显示文本）、`commandName`（命令标识）、`execute`（执行函数）和可选的 `subCommands`（子菜单数组）。

#### 3.1.3 注册命令到 Workbook 的命令管理器

设计器配置只负责菜单显示，实际命令需要注册到 Workbook：

```javascript
let spread = designer.getWorkbook()

spread.commandManager().register("subCustomCommand1_1", subCustomCommand1_1);
spread.commandManager().register("subCustomCommand1_2", subCustomCommand1_2);
spread.commandManager().register("subCustomCommand2_1", subCustomCommand2_1);
spread.commandManager().register("subCustomCommand2_2", subCustomCommand2_2);
```

#### 3.1.4 配置 Workbook 的上下文菜单数据

通过 `spread.contextMenu.menuData` 定义菜单的完整结构，包括三级菜单：

```javascript
let menuData = spread.contextMenu.menuData
menuData.unshift({
    text: "自定义菜单",
    name: "customCommand",
    command: "customCommand",
    subMenu: [{
        text: "子级菜单1",
        iconClass: "c-submenu-1",
        name: "subCustomCommand1",
        command: "subCustomCommand1",
        subMenu: [{
            text: "子级菜单1-1",
            iconClass: "",
            name: "子级菜单1-1",
            command: "subCustomCommand1_1",
        }, {
            text: "子级菜单1-2",
            iconClass: "",
            name: "子级菜单1-2",
            command: "subCustomCommand1_2",
        }]
    }]
})
spread.contextMenu.menuData = menuData
```

注

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
