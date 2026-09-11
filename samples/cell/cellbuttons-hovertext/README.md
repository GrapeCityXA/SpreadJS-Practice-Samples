## 一、Demo 概述

本示例展示了如何为 SpreadJS 单元格按钮添加鼠标悬停提示功能。通过自定义 CellType，实现了当鼠标悬停在单元格按钮上时显示提示文本，并将鼠标指针样式改为 pointer，提升用户交互体验。 

## 二、解决的问题

SpreadJS 原生的单元格按钮功能虽然强大，但缺少鼠标悬停提示，用户无法直观了解按钮的功能。本示例通过扩展 CellType 解决了以下问题：

* 为单元格按钮添加自定义 hover 提示文本
* 鼠标悬停时自动显示浮动提示框
* 鼠标移出时隐藏提示框并恢复鼠标样式
* 支持多个按钮分别设置不同的提示文本

## 三、实现思路

### 3.1 自定义 CellType 扩展

通过继承 `GC.Spread.Sheets.CellTypes.Text` 创建自定义 CellType，重写 `processMouseMove` 和 `processMouseLeave` 方法来实现 hover 提示功能。

```javascript
function hoverCellType() { }
hoverCellType.prototype = new GC.Spread.Sheets.CellTypes.Text()

hoverCellType.prototype.processMouseMove = function (hitInfo) {
    if (!hitInfo.cellButtonHitInfo?.buttonConfig?.hoverText) {
        if (this._toolTipElement) {
            this._toolTipElement.style.display = "none"
        }
        return
    }
    // 获取容器位置
    let containerPosition = {
        left: hitInfo.sheet.getParent().getHost().getBoundingClientRect().left,
        top: hitInfo.sheet.getParent().getHost().getBoundingClientRect().top
    }
    let hoverText = hitInfo.cellButtonHitInfo.buttonConfig.hoverText
    
    // 创建或更新提示框
    if (this._toolTipElement) {
        this._toolTipElement.innerText = hoverText
        this._toolTipElement.style.top = hitInfo.y + containerPosition.top - 40 + "px"
        this._toolTipElement.style.left = hitInfo.x + containerPosition.left - 30 + "px"
        this._toolTipElement.style.display = "block"
    } else {
        let div = document.createElement("div");
        div.style.position = "absolute"
        div.style.border = "1px #C0C0C0 solid"
        div.style.boxShadow = "1px 2px 5px rgba(0,0,0,0.4)"
        div.style.font = "9pt Arial"
        div.style.background = "white"
        div.style.padding = "5px"
        
        this._toolTipElement = div
        this._toolTipElement.innerText = hoverText
        document.body.insertBefore(this._toolTipElement, null);
        this._toolTipElement.style.display = "block"
    }
    changeCursor(true)
}
```

### 3.2 鼠标样式切换

通过操作 canvas 元素的 CSS 类来实现鼠标指针样式的切换：

```javascript
function changeCursor(type = false) {
    let canvas = document.querySelector("canvas[gcuielement='gcWorksheetCanvas']")
    if(type) {
        canvas.classList.add("pointer")
    } else {
        canvas.classList.remove("pointer")
    }
}
```

CSS 样式定义：

```css
.pointer {
    cursor: pointer !important;
}
```

### 3.3 按钮配置与应用

为单元格按钮配置添加 `hoverText` 属性，并通过辅助函数应用到指定单元格：

```javascript
let cellButtons = [{
    imageType: GC.Spread.Sheets.ButtonImageType.custom,
    hoverText: "删除",
    imageSrc: del,
    command: (sheet, row, col, option) => {
        alert("点击删除")
    }
},{
    imageType: GC.Spread.Sheets.ButtonImageType.custom,
    hoverText: "向上移动",
    imageSrc: moveup,
    command: (sheet, row, col, option) => {
        alert("上移")
    }
},{
    imageType: GC.Spread.Sheets.ButtonImageType.custom,
    hoverText: "下移",
    imageSrc: movedown,
    command: (sheet, row, col, option) => {
        alert("下移")
    }
}]

function setCellButtons(sheet, row, col, cellButtons) {
    let style = new GC.Spread.Sheets.Style()
    style.cellButtons = cellButtons
    sheet.setStyle(row, col, style)
    sheet.setCellType(row, col, new hoverCellType())
}

setCellButtons(spread.getActiveSheet(), 1, 1, cellButtons)
```

### 3.4 技术栈

* SpreadJS 16.0.1
* SystemJS 0.19.22
* TypeScript 4.1.2

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件。

### 4.2 操作步骤

1. 打开页面后，在单元格 (1,1) 可以看到三个自定义按钮
2. 将鼠标悬停在任意按钮上，会显示对应的提示文本
3. 鼠标指针会自动变为 pointer 样式
4. 点击按钮会触发相应的操作（弹出提示框）

## 五、功能特点

### 5.1 优点

* 提升用户体验，通过 hover 提示让按钮功能更直观
* 实现简单，通过扩展 CellType 即可完成
* 支持多按钮配置，每个按钮可设置独立的提示文本
* 提示框样式可自定义，易于调整外观

### 5.2 扩展建议

* 可以添加提示框显示延迟，避免鼠标快速划过时频繁显示
* 提示框位置可以根据鼠标位置和屏幕边界动态调整
* 可以支持 HTML 格式的提示内容，实现更丰富的提示效果

## 六、总结

本示例展示了如何通过自定义 CellType 为 SpreadJS 单元格按钮添加 hover 提示功能。开发者可以学习到：

* 如何扩展 SpreadJS 的 CellType
* 如何处理鼠标事件（processMouseMove、processMouseLeave）
* 如何动态创建和管理 DOM 元素
* 如何通过 CSS 类切换鼠标样式

该方案适用于需要为单元格按钮提供额外交互提示的场景，具有良好的扩展性和可维护性。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
