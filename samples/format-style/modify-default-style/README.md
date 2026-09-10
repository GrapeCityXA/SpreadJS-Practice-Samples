## 一、Demo 概述

本示例展示了如何通过 CSS 自定义 SpreadJS 表格控件的视觉样式，包括列头的常规、悬停、选中、高亮状态以及单元格选中区域的样式。通过覆盖 SpreadJS 内置的 CSS 类名，开发者可以轻松实现符合自身产品设计规范的表格外观，无需修改 JavaScript 代码即可完成样式定制。

该示例适用于需要将 SpreadJS 集成到现有系统中，并要求表格样式与整体 UI 风格保持一致的场景。

## 二、解决的问题

* **品牌一致性**：默认的 SpreadJS 样式可能与产品的设计语言不符，通过 CSS 覆盖可以快速实现品牌色和交互风格的统一
* **用户体验优化**：自定义悬停、选中等交互状态的视觉反馈，提升用户操作的直观性
* **快速主题切换**：通过修改 CSS 变量或类名，可以实现多主题支持（如浅色/深色模式）

## 三、实现思路

### 3.1 核心技术点

#### 通过 CSS 类名覆盖实现样式定制

SpreadJS 为表格的各个组件（列头、行头、单元格等）预定义了 CSS 类名，开发者可以通过在页面中添加自定义样式来覆盖默认样式。本示例针对以下关键类名进行了定制：

```css
/* 列头常规状态 */
.gc-columnHeader-normal{
    color: #000;
    background-color: #ecf5ff;
    border-style: solid;
}

/* 列头悬停状态 */
.gc-columnHeader-hover{
    color: #000;
    background-color: #b3d8ff;
    border-style: solid;
}

/* 列头选中状态 */
.gc-columnHeader-selected{
    color: #fff;
    background-image: none;
    background-color: #409eff;
    border-style: solid;
}

/* 列头高亮状态 */
.gc-columnHeader-highlight{
    color: #fff;
    background-image: none;
    background-color: #409eff;
    border-style: solid;
}

/* 单元格选中区域样式 */
.gc-selection{
    background-color: rgba(20,20,20,.2);
    border-color: #f5dab1;
    color: rgba(240,240,240,.7)
}
```

这些样式采用了类似 Element UI 的蓝色系配色方案，通过修改 `background-color`、`color` 和 `border-color` 属性实现视觉定制。

#### 最小化 JavaScript 代码

本示例的 JavaScript 代码极其简洁，仅初始化 SpreadJS 工作簿实例：

```javascript
import * as GC from "@grapecity/spread-sheets";
GC.Spread.Sheets.LicenseKey = "..."; // 许可证密钥

new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
```

所有样式定制工作都在 HTML 的 `<style>` 标签中完成，体现了"关注点分离"的设计原则。

### 3.2 技术栈

* **SpreadJS**: 15.0.0（核心表格控件）
* **SystemJS**: 0.19.22（模块加载器）
* **TypeScript**: 4.1.2（类型支持）
* **plugin-typescript**: 8.0.0（SystemJS 的 TypeScript 插件）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
# 或使用本地服务器（如 Live Server）运行
```

### 4.2 操作步骤

1. 打开 `index.html` 文件，页面将显示一个空白的 SpreadJS 表格
2. 观察列头的默认样式（浅蓝色背景）
3. 将鼠标悬停在列头上，观察悬停效果（中蓝色背景）
4. 点击列头选中整列，观察选中状态（深蓝色背景，白色文字）
5. 选中单元格区域，观察选中框的样式（半透明黑色背景，金色边框）

## 五、功能特点

### 5.1 优点

* **零代码侵入**：无需修改 SpreadJS 的 API 调用，仅通过 CSS 即可完成样式定制
* **易于维护**：样式集中在 `<style>` 标签中，修改和调试非常方便
* **性能友好**：CSS 样式覆盖不会影响 SpreadJS 的渲染性能
* **扩展性强**：可以轻松扩展到行头、滚动条、编辑器等其他组件的样式定制

### 5.2 局限性与扩展建议

* **样式优先级**：如果 SpreadJS 的内联样式或 `!important` 规则优先级更高，可能需要使用 `!important` 强制覆盖
* **主题切换**：当前示例为静态样式，如需支持动态主题切换，建议使用 CSS 变量（`--custom-color`）或动态加载不同的样式表
* **深度定制**：对于更复杂的样式需求（如自定义单元格编辑器、下拉框样式），可能需要结合 SpreadJS 的 `CellType` 和自定义渲染器

## 六、关键代码片段

### HTML 结构与样式定义

```html
<!doctype html>
<html>
<head>
    <title>SpreadJS in TypeScript</title>
    <link rel="stylesheet" type="text/css" href="node_modules/@grapecity/spread-sheets/styles/gc.spread.sheets.excel2013white.css">
    <style>
        /* 列头样式定制 */
        .gc-columnHeader-normal{ color: #000; background-color: #ecf5ff; border-style: solid; }
        .gc-columnHeader-hover{ color: #000; background-color: #b3d8ff; border-style: solid; }
        .gc-columnHeader-selected{ color: #fff; background-image: none; background-color: #409eff; border-style: solid; }
        .gc-columnHeader-highlight{ color: #fff; background-image: none; background-color: #409eff; border-style: solid; }
        
        /* 单元格选中样式 */
        .gc-selection{ background-color: rgba(20,20,20,.2); border-color: #f5dab1; color: rgba(240,240,240,.7) }
    </style>
    <div id="ss" style="width:100%;height:98vh;border:1px solid darkgray"></div>
    <script>System.import('./src/app');</script>
</head>
<body></body>
</html>
```

### JavaScript 初始化代码

```javascript
import * as GC from "@grapecity/spread-sheets";
GC.Spread.Sheets.LicenseKey = "..."; // 许可证密钥

// 创建 SpreadJS 工作簿实例
new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
```

## 七、总结

本示例展示了 SpreadJS 样式定制的最佳实践：通过 CSS 类名覆盖实现视觉定制，无需修改业务逻辑代码。开发者可以从中学到：

* SpreadJS 的 CSS 类名命名规范（`gc-columnHeader-*`、`gc-selection` 等）
* 如何通过 CSS 覆盖实现表格组件的样式定制
* 前端开发中"关注点分离"的设计思想（样式与逻辑分离）

该方案适用于需要快速实现品牌化表格界面的场景，特别是在已有设计规范的企业级应用中。对于更复杂的定制需求，可以在此基础上结合 SpreadJS 的主题 API 和自定义渲染器进一步扩展。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
