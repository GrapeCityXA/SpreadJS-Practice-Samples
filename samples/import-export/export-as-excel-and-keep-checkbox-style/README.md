## 一、Demo 概述

本示例展示了如何将 SpreadJS 中的 CheckBox 单元格类型导出为 Excel 文件时保持为真正的复选框控件，而不是默认的布尔值（TRUE/FALSE）。通过将 CheckBox 单元格类型转换为 FormControl 形状对象，实现了在导出的 Excel 文件中保留复选框的交互功能和显示样式。 

该方案适用于需要在 Excel 中保持表单控件交互性的场景，例如问卷调查表、任务清单、审批表单等。

## 二、解决的问题

* **默认导出行为的局限**：SpreadJS 的 CheckBox 单元格类型在导出 Excel 时会被转换为布尔值（TRUE/FALSE），失去了复选框的交互功能
* **保持用户体验一致性**：确保用户在 Excel 中打开文件后，仍然可以通过点击复选框进行交互，而不是看到静态的文本值
* **支持三态复选框**：处理包含"是/否/不确定"三种状态的复选框，并正确映射其文本显示

## 三、实现思路

### 3.1 影子工作簿技术

为了避免修改原始工作簿数据，使用深拷贝创建影子工作簿进行差异化导出：

```javascript
let spread_copy = new GC.Spread.Sheets.Workbook()
spread_copy.fromJSON(spread.toJSON())
let sheet = spread_copy.getActiveSheet()
```

这种方式确保原始工作簿不受导出过程的影响，所有转换操作都在副本上进行。

### 3.2 遍历识别 CheckBox 单元格

通过双重循环遍历所有单元格，识别 CheckBox 类型并记录其位置坐标：

```javascript
for (let i = 0; i < row; i++) {
    for (let j = 0; j < col; j++) {
        var cellWidth = sheet.getCell(-1, j).width();
        var cellHeight = sheet.getCell(i, -1).height();
        
        if (sheet.getCellType(i, j) instanceof GC.Spread.Sheets.CellTypes.CheckBox) {
            cellTypeToShape(sheet, x, y, cellWidth, cellHeight, i, j);
        }
        
        x += cellWidth;
        if (j == col - 1) {
            x = 0;
            y += cellHeight;
        }
    }
}
```

关键点在于累加计算每个单元格的绝对坐标位置（x, y），为后续创建 FormControl 提供精确的定位信息。

### 3.3 CheckBox 转 FormControl 形状

核心转换逻辑将 CheckBox 单元格类型替换为 FormControl 形状对象：

```javascript
function cellTypeToShape(sheet, x, y, width, height, row, col) {
    // 创建复选框形状控件
    var checkBox = sheet.shapes.addFormControl("check box", 
        GC.Spread.Sheets.Shapes.FormControlType.checkBox, 
        x, y, width, height);
    
    let text = ''
    let checkbox = sheet.getCellType(row, col)
    
    // 处理三态复选框
    if (sheet.getCellType(row, col).isThreeState()) {
        text = sheet.getValue(row, col) ? checkbox.textTrue() : (
            sheet.getValue(row, col) == null ? checkbox.textIndeterminate()
                : checkbox.textFalse()
        )
    } else {
        var cellType = sheet.getCellType(row, col);
        text = cellType.caption();
    }
    
    // 清除原单元格类型和值，设置形状属性
    sheet.setCellType(row, col, null)
    checkBox.text(text);
    var checkBoxValue = sheet.getValue(row, col) ? sheet.getValue(row, col) : false;
    checkBox.value(checkBoxValue);
    sheet.setValue(row, col, null)
}
```

该函数完成三个关键操作：

1. 根据单元格位置和尺寸创建 FormControl 复选框
2. 提取原 CheckBox 的文本标签和选中状态
3. 清除原单元格内容，避免导出时出现重复数据

### 3.4 技术栈

* @grapecity/spread-sheets: 16.2.0（核心表格组件）
* @grapecity/spread-sheets-shapes: 16.2.0（形状和表单控件支持）
* @grapecity/spread-sheets-io: 16.2.0（Excel 导入导出功能）
* file-saver: ^2.0.5（文件下载工具）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 使用支持 SystemJS 的本地服务器打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，可以看到表格中已预置了几个 CheckBox 单元格
2. 点击"导出Excel"按钮
3. 下载生成的 test.xlsx 文件
4. 使用 Excel 打开文件，验证复选框是否为可交互的表单控件

## 五、功能特点

### 5.1 优点

* **保持交互性**：导出的 Excel 文件中复选框仍然可以点击切换状态
* **无损转换**：准确保留复选框的文本标签和选中状态
* **支持三态复选框**：正确处理"是/否/不确定"三种状态的映射
* **非侵入式**：使用影子工作簿技术，不影响原始数据

### 5.2 局限性与扩展建议

* **性能考虑**：大量 CheckBox 的转换可能影响导出速度，可考虑仅转换可视区域或按需转换
* **样式定制**：当前代码中注释了样式设置部分（第 85-92 行），可根据需求启用以自定义复选框外观
* **批量操作**：可扩展为支持批量导出多个工作表的场景

## 六、关键代码片段

### 坐标累加计算

```javascript
x += cellWidth;
if (j == col - 1) {
    x = 0;
    y += cellHeight;
}
```

通过累加列宽和行高，计算每个单元格在工作表中的绝对坐标，这是准确定位 FormControl 的基础。

### 三态复选框文本映射

```javascript
if (sheet.getCellType(row, col).isThreeState()) {
    text = sheet.getValue(row, col) ? checkbox.textTrue() : (
        sheet.getValue(row, col) == null ? checkbox.textIndeterminate()
            : checkbox.textFalse()
    )
}
```

根据单元格值（true/false/null）映射到对应的文本标签（是/否/不确定），确保三态复选框的语义正确性。

## 七、总结

本示例提供了一种实用的解决方案，解决了 SpreadJS CheckBox 导出 Excel 时丢失交互性的问题。开发者可以从中学到：

* 如何使用影子工作簿进行差异化导出
* CheckBox 单元格类型与 FormControl 形状的转换技巧
* 单元格坐标的精确计算方法
* 三态复选框的状态处理逻辑

该方案适用于需要在 Excel 中保持表单控件功能的各类业务场景，具有良好的扩展性和实用价值。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
