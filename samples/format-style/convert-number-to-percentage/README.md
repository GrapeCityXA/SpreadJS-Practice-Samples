## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现数字输入自动转换为百分比格式的功能。当用户在设置了百分比格式的单元格中输入数字时，系统会自动将输入值转换为百分比显示形式，同时正确处理数值的存储和显示逻辑。

该功能通过扩展 SpreadJS 的单元格类型和监听编辑事件实现，适用于需要频繁输入百分比数据的业务场景，如财务报表、数据分析表格等。

## 二、解决的问题

* **简化百分比输入**：用户输入 50 时自动显示为 50%，无需手动输入百分号
* **自动格式识别**：根据单元格格式自动判断是否需要进行百分比转换
* **数值存储正确性**：确保显示为 50% 时，实际存储的值为 0.5，符合 Excel 标准
* **动态格式设置**：当用户输入带百分号的文本时，自动为单元格设置百分比格式

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 扩展单元格编辑器的 setEditorValue 方法

通过重写 `CellTypes.Text.prototype.setEditorValue` 方法，在编辑器显示值时进行拦截处理：

```javascript
var oldsetEditorValue = GC.Spread.Sheets.CellTypes.Text.prototype.setEditorValue;
GC.Spread.Sheets.CellTypes.Text.prototype.setEditorValue = function (editorContext, value, context) {
    var sheet = context.sheet, row = context.row, col = context.col
    var format = sheet.getFormatter(row, col)
    if (value && !isNaN(value) && format && format.indexOf("%") === format.length - 1) {
        value = value * 100 + "%";
    }
    oldsetEditorValue.call(this, editorContext, value, context);
}
```

该方法的作用是：当单元格已设置百分比格式（如 "0%"）时，在编辑器中显示时将存储的小数值（如 0.5）乘以 100 并添加百分号，显示为 "50%"。

#### 3.1.2 监听 EditEnding 事件处理数值转换

在编辑结束前，将用户输入的数字转换为小数存储：

```javascript
spread.bind(GC.Spread.Sheets.Events.EditEnding, function (sender, args) {
    var sheet = args.sheet, row = args.row, col = args.col, text = args.editingText;
    var format = sheet.getFormatter(row, col)
    if (format && format.indexOf("%") === format.length - 1 && text && text.indexOf("%") === -1 && !isNaN(text)) {
        setTimeout(function () {
            sheet.setValue(row, col, text / 100);
        }, 0);
    }
});
```

当用户在百分比格式的单元格中输入纯数字（如 50）时，将其除以 100（变为 0.5）后存储，确保数据的正确性。

#### 3.1.3 监听 EditEnded 事件自动设置格式

当用户输入带百分号的文本时，自动为单元格设置百分比格式：

```javascript
spread.bind(GC.Spread.Sheets.Events.EditEnded, function (sender, args) {
    var sheet = args.sheet, row = args.row, col = args.col, text = args.editingText;
    var format = sheet.getFormatter(row, col);
    if (!format && text && text.indexOf("%") === text.length - 1 && !isNaN(text.substr(0, text.length - 1))) {
        var format = text.indexOf('.') > 0 ? '0.00%' : "0%";
        sheet.setFormatter(row, col, format);
    }
});
```

该逻辑会检测输入文本是否以百分号结尾，并根据是否包含小数点自动设置 "0%" 或 "0.00%" 格式。

#### 3.1.4 初始化单元格格式

在代码中预设了示例单元格的格式：

```javascript
var sheet = spread.getActiveSheet();
sheet.setFormatter(1, 1, "0%");  // B2 单元格设置为百分比格式
sheet.setFormatter(2, 1, "@");   // B3 单元格设置为文本格式
```

### 3.2 技术栈

* **@grapecity/spread-sheets**: 15.0.0 - SpreadJS 核心库
* **SystemJS**: 0.19.22 - 模块加载器
* **TypeScript**: 4.1.2 - 类型支持（项目配置支持，但主代码为 JavaScript）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，可以看到一个 SpreadJS 表格
2. 在 B2 单元格（已预设百分比格式）中输入数字，例如输入 `50`
3. 按回车或点击其他单元格，会看到 B2 显示为 `50%`
4. 双击 B2 单元格重新编辑，编辑器中会显示 `50%`
5. 在其他未设置格式的单元格中输入 `30%`，该单元格会自动设置百分比格式

## 五、功能特点

### 5.1 优点

* **用户体验友好**：输入数字即可自动转换，无需手动输入百分号
* **数据存储规范**：遵循 Excel 标准，百分比以小数形式存储（50% 存储为 0.5）
* **智能格式识别**：自动检测单元格格式和输入内容，灵活处理不同场景
* **扩展性强**：通过原型链扩展实现，不影响其他单元格类型的正常功能

### 5.2 局限性与扩展建议

* **当前实现仅针对文本单元格类型**：如果需要支持其他单元格类型，需要扩展对应的 `setEditorValue` 方法
* **格式判断较为简单**：仅通过字符串末尾是否为 "%" 判断，可以考虑使用更严格的格式解析逻辑
* **扩展建议**：可以增加对负数百分比、千分位分隔符等复杂格式的支持

## 六、关键代码片段

### 6.1 完整的事件处理流程

```javascript
// 1. 扩展编辑器显示逻辑
var oldsetEditorValue = GC.Spread.Sheets.CellTypes.Text.prototype.setEditorValue;
GC.Spread.Sheets.CellTypes.Text.prototype.setEditorValue = function (editorContext, value, context) {
    var sheet = context.sheet, row = context.row, col = context.col
    var format = sheet.getFormatter(row, col)
    if (value && !isNaN(value) && format && format.indexOf("%") === format.length - 1) {
        value = value * 100 + "%";
    }
    oldsetEditorValue.call(this, editorContext, value, context);
}

// 2. 编辑结束前转换数值
spread.bind(GC.Spread.Sheets.Events.EditEnding, function (sender, args) {
    var sheet = args.sheet, row = args.row, col = args.col, text = args.editingText;
    var format = sheet.getFormatter(row, col)
    if (format && format.indexOf("%") === format.length - 1 && text && text.indexOf("%") === -1 && !isNaN(text)) {
        setTimeout(function () {
            sheet.setValue(row, col, text / 100);
        }, 0);
    }
});

// 3. 编辑结束后自动设置格式
spread.bind(GC.Spread.Sheets.Events.EditEnded, function (sender, args) {
    var sheet = args.sheet, row = args.row, col = args.col, text = args.editingText;
    var format = sheet.getFormatter(row, col);
    if (!format && text && text.indexOf("%") === text.length - 1 && !isNaN(text.substr(0, text.length - 1))) {
        var format = text.indexOf('.') > 0 ? '0.00%' : "0%";
        sheet.setFormatter(row, col, format);
    }
});
```

## 七、总结

本示例展示了如何通过扩展 SpreadJS 的单元格类型和监听编辑事件，实现数字输入自动转换为百分比的功能。开发者可以从中学到：

* 如何扩展 SpreadJS 的单元格类型原型方法
* 如何使用 EditEnding 和 EditEnded 事件处理编辑流程
* 如何正确处理百分比的显示值和存储值之间的转换关系
* 如何根据用户输入动态设置单元格格式

该方案适用于需要频繁输入百分比数据的场景，可以显著提升用户的输入效率。开发者可以在此基础上扩展更多自定义格式的自动转换功能。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
