## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现智能的百分数格式处理功能。当用户在设置了百分数格式的单元格中输入数值时，系统会自动将输入值转换为百分数（乘以 100），并在编辑时显示百分数形式；同时支持用户直接输入带 `%` 符号的数值，系统会自动识别并设置相应的百分数格式。

该示例解决了电子表格应用中百分数输入的用户体验问题，让用户可以更自然地输入和编辑百分数数据。

## 二、解决的问题

1. **百分数输入的二义性问题**：用户输入 0.5 希望显示为 50%，而不是 0.5%
2. **编辑体验优化**：编辑已有百分数时，显示 50 而不是 0.5，更符合用户直觉
3. **自动格式识别**：用户输入 "50%" 时自动设置百分数格式，无需手动设置

## 三、实现思路

### 3.1 重写单元格编辑器的值设置方法

通过扩展 SpreadJS 的 `CellTypes.Text` 原型，重写 `setEditorValue` 方法，在编辑器显示值之前进行预处理：

```javascript
var oldsetEditorValue = GC.Spread.Sheets.CellTypes.Text.prototype.setEditorValue;
GC.Spread.Sheets.CellTypes.Text.prototype.setEditorValue = function (editorContext, value, context) {
    var sheet = context.sheet,
        row = context.row,
        col = context.col
    var format = sheet.getFormatter(row, col)
    // 如果单元格已设置百分数格式，且输入值为数值，则乘以 100 并添加 % 符号
    if (value && !isNaN(value) && format && format.indexOf("%") === format.length - 1) {
        value = value * 100 + "%";
    }
    oldsetEditorValue.call(this, editorContext, value, context);
}
```

这段代码的核心逻辑：
- 检查单元格是否已设置百分数格式（格式字符串以 `%` 结尾）
- 如果输入值是数值（如 0.5），则转换为百分数形式（50%）
- 调用原始方法完成编辑器赋值

### 3.2 编辑结束时的数值转换

监听 `EditEnding` 事件，在用户完成编辑但尚未提交时，将百分数形式的输入转换回小数形式存储：

```javascript
spread.bind(GC.Spread.Sheets.Events.EditEnding, function (sender, args) {
    var sheet = args.sheet,
        row = args.row,
        col = args.col,
        text = args.editingText;
    var format = sheet.getFormatter(row, col)
    // 如果单元格有百分数格式，且输入的是纯数值（不含 %），则除以 100 存储
    if (format && format.indexOf("%") === format.length - 1 && text && text.indexOf("%") === -1 && !isNaN(text)) {
        setTimeout(function () {
            sheet.setValue(row, col, text / 100);
        }, 0);
    }
});
```

使用 `setTimeout` 确保在编辑流程完成后再设置值，避免与内部逻辑冲突。

### 3.3 自动格式识别

监听 `EditEnded` 事件，当用户输入带 `%` 符号的文本时，自动为单元格设置百分数格式：

```javascript
spread.bind(GC.Spread.Sheets.Events.EditEnded, function (sender, args) {
    var sheet = args.sheet,
        row = args.row,
        col = args.col,
        text = args.editingText;
    var format = sheet.getFormatter(row, col);
    // 如果单元格无格式，且输入内容以 % 结尾且是有效数值，则自动设置百分数格式
    if (!format && text && text.indexOf("%") === text.length - 1 && !isNaN(text.substr(0, text.length - 1))) {
        var format = text.indexOf('.') > 0 ? '0.00%' : "0%";
        sheet.setFormatter(row, col, format);
    }
});
```

根据输入内容是否包含小数点，智能选择格式：
- 整数（如 "50%"）→ 使用 `0%` 格式
- 小数（如 "50.5%"）→ 使用 `0.00%` 格式

### 3.4 技术栈

- SpreadJS 15.0.0：核心电子表格引擎
- TypeScript 4.1.2：类型安全的开发语言
- SystemJS 0.19.22：模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，B2 单元格已预设为百分数格式（`0%`）
2. 在 B2 单元格输入数值 `0.5`，按回车后显示为 `50%`
3. 双击 B2 单元格进入编辑模式，编辑器中显示 `50%`（而非 `0.5`）
4. 在其他空白单元格输入 `75%`，系统自动设置百分数格式
5. 在 B3 单元格（文本格式 `@`）输入数值，不会触发百分数转换

## 五、功能特点

### 5.1 优点

1. **用户体验优化**：编辑百分数时显示直观的百分数值，而非小数
2. **智能格式识别**：自动识别用户输入的百分数符号并设置格式
3. **数据存储规范**：内部仍以小数形式存储，保证计算准确性
4. **非侵入式扩展**：通过原型扩展实现，不影响 SpreadJS 其他功能

### 5.2 局限性与扩展建议

- 当前实现仅处理简单的百分数格式（`0%` 和 `0.00%`），对于更复杂的格式（如 `0.00%↑`）可能需要额外处理
- 可以扩展支持其他自定义格式的智能输入（如货币、日期等）
- 建议在生产环境中添加更完善的输入验证和错误处理

## 六、关键代码片段

### 编辑器值预处理

```javascript
// 重写编辑器赋值方法，实现百分数显示转换
GC.Spread.Sheets.CellTypes.Text.prototype.setEditorValue = function (editorContext, value, context) {
    var sheet = context.sheet, row = context.row, col = context.col;
    var format = sheet.getFormatter(row, col);
    
    // 核心逻辑：检测百分数格式并转换显示值
    if (value && !isNaN(value) && format && format.indexOf("%") === format.length - 1) {
        value = value * 100 + "%";
    }
    
    oldsetEditorValue.call(this, editorContext, value, context);
}
```

### 双向数据转换

```javascript
// 编辑结束时：百分数 → 小数（存储）
spread.bind(GC.Spread.Sheets.Events.EditEnding, function (sender, args) {
    var format = args.sheet.getFormatter(args.row, args.col);
    if (format && format.indexOf("%") === format.length - 1 && 
        args.editingText && args.editingText.indexOf("%") === -1 && 
        !isNaN(args.editingText)) {
        setTimeout(function () {
            args.sheet.setValue(args.row, args.col, args.editingText / 100);
        }, 0);
    }
});
```

## 七、总结

本示例展示了如何通过扩展 SpreadJS 的内置方法和事件监听机制，实现智能的百分数格式处理功能。开发者可以从中学到：

1. 如何通过原型扩展定制 SpreadJS 的单元格编辑行为
2. 利用 `EditEnding` 和 `EditEnded` 事件实现数据转换和格式识别
3. 在保持数据存储规范的前提下优化用户输入体验
4. 使用 `setTimeout` 处理异步编辑流程的技巧

该方案适用于需要优化百分数、货币等特殊格式输入体验的电子表格应用，具有良好的扩展性和可维护性。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/ThEQsPj4gkOfXZs7AWKs-Q/)）
