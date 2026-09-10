## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现自定义的多行列头排序功能。通过自定义 CellType，在复杂的多行合并列头场景下，为指定列添加可点击的排序指示器（上下箭头），用户点击后可以对整个数据区域按该列进行升序或降序排序。

该示例适用于需要在复杂表头结构中实现灵活排序交互的业务场景，特别是当表头存在多行合并单元格时，标准的排序功能无法满足自定义交互需求的情况。

## 二、解决的问题

* **复杂表头排序交互**：在多行合并列头的场景下，标准的列头排序功能可能无法满足自定义交互需求，本示例通过自定义 CellType 实现了灵活的排序控制
* **可视化排序状态**：通过在列头单元格中绘制红色的上下箭头指示器，直观展示当前列的排序状态（升序/降序）
* **精确的点击区域控制**：通过 `getHitInfo` 方法精确控制排序触发区域，只有点击列头右侧的箭头区域才会触发排序，避免误操作

## 三、实现思路

### 3.1 自定义列头 CellType

核心实现是创建一个继承自 `ColumnHeader` 的自定义 CellType，重写其 `paint`、`getHitInfo` 和 `processMouseUp` 方法：

```javascript
function SortHearderCellType() {}
SortHearderCellType.prototype = new spreadNS.CellTypes.ColumnHeader();
```

通过原型链继承 `ColumnHeader` 的基础功能，然后扩展自定义的排序交互逻辑。

### 3.2 绘制排序指示器

在 `paint` 方法中，使用 Canvas API 绘制上下箭头指示器，根据单元格的 `tag` 属性判断当前排序状态：

```javascript
SortHearderCellType.prototype.paint = function(ctx, value, x, y, width, height, style, context) {
    spreadNS.CellTypes.ColumnHeader.prototype.paint.apply(this, arguments);
    var margin = 3;
    var gap = 1;
    var color = "red";
    var size = 20;
    var tag = context.sheet.getTag(context.row, context.col, context.sheetArea);
    ctx.save();
    
    // 绘制向上箭头（升序指示器）
    if (!tag || tag && tag.ascending) {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.moveTo(x + width - size + margin, y + height / 2 - gap);
        ctx.lineTo(x + width - margin, y + height / 2 - gap);
        ctx.lineTo(x + width - size / 2, y + (height - size) / 2 + margin);
        ctx.closePath();
        ctx.fill();
    }
    
    // 绘制向下箭头（降序指示器）
    if (!tag || tag && !tag.ascending) {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.moveTo(x + width - size + margin, y + height / 2 + gap);
        ctx.lineTo(x + width - margin, y + height / 2 + gap);
        ctx.lineTo(x + width - size / 2, y + (height + size) / 2 - margin);
        ctx.closePath();
        ctx.fill();
    }
    ctx.restore();
};
```

### 3.3 点击区域检测

通过 `getHitInfo` 方法定义可点击的排序触发区域，只有点击列头右侧的箭头区域才会触发排序：

```javascript
SortHearderCellType.prototype.getHitInfo = function(x, y, cellStyle, cellRect, context) {
    var hitInfo = {
        x: x,
        y: y,
        row: context.row,
        col: context.col,
        cellRect: cellRect,
        sheetArea: context.sheetArea,
        sheet: context.sheet
    };
    // 判断点击位置是否在右侧箭头区域
    if (x > cellRect.x + cellRect.width - cellRect.height) {
        hitInfo.isReservedLocation = true;
    }
    return hitInfo;
};
```

### 3.4 排序逻辑处理

在 `processMouseUp` 方法中处理点击事件，切换排序状态并执行排序操作：

```javascript
SortHearderCellType.prototype.processMouseUp = function(hitInfo) {
    if (hitInfo.isReservedLocation) {
        var sheet = hitInfo.sheet,
            sheetArea = hitInfo.sheetArea,
            row = hitInfo.row,
            col = hitInfo.col;
        var tag = sheet.getTag(row, col, sheetArea) || {};
        // 切换排序状态
        tag.ascending = !tag.ascending;
        sheet.setTag(row, col, tag, sheetArea);
        // 执行排序
        sheet.sortRange(0, 0, -1, -1, true, [{
            index: col,
            ascending: tag.ascending
        }]);
    }
};
```

### 3.5 应用自定义 CellType

为指定的列头单元格设置自定义 CellType：

```javascript
sheet.setCellType(0, 1, new SortHearderCellType(), spreadNS.SheetArea.colHeader);
sheet.setCellType(1, 2, new SortHearderCellType(), spreadNS.SheetArea.colHeader);
sheet.setCellType(1, 3, new SortHearderCellType(), spreadNS.SheetArea.colHeader);
sheet.setCellType(2, 4, new SortHearderCellType(), spreadNS.SheetArea.colHeader);
```

### 3.6 技术栈

* SpreadJS 15.0.0：核心表格控件库
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

1. 打开页面后，可以看到一个包含多行合并列头的表格
2. 部分列头右侧显示红色的上下箭头指示器
3. 点击箭头区域，表格会按该列进行升序或降序排序
4. 箭头状态会根据当前排序方向动态更新
5. 可以多次点击同一列头切换排序方向

## 五、功能特点

### 5.1 优点

* **灵活的自定义能力**：通过自定义 CellType 实现完全可控的排序交互逻辑
* **可视化反馈**：通过箭头指示器直观展示排序状态
* **精确的交互控制**：通过 `getHitInfo` 精确控制点击触发区域，避免误操作
* **适配复杂表头**：支持多行合并列头场景，可以为任意列头单元格添加排序功能

### 5.2 局限性与扩展建议

* **单列排序**：当前实现仅支持单列排序，如需多列排序需要扩展 `tag` 数据结构和排序逻辑
* **样式固定**：箭头颜色、大小等样式参数硬编码在代码中，可以改为通过配置参数传入
* **扩展建议**：可以添加排序动画效果、支持自定义排序规则、添加排序历史记录等功能

## 六、关键代码片段

### 6.1 复杂表头设置

```javascript
// 设置3行列头
sheet.setRowCount(3, spreadNS.SheetArea.colHeader);

// 创建合并单元格
sheet.addSpan(0, 0, 3, 1, spreadNS.SheetArea.colHeader);
sheet.setValue(0, 0, "第1列", spreadNS.SheetArea.colHeader);

sheet.addSpan(0, 2, 1, 2, spreadNS.SheetArea.colHeader);
sheet.setValue(0, 2, "合并列头", spreadNS.SheetArea.colHeader);

sheet.addSpan(1, 2, 2, 1, spreadNS.SheetArea.colHeader);
sheet.setValue(1, 2, "第3列", spreadNS.SheetArea.colHeader);
```

### 6.2 数据填充

```javascript
function fillSampleData(sheet, range) {
    for (var i = 0; i < range.rowCount; i++) {
        for (var j = 0; j < range.colCount; j++) {
            sheet.setValue(range.row + i, range.col + j, Math.ceil(Math.random() * 300) - 100);
        }
    }
}
```

## 七、总结

本示例展示了如何通过自定义 CellType 实现复杂的列头排序交互功能。开发者可以从中学到：

1. 如何继承和扩展 SpreadJS 内置的 CellType
2. 如何使用 Canvas API 在单元格中绘制自定义图形
3. 如何通过 `getHitInfo` 实现精确的点击区域控制
4. 如何使用 `tag` 属性存储单元格的自定义状态
5. 如何在复杂表头场景下实现灵活的排序功能

该方案适用于需要在复杂表头结构中实现自定义排序交互的场景，具有良好的扩展性，可以根据实际需求进一步定制排序逻辑和视觉效果。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
