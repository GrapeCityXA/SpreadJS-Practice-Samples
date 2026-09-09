## 一、Demo 概述

本示例演示了如何在 SpreadJS 中为单元格设置数字格式，并实现了一个智能检测机制，用于防止用户对字符串类型的单元格错误地应用数字格式。该示例通过监听单元格变化事件，自动检测单元格的数据类型和格式设置，当发现字符串单元格被设置了格式化器时，会弹出警告提示用户正确的操作方式。

## 二、解决的问题

在实际开发中，开发者经常会遇到以下问题：

- 用户可能会对字符串类型的单元格设置数字格式，导致格式无法生效
- 缺乏对单元格类型和格式设置的实时校验机制
- 需要引导用户正确使用 SpreadJS 的格式化功能

本示例通过事件监听和类型检测，帮助开发者构建更加健壮的数据输入验证机制。

## 三、实现思路

### 3.1 初始化工作簿和设置中文环境

示例首先设置了 SpreadJS 的语言环境为中文，并初始化了工作簿和工作表：

```javascript
GC.Spread.Common.CultureManager.culture('zh-cn');
var spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'))
var sheet = spread.getActiveSheet();

sheet.setValue(1,3,99)
sheet.setActiveCell(1,3)
sheet.setColumnWidth(3,120)
```

这段代码设置了中文环境，创建了工作簿实例，并在 D2 单元格（行索引 1，列索引 3）中预设了数值 99，同时将该单元格设为活动单元格，并调整了列宽。

### 3.2 监听单元格变化事件

核心功能通过监听 `CellChanged` 事件实现，当单元格的公式或样式信息发生变化时触发检测：

```javascript
spread.bind(GC.Spread.Sheets.Events.CellChanged, function(s, e){
    document.getElementById('log').innerHTML = JSON.stringify(e.propertyName)
    if(e.propertyName === "formula" || e.propertyName === "[styleinfo]"){
        setTimeout(function(){
            checkCellFormat(e.sheet, e.row, e.col)
        },10)
    }
})
```

这里使用了 `setTimeout` 延迟 10 毫秒执行检测，确保单元格的值和格式已经完全更新。

### 3.3 单元格格式检测逻辑

检测函数会判断单元格的值类型和格式设置，当发现字符串单元格被设置了格式化器时发出警告：

```javascript
function checkCellFormat(sheet, row, col){
    var cell = sheet.getCell(row, col), value = cell.value(), formatter = cell.formatter();
    if(typeof value === "string" && formatter){
        alert("请不要给string单元格设置格式，如果需要设置格式，请加Value方法")
    }
}
```

这个函数通过 `typeof` 检测值类型，并通过 `formatter()` 方法检查是否设置了格式化器。

### 3.4 手动设置格式功能

示例提供了一个按钮，允许用户为当前活动单元格设置五位小数的数字格式：

```javascript
document.getElementById('setFormatter').addEventListener('click',function() {
    var sheet = spread.getActiveSheet();
    var cell = sheet.getCell(sheet.getActiveRowIndex(), sheet.getActiveColumnIndex());
    cell.formatter("0.00000")
})
```

### 3.5 技术栈

- SpreadJS 15.0.0：核心电子表格组件
- SystemJS 0.19.22：模块加载器
- TypeScript 4.1.2：类型支持（配置环境）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

然后在浏览器中打开 `index.html` 文件。

### 4.2 操作步骤

1. 打开页面后，会看到 D2 单元格中预设了数值 99
2. 点击"点我设置单元格数据格式"按钮，数值会被格式化为五位小数（99.00000）
3. 尝试在任意单元格中输入字符串（如 "test"）
4. 选中该字符串单元格，点击格式设置按钮
5. 系统会弹出警告："请不要给string单元格设置格式，如果需要设置格式，请加Value方法"

## 五、功能特点

### 5.1 优点

- 实时监听单元格变化，提供即时反馈
- 智能识别数据类型，防止格式设置错误
- 代码简洁，易于理解和扩展
- 提供了清晰的用户提示信息

### 5.2 局限性与扩展建议

当前实现的局限性：

- 仅检测字符串类型，未覆盖其他特殊类型（如日期、布尔值）
- 警告方式使用 `alert`，用户体验不够友好

扩展建议：

- 可以使用自定义对话框或 Toast 提示替代 `alert`
- 可以扩展检测逻辑，支持更多数据类型的格式校验
- 可以添加自动修正功能，当检测到错误时自动转换数据类型

## 六、关键代码片段

### 事件监听与延迟检测

```javascript
spread.bind(GC.Spread.Sheets.Events.CellChanged, function(s, e){
    document.getElementById('log').innerHTML = JSON.stringify(e.propertyName)
    if(e.propertyName === "formula" || e.propertyName === "[styleinfo]"){
        setTimeout(function(){
            checkCellFormat(e.sheet, e.row, e.col)
        },10)
    }
})
```

这段代码展示了如何监听特定属性的变化，并使用延迟执行确保数据更新完成。

### 类型检测与格式校验

```javascript
function checkCellFormat(sheet, row, col){
    var cell = sheet.getCell(row, col), value = cell.value(), formatter = cell.formatter();
    if(typeof value === "string" && formatter){
        alert("请不要给string单元格设置格式，如果需要设置格式，请加Value方法")
    }
}
```

通过 JavaScript 原生的 `typeof` 操作符和 SpreadJS 的 `formatter()` 方法，实现了简洁高效的类型检测。

## 七、总结

本示例展示了 SpreadJS 中单元格格式设置的基本用法，以及如何通过事件监听机制实现数据类型校验。开发者可以从中学到：

- SpreadJS 的 `CellChanged` 事件监听机制
- 单元格格式化器（formatter）的使用方法
- 如何获取和检测单元格的值类型
- 延迟执行在事件处理中的应用场景

该方案适用于需要对用户输入进行实时校验的场景，特别是在构建数据录入系统时，可以有效防止用户操作错误，提升数据质量。通过扩展检测逻辑和优化提示方式，可以构建更加完善的数据验证系统。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/pAryBXsVfEKUridIscCP3Q/)）
