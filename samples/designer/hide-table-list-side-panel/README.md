## 一、Demo 概述

本示例演示了如何在 SpreadJS Designer 中自定义配置，隐藏报表设计模式下的数据源侧边栏（tableListPanel）。通过修改 Designer 的命令配置，开发者可以控制特定面板的显示与隐藏，从而实现更加定制化的用户界面。

该功能适用于需要简化报表设计界面、限制用户操作权限或提供特定工作流程的应用场景。

## 二、解决的问题

* **界面定制需求**：在某些业务场景下，数据源侧边栏可能包含敏感信息或不需要暴露给最终用户，需要将其隐藏
* **简化用户体验**：对于特定的报表设计流程，隐藏不必要的面板可以减少界面复杂度，提升用户专注度
* **权限控制**：通过隐藏特定功能面板，可以实现基于角色的界面权限管理

## 三、实现思路

### 3.1 核心技术点

#### 获取默认配置并修改命令映射

通过 `GC.Spread.Sheets.Designer.DefaultConfig` 获取 Designer 的默认配置对象，然后通过 `getCommand` 方法获取特定命令（如 `tableListPanel`），修改其 `visibleContext` 属性为 `'false'`，最后将修改后的命令重新映射到配置对象中。

```javascript
const config = GC.Spread.Sheets.Designer.DefaultConfig
GC.Spread.Sheets.Designer.getCommand('tableListPanel').visibleContext = 'false'
config.commandMap = {
  'tableListPanel': GC.Spread.Sheets.Designer.getCommand('tableListPanel')
}
designer.setConfig(config)
```

这段代码的关键在于：

* `getCommand('tableListPanel')` 获取数据源面板的命令对象
* 设置 `visibleContext = 'false'` 控制该面板在所有上下文中不可见
* 通过 `commandMap` 将修改后的命令应用到配置中
* 使用 `designer.setConfig(config)` 使配置生效

### 3.2 技术栈

* SpreadJS v17.0.8（核心表格组件）
* SpreadJS Designer v17.0.8（设计器组件）
* SpreadJS ReportSheet Addon v17.0.8（报表功能扩展）
* SystemJS 0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 在浏览器中打开 `index.html`
2. 点击 Designer 工具栏中的"插入"菜单
3. 选择"报表"选项，进入报表设计模式
4. 观察左侧面板，数据源侧边栏（tableListPanel）已被隐藏

## 五、功能特点

### 5.1 优点

* **配置简单**：只需几行代码即可实现面板的显示控制
* **灵活性高**：可以通过相同方式控制其他命令和面板的可见性
* **无侵入性**：不影响 Designer 的其他功能，仅针对特定面板进行配置

### 5.2 扩展建议

* 可以扩展为动态控制多个面板的显示/隐藏，实现更复杂的权限管理
* 结合用户角色信息，根据不同用户权限动态加载不同的配置
* 可以通过 `visibleContext` 设置为特定上下文字符串，实现条件性显示

## 六、关键代码片段

### 初始化 Designer 并应用配置

```javascript
// 创建 Designer 实例
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()

// 获取默认配置
const config = GC.Spread.Sheets.Designer.DefaultConfig

// 修改 tableListPanel 命令的可见性
GC.Spread.Sheets.Designer.getCommand('tableListPanel').visibleContext = 'false'

// 将修改后的命令映射到配置中
config.commandMap = {
  'tableListPanel': GC.Spread.Sheets.Designer.getCommand('tableListPanel')
}

// 应用配置
designer.setConfig(config)
```

## 七、总结

本示例展示了 SpreadJS Designer 的配置定制能力，通过修改命令的 `visibleContext` 属性，开发者可以轻松控制特定面板的显示与隐藏。这种方法适用于需要简化界面、实现权限控制或提供定制化用户体验的场景。

开发者可以从中学到：

* SpreadJS Designer 的配置机制和 `DefaultConfig` 的使用
* 通过 `getCommand` 方法获取和修改命令对象
* 使用 `commandMap` 自定义命令映射
* 通过 `setConfig` 方法应用自定义配置

该方案具有良好的扩展性，可以应用于其他命令和面板的定制，为构建企业级报表应用提供了灵活的界面控制能力。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
