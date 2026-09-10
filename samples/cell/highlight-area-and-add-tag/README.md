## 一、Demo 概述

本示例展示了如何在 SpreadJS 表格中为指定的单元格区域添加自定义高亮边框，并在高亮区域的右下角显示用户标识标签。该功能通过自定义布局层（Layout Layer）实现，可以在不影响单元格原有样式的情况下，叠加显示协作编辑场景中的用户编辑区域标识。 

该方案适用于多人协作编辑场景，可以直观地展示不同用户正在编辑的单元格区域，提升协作体验。

## 二、解决的问题

* **协作编辑可视化**：在多人协作编辑场景中，需要实时显示不同用户正在编辑的单元格区域，避免编辑冲突
* **非侵入式标识**：通过独立的布局层实现高亮效果，不修改单元格原有样式和数据
* **动态跟随视口**：当用户滚动表格、调整行高列宽时，高亮框能够自动重新计算位置并保持正确显示
* **可见区域优化**：智能判断高亮区域与视口的交集，只渲染可见部分，提升性能

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 自定义布局容器创建

通过在 SpreadJS 宿主元素上叠加一个绝对定位的 div 容器，作为高亮框的渲染层：

```javascript
HighlightLayout.prototype._createLayoutContainer = function(host){
    host.style.position = "relative";
    var container = document.createElement('div');
    container.style.cssText = "position: absolute;height: 100%;width: 100%;top: 0px;left: 0px;pointer-events: none";
    host.appendChild(container)
    return container;
}
```

关键点：

* 设置 `pointer-events: none` 确保布局层不拦截鼠标事件
* 使用绝对定位覆盖整个表格区域
* 宿主元素设置为 `relative` 定位作为参照

#### 3.1.2 视口变化事件监听

监听表格的滚动、行高列宽变化等事件，触发布局重绘：

```javascript
HighlightLayout.prototype._bindEvents = function(context){
    var self = this;
    context.bind(GC.Spread.Sheets.Events.TopRowChanged + self._eventNs, function (e, data) {
        setTimeout(function(){
            self._resetLayout();
        },0);
    });
    context.bind(GC.Spread.Sheets.Events.LeftColumnChanged + self._eventNs, function (e, data) {
        setTimeout(function(){
            self._resetLayout();
        },0);
    });
    context.bind(GC.Spread.Sheets.Events.ColumnWidthChanged + self._eventNs, function (e, data) {
        setTimeout(function(){
            self._resetLayout();
        },0);
    });
    // ... 其他事件监听
}
```

使用 `setTimeout` 确保在 SpreadJS 内部布局更新完成后再执行重绘。

#### 3.1.3 可见区域计算与边框绘制

核心算法：遍历高亮区域的单元格，找到可见区域的左上角和右下角单元格，计算出实际需要绘制的矩形范围：

```javascript
// 从左上角开始查找第一个可见单元格
for(var i = hightlightRange.row; i < hightlightRange.row + hightlightRange.rowCount; i++){
    var breakFlag = false;
    for(var j = hightlightRange.col; j < hightlightRange.col + hightlightRange.colCount; j++){
        var rect = sheet.getCellRect(i, j);
        if(rect.x != null){
            tlRect = rect;
            actualArea.rowStart = i;
            actualArea.colStart = j;
            breakFlag = true;
            break;
        }
    }
    if(breakFlag){
        break
    }
}

// 从右下角开始查找最后一个可见单元格
for(var i = hightlightRange.row + hightlightRange.rowCount - 1; i >= hightlightRange.row; i--){
    // ... 类似逻辑
}
```

根据可见边界判断，只绘制在视口内的边框：

```javascript
var left = x && x - cornerRect.width >= 0,
    top = y && y - cornerRect.height >= 0, 
    right = endX && endX <= viewportWidth, 
    bottom = endY && endY <= viewportHeight;

highLightRect.style.borderLeft = left ? highlightBorderStyle : noneBorderStyle;
highLightRect.style.borderTop = top ? highlightBorderStyle : noneBorderStyle;
highLightRect.style.borderRight = right ? highlightBorderStyle : noneBorderStyle;
highLightRect.style.borderBottom = bottom ? highlightBorderStyle : noneBorderStyle;
```

#### 3.1.4 右下角用户标识标签

在高亮框的右下角添加用户名标签：

```javascript
highLightRect.innerHTML = '<div style="position:absolute;right:0px;bottom:0px;width: 60px;height: 20px;text-align:center;background-color:#1B9AF7">' + name + '</div>'
```

标签使用绝对定位固定在高亮框的右下角，背景色为蓝色，显示用户 ID。

### 3.2 技术栈

* SpreadJS 16.0.1：核心表格组件
* SystemJS：模块加载器
* TypeScript 4.1.2：类型支持（配置环境）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，表格会自动显示两个高亮区域（绿色边框）
2. 每个高亮区域的右下角显示 "user1" 标识
3. 尝试滚动表格，观察高亮框如何动态调整显示范围
4. 调整列宽或行高，高亮框会自动重新计算位置

## 五、功能特点

### 5.1 优点

* **性能优化**：只渲染可见区域的高亮框，避免不必要的 DOM 操作
* **事件透传**：布局层不拦截鼠标事件，不影响表格的正常交互
* **灵活配置**：支持自定义边框颜色、多个用户区域同时显示
* **自动适配**：响应表格的各种视口变化事件，无需手动触发更新

### 5.2 局限性与扩展建议

* **标签位置固定**：当前标签固定在右下角，可以扩展为支持自定义位置
* **样式单一**：可以增加更多样式配置选项，如标签大小、字体、阴影效果等
* **缺少动画**：可以添加高亮框出现/消失的过渡动画，提升视觉体验
* **性能优化空间**：对于大量高亮区域，可以考虑使用 Canvas 绘制替代 DOM 元素

## 六、关键代码片段

### 6.1 初始化与绑定

```javascript
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss")); 
let highlightLayout = new HighlightLayout();
highlightLayout.bind(spread)
highlightLayout.addRanges("Sheet1", "user1",
 [new GC.Spread.Sheets.Range(40, 4, 4, 4), new GC.Spread.Sheets.Range(5, 4, 8, 4)], 
 { borderColor: "lightGreen" })
```

通过 `addRanges` 方法添加需要高亮的区域，支持同时添加多个不连续的区域。

### 6.2 布局重置逻辑

```javascript
HighlightLayout.prototype._resetLayout = function(id){
    var content = this._content,
        container = this._container,
        sheet = content.getActiveSheet();
    
    // 清空现有布局
    container.innerHTML = "";

    var rangesInfo = this._sheetRangesInfo[sheet.name()];
    if(!rangesInfo){
        return;
    }
    // 遍历所有用户的高亮区域并重新绘制
    for(var id in rangesInfo){
        var info = rangesInfo[id];
        if(!info.ranges){
            continue;
        }
        for(var i = 0; i < info.ranges.length; i++){
            this._paintRange(container, id + "_" + i, sheet, info.ranges[i], info.option, id)
        }
    }
}
```

每次视口变化时，清空容器并重新绘制所有高亮框，确保位置准确。

## 七、总结

本示例展示了如何通过自定义布局层实现非侵入式的单元格区域高亮标识功能。开发者可以从中学到：

* 如何在 SpreadJS 上叠加自定义 UI 层而不影响表格交互
* 如何监听表格视口变化事件并动态更新自定义 UI
* 如何计算单元格区域与视口的交集，实现智能渲染
* 如何使用 `getCellRect` API 获取单元格的屏幕坐标

该方案适用于协作编辑、数据审批流程可视化、单元格锁定状态展示等场景，具有良好的扩展性和实用价值。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
