## 一、Demo 概述

本示例演示了如何在 SpreadJS Designer 中实现工作表保护状态下的工具栏权限动态控制。通过自定义命令的 `enableContext` 属性，开发者可以在不解除工作表保护的情况下，灵活控制设计器 Ribbon 工具栏中特定按钮的启用/禁用状态，实现更精细化的权限管理。

## 二、解决的问题

在实际应用中，工作表保护是常见的数据安全需求，但默认情况下，当工作表被保护时，设计器工具栏的大部分编辑功能会自动禁用。本示例解决了以下问题：

* 在工作表保护状态下，需要选择性地开放某些编辑功能（如字体设置）
* 需要动态切换工具栏按钮的可用性，而不是静态配置
* 需要批量控制某个 Ribbon 分组下的所有命令权限

## 三、实现思路

### 3.1 核心技术点

#### 遍历 Ribbon 配置树结构

通过递归函数遍历 SpreadJS Designer 的 Ribbon 配置树，提取目标分组下的所有命令名称：

```javascript
function findNode(node) {
    if (node instanceof Array) {
        for (let i = 0; i < node.length; i++) {
            findNode(node[i])
        }
    } else if (node.buttonGroups) {
        findNode(node.buttonGroups)
    } else if (node.commandGroup) {
        findNode(node.commandGroup)
    } else if (node.children) {
        if (node.command) {
            commands.push(node.command)
        }
        findNode(node.children)
    } else if (node.commands) {
        commands.push(...node.commands)
    } else {
        if (!node.type) {
            commands.push(node)
        }
    }
}
```

该函数处理了 Ribbon 配置的多种节点类型（数组、buttonGroups、commandGroup、children、commands），确保能够完整提取所有命令。

#### 修改命令的 enableContext 属性

通过 `GC.Spread.Sheets.Designer.getCommand()` 获取命令对象，修改其 `enableContext` 属性来控制启用条件：

```javascript
commands.forEach(commandName => {
    let command = GC.Spread.Sheets.Designer.getCommand(commandName)
    if (command) {
        if(canEdit) {
            command.enableContext = "true"  // 始终启用
        } else {
            command.enableContext = "false" // 始终禁用
        }
        config.commandMap[commandName] = command
    }
})
```

`enableContext` 设置为字符串 `"true"` 时，命令会无视工作表保护状态始终可用；设置为 `"false"` 则始终禁用。

#### 应用自定义配置

通过 `designer.setConfig()` 方法应用修改后的配置：

```javascript
let config = GC.Spread.Sheets.Designer.DefaultConfig
config.commandMap = {}
// ... 修改命令配置
designer.setConfig(config)
```

### 3.2 UI 交互流程

用户点击"切换状态"按钮 → 触发 `toggleStatus()` 函数 → 遍历字体工具栏分组 → 修改所有命令的 `enableContext` → 应用新配置 → 工具栏按钮状态更新

### 3.3 技术栈

* @grapecity/spread-sheets: 17.0.8（核心表格引擎）
* @grapecity/spread-sheets-designer: 17.0.8（设计器组件）
* SystemJS: 0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件。

### 4.2 操作步骤

1. 打开页面后，工作表默认处于保护状态
2. 观察设计器工具栏"开始"选项卡下的"字体"分组，此时按钮处于禁用状态
3. 点击页面顶部的"切换状态"按钮
4. 观察"字体"分组的按钮变为可用状态（尽管工作表仍处于保护状态）
5. 再次点击按钮，按钮恢复禁用状态

## 五、功能特点

### 5.1 优点

* 实现了工作表保护与工具栏权限的解耦，提供更灵活的权限控制方案
* 通过递归遍历自动处理整个 Ribbon 分组，无需手动枚举命令名称
* 动态切换机制便于根据业务逻辑实时调整权限

### 5.2 局限性与扩展建议

当前实现通过硬编码索引 `config.ribbon[0].buttonGroups[2]` 定位字体分组，这种方式在 Ribbon 结构变化时可能失效。建议改进方案：

* 通过命令名称或分组 ID 进行查找，提高代码健壮性
* 将权限配置抽象为配置文件，支持批量管理多个分组的权限
* 结合用户角色系统，实现基于角色的动态权限控制

## 六、关键代码片段

### 定位目标 Ribbon 分组

```javascript
let config = GC.Spread.Sheets.Designer.DefaultConfig
let ribbonNode = config.ribbon[0].buttonGroups[2] // 字体的ribbon路径
```

`config.ribbon[0]` 对应"开始"选项卡，`buttonGroups[2]` 对应"字体"分组。

### 工作表保护设置

```javascript
let sheet = spread.getActiveSheet()
sheet.options.isProtected = true
```

通过 `isProtected` 属性启用工作表保护，此时默认情况下大部分编辑功能会被禁用。

## 七、总结

本示例展示了 SpreadJS Designer 高级权限控制的实现方法，开发者可以从中学到：

* SpreadJS Designer 的 Ribbon 配置结构和遍历方法
* 命令对象的 `enableContext` 属性用法
* 如何通过 `setConfig()` 动态更新设计器配置
* 工作表保护与工具栏权限的独立控制机制

该方案适用于需要精细化权限管理的企业级应用场景，例如：允许普通用户在保护模式下修改单元格格式但不能修改公式，或根据用户角色动态调整可用功能。通过扩展本示例的思路，可以实现更复杂的权限控制逻辑。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
