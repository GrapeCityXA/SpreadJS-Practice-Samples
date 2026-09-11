## 一、Demo 概述

本示例展示了如何在 SpreadJS Designer（设计器）中自定义 Ribbon 菜单，并实现两种不同类型的下拉框功能。通过扩展设计器的默认配置，开发者可以添加自定义按钮组和命令，为用户提供更加灵活的交互方式。

该示例演示了两种下拉框实现方式：一种是通过 `children` 属性添加子命令的层级下拉菜单，另一种是通过 `dropdownList` 属性为命令添加可选择项的列表下拉菜单。

## 二、解决的问题

* 扩展设计器默认功能：SpreadJS Designer 提供了丰富的内置功能，但在实际业务场景中，开发者往往需要添加自定义的业务逻辑和操作入口
* 提供多层级菜单结构：通过下拉框组织相关功能，避免 Ribbon 菜单过于拥挤，提升用户体验
* 实现两种下拉交互模式：满足不同的业务需求，既可以通过子命令实现功能分组，也可以通过选项列表实现参数选择

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 自定义命令配置

通过修改 `GC.Spread.Sheets.Designer.DefaultConfig` 的 `commandMap` 属性来注册自定义命令。每个命令包含标题、图标、执行函数等配置：

```javascript
var config = GC.Spread.Sheets.Designer.DefaultConfig;
config.commandMap = {
    Welcome: {
        title: "Welcome",
        text: "Welcome",
        iconClass: "ribbon-button-welcome",
        bigButton: "true",
        commandName: "Welcome",
        execute: function (context, propertyName, fontItalicChecked) {
            alert('Welcome to new designer.');
        }
    }
}
```

#### 3.1.2 Children 方式实现下拉框

通过 `children` 属性添加子命令，父命令可以有自己的 `execute` 函数，也可以仅作为容器：

```javascript
childrenDropdown: {
    commandName: "childrenDropdown",
    text: "Children",
    title: "Children",
    iconClass: "ribbon-button-welcome",
    bigButton: "true",
    direction: "vertical",
    execute: function (context, propertyName, fontItalicChecked) {
        alert('childrenDropdown');
    }
}
```

在 Ribbon 配置中关联子命令：

```javascript
{
    command: "childrenDropdown",
    type: "dropdown",
    children: ["childrenDropdown1", "childrenDropdown2"]
}
```

#### 3.1.3 DropdownList 方式实现下拉框

通过 `dropdownList` 属性为命令添加可选择项，支持普通列表项和分组列表项：

```javascript
listDropdown: {
    title: "List",
    text: "List",
    iconClass: "ribbon-button-welcome",
    commandName: "listDropdown",
    execute: function (context, propertyName, fontItalicChecked) {
        alert(propertyName);
    },
    type: "dropdown",
    dropdownList:[
        {text: "list1", value: "list1"},
        {text: "list2", value: "list2"},
        {text: "list3", value: "list3"},
        {groupName: "list4", groupItems: [
            {text: "list4-1", value: "list4-1"},
            {text: "list4-2", value: "list4-2"}
        ]}
    ]
}
```

#### 3.1.4 添加自定义按钮组到 Ribbon

使用 `unshift` 方法将自定义按钮组添加到 Ribbon 的首位：

```javascript
config.ribbon[0].buttonGroups.unshift({
    "label": "NewDesigner",
    "thumbnailClass": "welcome",
    "commandGroup": {
        "children": [
            {
                "direction": "vertical",
                "commands": ["Welcome"]
            },
            {
                command: "childrenDropdown",
                type: "dropdown",
                children: ["childrenDropdown1", "childrenDropdown2"]
            },
            "listDropdown"
        ]
    }
});
```

#### 3.1.5 添加自定义 Tab 页

通过 `push` 方法添加全新的 Ribbon Tab 页：

```javascript
config.ribbon.push({
    "text": "自定义",
    "id": "customTab",
    "buttonGroups": []
})
```

### 3.2 技术栈

* SpreadJS 15.0.0：核心电子表格组件
* SpreadJS Designer 15.0.0：设计器组件
* SystemJS 0.19.20：模块加载器
* TypeScript 4.1.2：开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开 index.html 文件，设计器会自动加载
2. 在 Ribbon 菜单的首位可以看到 "NewDesigner" 按钮组
3. 点击 "Welcome" 按钮，会弹出欢迎提示框
4. 点击 "Children" 下拉按钮，可以选择 "children 1" 或 "children 2" 子命令
5. 点击 "List" 下拉按钮，可以从列表中选择不同的选项（包括分组选项）
6. 切换到 "自定义" Tab 页，可以看到新添加的空白 Tab

## 五、功能特点

### 5.1 优点

* 灵活的扩展机制：通过配置对象即可实现自定义命令，无需修改设计器源码
* 两种下拉模式：`children` 适合功能分组，`dropdownList` 适合参数选择，满足不同业务需求
* 支持分组列表：`dropdownList` 支持 `groupName` 和 `groupItems`，可以实现更复杂的选项组织
* 易于维护：命令定义和 Ribbon 配置分离，代码结构清晰

### 5.2 局限性与扩展建议

* 图标样式简单：示例中使用了简单的 CSS 类名，实际项目中建议使用图标字体或 SVG
* 命令执行逻辑简单：示例中仅使用 `alert` 演示，实际应用中可以调用复杂的业务逻辑
* 扩展建议：
    * 可以通过 `context` 参数获取当前设计器和工作簿实例，实现更复杂的操作
    * 可以动态修改 `dropdownList`，实现根据上下文变化的选项列表
    * 可以结合自定义对话框，提供更丰富的用户交互

## 六、关键代码片段

### 6.1 两种下拉框的区别说明

```javascript
// 设计器dropdown可以通过children和dropdownList两种方式设置下拉项目
// 区别就是字面意思，children是添加子命令，dropdownList是给当前命令添加可选择项
```

* `children` 方式：每个子项都是独立的命令，有自己的 `execute` 函数
* `dropdownList` 方式：所有选项共享父命令的 `execute` 函数，通过 `propertyName` 参数区分选择的值

### 6.2 初始化设计器

```javascript
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", config)
let spread = designer.getWorkbook()
spread.setSheetCount(5)
let sheet = spread.getActiveSheet()
sheet.setValue(0,0,'grapecity')
```

## 七、总结

本示例展示了 SpreadJS Designer 自定义菜单的核心技术，开发者可以学到：

* 如何通过 `commandMap` 注册自定义命令
* 如何使用 `children` 和 `dropdownList` 两种方式实现下拉框
* 如何将自定义命令添加到 Ribbon 菜单的按钮组中
* 如何创建全新的 Ribbon Tab 页

该方案适用于需要在设计器中集成自定义业务功能的场景，通过配置化的方式实现了良好的扩展性。开发者可以基于此示例，结合实际业务需求，添加更多自定义命令和交互逻辑，打造符合特定业务场景的电子表格应用。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
