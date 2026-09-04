## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现单元格内容的自适应行高功能。通过自定义单元格类型，实现了在编辑多行文本时，单元格行高能够根据内容动态调整，特别是在包含换行符的长文本场景下，确保内容完整显示而不被截断。该功能适用于需要在表格中输入和展示大段文本的业务场景。

## 二、解决的问题

- **多行文本显示问题**：当单元格内容包含换行符或超长文本时，默认行高可能无法完整显示内容
- **编辑体验优化**：在编辑过程中动态获取编辑框高度，实时调整单元格行高，避免内容被遮挡
- **合并单元格适配**：针对合并单元格场景，能够正确计算并调整行高，确保内容完整显示

## 三、实现思路

### 3.1 自定义单元格类型

通过继承 `GC.Spread.Sheets.CellTypes.Text` 创建自定义单元格类型 `EnterNewlineCellType`，重写关键方法以实现自适应行高功能。

```javascript
function EnterNewlineCellType() {
    GC.Spread.Sheets.CellTypes.Text.apply(this, arguments);
    this.typeName = "EnterNewlineCellType";
}
EnterNewlineCellType.prototype = new spreadNS.CellTypes.Text();
```

### 3.2 重写 paint 方法处理空格

重写 `paint` 方法，将字符串前端的空格转换为制表符 `\t`，确保文本渲染时的格式正确。

```javascript
EnterNewlineCellType.prototype.paint = function (ctx, value, x, y, w, h, style, options) {
    var val = "";
    if (value && (typeof value === 'string') && value.constructor === String) {
        for (var i = 0; i < value.length; i++) {
            if (value[i] === " ") {
                val += "\t";
            } else {
                val += value[i];
            }
        }
    }
    spreadNS.CellTypes.Text.prototype.paint.apply(this, [ctx, val, x, y, w, h, style, options]);
};
```

### 3.3 动态获取编辑框高度

重写 `getEditorValue` 方法，在编辑结束时获取编辑框的实际高度，并通过 `setTag` 方法将高度值存储到单元格标签中，供后续行高调整使用。

```javascript
EnterNewlineCellType.prototype.getEditorValue = function (editorContext, context) {
    var editHeight = $(editorContext).height();
    var sheet = context.sheet;
    var row = context.row;
    var col = context.col;
    sheet.setTag(row, col, editHeight);
    return spreadNS.CellTypes.Text.prototype.getEditorValue.apply(this, arguments);
};
```

### 3.4 禁用默认 Enter 事件

重写 `isReservedKey` 方法，将 Enter 键事件从 SpreadJS 的默认行为中注销，使其能够在编辑框中正常换行。

```javascript
EnterNewlineCellType.prototype.isReservedKey = function (e) {
    return (e.keyCode === GC.Spread.Commands.Key.enter && !e.ctrlKey && !e.shiftKey && !e.altKey);
};
```

### 3.5 监听值变化事件动态调整行高

通过监听 `ValueChanged` 事件，在单元格内容发生变化时，根据存储的编辑框高度或使用 `autoFitRow` 方法自动调整行高。对于合并单元格，需要计算所有合并行的总高度，确保调整后的行高能够完整显示内容。

```javascript
spread.bind(GC.Spread.Sheets.Events.ValueChanged, function (s, e) {
    var newValue = e.newValue;
    var oldValue = e.oldValue;

    if (newValue !== oldValue) {
        var sheet = spread.getActiveSheet();
        var row = e.row, col = e.col;
        var span = sheet.getSpan(row, col);
        
        if (span) {
            var tag = sheet.getTag(row, col);
            if (tag) {
                var editHeight = parseFloat(tag);
                var rowCount = span.rowCount;
                var heightAll = 0;
                for (let i = row; i < row + rowCount; i++) {
                    heightAll += sheet.getRowHeight(i);
                }
                if (heightAll < editHeight) {
                    sheet.setRowHeight(row, editHeight - heightAll + sheet.getRowHeight(row));
                }
            }
        } else {
            sheet.autoFitRow(row);
        }
    }
});
```

### 3.6 技术栈

- SpreadJS 15.0.0：核心表格控件
- jQuery 3.6.1：用于获取编辑框高度
- SystemJS 0.19.22：模块加载器
- TypeScript 4.1.2：开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行示例。

### 4.2 操作步骤

1. 打开示例页面，可以看到第 2 行第 2 列已经预设了一段长文本，并启用了自动换行
2. 双击该单元格进入编辑模式
3. 按 Enter 键可以在单元格内换行（而不是结束编辑）
4. 输入多行文本后，点击其他单元格或按 Ctrl+Enter 结束编辑
5. 观察单元格行高自动调整，确保所有内容完整显示

## 五、功能特点

### 5.1 优点

- **智能行高调整**：根据实际内容高度动态调整，避免内容被截断或浪费空间
- **编辑体验优化**：支持在单元格内使用 Enter 键换行，符合用户习惯
- **合并单元格支持**：正确处理合并单元格场景，确保行高计算准确
- **可复用性强**：通过自定义单元格类型实现，可以应用到任意列或单元格

### 5.2 局限性与扩展建议

- **依赖 jQuery**：当前实现依赖 jQuery 获取编辑框高度，可以考虑使用原生 DOM API 替代以减少依赖
- **性能优化**：对于大量单元格场景，可以考虑添加防抖机制，避免频繁触发行高调整
- **扩展方向**：可以增加最大行高限制，防止单个单元格占用过多空间；可以添加配置项，允许用户自定义换行键（如 Shift+Enter）

## 六、总结

本示例展示了 SpreadJS 自定义单元格类型的强大扩展能力。通过重写 `paint`、`getEditorValue` 和 `isReservedKey` 方法，实现了单元格内容的自适应行高功能。开发者可以从中学到：

- 如何创建和使用自定义单元格类型
- 如何重写单元格类型的关键方法以实现特定功能
- 如何使用 `setTag` 和 `getTag` 方法存储和获取单元格元数据
- 如何监听 `ValueChanged` 事件并动态调整单元格样式
- 如何处理合并单元格场景下的行高计算

该方案适用于需要在表格中输入和展示大段文本的场景，如备注信息、详细描述、多行地址等，具有良好的扩展性和实用价值。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/_SwJ946qdUS_TypVh9uqew/)）
