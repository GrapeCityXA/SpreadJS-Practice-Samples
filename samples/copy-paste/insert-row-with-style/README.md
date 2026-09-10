## 一、Demo 概述

本示例演示了如何在 SpreadJS 工作表中插入新行时自动复制原有行的样式。通过监听 `RowChanged` 事件，当用户在工作表中插入新行时，系统会自动将插入位置下方行的样式复制到新插入的行中，从而保持工作表样式的一致性和连续性。

该功能特别适用于需要维护表格格式统一性的场景，例如带有交替行颜色、单元格按钮或其他样式设置的数据表格。

## 二、解决的问题

在实际的电子表格应用中，用户经常需要在已有数据中插入新行。默认情况下，新插入的行是空白的，没有任何样式，这会破坏原有表格的视觉连续性。本示例解决了以下问题：

* **样式断层问题**：插入新行后，原有的背景色、边框等样式会出现断层
* **手动调整成本**：用户需要手动为新行设置样式，增加操作步骤
* **格式一致性**：在具有复杂样式（如交替行颜色、单元格按钮）的表格中，保持格式统一

## 三、实现思路

### 3.1 初始化工作表样式

示例首先为工作表的特定行设置了不同的背景色，用于演示样式复制效果：

```javascript
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
var sheet = spread.getActiveSheet();
sheet.getRange(1, 0, 1, sheet.getColumnCount(), GC.Spread.Sheets.SheetArea.viewport).backColor("pink");
sheet.getRange(2, 0, 1, sheet.getColumnCount(), GC.Spread.Sheets.SheetArea.viewport).backColor("blue");
sheet.getRange(3, 0, 1, sheet.getColumnCount(), GC.Spread.Sheets.SheetArea.viewport).backColor("yellow");
sheet.getRange(sheet.getRowCount() - 1, 0, 1, sheet.getColumnCount(), GC.Spread.Sheets.SheetArea.viewport).backColor("pink");
```

这段代码为第 1、2、3 行以及最后一行设置了不同的背景色，同时还为前三行的第一列添加了单元格按钮：

```javascript
const cellButtons = [{
    imageType: GC.Spread.Sheets.ButtonImageType.dropdown,
    command: 'openDateTimePicker',
    useButtonStyle: false
}];
sheet.getRange(1, 0, 3, 1).cellButtons(cellButtons);
```

### 3.2 监听行变化事件并复制样式

核心实现通过监听 `RowChanged` 事件来捕获行插入操作，并在插入新行后自动复制样式：

```javascript
sheet.bind(GC.Spread.Sheets.Events.RowChanged, function (sender, info) {
    console.log(info)
    if(info.propertyName == "addRows"){
        info.sheet.copyTo(info.row + info.count, 0, info.row, 0, info.count, sheet.getColumnCount(), GC.Spread.Sheets.CopyToOptions.style);
    }
});
```

**实现原理**：

* 监听 `RowChanged` 事件，该事件在行发生变化时触发
* 通过 `info.propertyName == "addRows"` 判断是否为插入行操作
* 使用 `copyTo` 方法将插入位置下方行的样式复制到新插入的行
* `copyTo` 参数说明：
    * `info.row + info.count`：源行位置（插入位置的下一行）
    * `0`：源列起始位置
    * `info.row`：目标行位置（新插入的行）
    * `0`：目标列起始位置
    * `info.count`：复制的行数
    * `sheet.getColumnCount()`：复制的列数
    * `GC.Spread.Sheets.CopyToOptions.style`：仅复制样式，不复制数据

### 3.3 技术栈

* **SpreadJS**: 15.0.0 - 核心电子表格组件
* **SystemJS**: 0.19.22 - 模块加载器
* **TypeScript**: 4.1.2 - 开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开示例页面，可以看到工作表中已经设置了不同颜色的行（粉色、蓝色、黄色）
2. 选中任意行，右键选择"插入行"或使用快捷键插入新行
3. 观察新插入的行会自动复制下方行的背景色样式
4. 如果在前三行插入，新行还会自动复制单元格按钮样式

## 五、功能特点

### 5.1 优点

* **自动化样式维护**：无需手动设置新行样式，提升用户体验
* **样式完整性**：不仅复制背景色，还包括单元格按钮、边框等所有样式属性
* **实时响应**：通过事件监听机制，插入行时立即触发样式复制
* **灵活可控**：仅复制样式不复制数据，保持数据独立性

### 5.2 局限性与扩展建议

**局限性**：

* 当前实现总是复制插入位置下方行的样式，如果需要更复杂的样式继承逻辑（如根据上下文智能选择样式源），需要额外的判断逻辑

**扩展建议**：

* 可以根据插入位置的上下文（如是否在表头、数据区、汇总区）选择不同的样式复制策略
* 可以添加配置选项，让用户选择是否启用自动样式复制功能
* 可以扩展为复制公式、数据验证等其他单元格属性

## 六、关键代码片段

### 事件监听与样式复制核心逻辑

```javascript
sheet.bind(GC.Spread.Sheets.Events.RowChanged, function (sender, info) {
    console.log(info)
    // 判断是否为插入行操作
    if(info.propertyName == "addRows"){
        // 从插入位置的下一行复制样式到新插入的行
        // info.row: 插入行的起始位置
        // info.count: 插入的行数
        info.sheet.copyTo(
            info.row + info.count, 0,  // 源：插入位置的下一行
            info.row, 0,                // 目标：新插入的行
            info.count,                 // 复制的行数
            sheet.getColumnCount(),     // 复制所有列
            GC.Spread.Sheets.CopyToOptions.style  // 仅复制样式
        );
    }
});
```

## 七、总结

本示例展示了如何利用 SpreadJS 的事件机制和样式复制 API 实现插入行时自动复制样式的功能。通过监听 `RowChanged` 事件并结合 `copyTo` 方法，开发者可以轻松实现样式的自动继承，提升用户在编辑表格时的体验。

**学习要点**：

* SpreadJS 的 `RowChanged` 事件监听机制
* `copyTo` 方法的参数配置和使用场景
* `CopyToOptions.style` 选项实现仅复制样式的功能
* 如何通过事件信息（`info.row`、`info.count`）定位操作位置

**适用场景**：

* 需要维护表格格式一致性的数据录入场景
* 具有复杂样式设置的报表编辑器
* 需要自动化样式管理的在线表格应用

该方案具有良好的扩展性，开发者可以根据实际需求调整样式复制的逻辑和范围，实现更加智能的样式管理功能。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
