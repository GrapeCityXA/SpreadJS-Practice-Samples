## 一、Demo 概述

本示例演示了如何在 SpreadJS 中自定义右键菜单（Context Menu）功能。通过拦截和扩展 `contextMenu.onOpenMenu` 方法，开发者可以向默认的右键菜单中添加自定义菜单项，并为这些菜单项注册自定义命令处理逻辑。此外，示例还展示了如何根据用户选择的单元格位置动态控制菜单项的显示与隐藏。

该示例适用于需要在表格应用中提供个性化操作入口的场景，例如添加特定业务功能的快捷操作、根据单元格状态显示不同的菜单选项等。

## 二、解决的问题

* **扩展默认菜单**：SpreadJS 提供了默认的右键菜单，但在实际业务中往往需要添加自定义操作项，本示例展示了如何无缝扩展默认菜单
* **动态菜单控制**：根据用户当前选择的单元格位置或状态，动态决定显示哪些菜单项，提升用户体验
* **自定义命令绑定**：为自定义菜单项绑定特定的命令处理逻辑，实现业务功能与 UI 交互的解耦

## 三、实现思路

### 3.1 拦截并扩展右键菜单

通过重写 `spread.contextMenu.onOpenMenu` 方法，可以在菜单打开前拦截菜单数据，向 `itemsDataForShown` 数组中添加自定义菜单项。为了保留原有菜单逻辑，需要保存原方法引用并在最后调用。

```javascript
let oldF = spread.contextMenu.onOpenMenu
spread.contextMenu.onOpenMenu = function (menuData, itemsDataForShown, hitInfo, spread) {
    itemsDataForShown.push({
        text: "自定义右键菜单",
        name: "customContextMenu",
        command: "customCommand"
    },{
        text: "yustest",
        name: "customContextMenu",
        command: "customCommand"
    })
    // 调用原方法保留默认行为
    oldF.apply(this, arguments)
}
```

关键参数说明：

* `menuData`：菜单的原始数据
* `itemsDataForShown`：即将显示的菜单项数组，可以通过 `push` 添加新项
* `hitInfo`：鼠标点击位置的信息
* `spread`：Workbook 实例

### 3.2 动态控制菜单显示

根据用户选择的单元格位置，可以动态决定是否显示菜单项。示例中实现了"在第二行（row == 1）时清空所有菜单项"的逻辑：

```javascript
// 获取当前选中区域
let sel = spread.getActiveSheet().getSelections()[0]
if(sel.row == 1) {
    // 清空所有菜单项，不显示任何菜单
    itemsDataForShown.splice(0, itemsDataForShown.length)
}
```

这种机制可以灵活扩展，例如根据单元格的值、样式、锁定状态等条件来控制菜单项的显示。

### 3.3 注册自定义命令

使用 `commandManager().register()` 方法注册自定义命令，当用户点击菜单项时，会触发对应的命令执行逻辑：

```javascript
spread.commandManager().register("customCommand", {
    canUndo: false,
    execute: function (spread, options) {
        console.log(arguments)
    }
})
```

参数说明：

* `canUndo`：是否支持撤销操作
* `execute`：命令执行函数，接收 `spread` 实例和 `options` 参数

### 3.4 技术栈

* SpreadJS 16.0.1：核心表格控件库
* SystemJS 0.19.22：模块加载器
* TypeScript 4.1.2：类型支持（虽然示例使用 `.js` 文件，但配置了 TypeScript 环境）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 使用本地服务器打开 index.html（推荐使用 Live Server 或类似工具）
# 或直接在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，在表格区域内任意位置点击鼠标右键
2. 观察右键菜单中新增的"自定义右键菜单"和"yustest"两个菜单项
3. 点击自定义菜单项，查看浏览器控制台输出的命令参数
4. 选中第二行（row index = 1）的任意单元格，再次点击右键，观察菜单被完全隐藏

## 五、功能特点

### 5.1 优点

* **无侵入式扩展**：通过拦截原方法并保留原逻辑，不破坏 SpreadJS 的默认行为
* **灵活的动态控制**：可以根据任意业务逻辑动态调整菜单项的显示与隐藏
* **命令模式解耦**：使用命令注册机制，将菜单 UI 与业务逻辑分离，便于维护和扩展

### 5.2 局限性与扩展建议

* **菜单项样式定制**：当前示例仅添加了文本菜单项，如需添加图标、分隔线或子菜单，需要进一步配置 `menuData` 结构
* **命令参数传递**：示例中的命令执行逻辑较为简单，实际应用中可以通过 `options` 参数传递更多上下文信息（如选中的单元格范围、单元格值等）
* **国际化支持**：菜单文本可以结合国际化方案，根据用户语言动态切换

## 六、总结

本示例展示了 SpreadJS 中自定义右键菜单的核心实现方式，开发者可以从中学到：

* 如何拦截和扩展 SpreadJS 的右键菜单
* 如何根据单元格状态动态控制菜单显示
* 如何使用命令管理器注册自定义命令
* 如何保留原有功能的同时添加新功能

该方案适用于需要在表格应用中提供个性化操作入口的场景，具有良好的扩展性和可维护性。开发者可以在此基础上根据实际业务需求，添加更多复杂的菜单项和命令逻辑。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
