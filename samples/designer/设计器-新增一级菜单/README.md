## 一、Demo 概述

本示例展示了如何在 SpreadJS Designer（设计器）中添加自定义的一级菜单（Ribbon Tab）。通过扩展设计器的默认配置，开发者可以在顶部功能区新增自定义菜单选项卡，并在其中添加自定义命令按钮，实现业务特定的功能扩展。

该示例创建了一个名为"操作"的一级菜单，包含"加载"和"上传"两个自定义按钮，演示了从配置定义、命令注册到 UI 渲染的完整流程。

## 二、解决的问题

在实际业务场景中，SpreadJS Designer 的默认功能可能无法完全满足特定需求。本示例解决了以下问题：

- 如何在设计器中添加业务特定的功能入口，而不修改原有菜单结构
- 如何将自定义业务逻辑（如文件加载、上传等）集成到设计器的 Ribbon 界面
- 如何保持与 SpreadJS Designer 原生 UI 风格的一致性

## 三、实现思路

### 3.1 克隆默认配置

首先需要获取设计器的默认配置对象，并进行深拷贝以避免污染原始配置：

```javascript
let designerConfig = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))
```

通过 `JSON.parse(JSON.stringify())` 实现深拷贝，确保对配置的修改不会影响全局默认配置。

### 3.2 定义自定义菜单结构

创建一个新的 Ribbon Tab 对象，定义菜单的基本信息和按钮组：

```javascript
let customerRibbon = {
    "id": "operate",
    "text": "操作",
    "buttonGroups": []
};
```

- `id`：菜单的唯一标识符
- `text`：菜单显示的文本
- `buttonGroups`：包含该菜单下所有按钮组的数组

### 3.3 配置按钮组

定义按钮组的布局和包含的命令：

```javascript
let ribbonFileConfig = {
    "label": "文件操作",
    "thumbnailClass": "ribbon-thumbnail-spreadsettings",
    "commandGroup": {
        "children": [
            {
                "direction": "vertical",
                "commands": ["getTemplates", "uploadFile"]
            }
        ]
    }
};
```

- `label`：按钮组的标签
- `thumbnailClass`：按钮组的缩略图样式类
- `commandGroup.children`：定义命令的排列方式（垂直或水平）和包含的命令列表

### 3.4 注册自定义命令

定义命令对象并注册到配置的 `commandMap` 中：

```javascript
let ribbonFileCommands = {
    "getTemplates": {
        iconClass: "ribbon-button-welcome",
        text: "加载",
        commandName: "getTemplates",
        execute: async function (context) {
            alert("加载");
        }
    },
    "uploadFile": {
        iconClass: "ribbon-button-welcome",
        text: "上传",
        commandName: "uploadFile",
        execute: async function (context) {
            alert("上传");
        }
    }
};

designerConfig.commandMap = {};
Object.assign(designerConfig.commandMap, ribbonFileCommands);
```

每个命令包含：
- `iconClass`：按钮图标的 CSS 类名
- `text`：按钮显示文本
- `commandName`：命令的唯一名称
- `execute`：命令执行时的回调函数，接收 `context` 参数（包含设计器和工作簿实例）

### 3.5 组装配置并初始化设计器

将按钮组添加到自定义菜单，再将菜单添加到配置的 ribbon 数组中：

```javascript
customerRibbon.buttonGroups.push(ribbonFileConfig);
designerConfig.ribbon.push(customerRibbon);

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", designerConfig);
```

### 3.6 自定义按钮图标

通过 CSS 定义按钮图标样式：

```css
.ribbon-button-welcome {
    background-image: url('./welcome.png');
    background-size: 35px 35px;
}
```

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，设计器会自动加载
2. 在顶部功能区可以看到新增的"操作"菜单选项卡
3. 点击"操作"选项卡，可以看到"文件操作"按钮组
4. 点击"加载"或"上传"按钮，会弹出对应的提示框

## 五、功能特点

### 5.1 优点

- 配置化开发：通过 JSON 配置即可定义菜单结构，无需深入了解设计器内部实现
- 扩展性强：可以添加任意数量的菜单、按钮组和命令
- 与原生 UI 一致：自定义菜单与设计器原生菜单风格保持一致
- 灵活的命令系统：支持异步操作，可以在 `execute` 函数中实现复杂的业务逻辑

### 5.2 扩展建议

- 可以在 `execute` 函数中通过 `context.getWorkbook()` 获取工作簿实例，实现更复杂的表格操作
- 可以添加更多按钮组，实现功能分类管理
- 可以使用 `context.getDesigner()` 获取设计器实例，调用设计器的 API 方法
- 建议将命令的业务逻辑抽离到独立的模块中，保持代码的可维护性

## 六、关键代码片段

### 完整的自定义菜单配置流程

```javascript
// 1. 克隆默认配置
let designerConfig = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig));

// 2. 定义自定义菜单
let customerRibbon = {
    "id": "operate",
    "text": "操作",
    "buttonGroups": []
};

// 3. 定义按钮组
let ribbonFileConfig = {
    "label": "文件操作",
    "thumbnailClass": "ribbon-thumbnail-spreadsettings",
    "commandGroup": {
        "children": [
            {
                "direction": "vertical",
                "commands": ["getTemplates", "uploadFile"]
            }
        ]
    }
};

// 4. 定义命令
let ribbonFileCommands = {
    "getTemplates": {
        iconClass: "ribbon-button-welcome",
        text: "加载",
        commandName: "getTemplates",
        execute: async function (context) {
            alert("加载");
        }
    },
    "uploadFile": {
        iconClass: "ribbon-button-welcome",
        text: "上传",
        commandName: "uploadFile",
        execute: async function (context) {
            alert("上传");
        }
    }
};

// 5. 注册命令
designerConfig.commandMap = {};
Object.assign(designerConfig.commandMap, ribbonFileCommands);

// 6. 组装配置
customerRibbon.buttonGroups.push(ribbonFileConfig);
designerConfig.ribbon.push(customerRibbon);

// 7. 初始化设计器
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", designerConfig);
```

## 七、总结

本示例展示了 SpreadJS Designer 的扩展能力，开发者可以通过配置化的方式快速添加自定义功能入口。通过学习本示例，开发者可以掌握：

- SpreadJS Designer 的配置结构和扩展机制
- 如何定义和注册自定义命令
- 如何组织 Ribbon 菜单的层级结构
- 如何通过 CSS 自定义按钮图标

该方案适用于需要在设计器中集成业务特定功能的场景，如自定义的文件管理、数据导入导出、模板管理等。通过合理的配置和命令设计，可以构建出功能丰富且易于维护的表格应用。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/_s1pknuUik6kTI6b886BWQ/)）
