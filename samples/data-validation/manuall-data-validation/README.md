## 一、Demo 概述

本示例演示了如何在 SpreadJS 中实现输入完成后的数据验证功能。通过为单元格设置数据验证规则（数字范围验证和列表验证），并在用户完成输入后点击提交按钮时，系统会自动检测工作表中是否存在不合法的数据，并给出相应的提示。该功能适用于需要确保用户输入数据符合业务规则的场景，如表单填写、数据录入等。

## 二、解决的问题

* **数据质量控制**：在用户完成数据输入后，统一验证所有单元格数据是否符合预设规则，避免无效数据进入系统
* **用户体验优化**：通过输入提示和高亮显示无效数据，帮助用户快速定位和修正错误
* **业务规则约束**：支持多种验证类型（数字范围、列表选择等），满足不同业务场景的数据约束需求

## 三、实现思路

### 3.1 创建数据验证器

SpreadJS 提供了多种数据验证器类型，本示例使用了数字验证器和列表验证器：

```javascript
// 创建数字范围验证器（0-999999）
var numberValue = GC.Spread.Sheets.DataValidation.createNumberValidator(
    GC.Spread.Sheets.ConditionalFormatting.ComparisonOperators.between, 
    "0", 
    "999999", 
    false
);
numberValue.showInputMessage(true);
numberValue.inputTitle("tip");
numberValue.inputMessage("enter a number");
numberValue.ignoreBlank(false);

// 创建列表验证器
var dv1 = new GC.Spread.Sheets.DataValidation.createListValidator("Fruit,Vegetable,Food");
dv1.inputTitle("Please choose a category:");
dv1.inputMessage("Fruit\nVegetableVegetable\nFood");
dv1.ignoreBlank(false);
```

### 3.2 应用验证规则到单元格

将创建的验证器应用到指定单元格，并启用无效数据高亮显示：

```javascript
var activeSheet = spread.getActiveSheet();
activeSheet.setDataValidator(1, 1, numberValue);  // B2 单元格应用数字验证
activeSheet.setDataValidator(2, 2, dv1);          // C3 单元格应用列表验证

// 启用无效数据高亮显示
spread.options.highlightInvalidData = true;
```

### 3.3 全表数据验证逻辑

提供两种验证方式：遍历所有单元格和仅检查脏数据（已修改的单元格）。

**方式一：遍历所有单元格**

```javascript
function isSheetValid(sheet) {
    var rowCount = sheet.getRowCount(),
        colCount = sheet.getColumnCount();
    var isValid = true;

    for (var row = 0; row < rowCount; row++) {
        for (var col = 0; col < colCount; col++) {
            if (!sheet.isValid(row, col, sheet.getValue(row, col))) {
                isValid = false;
                break;
            }
        }
    }
    return isValid;
}
```

**方式二：仅检查脏数据（性能优化）**

```javascript
function isSheetValidNew(sheet) {
    var isValid = true;
    var cells = sheet.getDirtyCells();  // 获取所有被修改过的单元格

    for (var i = 0; i < cells.length; i++) {
        var dirtyCell = cells[i];
        var row = dirtyCell.row, col = dirtyCell.col;

        if (!sheet.isValid(row, col, sheet.getValue(row, col))) {
            isValid = false;
            break;
        }
    }
    return isValid;
}
```

### 3.4 提交验证交互

通过按钮点击事件触发验证，并根据结果给出提示：

```javascript
$("#get").click(function() {
    var activeSheet = spread.getActiveSheet();
    if (isSheetValid(activeSheet)) {
        alert("Success");
    } else {
        alert("Failed");
    }
});
```

### 3.5 技术栈

* SpreadJS 15.0.0：核心表格组件
* jQuery 3.6.1：DOM 操作和事件处理
* TypeScript 4.1.2：类型安全支持
* SystemJS：模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，在 B2 单元格（行1列1）输入数字，该单元格限制输入 0-999999 之间的数字
2. 在 C3 单元格（行2列2）选择类别，只能从 "Fruit"、"Vegetable"、"Food" 中选择
3. 尝试输入不符合规则的数据（如 B2 输入负数或超过 999999 的数字，C3 输入非列表项）
4. 点击"提交"按钮，系统会验证所有单元格数据
5. 如果所有数据合法，弹出 "Success"；如果存在无效数据，弹出 "Failed"

## 五、功能特点

### 5.1 优点

* **实时提示**：输入时显示提示信息，引导用户正确输入
* **视觉反馈**：通过 `highlightInvalidData` 选项，无效数据会被高亮显示
* **灵活验证**：支持多种验证器类型（数字、列表、日期等）
* **性能优化**：提供脏数据检查方式，避免大数据量时的性能问题

### 5.2 局限性与扩展建议

* **当前实现**：示例中使用了遍历所有单元格的方式，在大数据量场景下可能存在性能问题
* **扩展建议**：
    * 优先使用 `isSheetValidNew` 方法（脏数据检查），仅验证用户修改过的单元格
    * 可以扩展为异步验证，支持服务端数据校验
    * 可以添加更详细的错误提示，指出具体哪些单元格验证失败

## 六、关键代码片段

### 验证器配置关键参数

```javascript
// ignoreBlank(false) - 不允许空白输入
numberValue.ignoreBlank(false);

// showInputMessage(true) - 显示输入提示
numberValue.showInputMessage(true);

// 全局启用无效数据高亮
spread.options.highlightInvalidData = true;
```

### 单元格验证 API

```javascript
// 检查单个单元格是否有效
sheet.isValid(row, col, value)

// 获取所有被修改过的单元格
sheet.getDirtyCells()

// 为单元格设置验证器
sheet.setDataValidator(row, col, validator)
```

## 七、总结

本示例展示了 SpreadJS 数据验证功能的核心用法，开发者可以学到：

1. 如何创建和配置不同类型的数据验证器（数字、列表）
2. 如何将验证规则应用到单元格并启用视觉反馈
3. 如何实现全表数据验证逻辑（遍历方式和脏数据方式）
4. 如何通过 `isValid` API 检查单元格数据合法性

该方案适用于需要严格数据质量控制的场景，如财务报表、数据采集表单、配置管理等。通过合理选择验证方式（全量 vs 脏数据），可以在保证数据准确性的同时兼顾性能表现。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
