## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现基于数据分组的自动统计求和功能。通过遍历表格数据，当检测到分组字段值发生变化时，自动插入小计行并使用 SUBTOTAL 函数计算该组的汇总值，同时创建行分组大纲以支持数据的展开和折叠。该功能常用于销售报表、财务统计等需要按类别汇总数据的场景。

## 二、解决的问题

- **自动分组汇总**：根据一列或多列的值变化自动识别分组边界，无需手动插入小计行
- **动态计算**：使用 SUBTOTAL 函数实现小计，当原始数据变化时汇总值自动更新
- **可视化分组**：通过行分组大纲功能，用户可以折叠或展开各个分组，便于查看不同层级的数据
- **单元格合并**：对相同分组的单元格进行合并，使表格结构更清晰

## 三、实现思路

### 3.1 核心技术点

#### 数据初始化与分组逻辑

示例首先在工作表中填充测试数据，然后从右向左遍历分组列（第 1 列和第 0 列），检测每列中值的变化点：

```javascript
var rowCount = 10;
for (var col = 1; col >= 0; col--) {
    var start = 0, end = 0;
    var spanValue = sheet.getValue(0, col);
    for (var i = 1; i <= rowCount; i++) {
        var newRowValue = sheet.getValue(i, col);
        end = i;
        if (spanValue !== newRowValue) {
            // 检测到分组变化，执行插入小计行逻辑
            // ...
            start = end;
            spanValue = newRowValue;
        }
    }
}
```

从右向左遍历的原因是先处理细粒度分组（如子类别），再处理粗粒度分组（如主类别），避免插入行后索引混乱。

#### 插入小计行与公式设置

当检测到分组值变化时，在当前位置插入一行作为小计行，并设置 SUBTOTAL 公式：

```javascript
if (spanValue !== newRowValue) {
    if (end - start > 1) {
        sheet.addSpan(start, col, end - start, 1); // 合并相同分组的单元格
    }
    
    sheet.addRows(end, 1); // 插入小计行
    if (col > 0) {
        // 复制左侧列的值到小计行，保持分组标识一致
        sheet.copyTo(end - 1, 0, end, 0, 1, col, GC.Spread.Sheets.CopyToOptions.value);
    }
    sheet.setValue(end, col, "subTotal"); // 标记为小计行
    sheet.setFormula(end, 2, "SUBTOTAL(109,C" + (start + 1) + ":C" + end + ")"); // 设置求和公式
    sheet.rowOutlines.group(start, end - start); // 创建行分组
    i++, end++, rowCount++; // 更新索引和总行数
    
    start = end;
    spanValue = newRowValue;
}
```

SUBTOTAL 函数的第一个参数 109 表示忽略隐藏行的求和，确保折叠分组后小计值仍然正确。

#### 行分组大纲

通过 `sheet.rowOutlines.group()` 方法创建行分组，用户可以点击左侧的展开/折叠按钮控制数据显示：

```javascript
sheet.rowOutlines.group(start, end - start);
```

#### FormulaTextBox 集成

示例还集成了 FormulaTextBox 组件，允许用户通过可视化方式选择单元格区域：

```javascript
var rangeSelector = new GC.Spread.Sheets.FormulaTextBox.FormulaTextBox(
    document.getElementById("ftb"), 
    {
        rangeSelectMode: true,
        absoluteReference: false
    }
);
rangeSelector.workbook(spread);
```

### 3.2 技术栈

- SpreadJS 15.0.0：核心电子表格引擎
- SystemJS 0.19.22：模块加载器
- TypeScript 4.1.2：类型支持（虽然代码使用 JavaScript 编写）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，工作表会自动加载包含三列数据的测试数据
2. 观察第 0 列和第 1 列的分组效果，相同值的单元格已自动合并
3. 在每个分组的末尾会自动插入标记为 "subTotal" 的小计行
4. 点击工作表左侧的 "-" 按钮可以折叠分组，点击 "+" 按钮可以展开
5. 修改第 2 列（C 列）的数值，小计行的汇总值会自动更新
6. 使用页面顶部的 FormulaTextBox 可以选择单元格区域

## 五、功能特点

### 5.1 优点

- **自动化程度高**：无需手动插入小计行和设置公式，代码自动识别分组边界
- **支持多级分组**：通过从右向左遍历，可以处理多层级的分组结构
- **动态计算**：使用 SUBTOTAL 函数确保数据变化时汇总值自动更新
- **用户体验友好**：行分组大纲功能让用户可以灵活控制数据的显示层级

### 5.2 局限性与扩展建议

- **数据顺序依赖**：当前实现假设数据已按分组列排序，如果数据无序需要先排序
- **固定列索引**：分组列和汇总列的索引是硬编码的，可以改为参数化配置
- **扩展建议**：
  - 支持自定义汇总函数（如平均值、最大值、最小值）
  - 添加总计行（Grand Total）汇总所有分组
  - 支持动态数据源，当数据变化时自动重新分组

## 六、关键代码片段

### 分组检测与小计行插入

```javascript
for (var col = 1; col >= 0; col--) {
    var start = 0, end = 0;
    var spanValue = sheet.getValue(0, col);
    for (var i = 1; i <= rowCount; i++) {
        var newRowValue = sheet.getValue(i, col);
        end = i;
        if (spanValue !== newRowValue) {
            // 合并相同分组的单元格
            if (end - start > 1) {
                sheet.addSpan(start, col, end - start, 1);
            }
            
            // 插入小计行
            sheet.addRows(end, 1);
            if (col > 0) {
                sheet.copyTo(end - 1, 0, end, 0, 1, col, GC.Spread.Sheets.CopyToOptions.value);
            }
            sheet.setValue(end, col, "subTotal");
            
            // 设置 SUBTOTAL 公式（109 表示忽略隐藏行的求和）
            sheet.setFormula(end, 2, "SUBTOTAL(109,C" + (start + 1) + ":C" + end + ")");
            
            // 创建行分组
            sheet.rowOutlines.group(start, end - start);
            
            i++, end++, rowCount++;
            start = end;
            spanValue = newRowValue;
        }
    }
}
```

## 七、总结

本示例展示了 SpreadJS 在数据分组和汇总方面的强大能力，开发者可以学到以下知识点：

- 使用 `addRows()` 动态插入行
- 使用 `addSpan()` 合并单元格
- 使用 `setFormula()` 设置公式，特别是 SUBTOTAL 函数的应用
- 使用 `rowOutlines.group()` 创建行分组大纲
- 使用 `copyTo()` 复制单元格内容

该方案适用于需要按类别或层级汇总数据的报表场景，如销售统计、财务报表、库存管理等。通过参数化改造，可以扩展为通用的分组汇总组件，支持更复杂的业务需求。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/-Xux58GX2EWr74ntGoCxiA/)）
