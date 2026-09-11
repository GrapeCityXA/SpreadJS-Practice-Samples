## 一、Demo 概述

本示例演示了如何在 SpreadJS Designer 容器尺寸发生变化时（如通过 CSS 动画调整宽度），实现平滑的刷新效果。通过 CSS transition 结合定时器刷新，可以避免 Designer 在容器大小变化过程中出现显示异常或内容错位的问题。

## 二、解决的问题

* **动画过程中的显示问题**：当 Designer 容器宽度通过 CSS transition 动画变化时，内容可能无法正确重绘，导致显示残缺或错位
* **实时响应容器变化**：Designer 需要在容器尺寸变化过程中保持正确的显示状态
* **优雅的动画体验**：在保证功能正确的前提下，实现流畅的缩放动画效果

## 三、实现思路

### 3.1 核心技术点

#### CSS Transition 动画实现

通过 CSS `transition` 属性为 Designer 容器添加宽度变化动画效果，动画持续时间为 2 秒。

```html
<style>
    .resizing {
        transition: width 2s;
        -webkit-transition: width 2s;
    }
</style>
```

#### 方案一：无限刷新直到动画结束

使用 `setInterval` 每 100 毫秒调用一次 `designer.refresh()` 方法进行刷新，同时通过 `transitionend` 事件监听动画结束并停止刷新。

```javascript
var myInterval;
function resizeForever(){
    myInterval = setInterval(function(){
        designer.refresh()
    }, 100);
}
const animated = document.querySelector('.resizing');
animated.addEventListener("transitionend", () => {
    clearInterval(myInterval)
    designer.refresh()
});
```

#### 方案二：定时器刷新方案

使用 `setInterval` 配合 `setTimeout`，在指定的动画时长内持续刷新，动画结束后停止刷新。

```javascript
function resizeSmooth(host, timing){
    let designer = GC.Spread.Sheets.Designer.findControl(host);
    if(!designer) return;
    let refreshInterval = setInterval(function(){
        designer.refresh()
    }, 100);
    setTimeout(function(){
        clearInterval(refreshInterval)
        designer.refresh()
        console.log("End")
    }, timing)
}
```

### 3.2 UI 交互流程

1. 页面加载 → Designer 初始化并显示
2. 点击"缩小"按钮 → 容器宽度从 100% 变为 50%，触发无限刷新方案
3. 点击"放大"按钮 → 容器宽度从 50% 变为 100%，触发定时刷新方案（持续 2 秒）
4. 动画结束 → 刷新停止，Designer 以最终尺寸正确显示

### 3.3 技术栈

* SpreadJS Designer 15.0.0
* SystemJS 模块加载器
* 原生 JavaScript（定时器、事件监听）

## 四、使用说明

### 4.1 运行方式

1. 安装依赖：

```bash
npm install
```

2. 由于使用了 SystemJS 加载器，直接在浏览器中打开 `index.html` 文件即可运行

### 4.2 操作步骤

1. 打开页面后，Designer 以 100% 宽度显示
2. 点击"缩小"按钮，容器宽度在 2 秒内逐渐缩小至 50%
3. 观察缩小过程中 Designer 的刷新效果
4. 点击"放大"按钮，容器宽度在 2 秒内逐渐恢复至 100%
5. 观察放大过程中 Designer 的刷新效果

## 五、功能特点

### 5.1 优点

* **流畅的视觉体验**：CSS transition 提供了平滑的宽度变化动画
* **避免显示异常**：持续的刷新确保 Designer 内容在变化过程中正确显示
* **两种刷新方案可选**：可根据实际需求选择无限刷新或定时刷新
* **实现简单**：仅需少量代码即可实现动画刷新效果

### 5.2 局限性与扩展建议

* 当前实现仅针对宽度变化，如需支持高度变化，可类似地添加相应逻辑
* 刷新频率固定为 100 毫秒，可根据实际效果调整刷新间隔
* 可考虑使用 `ResizeObserver` API 替代按钮触发，以响应任意尺寸变化

## 六、关键代码片段

#### 获取 Designer 实例并刷新

```javascript
// 获取 Designer 实例
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
// 获取 Workbook
let spread = designer.getWorkbook()
// 手动刷新 Designer
designer.refresh()
```

#### 通过 host 元素查找 Designer

```javascript
function resizeSmooth(host, timing){
    let designer = GC.Spread.Sheets.Designer.findControl(host);
    if(!designer) return;
    // ...刷新逻辑
}
```

## 七、总结

本示例展示了 SpreadJS Designer 在容器尺寸动画变化时的刷新处理方案。通过 `designer.refresh()` 方法配合 CSS transition 和定时器，实现了流畅的缩放动画效果。开发者可以从本示例中学到：

* 如何使用 `designer.refresh()` 手动刷新 Designer
* 如何使用 `GC.Spread.Sheets.Designer.findControl()` 通过 DOM 元素获取 Designer 实例
* 如何结合 CSS transition 和 JavaScript 定时器实现平滑的 UI 动画
* 如何使用 `transitionend` 事件监听 CSS 动画完成

该方案适用于需要动态调整 Designer 尺寸的应用场景，如响应式布局、侧边栏展开收起等交互效果。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
