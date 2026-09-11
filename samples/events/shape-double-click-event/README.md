## 一、Demo 概述

本示例演示了如何在 SpreadJS 中实现对形状（Shape）的双击事件监听功能。通过结合原生 DOM 事件监听和 SpreadJS 的 hitTest API，实现了对工作表中图片形状的精准双击检测。该示例在工作表中添加了多个图片形状和一个心形自动形状，当用户双击图片形状时，能够准确识别并输出被点击的图片名称。

## 二、解决的问题

SpreadJS 的形状对象本身不直接支持双击事件监听，开发者需要通过以下方式实现形状的交互功能：

* 如何捕获工作表中形状的双击事件
* 如何将鼠标坐标转换为工作表的行列位置
* 如何判断点击位置是否落在某个形状的范围内
* 如何在存在冻结行列的情况下准确定位形状

## 三、实现思路

### 3.1 添加形状到工作表

使用 SpreadJS 的 shapes API 添加图片形状和自动形状：

```javascript
sheet.shapes.addPictureShape("Picture 1", "1.png", 200, 200, 100, 100);
sheet.shapes.addPictureShape("Picture 2", "1.png", 1000, 300, 100, 100);
sheet.shapes.addPictureShape("Picture 3", "1.png", 500, 500, 100, 100);
sheet.shapes.add('autoShape', GC.Spread.Sheets.Shapes.AutoShapeType.heart, 100, 250, 100, 150);
```

`addPictureShape` 方法参数依次为：形状名称、图片路径、X 坐标、Y 坐标、宽度、高度。

### 3.2 监听双击事件并进行坐标转换

在容器元素上添加原生 dblclick 事件监听器，并使用 hitTest API 将鼠标坐标转换为工作表位置：

```javascript
document.getElementById('ss').addEventListener('dblclick', function (e) {
    let _x = e.pageX - this.offsetLeft
    let _y = e.pageY - this.offsetTop
    let result = spread.hitTest(_x, _y)
    var { row, col } = getHitAreaName(result);
    
    // 遍历所有形状进行匹配
    for (let i = 0; i < sheet.shapes.all().length; i++) {
        // ...
    }
});
```

通过 `e.pageX - this.offsetLeft` 和 `e.pageY - this.offsetTop` 计算出相对于 SpreadJS 容器的坐标，然后使用 `spread.hitTest()` 方法获取点击位置的详细信息。

### 3.3 解析 hitTest 结果获取行列信息

通过 `getHitAreaName` 函数解析 hitTest 返回的结果，提取点击位置的行列索引：

```javascript
function getHitAreaName(result) {
    if (!result) return;
    var str = '';
    if (result.worksheetHitInfo) {
        let type = result.worksheetHitInfo.hitTestType
        switch (type) {
            case 0:
                str = 'corner';
            case 1:
                str = 'colHeader';
            case 2:
                str = 'rowHeader';
            case 3:
                return { row: result.worksheetHitInfo.row, col: result.worksheetHitInfo.col }
        }
    }
}
```

当 `hitTestType` 为 3 时，表示点击的是单元格区域，此时返回对应的行列索引。

### 3.4 判断点击位置是否在形状范围内

遍历所有图片形状，通过比较点击位置的行列索引与形状的起始/结束行列，判断是否命中：

```javascript
for (let i = 0; i < sheet.shapes.all().length; i++) {
    if (sheet.shapes.all()[i] instanceof GC.Spread.Sheets.Shapes.PictureShape) {
        let pic = sheet.shapes.all()[i]
        let startRow = pic.startRow()
        let endRow = pic.endRow()
        let startColumn = pic.startColumn()
        let endColumn = pic.endColumn()
        if (row >= startRow && row <= endRow && col >= startColumn && col <= endColumn) {
            console.log("当前图片双击", pic.name())
        }
    }
}
```

通过 `startRow()`、`endRow()`、`startColumn()`、`endColumn()` 方法获取形状占据的行列范围，然后判断点击位置是否在该范围内。

### 3.5 技术栈

* @grapecity/spread-sheets: 16.0.1（核心表格组件）
* @grapecity/spread-sheets-shapes: 16.0.1（形状扩展模块）
* TypeScript: ^4.1.2（开发语言）
* SystemJS: ^0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

然后在浏览器中打开 `index.html` 文件。

### 4.2 操作步骤

1. 打开页面后，可以看到工作表中显示了 3 个图片形状和 1 个心形自动形状
2. 双击任意图片形状，控制台会输出该图片的名称（如 "Picture 1"）
3. 双击心形或其他区域不会触发输出（因为代码只处理了 PictureShape 类型）

## 五、功能特点

### 5.1 优点

* 实现了形状的双击事件监听，弥补了 SpreadJS 形状对象不直接支持事件监听的不足
* 使用 hitTest API 进行精准的坐标转换，支持冻结行列场景
* 通过类型判断（instanceof）可以区分不同类型的形状，实现差异化处理
* 代码逻辑清晰，易于扩展到其他交互场景（如右键菜单、拖拽等）

### 5.2 局限性与扩展建议

* 当前实现只处理了 PictureShape 类型，如需支持其他形状类型（如 AutoShape、Connector 等），需要添加相应的类型判断
* `getHitAreaName` 函数中的 switch 语句缺少 break，可能导致逻辑错误
* 可以考虑将形状事件监听封装为独立的工具函数，支持注册多种事件类型（单击、双击、右键等）
* 可以添加视觉反馈（如高亮选中的形状），提升用户体验

## 六、关键代码片段

### 坐标转换与 hitTest

```javascript
let _x = e.pageX - this.offsetLeft
let _y = e.pageY - this.offsetTop
let result = spread.hitTest(_x, _y)
```

这段代码将浏览器的全局坐标转换为相对于 SpreadJS 容器的坐标，然后通过 hitTest 获取点击位置的详细信息。

### 形状范围判断

```javascript
let startRow = pic.startRow()
let endRow = pic.endRow()
let startColumn = pic.startColumn()
let endColumn = pic.endColumn()
if (row >= startRow && row <= endRow && col >= startColumn && col <= endColumn) {
    console.log("当前图片双击", pic.name())
}
```

通过比较点击位置的行列索引与形状的边界范围，实现精准的命中检测。

## 七、总结

本示例展示了如何在 SpreadJS 中实现形状的双击事件监听功能，核心技术点包括原生 DOM 事件监听、hitTest API 的使用、形状范围判断等。开发者可以从中学到：

* SpreadJS 的 hitTest API 使用方法
* 形状对象的位置信息获取方式（startRow、endRow 等）
* 如何结合原生事件和 SpreadJS API 实现自定义交互
* 形状类型判断和遍历技巧

该方案适用于需要对工作表中的形状进行交互操作的场景，如图表点击、图片编辑、流程图节点操作等，具有较好的扩展性和实用价值。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
