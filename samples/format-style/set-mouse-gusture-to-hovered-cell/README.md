## 一、Demo 概述

本示例展示了如何在 SpreadJS 中自定义单元格类型的鼠标滑过（hover）行为。通过继承 RadioButtonList 单元格类型并重写 `processMouseMove` 方法，实现了当鼠标移入单元格时，光标自动变为 pointer 状态的交互效果，提升了用户体验。

## 二、解决的问题

* **自定义鼠标交互反馈**：默认情况下，单元格的鼠标样式可能无法满足特定的交互需求，通过自定义可以提供更直观的视觉反馈
* **增强单元格类型的交互性**：为自定义单元格类型（如 RadioButtonList）添加鼠标悬停效果，让用户明确知道该区域可交互

## 三、实现思路

### 3.1 自定义单元格类型

通过继承 SpreadJS 内置的 `RadioButtonList` 单元格类型，创建自定义的 `RaidoButtonCellType` 类：

```javascript
function RaidoButtonCellType(items, size, isHorizontal) {
    this.typeName = "RaidoButtonCellType";
}
RaidoButtonCellType.prototype = new GC.Spread.Sheets.CellTypes.RadioButtonList();
```

### 3.2 重写鼠标移动事件处理

核心实现在于重写 `processMouseMove` 方法，该方法在鼠标在单元格上移动时被调用：

```javascript
RaidoButtonCellType.prototype.processMouseMove = function (hitInfo) {
    var sheet = hitInfo.sheet;
    var div = sheet.getParent().getHost();
    var canvasId = div.id + "vp_vp";
    var canvas = div.querySelector("#" + canvasId);
    
    if (sheet && hitInfo.isReservedLocation) {
        canvas.style.cursor = 'pointer';  // 鼠标移入时设置为 pointer
        return true;
    } else {
        canvas.style.cursor = 'default';  // 鼠标移出时恢复默认
    }
    return false;
};
```

**关键技术点**：

* `hitInfo.isReservedLocation`：判断鼠标是否在单元格的保留区域（即单元格内容区域）
* 通过 DOM 操作直接修改 canvas 元素的 `cursor` 样式
* 返回 `true` 表示事件已处理，阻止默认行为

### 3.3 应用自定义单元格类型

创建实例并配置单选按钮选项，然后应用到指定单元格：

```javascript
var radio = new RaidoButtonCellType();

radio.items([
    { text: "sample1", value: "0" },
    { text: "sample2", value: "1" },
    { text: "sample3", value: "2" },
]);

sheet.setCellType(0, 1, radio);  // 应用到第 0 行第 1 列
```

### 3.4 技术栈

* SpreadJS 15.2.0
* SystemJS 0.19.22（模块加载器）
* TypeScript 4.1.2（支持 TypeScript 开发）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

直接在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，可以看到一个包含三个单选按钮的单元格（位于第 0 行第 1 列）
2. 将鼠标移入该单元格区域，观察鼠标指针变化
3. 鼠标移入时，指针会从默认箭头变为 pointer（手型）
4. 鼠标移出时，指针恢复为默认状态

## 五、功能特点

### 5.1 优点

* **简单高效**：通过继承和重写单一方法即可实现自定义鼠标行为
* **用户体验提升**：直观的鼠标反馈让用户明确知道哪些区域可交互
* **可扩展性强**：该方法可应用于任何自定义单元格类型，不局限于 RadioButtonList

### 5.2 扩展建议

* 可以根据不同的 `hitInfo` 属性（如 `hitInfo.cellRect`）实现更精细的区域判断
* 可以扩展为支持不同的鼠标样式（如 `grab`、`move` 等）
* 可以结合其他鼠标事件（如 `processMouseDown`、`processMouseUp`）实现更复杂的交互

## 六、关键代码片段

完整的自定义单元格类型实现：

```javascript
function RaidoButtonCellType(items, size, isHorizontal) {
    this.typeName = "RaidoButtonCellType";
}
RaidoButtonCellType.prototype = new GC.Spread.Sheets.CellTypes.RadioButtonList();

// 重写鼠标移动处理方法
RaidoButtonCellType.prototype.processMouseMove = function (hitInfo) {
    var sheet = hitInfo.sheet;
    var div = sheet.getParent().getHost();
    var canvasId = div.id + "vp_vp";
    var canvas = div.querySelector("#" + canvasId);
    
    if (sheet && hitInfo.isReservedLocation) {
        canvas.style.cursor = 'pointer';
        return true;
    } else {
        canvas.style.cursor = 'default';
    }
    return false;
};
```

## 七、总结

本示例展示了 SpreadJS 单元格类型扩展的灵活性，通过简单的继承和方法重写即可实现自定义的鼠标交互行为。开发者可以从中学到：

* 如何继承 SpreadJS 内置单元格类型
* 如何重写 `processMouseMove` 方法自定义鼠标行为
* 如何通过 DOM 操作控制 canvas 元素的样式
* 如何利用 `hitInfo` 对象判断鼠标位置

该方案适用于需要为自定义单元格类型添加特殊鼠标交互效果的场景，具有良好的可扩展性和实用性。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
