## 一、Demo 概述

本示例展示了如何在 SpreadJS Designer（设计器）中实现浮动工具栏效果。通过 CSS 定位和 JavaScript 事件监听，将设计器的 Ribbon 工具栏设置为固定在页面顶部，并根据鼠标悬停状态动态显示或隐藏，从而节省页面空间并提升用户体验。

该方案适用于需要最大化表格显示区域，同时保留完整设计器功能的场景。

## 二、解决的问题

- **空间利用优化**：传统设计器工具栏始终占据顶部空间，本示例通过隐藏机制释放更多可视区域
- **按需显示**：工具栏仅在鼠标悬停时显示，避免干扰用户查看数据
- **保持功能完整性**：隐藏状态不影响设计器的所有功能，用户可随时唤起工具栏进行操作

## 三、实现思路

### 3.1 CSS 固定定位与隐藏

通过 CSS 将 Ribbon 工具栏设置为固定定位（`position: fixed`），并初始化为隐藏状态（`visibility: hidden`）：

```css
.gc-ribbon-bar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 10;
    visibility: hidden;
}
```

- `position: fixed`：使工具栏固定在视口顶部，不随页面滚动
- `z-index: 10`：确保工具栏在其他元素之上
- `visibility: hidden`：初始状态隐藏，但保留布局空间

### 3.2 鼠标事件监听

通过监听 `top-panels` 区域的 `onmouseover` 和 `gc-ribbon-bar` 的 `onmouseout` 事件，动态切换工具栏的可见性：

```javascript
document.getElementsByClassName('top-panels')[0].onmouseover = function(){
   document.getElementsByClassName('gc-ribbon-bar')[0].style.visibility = 'visible'
}

document.getElementsByClassName('gc-ribbon-bar')[0].onmouseout = function(){
   document.getElementsByClassName('gc-ribbon-bar')[0].style.visibility = 'hidden'
}
```

- 当鼠标移入 `top-panels` 区域时，显示工具栏
- 当鼠标移出 `gc-ribbon-bar` 时，隐藏工具栏
- 使用 `visibility` 而非 `display` 可避免布局重排

### 3.3 技术栈

- **SpreadJS Designer 15.0.0**：提供完整的电子表格设计器功能
- **SystemJS**：模块加载器，支持动态导入
- **TypeScript 4.1.2**：类型安全的 JavaScript 超集
- **SpreadJS 扩展包**：包括图表、打印、PDF、条形码、形状、数据透视表等功能模块

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

安装完成后，使用本地服务器（如 Live Server）打开 `index.html` 文件。

### 4.2 操作步骤

1. 打开页面后，工具栏默认隐藏，可看到完整的表格区域
2. 将鼠标移动到页面顶部区域（提示文字下方）
3. 工具栏自动显示，可进行各种设计器操作
4. 鼠标移出工具栏区域后，工具栏自动隐藏

## 五、功能特点

### 5.1 优点

- **实现简单**：仅需少量 CSS 和 JavaScript 代码即可实现
- **用户体验友好**：按需显示工具栏，不干扰数据查看
- **性能优化**：使用 `visibility` 属性避免频繁的 DOM 重排
- **兼容性好**：基于标准 DOM API，无需额外依赖

### 5.2 局限性与扩展建议

- **触发区域固定**：当前依赖 `top-panels` 类名，如果设计器结构变化可能失效
- **扩展建议**：
  - 可添加延迟隐藏机制，避免鼠标快速移出时工具栏闪烁
  - 可增加快捷键（如 F11）切换工具栏显示状态
  - 可将显示状态保存到 localStorage，记住用户偏好

## 六、关键代码片段

### 初始化设计器

```javascript
import * as GC from "@grapecity/spread-sheets";
import "@grapecity/spread-sheets-designer";

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container");
let spread = designer.getWorkbook();
```

创建设计器实例并绑定到 DOM 容器，`getWorkbook()` 方法可获取底层的 Workbook 对象用于进一步操作。

## 七、总结

本示例展示了一种轻量级的 UI 优化方案，通过简单的 CSS 和事件监听实现浮动工具栏效果。开发者可以从中学到：

- 如何使用 CSS 固定定位实现浮动 UI 组件
- 如何通过 DOM 事件监听实现交互式显示/隐藏
- SpreadJS Designer 的基本初始化和集成方式
- `visibility` 与 `display` 属性在性能优化中的差异

该方案适用于需要最大化内容显示区域的场景，如数据分析看板、报表查看器等，同时保留完整的编辑功能。开发者可根据实际需求调整触发逻辑和动画效果。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/2TA3K6NKCUu2_buGw3qGdA/)）
