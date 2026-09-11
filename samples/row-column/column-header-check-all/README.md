## 一、Demo 概述

本示例展示了如何在 SpreadJS 表格的列头中添加一个自定义复选框，实现对该列所有复选框单元格的全选/取消全选功能。通过自定义 CellType 继承 CheckBox 类型，重写其绘制和交互逻辑，实现了列头复选框与数据区复选框的双向联动效果。

该功能常用于数据表格的批量选择场景，例如任务列表、权限配置表、数据筛选等需要快速选中或取消选中整列数据的业务场景。

## 二、解决的问题

* **批量操作效率**：用户无需逐个点击数据行的复选框，通过列头复选框一键完成整列的选中或取消选中操作
* **状态同步**：列头复选框能够根据数据区复选框的状态自动更新显示（全选、全不选、部分选中）
* **自定义单元格类型**：演示如何通过继承 SpreadJS 内置 CellType 来实现自定义交互逻辑

## 三、实现思路

### 3.1 自定义复选框单元格类型

通过继承 `GC.Spread.Sheets.CellTypes.CheckBox` 创建自定义的 `MyCheckBoxCellType` 类，用于列头的复选框显示和交互。

```javascript
function MyCheckBoxCellType() {
    GC.Spread.Sheets.CellTypes.CheckBox.apply(this);
    this.caption("All");
}
MyCheckBoxCellType.prototype = new GC.Spread.Sheets.CellTypes.CheckBox();
```

关键点：

* 调用父类构造函数初始化基础功能
* 设置复选框标题为 "All" 提示用户这是全选功能
* 通过原型链继承父类的所有方法

### 3.2 重写绘制方法实现状态显示

重写 `paint` 方法，使复选框的显示状态由单元格的 `tag` 属性控制，而非 `value` 属性。

```javascript
var basePaint = GC.Spread.Sheets.CellTypes.CheckBox.prototype.paint;
MyCheckBoxCellType.prototype.paint = function (ctx, value, x, y, width, height, style, context) {
    var tag = context.sheet.getTag(context.row, context.col, context.sheetArea);
    if (tag !== true) {
        tag = false;
    }
    basePaint.apply(this, [ctx, tag, x, y, width, height, style, context]);
};
```

技术要点：

* 保存父类的 `paint` 方法引用
* 从单元格的 `tag` 属性读取选中状态
* 将 `tag` 值传递给父类的绘制方法，实现状态可视化

### 3.3 处理鼠标点击事件实现全选逻辑

重写 `processMouseUp` 方法，在用户点击列头复选框时，遍历该列所有复选框单元格并统一设置其值。

```javascript
MyCheckBoxCellType.prototype.processMouseUp = function (hitInfo) {
    var sheet = hitInfo.sheet,
        row = hitInfo.row,
        col = hitInfo.col,
        sheetArea = hitInfo.sheetArea;

    // 检查保护状态
    if (sheet.getCell(0, 0, GC.Spread.Sheets.SheetArea.colHeader).locked() && sheet.options.isProtected) {
        return;
    }

    // 切换 tag 状态
    var tag = sheet.getTag(row, col, sheetArea);
    if (tag === undefined || tag === null) {
        sheet.setTag(row, col, true, sheetArea);
    } else {
        sheet.setTag(row, col, !tag, sheetArea);
    }

    // 批量更新该列所有复选框的值
    tag = sheet.getTag(row, col, sheetArea);
    sheet.suspendPaint();
    for (var i = 0; i < sheet.getRowCount(); i++) {
        var cell = sheet.getCell(i, col);
        if (cell.cellType() instanceof GC.Spread.Sheets.CellTypes.CheckBox) {
            cell.value(tag);
        }
    }
    sheet.resumePaint();
};
```

实现细节：

* 使用 `suspendPaint()` 和 `resumePaint()` 优化批量更新性能
* 遍历该列所有行，仅更新复选框类型的单元格
* 通过 `tag` 属性存储列头复选框的状态

### 3.4 数据区复选框反向联动

监听 `ButtonClicked` 事件，当用户点击数据区的复选框时，检查该列所有复选框的状态，自动更新列头复选框的显示。

```javascript
spread.bind(GC.Spread.Sheets.Events.ButtonClicked,
    function (e, args) {
        var sheet = args.sheet,
            row = args.row,
            col = args.col;
        var cellType = sheet.getCellType(row, col);
        if (cellType instanceof GC.Spread.Sheets.CellTypes.CheckBox) {
            var colHeaderCell = sheet.getCell(0, col, GC.Spread.Sheets.SheetArea.colHeader);
            if (colHeaderCell.cellType() instanceof MyCheckBoxCellType) {
                var checkStatus = true;
                for (var i = 0; i < sheet.getRowCount(); i++) {
                    var cell = sheet.getCell(i, col);
                    if (cell.cellType() instanceof GC.Spread.Sheets.CellTypes.CheckBox && !cell.value()) {
                        checkStatus = false;
                        break;
                    }
                }
                colHeaderCell.tag(checkStatus);
                sheet.repaint();
            }
        }
    });
```

逻辑说明：

* 遍历该列所有复选框，只要有一个未选中，列头复选框就显示为未选中状态
* 只有当该列所有复选框都选中时，列头复选框才显示为选中状态
* 通过 `repaint()` 触发列头复选框的重新绘制

### 3.5 技术栈

* SpreadJS 16.0.1：核心表格控件
* jQuery 3.3.1：DOM 操作辅助库
* SystemJS：模块加载器
* TypeScript 4.1.2：开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，可以看到第一列包含 8 个复选框单元格
2. 点击列头的 "All" 复选框，该列所有复选框将被选中
3. 再次点击列头复选框，该列所有复选框将被取消选中
4. 点击数据区的任意复选框，列头复选框会根据整列的选中状态自动更新

## 五、功能特点

### 5.1 优点

* **双向联动**：列头复选框与数据区复选框实现了完整的双向状态同步
* **性能优化**：使用 `suspendPaint()` 和 `resumePaint()` 避免批量更新时的多次重绘
* **扩展性强**：通过继承 CellType 的方式，可以轻松扩展到其他自定义单元格类型
* **用户体验好**：提供了直观的全选操作方式，符合用户使用习惯

### 5.2 局限性与扩展建议

* **单列限制**：当前实现仅支持单列的全选功能，如需多列支持需要为每列分别设置
* **扩展建议**：可以增加"部分选中"状态的视觉反馈（如使用不同的图标或颜色），进一步提升用户体验

## 六、关键代码片段

### 禁用编辑器创建

```javascript
MyCheckBoxCellType.prototype.createEditorElement = function(){
    return null;
}
```

通过返回 `null` 禁止列头复选框进入编辑模式，确保其仅作为全选控制器使用。

### 自定义点击区域

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

设置 `isReservedLocation: true` 确保点击事件能够被自定义的 `processMouseUp` 方法正确捕获。

## 七、总结

本示例展示了 SpreadJS 自定义单元格类型的核心技术，通过继承和重写内置 CellType 的方法，实现了列头复选框的全选功能。开发者可以从中学到：

* 如何继承和扩展 SpreadJS 内置的 CellType
* 如何使用 `tag` 属性存储自定义状态数据
* 如何通过事件监听实现单元格之间的联动
* 如何使用 `suspendPaint/resumePaint` 优化批量操作性能

该方案适用于需要批量选择功能的表格场景，代码结构清晰，易于理解和扩展。开发者可以基于此实现更复杂的自定义单元格类型，如带搜索的下拉框、自定义日期选择器等。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
