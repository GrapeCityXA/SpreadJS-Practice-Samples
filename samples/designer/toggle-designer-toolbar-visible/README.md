## 一、Demo 概述

本示例演示了如何在 SpreadJS Designer（设计器）中实现工具栏（Ribbon Bar）的显示和隐藏切换功能。通过一个简单的按钮点击事件，用户可以动态控制设计器顶部工具栏的可见性，从而在需要更大工作区域时隐藏工具栏，或在需要使用工具栏功能时重新显示。

该示例适用于需要灵活控制界面布局的场景，特别是在小屏幕设备或需要最大化表格显示区域的应用中。

## 二、解决的问题

* **界面空间优化**：在有限的屏幕空间中，工具栏占据了较大的垂直空间，通过隐藏工具栏可以为电子表格提供更多的显示区域
* **用户体验提升**：为用户提供自定义界面布局的能力，根据实际使用场景灵活调整界面元素的显示状态
* **全屏模式支持**：在演示或专注于数据查看的场景下，隐藏工具栏可以实现类似全屏的效果

## 三、实现思路

### 3.1 核心技术点

#### 初始化 SpreadJS Designer

首先创建 Designer 实例并获取工作簿对象，设置基础的工作表环境：

```javascript
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
let spread = designer.getWorkbook()
spread.setSheetCount(5)
let sheet = spread.getActiveSheet()
sheet.setValue(0,0,'grapecity')
```

这段代码初始化了一个包含 5 个工作表的设计器实例，并在第一个单元格中设置了示例数据。

#### 工具栏显示隐藏切换逻辑

核心功能通过操作 DOM 元素的 `display` 样式属性实现：

```javascript
document.getElementById('changeDisplay').onclick = function(){
    document.getElementsByClassName('gc-ribbon-bar')[0].style.display = 
    document.getElementsByClassName('gc-ribbon-bar')[0].style.display=='none' ? 'block' : 'none'
    // 该变之后要重新refresh
    designer.refresh()
}
```

关键实现要点：

* 通过 `getElementsByClassName('gc-ribbon-bar')` 获取设计器的工具栏 DOM 元素
* 使用三元运算符切换 `display` 属性在 `'none'` 和 `'block'` 之间
* **重要**：修改 DOM 后必须调用 `designer.refresh()` 方法，确保设计器重新计算布局并正确渲染

### 3.2 技术栈

* **SpreadJS Designer 16.0.1**：提供完整的电子表格设计器功能
* **SpreadJS 核心库及扩展**：包括图表、打印、PDF、条形码、透视表等功能模块
* **SystemJS**：模块加载器，用于动态加载 ES6 模块
* **TypeScript 4.1.2**：支持 TypeScript 开发环境

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
# 或使用本地服务器运行（推荐）
npx http-server -p 8080
```

### 4.2 操作步骤

1. 在浏览器中打开示例页面，可以看到完整的 SpreadJS Designer 界面，包括顶部的工具栏（Ribbon Bar）
2. 点击页面顶部的"显示切换"按钮
3. 观察工具栏的显示状态变化：
    * 第一次点击：工具栏隐藏，表格显示区域扩大
    * 第二次点击：工具栏重新显示，恢复原始布局
4. 可以多次点击按钮测试切换效果

## 五、功能特点

### 5.1 优点

* **实现简单**：仅需几行代码即可实现工具栏的显示隐藏功能
* **用户友好**：提供直观的按钮控制，用户可以根据需要自由切换
* **空间利用**：隐藏工具栏后可以显著增加表格的可视区域
* **无侵入性**：通过 DOM 操作实现，不影响 Designer 的核心功能

### 5.2 局限性与扩展建议

* **状态持久化**：当前实现不会保存用户的显示偏好，刷新页面后会恢复默认状态。可以考虑使用 `localStorage` 保存用户的选择
* **动画效果**：切换过程是瞬时的，可以添加 CSS 过渡动画提升用户体验
* **快捷键支持**：可以添加键盘快捷键（如 F11）来触发切换，提高操作效率

## 六、关键代码片段

### HTML 结构

```html
<button id="changeDisplay">显示切换</button>
<div id="designer-container" style="width:100%;height:600px;border:1px solid darkgray"></div>
```

简洁的 HTML 结构，包含一个控制按钮和设计器容器。

### 完整的切换逻辑

```javascript
document.getElementById('changeDisplay').onclick = function(){
    // 获取工具栏元素并切换 display 属性
    document.getElementsByClassName('gc-ribbon-bar')[0].style.display = 
    document.getElementsByClassName('gc-ribbon-bar')[0].style.display=='none' ? 'block' : 'none'
    
    // 刷新设计器以重新计算布局
    designer.refresh()
}
```

这段代码展示了完整的切换逻辑，包括 DOM 操作和设计器刷新两个关键步骤。

## 七、总结

本示例展示了如何通过简单的 DOM 操作实现 SpreadJS Designer 工具栏的显示隐藏功能。虽然实现方式简单，但在实际应用中非常实用，特别是在需要优化界面空间利用的场景下。

开发者可以从本示例中学到：

1. SpreadJS Designer 的基本初始化和配置方法
2. 如何通过 DOM 操作控制设计器的 UI 元素
3. 修改设计器 UI 后需要调用 `refresh()` 方法的重要性
4. 简单的用户交互实现方式

该方案适用于需要动态调整界面布局的应用场景，可以作为实现自定义工具栏控制、全屏模式或响应式布局的基础。开发者可以在此基础上扩展更多的界面控制功能，如侧边栏切换、状态栏显示隐藏等。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
