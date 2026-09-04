## 一、Demo 概述

本示例演示了如何在 SpreadJS 中获取单元格数据校验结果。通过两种不同的方式（数据验证器方法和工作表方法）来检查单元格数据是否符合预设的校验规则，并将校验结果以 JSON 格式展示。该示例为数据验证场景提供了编程式的校验结果获取方案。

## 二、解决的问题

- 需要在代码层面批量检查单元格数据是否符合校验规则
- 需要获取详细的校验结果信息（包括行列位置、单元格值、是否有效）
- 需要对比不同校验方法的使用场景和差异

## 三、实现思路

### 3.1 设置数据校验规则

使用 SpreadJS 的 DataValidation API 创建数值范围校验器，并应用到整列：

```javascript
spread.options.highlightInvalidData = true;
var dv = GC.Spread.Sheets.DataValidation.createDateValidator(
    GC.Spread.Sheets.ConditionalFormatting.ComparisonOperators.between, 
    10, 
    20
);
dv.showInputMessage(true);
dv.inputMessage("请输入10~20之间的数字");
dv.inputTitle("输入提示");
sheet.getCell(-1, 0).validator(dv);
```

关键点：
- `highlightInvalidData` 启用无效数据高亮显示
- `createDateValidator` 创建数值范围校验器（10-20 之间）
- `getCell(-1, 0)` 将校验规则应用到第 0 列的所有行

### 3.2 方法一：通过数据验证器获取校验结果

直接调用验证器对象的 `isValid` 方法进行校验：

```javascript
document.getElementById('validatorBtn').addEventListener('click', function() {
    var validRes = [];
    for (var i = 0; i < 4; i++) {
        if (sheet.getDataValidator(i, 0)) {
            validRes.push({
                row: i, 
                col: 0, 
                value: sheet.getValue(i, 0), 
                valid: sheet.getDataValidator(i, 0).isValid(sheet, i, 0, sheet.getValue(i, 0))
            });
        }
    }
    alert(JSON.stringify(validRes));
});
```

特点：
- 需要先通过 `getDataValidator` 获取验证器对象
- 调用验证器的 `isValid(sheet, row, col, value)` 方法
- 适用于需要明确知道验证器存在的场景

### 3.3 方法二：通过工作表方法获取校验结果

使用工作表对象的 `isValid` 方法进行校验：

```javascript
document.getElementById('sheetBtn').addEventListener('click', function() {
    var validRes = [];
    for (var i = 0; i < 4; i++) {
        validRes.push({
            row: i, 
            col: 0, 
            value: sheet.getValue(i, 0),
            valid: sheet.isValid(i, 0, sheet.getValue(i, 0)) 
        });
    }
    alert(JSON.stringify(validRes));
});
```

特点：
- 直接调用 `sheet.isValid(row, col, value)` 方法
- 无需预先获取验证器对象
- 代码更简洁，适用于批量校验场景

### 3.4 技术栈

- @grapecity/spread-sheets: 17.0.8（核心表格组件）
- SystemJS: 0.19.22（模块加载器）
- systemjs-plugin-babel: 0.0.25（ES6 转译支持）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 使用本地服务器打开 index.html（如 Live Server）
```

### 4.2 操作步骤

1. 打开页面后，表格第一列会显示预设数据：1, 2, 10, 20
2. 点击"数据验证器获取校验结果"按钮，查看通过验证器方法获取的校验结果
3. 点击"工作表获取校验结果"按钮，查看通过工作表方法获取的校验结果
4. 对比两种方法的输出结果（JSON 格式）

预期结果：
- 值为 1 和 2 的单元格校验失败（不在 10-20 范围内）
- 值为 10 和 20 的单元格校验通过

## 五、功能特点

### 5.1 优点

- 提供两种校验结果获取方式，满足不同开发场景
- 校验结果结构化输出（包含行列位置、值、校验状态）
- 代码简洁，易于集成到实际业务逻辑中
- 支持批量校验，提高数据处理效率

### 5.2 局限性与扩展建议

- 当前示例仅演示数值范围校验，可扩展到其他校验类型（日期、列表、自定义公式等）
- 校验结果通过 alert 展示，实际应用中可改为表格显示或导出为文件
- 可结合 `getInvalidData` 方法快速定位所有无效数据

## 六、关键代码片段

### 创建并应用数据校验规则

```javascript
var dv = GC.Spread.Sheets.DataValidation.createDateValidator(
    GC.Spread.Sheets.ConditionalFormatting.ComparisonOperators.between, 
    10, 
    20
);
dv.showInputMessage(true);
dv.inputMessage("请输入10~20之间的数字");
dv.inputTitle("输入提示");
sheet.getCell(-1, 0).validator(dv);
```

### 两种校验方法对比

```javascript
// 方法一：通过验证器对象
sheet.getDataValidator(i, 0).isValid(sheet, i, 0, sheet.getValue(i, 0))

// 方法二：通过工作表对象（推荐）
sheet.isValid(i, 0, sheet.getValue(i, 0))
```

## 七、总结

本示例展示了 SpreadJS 中获取数据校验结果的两种核心方法，为开发者提供了编程式数据验证的解决方案。开发者可以从中学到：

1. 如何创建和应用数据校验规则
2. 两种获取校验结果的 API 使用方式及其差异
3. 批量校验数据的实现思路
4. 校验结果的结构化处理方法

该方案适用于需要在提交前批量验证数据、生成数据质量报告、或实现自定义校验逻辑的场景，具有良好的扩展性和实用性。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/Ds2z0_14cUmwNNCd0CJeOw/)）
