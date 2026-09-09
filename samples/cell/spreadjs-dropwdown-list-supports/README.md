## 一、Demo 概述

本示例展示了 SpreadJS 中实现下拉列表的四种不同方式，包括 ComboBox 单元格类型、数据验证序列、样式下拉菜单和表单控件 ComboBox。每种方式都有其特定的应用场景和特点，开发者可以根据实际需求选择合适的实现方案。

该示例通过并排对比的方式，直观地展示了四种下拉列表的外观和交互差异，帮助开发者快速理解各种方式的使用方法。

## 二、解决的问题

- 提供多种下拉列表实现方案，满足不同的业务场景需求
- 实现单元格内的数据选择功能，提高数据录入效率和准确性
- 支持自定义下拉列表的显示文本和实际值，实现文本与值的分离
- 提供灵活的下拉列表配置方式，适应不同的 UI 交互需求

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 ComboBox 单元格类型

使用 `CellTypes.ComboBox` 创建下拉列表单元格，支持自定义显示文本和实际值：

```javascript
var comboBoxCellType = new GC.Spread.Sheets.CellTypes.ComboBox();
comboBoxCellType.items([
    { text: 'one', value: 1 }, 
    { text: 'two', value: 2 }, 
    { text: 'three', value: 3 }, 
    { text: 'four', value: 4 }
]);
sheet.setCellType(0, 1, comboBoxCellType);
```

这种方式将下拉列表作为单元格类型，用户点击单元格时自动显示下拉选项。

#### 3.1.2 数据验证序列

使用数据验证器创建下拉列表，通过逗号分隔的字符串定义选项：

```javascript
var listValidator = GC.Spread.Sheets.DataValidation.createListValidator('1,2,3,4');
sheet.setDataValidator(0, 4, listValidator);
```

这是最简单的实现方式，适合快速创建简单的下拉列表，但不支持文本与值的分离。

#### 3.1.3 样式下拉菜单

通过样式对象的 `cellButtons` 和 `dropDowns` 属性创建下拉列表：

```javascript
var dropDownStyle = new GC.Spread.Sheets.Style();
dropDownStyle.cellButtons = [
    {
        imageType: GC.Spread.Sheets.ButtonImageType.dropdown, 
        command: 'openList', 
        useButtonStyle: true
    }
];
dropDownStyle.dropDowns = [
    {
        type: GC.Spread.Sheets.DropDownType.list, 
        option: {
            items: [
                { text: 'one', value: 1 }, 
                { text: 'two', value: 2 }, 
                { text: 'three', value: 3 }, 
                { text: 'four', value: 4 }
            ]
        }
    }
];
sheet.setStyle(0, 7, dropDownStyle);
```

这种方式通过样式实现下拉列表，提供了更灵活的自定义能力，可以控制按钮样式和下拉行为。

#### 3.1.4 表单控件 ComboBox

使用 Shapes API 添加表单控件形式的下拉列表：

```javascript
sheet.setValue(0, 10, 1);
sheet.setValue(1, 10, 2);
sheet.setValue(2, 10, 3);
sheet.setValue(3, 10, 4);

var comboBox = sheet.shapes.addFormControl(
    "comboBox", 
    GC.Spread.Sheets.Shapes.FormControlType.comboBox, 
    100, 50, 200, 30
);
var options = comboBox.options();
options.inputRange = "K1:K4";
comboBox.options(options);
```

这种方式创建的是独立于单元格的浮动控件，通过 `inputRange` 属性指定数据源范围。

### 3.2 UI 交互流程

用户操作 → 点击单元格或控件 → 显示下拉列表 → 选择选项 → 单元格显示选中的值

### 3.3 技术栈

- @grapecity/spread-sheets: 17.0.8（核心表格组件）
- @grapecity/spread-sheets-shapes: 17.0.8（形状和表单控件支持）
- SystemJS: 0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行示例。

### 4.2 操作步骤

1. 打开页面后，可以看到四列标题分别为"ComboBox单元格类型"、"数据验证序列"、"样式下拉菜单"和"表单控件ComboBox"
2. 点击第一列（B列）的单元格，会显示 ComboBox 下拉列表
3. 点击第四列（E列）的单元格，会显示数据验证下拉列表
4. 点击第七列（H列）的单元格右侧按钮，会显示样式下拉菜单
5. 点击表单控件 ComboBox（浮动在表格上方），会显示下拉选项
6. 对比四种方式的外观和交互差异

## 五、功能特点

### 5.1 优点

- 提供四种不同的下拉列表实现方式，满足多样化需求
- ComboBox 单元格类型和样式下拉菜单支持文本与值分离，适合需要显示友好文本的场景
- 数据验证序列实现简单，适合快速开发
- 表单控件 ComboBox 可以独立于单元格布局，提供更灵活的 UI 设计

### 5.2 局限性与扩展建议

- 数据验证序列不支持文本与值分离，只能显示和存储相同的值
- 表单控件 ComboBox 需要手动管理位置和数据源，相对复杂
- 建议根据实际场景选择合适的实现方式：简单场景使用数据验证，需要文本值分离时使用 ComboBox 单元格类型，需要自定义样式时使用样式下拉菜单，需要独立布局时使用表单控件

## 六、关键代码片段

### 6.1 初始化工作簿和设置标题

```javascript
const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
var sheet = spread.getActiveSheet();
sheet.setValue(0, 0, 'ComboBox单元格类型');
sheet.setValue(0, 3, '数据验证序列');
sheet.setValue(0, 6, '样式下拉菜单');
sheet.setValue(0, 9, '表单控件ComboBox');

// 设置标题样式
var style = new GC.Spread.Sheets.Style();
style.backColor = 'yellow';
sheet.setStyle(0, 0, style);
sheet.setStyle(0, 3, style);
sheet.setStyle(0, 6, style);
sheet.setStyle(0, 9, style);
```

### 6.2 四种下拉列表的完整实现

代码中分别展示了四种实现方式的完整代码，详见"实现思路"章节。

## 七、总结

本示例全面展示了 SpreadJS 中实现下拉列表的四种方式，每种方式都有其独特的优势和适用场景。开发者可以学到：

- 如何使用 ComboBox 单元格类型创建功能丰富的下拉列表
- 如何使用数据验证快速实现简单的下拉选择
- 如何通过样式对象自定义下拉列表的外观和行为
- 如何使用表单控件创建独立的下拉列表组件

该示例适合需要在电子表格中实现数据选择功能的场景，通过对比不同实现方式，开发者可以根据具体需求选择最合适的技术方案。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/8UV8FG1f0EeXz89qL9Oyrg/)）
