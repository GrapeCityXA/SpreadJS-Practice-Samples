## 一、Demo 概述

本示例演示了如何在 SpreadJS 中自定义列头右键菜单，实现点击列头右键时弹出提示框显示该列头单元格的值。该功能支持普通列头单元格和合并列头单元格两种场景，能够准确获取并显示列头内容。

## 二、解决的问题

在实际的表格应用中，开发者可能需要在用户右键点击列头时执行自定义操作，例如显示列的详细信息、执行特定的列操作等。SpreadJS 默认的右键菜单无法直接获取列头单元格的值，本示例通过自定义右键菜单解决了以下问题：

* 如何捕获列头区域的右键点击事件
* 如何准确获取被点击的列头单元格的值
* 如何处理合并列头单元格的情况

## 三、实现思路

### 3.1 自定义右键菜单类

通过继承 `GC.Spread.Sheets.ContextMenu.ContextMenu` 创建自定义菜单类，重写 `onOpenMenu` 方法来实现自定义逻辑：

```javascript
function MyContextMenu() { }
MyContextMenu.prototype = new GC.Spread.Sheets.ContextMenu.ContextMenu(spread);
MyContextMenu.prototype.onOpenMenu = function (menuData, itemsDataForShown, hitInfo, spread) {
    // 自定义菜单逻辑
};
```

### 3.2 判断点击区域

通过 `hitInfo.worksheetHitInfo.rowViewportIndex` 判断是否点击的是列头区域。当 `rowViewportIndex == -1` 时，表示点击的是列头：

```javascript
let worksheetHitInfo = hitInfo.worksheetHitInfo;
if (worksheetHitInfo.rowViewportIndex == -1) {
    // 列头右键菜单逻辑
}
```

### 3.3 处理合并单元格

使用 `sheet.getSpans()` 方法检查当前单元格是否为合并单元格。如果是合并单元格，需要获取合并区域左上角单元格的坐标，然后获取该单元格的值：

```javascript
let range = new GC.Spread.Sheets.Range(row, col, 1, 1);
let spanArr = sheet.getSpans(range, GC.Spread.Sheets.SheetArea.colHeader);
if (spanArr.length > 0) {
    // 合并单元格：获取左上角单元格的值
    let relRow = spanArr[0].row;
    let relCol = spanArr[0].col;
    let relValue = sheet.getValue(relRow, relCol, GC.Spread.Sheets.SheetArea.colHeader);
    alert("选择列头单元格的值为" + relValue);
} else {
    // 普通单元格：直接获取值
    let value = sheet.getValue(row, col, GC.Spread.Sheets.SheetArea.colHeader);
    alert("选择列头单元格的值为" + value);
}
```

### 3.4 技术栈

* @grapecity/spread-sheets: 15.0.0
* TypeScript: ^4.1.2
* SystemJS: ^0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，可以看到一个 SpreadJS 表格，列头第一行的 D-E 列已合并并显示"2019"
2. 在任意列头位置点击鼠标右键
3. 系统会弹出提示框，显示该列头单元格的值
4. 对于合并的列头单元格（如 D-E 列），点击任意位置都会显示合并单元格的值"2019"

## 五、功能特点

### 5.1 优点

* 准确识别列头区域的右键点击事件
* 完善处理合并单元格场景，避免获取错误的单元格值
* 代码结构清晰，易于扩展为更复杂的自定义菜单功能
* 通过继承原生菜单类，保持了 SpreadJS 的原有功能

### 5.2 扩展建议

* 可以在 `onOpenMenu` 方法中添加自定义菜单项，而不仅仅是弹出提示框
* 可以根据列头的值或位置动态显示不同的菜单选项
* 可以结合其他事件（如双击、悬停）实现更丰富的交互效果

## 六、关键代码片段

### 初始化列头合并单元格

```javascript
let spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'));
let sheet = spread.getActiveSheet();
// 设置列头为2行
sheet.setRowCount(2, 1);
// 合并列头单元格（第0行，第3列开始，跨1行2列）
sheet.addSpan(0, 3, 1, 2, GC.Spread.Sheets.SheetArea.colHeader);
sheet.setValue(0, 3, "2019", GC.Spread.Sheets.SheetArea.colHeader);
```

### 应用自定义菜单

```javascript
let contextMenu = new MyContextMenu();
spread.contextMenu = contextMenu;
```

## 七、总结

本示例展示了 SpreadJS 自定义右键菜单的基本用法，特别是如何在列头区域实现自定义交互。开发者可以从中学到：

* 如何继承和扩展 SpreadJS 的内置菜单类
* 如何通过 `hitInfo` 对象判断用户点击的区域和位置
* 如何处理合并单元格的特殊情况
* 如何使用 `SheetArea.colHeader` 操作列头区域

该方案适用于需要在列头实现自定义交互的场景，例如列筛选、列排序、列属性设置等功能。通过扩展 `onOpenMenu` 方法，可以轻松实现更复杂的业务逻辑。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
