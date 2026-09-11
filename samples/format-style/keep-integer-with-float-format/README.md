## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现一个特殊的数字格式化需求：当单元格设置了小数格式（如 "0.00"）时，对于整数值仍然保持整数显示，而小数值则正常显示小数位。这种格式化方式在财务报表、数据统计等场景中非常实用，可以避免整数后面出现不必要的 ".00" 后缀，同时保证小数的精度显示。

## 二、解决的问题

在实际业务中，我们经常遇到这样的场景：同一列数据既包含整数也包含小数，如果统一设置小数格式，整数会显示为 "2.00"、"7.00" 这样的形式，显得冗余；如果不设置格式，小数的显示位数又无法统一控制。本示例通过条件格式和公式的组合，完美解决了这个矛盾，实现了智能的数字格式化。

## 三、实现思路

### 3.1 核心技术点

#### 条件格式与公式结合

本示例的核心是使用条件格式（Conditional Formatting）配合 MOD 函数来判断单元格值是否为整数。通过公式 `=IF(MOD(A1,1),,A1)` 来检测：

* `MOD(A1,1)` 计算单元格值除以 1 的余数，如果是整数则余数为 0
* `IF(MOD(A1,1),,A1)` 当余数为 0（即整数）时返回单元格值，否则返回空

```javascript
var style = new GC.Spread.Sheets.Style();
style.formatter = "0";  // 整数格式，不显示小数位
style.backColor = "green";  // 设置背景色便于识别
var ranges = [new GC.Spread.Sheets.Range(0, 0, 2, 3)];
sheet.conditionalFormats.addFormulaRule("=IF(MOD(A1,1),,A1)", style, ranges);
```

#### 默认格式设置

为单元格设置默认的小数格式，这样当条件格式不满足时（即小数值），会使用这个默认格式：

```javascript
sheet.setFormatter(0, 0, '0.00');  // 设置两位小数格式
```

#### 数据填充测试

示例中填充了不同类型的数值来验证效果：

```javascript
sheet.setValue(0, 0, 2);      // 整数，显示为 "2"
sheet.setValue(0, 1, 1.334);  // 小数，显示为 "1.33"
sheet.setValue(0, 2, 5.3);    // 小数，显示为 "5.30"
sheet.setValue(1, 0, 7.00);   // 整数，显示为 "7"
```

### 3.2 技术栈

* SpreadJS v17.0.8：核心表格控件
* SystemJS v0.19.22：模块加载器
* systemjs-plugin-babel v0.0.25：ES6 转译支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，可以看到表格中已经填充了测试数据
2. 观察单元格显示：整数值（2、7）显示为整数格式，小数值（1.334、5.3）显示为两位小数格式
3. 整数单元格会有绿色背景，便于识别条件格式的应用范围
4. 可以尝试在范围内输入新的数值，验证格式化效果

## 五、功能特点

### 5.1 优点

* 智能格式化：自动识别整数和小数，应用不同的显示格式
* 代码简洁：仅需几行代码即可实现复杂的格式化逻辑
* 灵活扩展：可以轻松调整应用范围、小数位数和样式

### 5.2 局限性与扩展建议

当前实现使用了背景色来标识整数单元格，在实际应用中可能需要去除这个视觉标识。可以通过以下方式优化：

```javascript
var style = new GC.Spread.Sheets.Style();
style.formatter = "0";
// 不设置 backColor，保持默认背景
```

如果需要应用到整个工作表，可以扩大范围：

```javascript
var ranges = [new GC.Spread.Sheets.Range(0, 0, sheet.getRowCount(), sheet.getColumnCount())];
```

## 六、关键代码片段

完整的核心实现代码：

```javascript
import * as GC from "@grapecity/spread-sheets";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();

// 创建条件格式样式（整数格式）
var style = new GC.Spread.Sheets.Style();
style.formatter = "0";
style.backColor = "green";

// 定义应用范围并添加公式规则
var ranges = [new GC.Spread.Sheets.Range(0, 0, 2, 3)];
sheet.conditionalFormats.addFormulaRule("=IF(MOD(A1,1),,A1)", style, ranges);

// 设置默认小数格式
sheet.setFormatter(0, 0, '0.00');

// 填充测试数据
sheet.setValue(0, 0, 2);
sheet.setValue(0, 1, 1.334);
sheet.setValue(0, 2, 5.3);
sheet.setValue(1, 0, 7.00);
```

## 七、总结

本示例展示了 SpreadJS 条件格式的强大功能，通过公式规则实现了智能的数字格式化。开发者可以从中学到：

* 条件格式的公式规则用法
* MOD 函数在格式化中的应用
* 如何组合默认格式和条件格式实现复杂需求
* Style 对象的 formatter 属性使用方法

这种方案特别适合需要在同一区域内混合显示整数和小数的场景，如财务报表、统计表格等，既保证了数据的准确性，又提升了视觉呈现的专业性。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
