## 一、Demo 概述

本示例演示了如何在 SpreadJS 中实现跨工作表的单元格引用功能。用户可以在 Sheet2 中输入公式（如 `=sum(`），然后通过点击按钮选择 Sheet1 中的单元格区域，系统会自动将选中的区域引用插入到公式中，形成完整的跨表引用公式（如 `=sum(Sheet1!$A$1:$A$4)`）。

该示例解决了在多工作表场景下，用户需要手动输入跨表引用公式的繁琐问题，通过可视化选择的方式提升了用户体验。

## 二、解决的问题

在实际的电子表格应用中，用户经常需要在一个工作表中引用另一个工作表的数据。传统方式需要用户手动输入完整的跨表引用公式（如 `=sum(Sheet1!A1:A4)`），这种方式存在以下问题：

* 用户需要记住目标工作表的名称和单元格地址，容易出错
* 对于复杂的区域引用，手动输入效率低下
* 缺乏可视化的选择体验，不够直观

本示例通过实现一个辅助选择功能，允许用户在输入公式时通过按钮切换到目标工作表，可视化地选择需要引用的单元格区域，系统自动生成正确的跨表引用公式。

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 允许无效公式输入

在 SpreadJS 15.2.4 及以上版本中，默认不允许输入不完整的公式。为了实现在公式输入过程中切换工作表的功能，需要启用 `allowInvalidFormula` 选项：

```javascript
spread.options.allowInvalidFormula = true
```

这样用户可以先输入不完整的公式（如 `=sum(`），然后通过按钮选择区域来补全公式。

#### 3.1.2 状态管理

示例使用多个变量来跟踪用户的操作状态：

```javascript
// 用于判断当前是否是按钮触发的选择区域
let selectFlag = false
// 用于记录选择区域之前的公式值
let formula
// 记录sheetName
let sheet1Name
let prevSheetName
// 记录点击之前在哪个sheet页
let prevSheet
// 记录点击前的单元格
let prevCellRange
```

这些状态变量确保了在工作表切换和区域选择过程中，能够准确地恢复到原始位置并完成公式的拼接。

#### 3.1.3 按钮点击事件处理

当用户点击"选择sheet1的区域"按钮时，系统会保存当前状态并切换到目标工作表：

```javascript
document.getElementById('select').addEventListener('click', function () {
    let sheet2 = spread.getActiveSheet()
    let range = sheet2.getSelections()[0]
    let f = sheet2.getValue(range.row, range.col)
    formula = f

    // 切换到Sheet1
    spread.setActiveSheetIndex(0)

    sheet1Name = spread.getActiveSheet().name()
    prevSheetName = sheet2.name()
    selectFlag = true
    prevSheet = sheet2
    prevCellRange = range
})
```

#### 3.1.4 选区变化监听与公式生成

通过监听 `SelectionChanged` 事件，在用户选择区域后自动生成跨表引用公式：

```javascript
sheet1.bind(GC.Spread.Sheets.Events.SelectionChanged, function (sender, args) {
    if (selectFlag) {
        // 将选中的区域转换为公式引用格式（绝对引用）
        let selectedRange = GC.Spread.Sheets.CalcEngine.rangeToFormula(args.newSelections[0])
        selectFlag = false
        // 切换回原工作表
        spread.setActiveSheet(prevSheetName)
        // 拼接完整的跨表引用公式
        prevSheet.setFormula(prevCellRange.row, prevCellRange.col, formula + sheet1Name + '!' + selectedRange + ')')
    }
});
```

关键 API `rangeToFormula` 可以将选区对象转换为公式引用字符串，支持相对引用、绝对引用以及 R1C1 引用方式。

### 3.2 UI 交互流程

用户操作 → 切换到 Sheet2 → 在单元格中输入不完整公式（如 `=sum(`） → 点击"选择sheet1的区域"按钮 → 系统自动切换到 Sheet1 → 用户选择目标单元格区域 → 系统自动切换回 Sheet2 并完成公式拼接

### 3.3 技术栈

* @grapecity/spread-sheets: 15.2.4（核心电子表格引擎）
* SystemJS: 0.19.22（模块加载器）
* TypeScript: 4.1.2（类型支持）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，默认显示 Sheet1，其中 A1:A4 单元格已填充数值 1、2、3、4
2. 切换到 Sheet2 工作表
3. 在 Sheet2 的任意单元格中输入不完整的公式，例如 `=sum(`
4. 点击页面上方的"选择sheet1的区域"按钮
5. 系统自动切换到 Sheet1，此时可以用鼠标选择需要引用的单元格区域（如 A1:A4）
6. 选择完成后，系统自动切换回 Sheet2，并在原单元格中生成完整的跨表引用公式（如 `=sum(Sheet1!$A$1:$A$4)`）
7. 按回车键确认公式，即可看到计算结果

## 五、功能特点

### 5.1 优点

* 提供可视化的跨表引用选择体验，降低用户操作难度
* 自动生成绝对引用格式（`$A$1`），避免公式复制时的引用错误
* 支持区域选择，可以一次性引用多个单元格
* 代码结构清晰，易于扩展和定制

### 5.2 局限性与扩展建议

当前实现仅支持单个区域的选择，如果需要支持多区域选择（如 `=sum(Sheet1!A1:A4, Sheet1!C1:C4)`），可以在 `SelectionChanged` 事件处理中遍历 `args.newSelections` 数组，将多个区域用逗号连接。

此外，`rangeToFormula` 方法支持配置引用类型（相对引用、绝对引用、混合引用）和引用方式（A1 或 R1C1），可以根据实际需求进行调整。

## 六、关键代码片段

### 6.1 区域转换为公式引用

```javascript
// 将选区对象转换为公式引用字符串（默认绝对引用）
let selectedRange = GC.Spread.Sheets.CalcEngine.rangeToFormula(args.newSelections[0])
// 结果示例：$A$1:$A$4
```

### 6.2 跨表公式拼接

```javascript
// 拼接完整的跨表引用公式
// formula: "=sum("
// sheet1Name: "Sheet1"
// selectedRange: "$A$1:$A$4"
// 最终结果: "=sum(Sheet1!$A$1:$A$4)"
prevSheet.setFormula(prevCellRange.row, prevCellRange.col, formula + sheet1Name + '!' + selectedRange + ')')
```

## 七、总结

本示例展示了如何在 SpreadJS 中实现跨工作表的单元格引用辅助功能，通过事件监听和状态管理，实现了可视化的区域选择体验。开发者可以从中学到以下知识点：

* 如何使用 `allowInvalidFormula` 选项允许不完整公式的输入
* 如何监听 `SelectionChanged` 事件捕获用户的选区变化
* 如何使用 `rangeToFormula` API 将选区对象转换为公式引用字符串
* 如何在多工作表之间切换并保持状态一致性
* 如何动态拼接和设置单元格公式

该方案适用于需要频繁进行跨表引用的场景，可以显著提升用户的操作效率。开发者可以在此基础上扩展更多功能，如支持多区域选择、自定义引用类型、支持跨工作簿引用等。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
