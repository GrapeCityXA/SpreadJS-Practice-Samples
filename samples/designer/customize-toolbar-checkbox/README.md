## 一、Demo 概述

本示例展示了如何在 SpreadJS Designer 中自定义工具栏，并添加一个复选框类型的按钮来控制打印分页线的显示与隐藏。通过扩展 Designer 的默认配置，开发者可以在功能区（Ribbon）中添加自定义的 Tab 页和命令按钮，实现业务特定的交互功能。该示例适用于需要在 SpreadJS Designer 中集成自定义操作的场景。

## 二、解决的问题

* **自定义工具栏扩展**：在 SpreadJS Designer 默认工具栏基础上添加自定义功能区，满足特定业务需求
* **复选框状态管理**：实现带状态的复选框按钮，根据当前工作表状态动态显示选中/未选中状态
* **打印分页线控制**：提供可视化的打印分页线开关，方便用户在编辑时预览打印效果

## 三、实现思路

### 3.1 扩展 Designer 默认配置

通过深拷贝 `GC.Spread.Sheets.Designer.DefaultConfig` 获取默认配置，然后在 `ribbon` 数组中添加自定义 Tab 页：

```javascript
let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))
// 新增Tab
let customerRibbon = {
    id: "operate",
    text: "自定义操作",
    buttonGroups: [
        {
            label: "自定义行为",
            commandGroup: {
                children: [
                    {
                        direction: "vertical",
                        commands: ["changeLineVisible"]
                    }
                ]
            }
        }
    ]
}
config.ribbon.push(customerRibbon)
```

### 3.2 定义复选框命令

创建一个 `checkbox` 类型的命令，通过 `execute` 方法处理点击事件，通过 `getState` 方法控制复选框的选中状态：

```javascript
let changeLineVisibleExec = {
    text: '显示打印分页线',
    type: "checkbox",
    enableContext: ISENABLED,
    commandName: "changeLineVisible",
    execute: (context) => {
        let sheet = context.getWorkbook().getActiveSheet();
        var isVisible = sheet.isPrintLineVisible();
        sheet.isPrintLineVisible(!isVisible);
    }, 
    getState: (context) => {
        // getState用于控制复选框的选中状态
        let sheet = context.getWorkbook().getActiveSheet();   
        //设置 checkBox 初始状态         
        return sheet.isPrintLineVisible();   //初始为未选中状态
    }
}
```

关键点：

* `type: "checkbox"` 指定按钮类型为复选框
* `execute` 方法切换打印分页线的显示状态
* `getState` 方法返回当前状态，用于同步复选框的选中状态

### 3.3 注册命令并应用配置

将自定义命令添加到 `commandMap` 中，并通过 `setConfig` 方法应用新配置：

```javascript
config.commandMap = {
    changeLineVisible: changeLineVisibleExec,
}
designer.setConfig(config)
```

同时设置上下文数据以启用命令：

```javascript
designer.setData(ISENABLED, true)
```

### 3.4 技术栈

* SpreadJS 16.0.1：核心电子表格引擎
* SpreadJS Designer 16.0.1：可视化设计器组件
* SystemJS：模块加载器
* TypeScript 4.1.2：开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，Designer 会自动加载
2. 在工具栏中找到"自定义操作"Tab 页
3. 点击"显示打印分页线"复选框
4. 观察工作表中打印分页线的显示/隐藏效果
5. 复选框状态会根据当前工作表的打印分页线状态自动同步

## 五、功能特点

### 5.1 优点

* **配置化扩展**：通过 JSON 配置方式扩展工具栏，无需修改 Designer 源码
* **状态同步**：复选框状态与工作表实际状态实时同步，避免状态不一致
* **可复用性强**：自定义命令的实现模式可应用于其他类似功能的扩展

## 六、关键代码片段

### 复选框状态管理核心逻辑

```javascript
execute: (context) => {
    let sheet = context.getWorkbook().getActiveSheet();
    var isVisible = sheet.isPrintLineVisible();
    sheet.isPrintLineVisible(!isVisible);  // 切换状态
}, 
getState: (context) => {
    let sheet = context.getWorkbook().getActiveSheet();   
    return sheet.isPrintLineVisible();  // 返回当前状态
}
```

`execute` 方法负责切换状态，`getState` 方法负责读取状态并反映到 UI 上，两者配合实现了复选框的双向绑定效果。

## 七、总结

本示例展示了 SpreadJS Designer 工具栏扩展的基本方法，开发者可以学到：

* 如何扩展 Designer 的默认配置并添加自定义 Tab 页
* 如何定义复选框类型的命令并实现状态管理
* 如何通过 `commandMap` 注册自定义命令
* 如何使用 `getState` 方法实现 UI 状态与数据状态的同步

该方案适用于需要在 SpreadJS Designer 中集成自定义操作的场景，可以根据实际需求扩展更多类型的按钮（如普通按钮、下拉菜单等），实现丰富的业务功能定制。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
