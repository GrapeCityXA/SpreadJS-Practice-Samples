## 一、Demo 概述

本示例展示了如何在 SpreadJS Designer（设计器）中创建自定义侧边栏面板，实现审计追踪功能。通过在工具栏添加自定义按钮，用户可以切换显示/隐藏右侧的审计面板，面板内容会根据当前选中的单元格位置动态更新显示不同的系统信息。

## 二、解决的问题

在实际的企业级应用中，开发者经常需要在 SpreadJS Designer 中集成自定义的业务功能面板，例如：

* 审计追踪：记录和展示单元格的操作历史
* 数据验证：显示当前单元格的校验规则和状态
* 业务信息：展示与当前选区相关的业务数据
* 自定义工具：提供特定业务场景下的辅助功能

本示例提供了一套完整的解决方案，演示如何扩展 Designer 的 UI 界面，添加自定义侧边栏并实现与表格的交互。

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 自定义工具栏按钮

通过修改 Designer 的配置对象，在 Ribbon 工具栏中添加自定义按钮：

```javascript
var config = GC.Spread.Sheets.Designer.DefaultConfig;
config.commandMap = {
    Welcome: {
        title: "Audit",
        text: "审计追踪",
        iconClass: "ribbon-button-upload",
        bigButton: "false",
        commandName: "Audit",
        execute: async (context, propertyName) => {
            if (context.getData("CData")) {
                context.setData("CData", false);
            } else {
                context.setData("CData", true);
            }
        },
    },
}

config.ribbon[0].buttonGroups.unshift({
    "label": "自定义功能",
    "thumbnailClass": "welcome",
    "commandGroup": {
        "children": [
            {
                "direction": "vertical",
                "commands": ["Welcome"]
            }
        ]
    }
});
```

该按钮通过 `context.setData()` 切换 `CData` 状态，控制侧边栏的显示/隐藏。

#### 3.1.2 注册自定义 UI 模板

使用 Designer 的模板系统定义侧边栏的 UI 结构：

```javascript
var auditTemplate = {
  templateName: "auditOptionTemplate",
  content: [
    {
      type: "TextBlock",
      style: "margin:10px;font-size: 20px;font-weight: lighter;color: #08892c",
      text: "审计追踪",
    },
    {
      type: "Container",
      children: [
        {
          type: "ColumnSet",
          margin: "5px 0px",
          children: [
            {
              type: "Column",
              width: "100px",
              children: [
                {
                  type: "TextBlock",
                  style: "color: #08892c",
                  text: "1",
                },
              ],
            },
            {
              type: "Column",
              width: "110px",
              children: [
                {
                  type: "TextBlock",
                  bindingPath: "text1",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

GC.Spread.Sheets.Designer.registerTemplate(
  "auditOptionTemplate",
  auditTemplate
);
```

模板采用声明式结构，支持 `bindingPath` 进行数据绑定。

#### 3.1.3 实现侧边栏命令逻辑

定义侧边栏的命令对象，通过 `getState` 方法实现动态数据更新：

```javascript
export var sidePanelsAuditCommands = {
  auditOptionPanel: {
    commandName: "auditOptionPanel",
    enableContext: "AllowEditObject",
    visibleContext: "CData ",
    execute: function (context, propertyName) {
      var sheet = context.Spread.getActiveSheet();
    },
    getState: function (context) {
      let sheet = context.Spread.getActiveSheet();
      var column = sheet.getActiveColumnIndex();
      var row = sheet.getActiveRowIndex();
      var text1 = row === 0 && column === 0 ? "system1" : "";
      var text2 = row === 0 && column === 1 ? "system2" : "";

      const pictureStatus = {
        text1: text1,
        text2: text2,
      };
      return pictureStatus;
    },
  },
};
```

`getState` 方法会在单元格选择变化时自动调用，返回的对象会绑定到模板中的 `bindingPath`。

#### 3.1.4 配置侧边栏面板

将命令和模板关联，配置侧边栏的位置和样式：

```javascript
export var sidePanelsAuditConfig = {
  position: "right",
  width: "315px",
  command: "auditOptionPanel",
  uiTemplate: "auditOptionTemplate",
  showCloseButton: true,
};

// 在主配置中注册
Object.assign(config.commandMap, sidePanelsAuditCommands);
config.sidePanels.push(sidePanelsAuditConfig);
```

### 3.2 UI 交互流程

用户操作流程：

1. 打开页面 → Designer 初始化完成
2. 点击工具栏"审计追踪"按钮 → 右侧显示审计面板
3. 选择不同单元格 → 面板内容动态更新（A1 显示 "system1"，B1 显示 "system2"，其他单元格为空）
4. 再次点击按钮或面板关闭按钮 → 隐藏面板

### 3.3 技术栈

* SpreadJS Designer 16.0.1：提供设计器核心功能
* SpreadJS 核心库 16.0.1：电子表格引擎
* SystemJS：模块加载器
* TypeScript 4.1.2：类型支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 在浏览器中打开 `index.html`
2. 等待 Designer 加载完成
3. 点击工具栏左上角的"审计追踪"按钮
4. 观察右侧出现的审计面板
5. 尝试选择单元格 A1（显示 "system1"）和 B1（显示 "system2"）
6. 选择其他单元格观察面板内容变化

## 五、功能特点

### 5.1 优点

* 完全集成到 Designer UI：自定义面板与原生界面风格一致
* 响应式数据绑定：通过 `getState` 方法实现自动更新，无需手动操作 DOM
* 模块化设计：命令、模板、配置分离，易于维护和扩展
* 灵活的模板系统：支持复杂的布局结构和样式定义

### 5.2 扩展建议

* 可以将 `getState` 方法改为从后端 API 获取真实的审计数据
* 模板中可以添加更多交互元素（按钮、输入框等）
* 支持多个侧边栏面板，通过不同的 `visibleContext` 控制显示
* 可以监听 Spread 的事件（如 `CellChanged`）来触发面板刷新

## 六、关键代码片段

### 配置文件整合

在 `app.js` 中完成所有配置的整合：

```javascript
// 1. 定义工具栏命令
config.commandMap = { Welcome: { /* ... */ } };

// 2. 添加工具栏按钮组
config.ribbon[0].buttonGroups.unshift({ /* ... */ });

// 3. 注册侧边栏命令
Object.assign(config.commandMap, sidePanelsAuditCommands);

// 4. 添加侧边栏配置
config.sidePanels.push(sidePanelsAuditConfig);

// 5. 创建 Designer 实例
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", config);
```

## 七、总结

本示例展示了 SpreadJS Designer 的高度可扩展性，开发者可以通过配置对象轻松添加自定义 UI 组件。核心学习要点包括：

1. Designer 配置对象的结构和扩展方式
2. 自定义命令的定义和执行机制
3. UI 模板的声明式定义和数据绑定
4. 侧边栏面板的配置和状态管理

该方案适用于需要在 Designer 中集成业务功能面板的场景，通过 `getState` 方法可以实现与表格数据的实时联动，具有良好的扩展性和可维护性。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
