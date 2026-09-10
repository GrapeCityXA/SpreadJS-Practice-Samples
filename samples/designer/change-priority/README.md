## 一、Demo 概述

本示例演示了如何在 SpreadJS 设计器中自定义调整菜单项的优先级顺序。通过修改菜单配置，可以将常用功能提前显示，将不常用功能后置，从而优化用户的操作体验。示例展示了如何通过配置对象来重新排列设计器功能区（Ribbon）中的菜单项顺序。

## 二、解决的问题

* **优化菜单布局**：将常用功能菜单项提前显示，提高用户操作效率
* **个性化定制**：根据业务需求调整菜单显示优先级，满足不同场景的使用习惯
* **隐藏不需要的功能**：通过设置极低优先级，将不需要的菜单项后置或隐藏

## 三、实现思路

### 3.1 核心技术点

#### 修改设计器配置的菜单优先级

SpreadJS 设计器允许通过 `config` 参数自定义 Ribbon 菜单的显示优先级。通过设置 `commandMap` 对象，可以为每个菜单命令分配不同的优先级数值，数值越小优先级越高，菜单项越靠前显示。

```javascript
let config = GC.Spread.Sheets.Designer.DefaultConfig;
let commandMap = config.commandMap;

// 修改"插入"菜单的优先级为最高
commandMap.insertTab.priority = 1;
// 修改"数据"菜单的优先级为第二
commandMap.dataTab.priority = 2;
// 修改"视图"菜单的优先级为第三
commandMap.viewTab.priority = 3;
// 修改"设置"菜单的优先级为第四
commandMap.settingTab.priority = 4;
// 将"公式"菜单的优先级设置为极低，使其后置
commandMap.formulasTab.priority = 1000;
```

### 3.2 技术栈

* SpreadJS v16.0.5：核心电子表格组件
* SpreadJS Designer v16.0.5：设计器组件
* Bootstrap 3.3.7：UI 框架

## 四、使用说明

### 4.1 运行方式

1. 直接在浏览器中打开 `index.html` 文件
2. 或通过 Web 服务器访问该示例页面

### 4.2 操作步骤

1. 打开示例页面，设计器会自动加载
2. 观察 Ribbon 功能区的菜单选项卡顺序
3. 可以看到菜单顺序已经按照配置的优先级排列：
    * "插入"选项卡显示在最前面
    * 依次是"数据"、"视图"、"设置"
    * "公式"选项卡被后置显示

## 五、功能特点

### 5.1 优点

* **灵活性高**：可以根据业务需求任意调整菜单显示顺序
* **配置简单**：通过简单的优先级数值设置即可实现菜单重排
* **用户体验优化**：将常用功能前置，减少用户查找时间

### 5.2 局限性与扩展建议

* **当前实现**：示例仅修改了选项卡级别的优先级
* **扩展建议**：
    * 可以进一步调整选项卡内部按钮组的优先级
    * 可以结合用户使用习惯，动态调整菜单优先级
    * 可以根据不同用户角色配置不同的菜单布局

## 六、关键代码片段

### 设计器初始化配置

```javascript
let config = GC.Spread.Sheets.Designer.DefaultConfig;
let commandMap = config.commandMap;

// 设置各菜单选项卡的优先级
commandMap.insertTab.priority = 1;
commandMap.dataTab.priority = 2;
commandMap.viewTab.priority = 3;
commandMap.settingTab.priority = 4;
commandMap.formulasTab.priority = 1000;

// 创建设计器实例
let designer = new GC.Spread.Sheets.Designer.Designer(
    document.getElementById("gc-designer-container"), 
    config
);
```

通过修改 `commandMap` 中的 `priority` 属性，可以控制菜单选项卡的显示顺序。优先级数值越小，菜单越靠前显示。

## 七、总结

### 学习价值

本示例展示了 SpreadJS 设计器的菜单定制能力，开发者可以从中学到：

* 如何访问和修改设计器的默认配置对象
* 如何通过优先级数值控制菜单显示顺序
* 如何根据业务需求优化设计器界面布局

### 适用场景

该方案适用于需要定制设计器界面的场景，例如：

* 针对特定业务流程优化菜单布局
* 为不同用户角色提供差异化的功能入口
* 简化设计器界面，突出核心功能

通过合理配置菜单优先级，可以显著提升用户的操作效率和使用体验。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
