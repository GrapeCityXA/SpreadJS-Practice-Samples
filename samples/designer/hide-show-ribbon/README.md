## 一、Demo 概述

本示例演示了如何在 SpreadJS Designer（设计器）中动态控制工具栏（Ribbon Bar）的显示和隐藏。通过一个简单的按钮点击事件，用户可以切换设计器顶部工具栏的可见性，从而实现更灵活的界面布局控制。该功能适用于需要根据不同场景动态调整界面元素的应用，例如在演示模式下隐藏工具栏以获得更大的工作区域，或在编辑模式下显示完整的功能面板。

## 二、解决的问题

在实际应用中，SpreadJS Designer 的工具栏占据了较大的屏幕空间。某些场景下，用户可能需要：

* 在演示或只读模式下隐藏工具栏，提供更简洁的界面
* 根据用户权限动态显示或隐藏编辑功能
* 在小屏幕设备上优化空间利用率
* 实现自定义的界面切换逻辑

本示例提供了一个简单而有效的解决方案，通过 CSS 样式控制和 Designer API 刷新机制，实现工具栏的动态切换。

## 三、实现思路

### 3.1 初始化时隐藏工具栏

通过 CSS 样式在页面加载时默认隐藏工具栏：

```css
.gc-ribbon-bar {
    display: none;
}
```

这段样式直接作用于 SpreadJS Designer 生成的工具栏元素，通过设置 `display: none` 实现初始隐藏状态。

### 3.2 动态切换显示状态

核心逻辑通过 JavaScript 实现工具栏的显示/隐藏切换：

```javascript
document.getElementById('changeDisplay').onclick = function(){
    document.getElementsByClassName('gc-ribbon-bar')[0].style.display = 
    document.getElementsByClassName('gc-ribbon-bar')[0].style.display=='none' ? 'block' : 'none'
    // 改变之后要重新refresh
    designer.refresh()
}
```

该代码实现了以下功能：

* 获取工具栏元素（通过类名 `gc-ribbon-bar`）
* 使用三元运算符切换 `display` 属性（`none` 和 `block` 之间切换）
* 调用 `designer.refresh()` 刷新设计器布局，确保界面正确渲染

### 3.3 Designer 刷新机制

在修改工具栏显示状态后，必须调用 `designer.refresh()` 方法。这是因为：

* SpreadJS Designer 需要重新计算工作区域的尺寸
* 确保表格视图与容器尺寸保持同步
* 避免出现布局错位或渲染异常

### 3.4 技术栈

* SpreadJS 15.0.0（核心表格引擎）
* SpreadJS Designer 15.0.0（设计器组件）
* SystemJS（模块加载器）
* TypeScript 4.1.2（开发语言）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 使用本地服务器打开 index.html
# 例如使用 Live Server 或其他 HTTP 服务器
```

### 4.2 操作步骤

1. 在浏览器中打开 `index.html` 文件
2. 页面加载后，工具栏默认处于隐藏状态
3. 点击页面顶部的"显示切换"按钮
4. 工具栏将显示出来，再次点击按钮可再次隐藏
5. 可以在工具栏显示时使用设计器的各项功能

## 五、功能特点

### 5.1 优点

* 实现简单，只需几行代码即可完成功能
* 性能开销小，仅涉及 DOM 样式修改和设计器刷新
* 可扩展性强，可以轻松集成到更复杂的权限控制或界面切换逻辑中
* 用户体验友好，提供了灵活的界面布局控制

### 5.2 扩展建议

* 可以添加动画效果，使工具栏的显示/隐藏更加平滑
* 可以结合用户权限系统，根据不同角色自动控制工具栏的可见性
* 可以扩展为控制更多界面元素（如侧边栏、状态栏等）的显示/隐藏
* 可以保存用户的显示偏好到本地存储，实现状态持久化

## 六、关键代码片段

完整的初始化和事件绑定代码：

```javascript
import * as GC from "@grapecity/spread-sheets";
import "@grapecity/spread-sheets-designer";

// 创建设计器实例
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")

// 获取工作簿和工作表
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()

// 设置示例数据
sheet.setValue(0, 0, 'grapecity')

// 绑定切换按钮事件
document.getElementById('changeDisplay').onclick = function(){
    document.getElementsByClassName('gc-ribbon-bar')[0].style.display = 
    document.getElementsByClassName('gc-ribbon-bar')[0].style.display=='none' ? 'block' : 'none'
    designer.refresh()
}
```

## 七、总结

本示例展示了如何通过简单的 CSS 和 JavaScript 代码实现 SpreadJS Designer 工具栏的动态显示控制。开发者可以从中学到：

* SpreadJS Designer 的基本初始化方法
* 如何通过 CSS 类名控制设计器内部元素的样式
* `designer.refresh()` 方法在界面变更后的重要性
* 简单而有效的界面切换实现方案

该方案适用于需要动态调整界面布局的各类应用场景，具有良好的可扩展性和实用价值。开发者可以在此基础上扩展更多的界面控制功能，打造更加灵活和用户友好的应用体验。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
