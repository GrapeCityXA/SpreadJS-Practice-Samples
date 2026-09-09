## 一、Demo 概述

本示例演示了如何在 SpreadJS Designer 的右键菜单中添加自定义菜单项，并在子菜单中插入分隔符。通过自定义 `MenuView` 类，实现了对右键菜单分隔符的样式定制，使菜单结构更加清晰美观。该功能适用于需要对右键菜单进行深度定制的场景，特别是在需要对菜单项进行分组展示时。

## 二、解决的问题

- 在 SpreadJS Designer 的右键菜单中添加自定义菜单项和子菜单
- 在子菜单中插入分隔符，实现菜单项的逻辑分组
- 自定义分隔符的样式，使其符合应用的 UI 设计规范
- 避免分隔符在鼠标悬停时出现默认的高亮背景效果

## 三、实现思路

### 3.1 自定义菜单项配置

通过 SpreadJS Designer 的 `commandMap` 和 `contextMenu` 配置，可以向右键菜单中添加自定义菜单项。在子菜单中使用字符串 `'separator'` 来插入分隔符。

```javascript
let cmd1 = {
    commandName: "子菜单",
    text: "子菜单",
    execute: async function (context, propertyName) {
        console.log(111)
    },
}
let cmd2 = {
    commandName: "子菜单2",
    text: "子菜单2",
    execute: async function (context, propertyName) {
        console.log(222)
    },
}
let menuItem = {
    commandName: "myCmd",
    text: "添加红框",
    visibleContext: "ClickViewport",
    subCommands: [
        cmd1, 'separator', cmd2
    ]
};
let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))
config.commandMap = { abc: menuItem };
config.contextMenu.splice(1, 0, 'abc')
```

### 3.2 自定义 MenuView 实现分隔符样式

通过继承 `GC.Spread.Sheets.ContextMenu.MenuView` 类并重写 `createMenuItemElement` 方法，可以自定义分隔符的 DOM 结构和样式。

```javascript
function CustomMenuView() {
}

CustomMenuView.prototype = new GC.Spread.Sheets.ContextMenu.MenuView();
CustomMenuView.prototype.createMenuItemElement = function (menuItemData) {
    var self = this;
    if (menuItemData.name === "separator") {
        var containers = GC.Spread.Sheets.ContextMenu.MenuView.prototype.createMenuItemElement.call(self, menuItemData);
        var supMenuItemContainer = containers[0];
        // 清空默认内容
        while (supMenuItemContainer.firstChild) {
            supMenuItemContainer.removeChild(supMenuItemContainer.firstChild);
        }
        // 添加自定义样式类
        supMenuItemContainer.setAttribute("class", "separatorIcon")
        return supMenuItemContainer;
    } else {
        return GC.Spread.Sheets.ContextMenu.MenuView.prototype.createMenuItemElement.call(self, menuItemData);
    }
};

spread.contextMenu.menuView = new CustomMenuView();
```

### 3.3 CSS 样式定制

通过 CSS 定义分隔符的视觉样式，并使用 `:has()` 伪类选择器禁用分隔符的悬停效果。

```css
.separatorIcon{
    padding: 3px;
    width: 90%;
    margin-left: 7%;
    margin-bottom: 3px;
    border-bottom: 1px solid #ccc;
}
.gc-ui-contextmenu-hover:has(.separatorIcon) {
    background: none !important;
}
```

### 3.4 技术栈

- SpreadJS 16.0.1（核心表格组件）
- SpreadJS Designer 16.0.1（设计器组件）
- SystemJS 0.19.22（模块加载器）
- TypeScript 4.1.2（开发语言）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开示例页面，SpreadJS Designer 会自动加载
2. 在表格的任意单元格区域点击鼠标右键
3. 在右键菜单的第二项位置可以看到"添加红框"菜单项
4. 将鼠标悬停在"添加红框"上，会展开子菜单
5. 子菜单中可以看到"子菜单"、分隔符、"子菜单2"三个项目
6. 分隔符显示为灰色横线，鼠标悬停时不会出现高亮效果

## 五、功能特点

### 5.1 优点

- 实现了右键菜单的深度定制，支持自定义菜单项和子菜单结构
- 通过继承 `MenuView` 类，可以灵活控制菜单项的渲染逻辑
- 分隔符样式完全可控，可以根据应用的 UI 规范进行调整
- 使用 CSS `:has()` 伪类选择器优雅地禁用了分隔符的交互效果

### 5.2 局限性与扩展建议

- `:has()` 伪类选择器在较旧的浏览器中可能不被支持，需要考虑兼容性方案
- 当前示例中的菜单命令只是简单的 `console.log` 输出，实际应用中需要实现具体的业务逻辑
- 可以扩展 `CustomMenuView` 类，支持更多类型的自定义菜单项（如图标、复选框等）

## 六、关键代码片段

### 6.1 菜单配置与注册

```javascript
let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))
config.commandMap = { abc: menuItem };
config.contextMenu.splice(1, 0, 'abc')
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", config)
```

通过深拷贝默认配置，然后修改 `commandMap` 和 `contextMenu` 数组，将自定义菜单项插入到右键菜单的第二个位置。

### 6.2 自定义 MenuView 的核心逻辑

```javascript
CustomMenuView.prototype.createMenuItemElement = function (menuItemData) {
    var self = this;
    if (menuItemData.name === "separator") {
        var containers = GC.Spread.Sheets.ContextMenu.MenuView.prototype.createMenuItemElement.call(self, menuItemData);
        var supMenuItemContainer = containers[0];
        while (supMenuItemContainer.firstChild) {
            supMenuItemContainer.removeChild(supMenuItemContainer.firstChild);
        }
        supMenuItemContainer.setAttribute("class", "separatorIcon")
        return supMenuItemContainer;
    } else {
        return GC.Spread.Sheets.ContextMenu.MenuView.prototype.createMenuItemElement.call(self, menuItemData);
    }
};
```

通过判断 `menuItemData.name` 是否为 `"separator"`，对分隔符进行特殊处理：清空默认内容并添加自定义样式类。

## 七、总结

本示例展示了 SpreadJS Designer 右键菜单的高级定制能力，开发者可以从中学到：

- 如何通过 `commandMap` 和 `contextMenu` 配置自定义菜单项
- 如何在子菜单中插入分隔符实现菜单分组
- 如何通过继承 `MenuView` 类自定义菜单项的渲染逻辑
- 如何使用 CSS 控制菜单项的样式和交互效果

该方案适用于需要对 SpreadJS Designer 右键菜单进行深度定制的场景，具有良好的扩展性，可以在此基础上实现更复杂的菜单功能，如动态菜单、条件显示、图标菜单等。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/N8RLjJc-cEi855PvRlDyGQ/)）
