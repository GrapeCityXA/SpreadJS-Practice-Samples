## 一、Demo 概述

本示例演示了如何在 SpreadJS 中实现单元格内容的自动换行功能。当用户在单元格中输入内容并按下回车键时，系统会自动为该单元格启用自动换行，并根据内容自动调整行高，确保所有内容都能完整显示。

该功能适用于需要在单元格中输入多行文本或长文本的场景，如备注信息、详细描述、地址信息等。

## 二、解决的问题

* **内容显示不全**：当单元格内容过长时，默认情况下会被截断或溢出到相邻单元格，影响数据的可读性
* **手动调整繁琐**：用户需要手动设置换行和调整行高，操作效率低下
* **用户体验优化**：通过自动化处理，提升用户在编辑长文本时的体验

## 三、实现思路

### 3.1 核心技术点

#### 监听单元格值变化事件

通过监听 `ValueChanged` 事件，在用户输入内容后自动触发换行和行高调整逻辑。

```javascript
sheet.bind(GC.Spread.Sheets.Events.ValueChanged, function(e, info) {
    console.log(info)
    sheet.getRange(info.row, info.col, 1, 1, GC.Spread.Sheets.SheetArea.viewport).wordWrap(true);
    sheet.autoFitRow(info.row);
})
```

#### 设置单元格自动换行

使用 `wordWrap(true)` 方法为指定单元格启用自动换行功能。通过 `getRange()` 方法获取当前编辑的单元格区域，然后应用换行设置。

```javascript
sheet.getRange(info.row, info.col, 1, 1, GC.Spread.Sheets.SheetArea.viewport).wordWrap(true);
```

#### 自动调整行高

使用 `autoFitRow()` 方法根据单元格内容自动调整行高，确保所有内容都能完整显示。

```javascript
sheet.autoFitRow(info.row);
```

### 3.2 技术栈

* SpreadJS 15.0.0：核心电子表格组件库
* SystemJS 0.19.22：模块加载器
* TypeScript 4.1.2：开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，会看到一个空白的 SpreadJS 表格
2. 在任意单元格中输入内容
3. 按下回车键或点击其他单元格完成输入
4. 系统会自动为该单元格启用换行，并调整行高以适应内容
5. 如果输入的内容包含换行符（通过 Alt+Enter 输入），内容会自动分行显示

## 五、功能特点

### 5.1 优点

* **自动化处理**：无需手动设置，输入内容后自动启用换行和调整行高
* **实时响应**：通过事件监听机制，在值变化时立即生效
* **代码简洁**：核心实现仅需几行代码，易于理解和维护
* **用户友好**：提升了长文本输入的用户体验

### 5.2 局限性与扩展建议

* **全局应用**：当前实现会对所有单元格生效，如果只需要对特定区域启用，可以在事件处理函数中添加行列范围判断
* **性能优化**：对于大量数据输入场景，可以考虑批量处理或延迟执行，避免频繁触发行高调整
* **扩展方向**：可以结合单元格样式设置，如文本对齐方式、字体大小等，提供更丰富的文本显示效果

## 六、关键代码片段

```javascript
import * as GC from "@grapecity/spread-sheets";

// 初始化 SpreadJS 工作簿
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
var sheet = spread.getActiveSheet();

// 监听单元格值变化事件
sheet.bind(GC.Spread.Sheets.Events.ValueChanged, function(e, info) {
    // 为当前单元格启用自动换行
    sheet.getRange(info.row, info.col, 1, 1, GC.Spread.Sheets.SheetArea.viewport).wordWrap(true);
    // 自动调整行高
    sheet.autoFitRow(info.row);
})
```

## 七、总结

本示例展示了 SpreadJS 中实现单元格自动换行的简单而实用的方案。开发者可以从中学到：

1. 如何使用 `ValueChanged` 事件监听单元格内容变化
2. 如何通过 `getRange()` 方法获取指定单元格区域
3. 如何使用 `wordWrap()` 方法设置单元格自动换行
4. 如何使用 `autoFitRow()` 方法自动调整行高

该方案适用于需要处理长文本输入的各类电子表格应用，通过简单的事件驱动机制实现了良好的用户体验。开发者可以在此基础上扩展更多功能，如条件判断、批量处理、样式定制等。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
