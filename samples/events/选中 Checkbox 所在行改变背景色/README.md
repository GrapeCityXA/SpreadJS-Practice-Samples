## 一、Demo 概述

本示例展示了如何在 SpreadJS 表格中实现一个交互式的 Checkbox 功能：当用户选中某一行的 Checkbox 时，该行的背景色会自动改变为红色；取消选中时，背景色恢复为默认状态。同时，示例还实现了列头的全选 Checkbox 功能，可以一键选中或取消选中该列的所有 Checkbox，并同步更新所有行的背景色。

该功能常用于数据表格的行选择场景，例如批量操作、数据筛选、任务列表等，通过视觉反馈让用户清晰地识别已选中的数据行。

## 二、解决的问题

- 提供直观的行选择视觉反馈，用户可以通过背景色快速识别已选中的数据行
- 实现列头全选功能，支持批量选择和取消选择操作
- 通过自定义 CellType 扩展 SpreadJS 的 Checkbox 功能，满足特定的交互需求
- 实现 Checkbox 状态与行背景色的联动，提升用户体验

## 三、实现思路

### 3.1 自定义 Checkbox CellType

通过继承 `GC.Spread.Sheets.CellTypes.CheckBox` 创建自定义的 `MyCheckBoxCellType`，用于列头的全选功能。该自定义类型重写了三个关键方法：

```javascript
function MyCheckBoxCellType() {
    GC.Spread.Sheets.CellTypes.CheckBox.apply(this);
    this.caption("All");
}
MyCheckBoxCellType.prototype = new GC.Spread.Sheets.CellTypes.CheckBox();

// 重写 paint 方法，从 tag 中读取选中状态
var basePaint = GC.Spread.Sheets.CellTypes.CheckBox.prototype.paint;
MyCheckBoxCellType.prototype.paint = function (ctx, value, x, y, width, height, style, context) {
    var tag = context.sheet.getTag(context.row, context.col, context.sheetArea);
    if (tag !== true) {
        tag = false;
    }
    basePaint.apply(this, [ctx, tag, x, y, width, height, style, context]);
};
```

`paint` 方法通过读取单元格的 `tag` 属性来确定 Checkbox 的选中状态，而不是直接使用 `value`，这样可以独立管理列头 Checkbox 的状态。

### 3.2 处理列头 Checkbox 点击事件

重写 `processMouseUp` 方法，实现列头 Checkbox 的全选/取消全选逻辑：

```javascript
MyCheckBoxCellType.prototype.processMouseUp = function (hitInfo) {
    var sheet = hitInfo.sheet,
        row = hitInfo.row,
        col = hitInfo.col,
        sheetArea = hitInfo.sheetArea;
    var colCount = sheet.getColumnCount();
    
    // 切换 tag 状态
    var tag = sheet.getTag(row, col, sheetArea);
    if (tag === undefined || tag === null) {
        sheet.setTag(row, col, true, sheetArea);
    } else {
        sheet.setTag(row, col, !tag, sheetArea);
    }
    
    // 更新所有行的 Checkbox 和背景色
    tag = sheet.getTag(row, col, sheetArea);
    sheet.suspendPaint();
    for (var i = 0; i < sheet.getRowCount(); i++) {
        var cell = sheet.getCell(i, col);
        if (cell.cellType() instanceof GC.Spread.Sheets.CellTypes.CheckBox) {
            cell.value(tag);
            var backcolor = undefined;
            if (cell.value()) {
                backcolor = "red";
            }
            sheet.getRange(i, 0, 1, colCount).backColor(backcolor);
        }
    }
    sheet.resumePaint();
};
```

该方法遍历该列的所有行，将每个 Checkbox 的值设置为列头 Checkbox 的状态，并同步更新行背景色。使用 `suspendPaint()` 和 `resumePaint()` 可以避免多次重绘，提升性能。

### 3.3 处理单个 Checkbox 点击事件

通过监听 `ButtonClicked` 事件，处理数据区域单个 Checkbox 的点击：

```javascript
spread.bind(GC.Spread.Sheets.Events.ButtonClicked,
    function (e, args) {
        var sheet = args.sheet,
            row = args.row,
            col = args.col;
        var colCount = sheet.getColumnCount();
        var cellType = sheet.getCellType(row, col);
        
        if (cellType instanceof GC.Spread.Sheets.CellTypes.CheckBox) {
            var colHeaderCell = sheet.getCell(0, col, GC.Spread.Sheets.SheetArea.colHeader);
            if (colHeaderCell.cellType() instanceof MyCheckBoxCellType) {
                // 检查该列所有 Checkbox 是否全部选中
                var checkStatus = true;
                for (var i = 0; i < sheet.getRowCount(); i++) {
                    var cell = sheet.getCell(i, col);
                    if (cell.cellType() instanceof GC.Spread.Sheets.CellTypes.CheckBox && !cell.value()) {
                        checkStatus = false;
                        break;
                    }
                }
                colHeaderCell.tag(checkStatus);
                
                // 更新当前行背景色
                var backcolor = undefined;
                if (sheet.getValue(row, col)) {
                    backcolor = "red";
                }
                sheet.suspendPaint();
                sheet.getRange(row, 0, 1, colCount).backColor(backcolor);
                sheet.resumePaint();
                sheet.repaint();
            }
        }
    });
```

该事件处理函数实现了两个功能：
1. 根据当前行 Checkbox 的选中状态更新行背景色
2. 检查该列所有 Checkbox 的状态，同步更新列头 Checkbox 的选中状态

### 3.4 初始化表格

在页面加载时初始化 SpreadJS 工作簿，并设置列头和数据区域的 Checkbox：

```javascript
var spread = new GC.Spread.Sheets.Workbook($("#ss").get(0), {
    sheetCount: 1
});
var sheet = spread.getActiveSheet();

// 设置列头自定义 Checkbox
sheet.setCellType(0, 0, new MyCheckBoxCellType(), GC.Spread.Sheets.SheetArea.colHeader);

// 设置数据区域的 Checkbox
for (var i = 0; i < 8; i++) {
    var c = new GC.Spread.Sheets.CellTypes.CheckBox();
    c.textAlign(GC.Spread.Sheets.CellTypes.CheckBoxTextAlign.right);
    sheet.setCellType(i, 0, c, GC.Spread.Sheets.SheetArea.viewport);
}
```

### 3.5 技术栈

- SpreadJS 15.0.0：核心表格控件
- jQuery 3.1.1：DOM 操作和事件处理
- SystemJS 0.19.22：模块加载器
- TypeScript 4.1.2：开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，可以看到一个包含 8 行 Checkbox 的表格
2. 点击列头的 "All" Checkbox，所有行的 Checkbox 会被选中，同时所有行的背景色变为红色
3. 再次点击列头的 "All" Checkbox，所有行的 Checkbox 会被取消选中，背景色恢复默认
4. 点击任意一行的 Checkbox，该行的背景色会变为红色（选中）或恢复默认（取消选中）
5. 当手动选中所有行的 Checkbox 时，列头的 "All" Checkbox 会自动变为选中状态
6. 当取消任意一行的 Checkbox 时，列头的 "All" Checkbox 会自动变为未选中状态

## 五、功能特点

### 5.1 优点

- 视觉反馈清晰：通过背景色变化直观展示选中状态
- 交互逻辑完善：支持全选/取消全选，单个选择与全选状态自动同步
- 性能优化：使用 `suspendPaint()` 和 `resumePaint()` 批量更新，避免频繁重绘
- 扩展性强：通过自定义 CellType 实现特定功能，可以进一步扩展其他交互逻辑

### 5.2 局限性与扩展建议

- 当前背景色固定为红色，可以扩展为支持自定义颜色配置
- 仅支持单列 Checkbox，可以扩展为多列独立管理
- 可以添加行选择后的批量操作功能，例如批量删除、批量导出等
- 可以将选中状态持久化到数据源，支持页面刷新后恢复选中状态

## 六、关键代码片段

### 自定义 CellType 的 getHitInfo 方法

```javascript
MyCheckBoxCellType.prototype.getHitInfo = function (x, y, cellStyle, cellRect, context) {
    if (context) {
        return {
            x: x,
            y: y,
            row: context.row,
            col: context.col,
            cellRect: cellRect,
            sheetArea: context.sheetArea,
            isReservedLocation: true,
            sheet: context.sheet
        };
    }
    return null;
};
```

该方法返回点击位置的详细信息，`isReservedLocation: true` 表示该区域是保留区域，点击事件会被自定义的 `processMouseUp` 方法处理，而不是默认的 Checkbox 行为。

## 七、总结

本示例展示了如何通过自定义 CellType 扩展 SpreadJS 的 Checkbox 功能，实现了选中 Checkbox 时改变行背景色的交互效果。开发者可以从中学到以下知识点：

- 如何继承和扩展 SpreadJS 的内置 CellType
- 如何重写 `paint`、`processMouseUp`、`getHitInfo` 等关键方法
- 如何使用 `tag` 属性存储自定义状态
- 如何监听 `ButtonClicked` 事件处理 Checkbox 点击
- 如何使用 `suspendPaint()` 和 `resumePaint()` 优化批量更新性能
- 如何实现列头全选与单个选择的状态同步

该方案适用于需要行选择功能的数据表格场景，具有良好的扩展性，可以根据实际需求进一步定制交互逻辑和视觉效果。

[操作视频](DOCUMENT_SITE_VIDEO_BUTTON_PREFIX:https://videos.grapecity.com.cn/SpreadJS/CodeLibrary/Select%20the%20checkbox%20line%20to%20change%20the%20background%20color.mp4)

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/cd2h13xgPk67FdXke6NePA/)）
