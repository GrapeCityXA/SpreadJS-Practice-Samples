## 一、Demo 概述

本示例演示了如何在 SpreadJS 中自定义单元格的显示格式，特别是将数值 0 显示为指定的文本内容（如 "-"）。这是一个常见的数据展示需求，在财务报表、数据统计表等场景中，通常需要将 0 值显示为更直观的符号，以提升表格的可读性和专业性。

该示例通过 SpreadJS 的单元格格式化功能，实现了对 0 值的自定义显示，同时保持单元格的实际数值不变，确保计算逻辑的正确性。

## 二、解决的问题

* **提升数据可读性**：在财务报表或统计表中，大量的 0 值会影响阅读体验，使用 "-" 或其他符号替代可以让表格更清晰
* **保持数据完整性**：仅改变显示格式而不改变实际数值，确保公式计算和数据处理的准确性
* **符合行业规范**：许多行业（如金融、会计）对 0 值的显示有特定的格式要求

## 三、实现思路

### 3.1 核心技术点

#### 使用条件格式

SpreadJS 支持通过条件格式字符串来控制数值的显示方式。

```javascript
var sheet = spread.getActiveSheet();
var style = new GC.Spread.Sheets.Style();
//  定义Style的格式为指定字符
style.formatter = '-';
//  设置条件格式，当单元格值为0时，显示Style效果
sheet.conditionalFormats.addCellValueRule(
    GC.Spread.Sheets.ConditionalFormatting.ComparisonOperators.equalsTo, '0', null, 
    style, [new GC.Spread.Sheets.Range(0, 0, 5, 1)]
);
sheet.setArray(0, 0, [0, 2, 0, 4, 0]);
```

### 3.2 技术栈

* SpreadJS v16.x：核心表格组件库
* 原生 JavaScript：实现交互逻辑

## 四、使用说明

### 4.1 运行方式

直接在浏览器中打开 `index.html` 文件即可运行，无需安装依赖。

### 4.2 操作步骤

1. 打开示例页面，可以看到一个包含数据的表格
2. 观察表格中的数值，其中 0 值已经显示为 "-"
3. 尝试在单元格中输入 0，会自动显示为 "-"
4. 双击单元格进入编辑模式，可以看到实际值仍然是 0
5. 可以修改代码中的格式字符串，测试不同的显示效果

## 五、功能特点

### 5.1 优点

* **实现简单**：仅需一行代码即可实现 0 值的自定义显示
* **不影响计算**：单元格的实际值不变，公式和计算逻辑不受影响
* **灵活可配置**：可以根据需求自定义 0 值的显示内容（如 "-"、"N/A"、"--" 等）
* **性能优秀**：格式化是 SpreadJS 的内置功能，不会影响性能

### 5.2 局限性与扩展建议

* **格式字符串语法**：需要熟悉 SpreadJS 的格式字符串语法，对于复杂格式可能需要查阅文档
* **扩展建议**：可以结合条件格式功能，实现更复杂的显示逻辑，如根据不同条件显示不同的内容和样式

## 六、总结

本示例展示了 SpreadJS 中自定义数字格式的基础应用，通过简单的格式字符串即可实现 0 值的自定义显示。这个功能在实际业务中非常实用，特别是在需要生成专业报表的场景中。

开发者可以从中学到：

* SpreadJS 自定义数字格式的语法和使用方法
* 如何在不改变数据的前提下改变显示效果
* 批量设置单元格格式的技巧

该方案适用于各种需要自定义数值显示的场景，如财务报表、数据统计表、考勤表等。通过扩展格式字符串，还可以实现更复杂的显示需求，如千分位分隔符、货币符号、百分比等。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
