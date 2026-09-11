## 一、Demo 概述

本示例展示了如何将外部 HTML 元素（如按钮）拖拽到 SpreadJS 表格中，并将元素的文本内容填充到目标单元格。该功能基于 HTML5 原生拖拽 API 实现，通过监听拖拽事件并结合 SpreadJS 的 hitTest API 来定位目标单元格，实现了从外部 DOM 元素到表格单元格的数据传递。

## 二、解决的问题

* **跨组件数据传递**：实现外部 UI 组件与 SpreadJS 表格之间的交互，用户可以通过拖拽操作快速将数据填充到表格中
* **可视化反馈**：在拖拽过程中实时高亮显示目标单元格，提供清晰的视觉引导
* **灵活的数据录入方式**：为用户提供除键盘输入外的另一种直观的数据录入方式，适用于从工具栏、侧边栏等外部区域快速填充数据的场景

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 设置拖拽源元素

通过 HTML5 Drag and Drop API 将按钮设置为可拖拽元素，并在拖拽开始时记录被拖拽的元素：

```javascript
var td = document.getElementById("btn1");
td.draggable = true;
td.addEventListener("dragstart", function (ev) {
    // 存储相关的拖拽元素
    dragged = ev.target;
    // 设置拖拽元素的透明度
    ev.target.style.opacity = 0.5;
}, false);
```

#### 3.1.2 实时高亮目标单元格

在 `dragover` 事件中，通过 SpreadJS 的 `hitTest` 方法获取鼠标位置对应的单元格，并动态创建高亮装饰层：

```javascript
host.addEventListener("dragover", function (event) {
    event.preventDefault();
    
    let hostRect = host.getBoundingClientRect()
    let offsetL = hostRect.left
    let offsetT = hostRect.top
    let x = event.pageX - offsetL;
    let y = event.pageY - offsetT;
    // 获取单元格的位置并高亮
    highlihgtCell(x, y)
}, false);

function highlihgtCell(x, y) {
    let target = spread.getActiveSheet().hitTest(x, y);
    if (target.row === undefined || target.col === undefined) {
        return
    }
    let cellRect = spread.getActiveSheet().getCellRect(target.row, target.col)
    
    decoration.style.display = "block"
    decoration.style.position = "absolute"
    decoration.style.border = "1px solid blue"
    decoration.style.boxShadow = "0px 0px 4px 0px #007eff"
    decoration.style.width = (cellRect.width - 1) + "px";
    decoration.style.height = (cellRect.height - 1) + "px";
    decoration.style.left = cellRect.x + "px";
    decoration.style.top = cellRect.y + "px";
}
```

#### 3.1.3 处理拖拽释放事件

在 `drop` 事件中，获取目标单元格的行列索引，并将拖拽元素的文本内容填充到该单元格：

```javascript
host.addEventListener("drop", function (event) {
    event.preventDefault();
    
    // 隐藏高亮装饰层
    decoration.style.display = "none"
    
    // 获取拖动物理在屏幕的位置
    let rect = spread.getHost().getBoundingClientRect()
    let offsetL = rect.left
    let offsetT = rect.top
    // 获取拖动块的值
    let tab_value = document.getElementById("btn1").innerText
    let x = event.pageX - offsetL;
    let y = event.pageY - offsetT;
    // 获取单元格的位置
    let target = spread.hitTest(x, y);
    let sheet = spread.getActiveSheet();
    sheet.setValue(target.worksheetHitInfo.row, target.worksheetHitInfo.col, tab_value);
})
```

### 3.2 UI 交互流程

用户点击按钮并拖拽 → 按钮透明度降低（视觉反馈）→ 鼠标移动到 SpreadJS 区域 → 目标单元格实时高亮显示 → 释放鼠标 → 按钮文本填充到目标单元格 → 高亮消失，按钮透明度恢复

### 3.3 技术栈

* SpreadJS 15.0.0：核心表格组件
* SystemJS 0.19.22：模块加载器
* TypeScript 4.1.2：开发语言支持
* HTML5 Drag and Drop API：原生拖拽功能

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，可以看到一个标题为"可以将我拖入SpreadJS中"的按钮
2. 点击并按住该按钮，开始拖拽操作
3. 将鼠标移动到 SpreadJS 表格区域，会看到目标单元格被蓝色边框高亮显示
4. 在目标单元格上释放鼠标，按钮的文本内容会自动填充到该单元格中

## 五、功能特点

### 5.1 优点

* **原生 API 实现**：基于 HTML5 标准拖拽 API，无需额外依赖库，兼容性好
* **实时视觉反馈**：拖拽过程中动态高亮目标单元格，用户体验友好
* **精准定位**：利用 SpreadJS 的 `hitTest` 和 `getCellRect` API 实现像素级精准定位
* **代码简洁**：核心逻辑清晰，易于扩展和维护

### 5.2 局限性与扩展建议

* **当前实现仅支持文本传递**，可扩展为支持拖拽图片、文件等多种数据类型（通过 `dataTransfer` API）
* **可以增加拖拽数据的格式化处理**，例如根据单元格类型自动转换数据格式
* **建议添加拖拽取消机制**，例如按 ESC 键取消拖拽操作
* **可以扩展为支持多单元格拖拽填充**，实现批量数据录入

## 六、关键代码片段

### 坐标转换与单元格定位

```javascript
// 获取 SpreadJS 容器相对于视口的位置
let hostRect = host.getBoundingClientRect()
let offsetL = hostRect.left
let offsetT = hostRect.top

// 将鼠标的页面坐标转换为相对于 SpreadJS 容器的坐标
let x = event.pageX - offsetL;
let y = event.pageY - offsetT;

// 使用 hitTest 获取坐标对应的单元格信息
let target = spread.hitTest(x, y);
```

这段代码展示了如何将浏览器事件的全局坐标转换为 SpreadJS 内部坐标系，是实现拖拽定位的关键步骤。

### 动态装饰层定位

```javascript
let cellRect = spread.getActiveSheet().getCellRect(target.row, target.col)

decoration.style.width = (cellRect.width - 1) + "px";
decoration.style.height = (cellRect.height - 1) + "px";
decoration.style.left = cellRect.x + "px";
decoration.style.top = cellRect.y + "px";
```

通过 `getCellRect` 获取单元格的精确位置和尺寸，动态调整装饰层的样式，实现像素级对齐。

## 七、总结

本示例展示了如何将 HTML5 原生拖拽功能与 SpreadJS 表格组件深度集成，实现了从外部元素到表格单元格的数据传递。开发者可以从中学到：

* HTML5 Drag and Drop API 的完整使用流程（dragstart、dragover、drop 等事件）
* SpreadJS 的 `hitTest` 和 `getCellRect` API 在坐标定位中的应用
* 如何通过动态创建 DOM 元素实现自定义视觉反馈
* 浏览器坐标系与 SpreadJS 内部坐标系的转换方法

该方案适用于需要从外部工具栏、侧边栏或其他 UI 组件快速向表格填充数据的场景，具有良好的扩展性，可以根据实际需求扩展为支持更复杂的数据类型和交互方式。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
