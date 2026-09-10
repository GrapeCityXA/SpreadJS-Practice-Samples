## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现单元格和列头宽度的智能自适应功能。当列头标题较长而单元格内容较短时，列宽会保持列头所需的宽度；当单元格内容较长时，列宽会自动扩展以适应内容。该方案确保列宽始终取列头和单元格内容中的较宽值，避免列头文字被截断或单元格内容显示不全的问题。

## 二、解决的问题

在实际业务场景中，表格的列头标题往往较长（如"客户联系方式"、"订单创建时间"等），而单元格内容可能较短（如"张三"、"2024-01-01"）。如果直接使用 SpreadJS 的 `autoFitColumn` 方法，列宽会根据当前内容自动调整，可能导致以下问题：

* 当用户编辑单元格并输入较短内容时，列宽会自动缩小，导致列头文字被截断
* 列宽频繁变化影响用户体验
* 无法保证列头始终完整显示

本示例通过记录列头初始宽度并在单元格编辑后进行宽度比较，确保列宽始终不小于列头所需宽度，同时能够自动扩展以适应更长的单元格内容。

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 设置自动调整类型

通过配置 `autoFitType` 选项，使自动调整宽度时同时考虑列头和单元格内容：

```javascript
spread.options.autoFitType = GC.Spread.Sheets.AutoFitType.cellWithHeader;
```

这个配置确保 `autoFitColumn` 方法在计算列宽时会同时考虑列头区域（colHeader）和视口区域（viewport）的内容。

#### 3.1.2 记录列头初始宽度

在数据加载完成后，首次调整所有列宽并记录每列的初始宽度：

```javascript
let widthInfo = {}

function setAutoFit() {
    let range = sheet.getUsedRange(GC.Spread.Sheets.UsedRangeType.all)
    for (let c = range.col; c < range.col + range.colCount; c++) {
        sheet.autoFitColumn(c)
        // 记录初始列头宽度
        widthInfo[c] = sheet.getColumnWidth(c)
    }
}
```

`widthInfo` 对象以列索引为键，存储每列的初始宽度（即列头所需的最小宽度）。

#### 3.1.3 监听单元格编辑事件

通过监听 `EditEnded` 事件，在用户编辑单元格后自动调整列宽：

```javascript
sheet.bind(GC.Spread.Sheets.Events.EditEnded, function (sender, args) {
    autoFitContent(args.col)
});
```

`args.col` 提供了被编辑单元格的列索引，用于精确调整对应列的宽度。

#### 3.1.4 智能宽度调整逻辑

核心的宽度调整函数实现了"取较宽值"的逻辑：

```javascript
function autoFitContent(col) {
    // 记录调整前的宽度
    let originalWidth = sheet.getColumnWidth(col)
    sheet.autoFitColumn(col);

    // 如果调整后的宽度小于列头宽度，则恢复到调整前的宽度
    let adjustedWidth = sheet.getColumnWidth(col)
    if (adjustedWidth < widthInfo[col]) {
        sheet.setColumnWidth(col, originalWidth)
    }
}
```

该函数的工作流程：

1. 记录当前列宽
2. 执行自动调整（`autoFitColumn`）
3. 比较调整后的宽度与列头初始宽度
4. 如果调整后宽度小于列头宽度，恢复到调整前的宽度（保持列头完整显示）
5. 如果调整后宽度大于列头宽度，保持新宽度（适应更长的单元格内容）

### 3.2 技术栈

* SpreadJS 15.2.2：核心表格组件
* TypeScript 4.1.2：类型支持
* SystemJS 0.19.22：模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，可以看到三列数据，列头显示"列头有很多很多很多内容"
2. 第一列的单元格内容较长，列宽已自动扩展以适应内容
3. 第二列和第三列的单元格内容较短，但列宽保持列头所需的宽度
4. 尝试编辑第一列的单元格，将内容改为较短的文字（如"短"），观察列宽不会缩小到小于列头宽度
5. 尝试编辑第二列的单元格，输入很长的内容，观察列宽会自动扩展

## 五、功能特点

### 5.1 优点

* 保证列头始终完整显示，避免文字被截断
* 自动适应单元格内容变化，无需手动调整列宽
* 用户体验友好，列宽变化符合直觉（只扩展不缩小到列头宽度以下）
* 实现简单，性能开销小（仅在编辑时触发）

### 5.2 扩展建议

* 可以扩展为支持行高的自适应（使用 `autoFitRow` 和类似的逻辑）
* 可以添加最大宽度限制，避免单元格内容过长导致列宽过大
* 可以支持批量编辑场景，在批量操作完成后统一调整列宽
* 可以将 `widthInfo` 持久化，在数据重新加载后恢复列宽设置

## 六、关键代码片段

### 初始化流程

```javascript
// 设置表头
initHeader()
// 配置自动调整并记录初始宽度
setAutoFit()
// 填充内容
initContent()
// 对所有已使用的列执行一次宽度调整
let range = sheet.getUsedRange(GC.Spread.Sheets.UsedRangeType.all)
for (let c = range.col; c < range.col + range.colCount; c++) {
    autoFitContent(c)
}
```

注意初始化顺序：必须先设置列头，再配置自动调整，最后填充内容。这是因为 `getUsedRange` 需要至少有一个单元格有内容才能正确获取范围。

### 列头初始化技巧

```javascript
function initHeader() {
    sheet.setValue(0, 0, '列头有很多很多很多内容', GC.Spread.Sheets.SheetArea.colHeader);
    // 并在第一行填入一个很短的数据，否则会导致后面getUsedRange获取不到
    sheet.setValue(0, 0, '1', GC.Spread.Sheets.SheetArea.viewport);
}
```

在设置列头后，必须在视口区域填入至少一个单元格的数据（即使是占位符），否则 `getUsedRange` 无法正确识别已使用的列范围。

## 七、总结

本示例展示了一个实用的列宽自适应方案，适用于列头标题较长的业务场景。开发者可以从中学到：

* SpreadJS 的 `autoFitType` 配置选项及其作用
* 如何使用 `EditEnded` 事件监听单元格编辑
* 如何通过 `getColumnWidth` 和 `setColumnWidth` 精确控制列宽
* 如何结合 `getUsedRange` 批量处理多列
* 如何通过记录初始状态实现智能的宽度调整逻辑

该方案的核心思想是"只扩展不缩小"，确保列宽始终满足列头和单元格内容的最大需求，可以直接应用于实际项目中，也可以根据具体需求进行扩展和优化。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
