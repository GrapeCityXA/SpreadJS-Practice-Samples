## 一、Demo 概述

本示例展示了如何在 SpreadJS 中使用 ComboBox 单元格类型实现下拉框选择公式的功能。用户可以通过下拉选择框从预设的公式列表中选择一个公式，选中后该公式会自动应用到单元格并计算结果。这种方式为用户提供了一种便捷的公式输入方式,特别适合在需要频繁使用相同公式的场景中使用。 

## 二、解决的问题

* **简化公式输入**:用户无需手动输入复杂的公式语法,通过下拉选择即可应用公式,降低了输入错误的风险
* **提高工作效率**:对于需要频繁使用相同几个公式的场景,下拉选择比反复输入更加高效
* **增强用户体验**:提供直观的可视化选择界面,用户可以清晰地看到可用的公式选项

## 三、实现思路

### 3.1 ComboBox 单元格类型配置

通过 `GC.Spread.Sheets.CellTypes.ComboBox` 创建下拉框单元格类型,并配置下拉选项列表。关键在于设置 `editorValueType` 为 `value`,使得下拉框选中后取 value 值(即公式字符串)而非显示文本。

```javascript
var combo = new GC.Spread.Sheets.CellTypes.ComboBox();

combo.items([
    { text: "=SUM(A1:B2)", value: "=SUM(A1:B2)" },
    { text: "=SUM(A1:C3)", value: "=SUM(A1:C3)" }])
    .editorValueType(GC.Spread.Sheets.CellTypes.EditorValueType.value);
```

在这个配置中,`items` 方法接收一个对象数组,每个对象包含 `text`(显示文本)和 `value`(实际值)两个属性。通过将 value 设置为公式字符串,当用户选择某个选项时,SpreadJS 会自动将该公式应用到单元格。

### 3.2 应用 ComboBox 到指定单元格

将配置好的 ComboBox 单元格类型应用到工作表的 D1 单元格(索引为 0, 3):

```javascript
sheet.getCell(0, 3, GC.Spread.Sheets.SheetArea.viewport).cellType(combo);
sheet.setColumnWidth(3, 100);
```

`getCell` 方法获取指定位置的单元格对象,`cellType` 方法将 ComboBox 单元格类型应用到该单元格。同时调整列宽以确保下拉框有足够的显示空间。

### 3.3 技术栈

* **@grapecity/spread-sheets**: 16.0.1(核心表格组件库)
* **TypeScript**: ^4.1.2(开发语言)
* **SystemJS**: ^0.19.22(模块加载器)

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

然后在浏览器中打开 `index.html` 文件即可运行示例。

### 4.2 操作步骤

1. 打开示例页面,可以看到一个包含 3x3 数据表格的工作表
2. 点击 D1 单元格,会出现下拉箭头
3. 点击下拉箭头,从列表中选择一个公式选项(如 "=SUM(A1:B2)")
4. 选择后,该单元格会自动显示公式计算结果

## 五、功能特点

### 5.1 优点

* **操作简单**:用户通过点击选择即可应用公式,无需记忆公式语法
* **减少错误**:避免了手动输入公式时可能出现的语法错误或引用错误
* **灵活扩展**:可以根据业务需求轻松添加更多预设公式选项
* **自动计算**:选择公式后立即计算并显示结果,实时反馈

### 5.2 局限性与扩展建议

当前实现的公式范围是固定的(A1:B2 和 A1:C3),在实际应用中可以考虑以下扩展:

* 支持动态公式范围,根据用户选择的区域自动生成公式
* 添加更多类型的公式选项(如 AVERAGE、MAX、MIN 等)
* 支持自定义公式列表,允许用户配置常用的公式模板
* 结合数据验证功能,限制只能通过下拉选择输入公式

## 六、关键代码片段

核心实现代码集中在 `src/app.js` 中:

```javascript
// 初始化工作簿和工作表
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let sheet = spread.getActiveSheet();

// 设置示例数据
sheet.setArray(0, 0, [[1, 2, 3], [4, 5, 6], [7, 8, 9]]);

// 创建 ComboBox 单元格类型并配置公式选项
var combo = new GC.Spread.Sheets.CellTypes.ComboBox();
combo.items([
    { text: "=SUM(A1:B2)", value: "=SUM(A1:B2)" },
    { text: "=SUM(A1:C3)", value: "=SUM(A1:C3)" }])
    .editorValueType(GC.Spread.Sheets.CellTypes.EditorValueType.value);

// 应用到 D1 单元格
sheet.getCell(0, 3, GC.Spread.Sheets.SheetArea.viewport).cellType(combo);
sheet.setColumnWidth(3, 100);
```

关键点说明:

* `editorValueType` 设置为 `value` 使得下拉选择后取 value 值而非 text
* `items` 中的 value 属性必须是完整的公式字符串(以 "=" 开头)
* `getCell` 的索引从 0 开始,D1 单元格对应 (0, 3)

## 七、总结

本示例演示了 SpreadJS 中 ComboBox 单元格类型的实用应用场景。开发者可以学到:

* ComboBox 单元格类型的基本配置方法
* 如何通过 `editorValueType` 控制下拉框的取值逻辑
* 公式在 ComboBox 中的应用技巧
* 单元格类型的应用方式

该方案特别适合需要为用户提供预设公式选项的业务场景,如财务报表模板、数据分析工具等。通过扩展 items 列表和结合其他 SpreadJS 功能,可以构建更加智能和用户友好的表格应用。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
