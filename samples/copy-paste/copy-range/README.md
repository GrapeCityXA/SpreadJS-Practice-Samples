## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现区域数据的拷贝和局部显示功能。通过点击按钮获取用户选中的区域，将该区域的数据和样式完整复制到另一个工作簿中，并通过隐藏非选中区域的行列来实现聚焦显示效果。该功能适用于需要对大型表格中的特定区域进行独立查看、编辑或展示的场景。

## 二、解决的问题

* **区域数据隔离查看**：在大型表格中，用户可能只需要关注某个特定区域的数据，通过拷贝并隐藏其他区域，可以实现聚焦显示
* **数据结构完整复制**：使用 `toJSON()` 和 `fromJSON()` 方法可以完整复制工作簿的所有数据、样式、公式等信息
* **视觉优化**：通过隐藏行列、调整缩放比例和偏移量，提供更好的局部数据查看体验

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 工作簿序列化与反序列化

使用 SpreadJS 的 `toJSON()` 和 `fromJSON()` 方法实现工作簿的完整复制：

```javascript
var jsonString = JSON.stringify(spread.toJSON());
spreadDetail.fromJSON(JSON.parse(jsonString))
```

这种方式可以完整复制源工作簿的所有数据、样式、公式、保护状态等信息，确保目标工作簿与源工作簿保持一致。

#### 3.1.2 获取用户选中区域

通过 `getSelections()` 方法获取用户在表格中选中的区域范围：

```javascript
var sheet = spread.getActiveSheet();
editingRange = sheet.getSelections()[0]
```

返回的 `editingRange` 对象包含 `row`、`col`、`rowCount`、`colCount` 四个属性，分别表示起始行、起始列、行数和列数。

#### 3.1.3 隐藏非选中区域

在 `initDetailSpread()` 函数中，通过设置行列的 `visible` 属性为 `false` 来隐藏选中区域之外的所有行列：

```javascript
// 隐藏选中区域上方的行
if (range.row > 0) {
    sheet.getRange(0, -1, range.row, -1).visible(false);
}
// 隐藏选中区域左侧的列
if (range.col > 0) {
    sheet.getRange(-1, 0, -1, range.col).visible(false);
}
// 隐藏选中区域下方的行
if (range.row + range.rowCount < rowCount) {
    sheet.getRange(range.row + range.rowCount, -1, rowCount - (range.row + range.rowCount), -1).visible(false);
}
// 隐藏选中区域右侧的列
if (range.col + range.colCount < colCount) {
    sheet.getRange(-1, range.col + range.colCount, -1, colCount - (range.col + range.colCount)).visible(false);
}
```

#### 3.1.4 视图优化配置

对详情工作簿进行视图优化，提升用户体验：

```javascript
spread.options.tabStripVisible = false;  // 隐藏工作表标签栏
spread.options.scrollIgnoreHidden = true;  // 滚动时忽略隐藏的行列
spread.options.scrollbarMaxAlign = true;  // 滚动条最大对齐
spread.options.scrollbarShowMax = true;  // 显示滚动条最大值

sheet.options.sheetAreaOffset = {  // 设置工作表区域偏移
    left: 5,
    top: 5
};
sheet.options.rowHeaderVisible = false;  // 隐藏行标题
sheet.options.colHeaderVisible = false;  // 隐藏列标题
sheet.zoom(sheet.zoom() * 1.2);  // 放大显示 120%
```

### 3.2 UI 交互流程

用户在上方工作簿中选择区域 → 点击"获取区域"按钮 → 系统复制整个工作簿数据到下方 → 隐藏选中区域之外的行列 → 下方工作簿聚焦显示选中区域

### 3.3 技术栈

* **@grapecity/spread-sheets**: 15.0.0（核心表格组件）
* **jQuery**: 3.6.1（事件处理）
* **SystemJS**: 0.19.22（模块加载）
* **TypeScript**: 4.1.2（开发语言支持）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，会看到上下两个工作簿区域
2. 在上方工作簿中，使用鼠标选择一个区域（可以是单个单元格或多个单元格）
3. 点击"获取区域"按钮
4. 下方工作簿会显示选中区域的内容，其他区域被隐藏
5. 下方工作簿会自动放大 120% 并隐藏行列标题，方便查看

## 五、功能特点

### 5.1 优点

* **完整数据复制**：使用 JSON 序列化方式，确保数据、样式、公式等信息完整复制
* **聚焦显示**：通过隐藏非选中区域，让用户专注于关注的数据
* **视图优化**：自动调整缩放比例、隐藏标题栏，提供更好的查看体验
* **实现简单**：核心代码不到 50 行，易于理解和维护

### 5.2 局限性与扩展建议

* **单向复制**：当前实现只支持从源工作簿复制到详情工作簿，代码中虽然有 `updateData` 按钮的事件处理（第 25-45 行），但 HTML 中未定义该按钮，无法实现反向同步
* **性能考虑**：对于超大型工作簿，完整的 JSON 序列化可能影响性能，可以考虑只复制选中区域的数据
* **扩展建议**：
    * 添加"更新数据"按钮，实现详情工作簿的修改同步回源工作簿
    * 支持多区域选择和显示
    * 添加区域边框高亮，更清晰地标识选中区域

## 六、关键代码片段

### 6.1 初始化详情工作簿函数

```javascript
function initDetailSpread(spread, range) {
    spread.suspendPaint();  // 暂停绘制，提升性能
    spread.options.tabStripVisible = false;
    spread.options.scrollIgnoreHidden = true;
    spread.options.scrollbarMaxAlign = true;
    spread.options.scrollbarShowMax = true;
    
    var sheet = spread.getActiveSheet(),
        rowCount = sheet.getRowCount(),
        colCount = sheet.getColumnCount();
    
    if (range) {
        // 隐藏选中区域之外的所有行列
        if (range.row > 0) {
            sheet.getRange(0, -1, range.row, -1).visible(false);
        }
        if (range.col > 0) {
            sheet.getRange(-1, 0, -1, range.col).visible(false);
        }
        if (range.row + range.rowCount < rowCount) {
            sheet.getRange(range.row + range.rowCount, -1, rowCount - (range.row + range.rowCount), -1).visible(false);
        }
        if (range.col + range.colCount < colCount) {
            sheet.getRange(-1, range.col + range.colCount, -1, colCount - (range.col + range.colCount)).visible(false);
        }
    }
    
    sheet.options.sheetAreaOffset = { left: 5, top: 5 };
    sheet.options.rowHeaderVisible = false;
    sheet.options.colHeaderVisible = false;
    sheet.zoom(sheet.zoom() * 1.2);
    sheet.clearPendingChanges();  // 清除待处理的更改
    spread.resumePaint();  // 恢复绘制
}
```

## 七、总结

本示例展示了 SpreadJS 中区域数据拷贝和聚焦显示的实现方法，核心价值在于通过 JSON 序列化实现完整的工作簿复制，并通过行列隐藏技术实现局部区域的聚焦显示。开发者可以从中学到：

1. 使用 `toJSON()` 和 `fromJSON()` 实现工作簿的深度复制
2. 通过 `getSelections()` 获取用户选中的区域范围
3. 使用 `getRange().visible(false)` 隐藏指定的行列
4. 通过配置 `options` 优化工作簿的显示效果
5. 使用 `suspendPaint()` 和 `resumePaint()` 提升批量操作的性能

该方案适用于需要对大型表格进行局部查看、数据对比、区域编辑等场景，具有良好的扩展性，可以根据实际需求添加双向同步、多区域显示等功能。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
