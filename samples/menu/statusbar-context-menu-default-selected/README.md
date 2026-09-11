## 一、Demo 概述

本示例演示了如何在 SpreadJS 中配置状态栏（StatusBar）并默认显示所有状态栏选项。通过编程方式遍历状态栏的所有子项，将隐藏的选项设置为可见，确保用户在右键点击状态栏时能够看到完整的功能菜单。

该示例适用于需要为用户提供完整状态栏功能访问权限的场景，避免用户手动勾选各个选项的繁琐操作。

## 二、解决的问题

* **默认状态栏选项不全**：SpreadJS 状态栏默认情况下部分选项处于隐藏状态，用户需要手动右键勾选才能显示
* **提升用户体验**：通过代码预先配置，让用户在首次使用时就能看到所有可用的状态栏功能
* **简化初始化配置**：为开发者提供一种快速启用所有状态栏选项的方法

## 三、实现思路

### 3.1 创建并绑定状态栏

首先需要创建 StatusBar 实例并将其绑定到 Workbook 对象：

```javascript
// 将状态栏挂载到一个 div 上
let statusBar = new GC.Spread.Sheets.StatusBar.StatusBar(
    document.getElementById('bar')
)
// 绑定 StatusBar 的上下文
statusBar.bind(spread)
```

这里使用了独立的 `<div id='bar'></div>` 容器来承载状态栏，而不是使用 SpreadJS 的默认状态栏位置。

### 3.2 遍历并显示所有状态栏选项

核心逻辑是通过 `statusBar.all()` 方法获取所有状态栏子项，然后遍历设置其可见性：

```javascript
// 默认展示所有的状态子项
let items = statusBar.all()
for (let i = 0; i < items.length; i++) {
    if (!items[i].visible) {
        items[i].visible = true
    }
}
```

该代码检查每个状态栏项的 `visible` 属性，如果为 `false` 则将其设置为 `true`，确保所有选项都处于可见状态。

### 3.3 技术栈

* SpreadJS 15.0.0：核心电子表格组件库
* SystemJS 0.19.22：模块加载器
* TypeScript 4.1.2：类型支持（配置环境）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

由于使用了 SystemJS 模块加载器，需要通过 HTTP 服务器访问（如 Live Server），直接双击打开可能会遇到跨域问题。

### 4.2 操作步骤

1. 在浏览器中打开示例页面
2. 在页面底部找到状态栏区域
3. 在状态栏上点击鼠标右键
4. 观察右键菜单中的所有选项均已默认勾选

## 五、功能特点

### 5.1 优点

* **代码简洁**：仅需几行代码即可实现全部状态栏选项的显示
* **用户友好**：用户无需手动配置即可使用完整的状态栏功能
* **易于维护**：通过 `statusBar.all()` 动态获取所有选项，即使 SpreadJS 版本更新增加新选项也能自动适配

## 六、关键代码片段

完整的初始化代码：

```javascript
import * as GC from "@grapecity/spread-sheets";

// 设置中文语言环境
GC.Spread.Common.CultureManager.culture('zh-cn');

// 创建 Workbook 实例
let spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'));

// 创建并绑定状态栏
let statusBar = new GC.Spread.Sheets.StatusBar.StatusBar(
    document.getElementById('bar')
)
statusBar.bind(spread)

// 显示所有状态栏选项
let items = statusBar.all()
for (let i = 0; i < items.length; i++) {
    if (!items[i].visible) {
        items[i].visible = true
    }
}
```

## 七、总结

本示例展示了 SpreadJS 状态栏的基础配置方法，开发者可以学到：

* 如何创建和绑定独立的状态栏组件
* 如何通过 `statusBar.all()` 获取所有状态栏子项
* 如何批量设置状态栏选项的可见性

该方案适用于需要为用户提供完整功能访问权限的应用场景，特别是企业内部系统或专业数据处理工具。如果需要更精细的控制，可以根据具体的状态栏项名称进行选择性显示或隐藏。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
