## 一、Demo 概述

本示例演示了如何使用 SpreadJS 的 FormulaTextBox 组件实现交互式区域选择功能，并将选中的单元格区域转换为字符串表达式。用户可以通过点击按钮进入区域选择模式，在表格中选择单元格区域，然后获取该区域的字符串表示形式（如 "A1:B5"）。

该功能常用于需要用户手动指定数据范围的场景，例如自定义公式编辑器、数据引用配置、动态图表数据源设置等。

## 二、解决的问题

* **交互式区域选择**：提供类似 Excel 的区域选择体验，用户无需手动输入单元格地址，通过鼠标点击即可选择目标区域
* **区域地址获取**：自动将用户选择的单元格区域转换为标准的 A1 引用格式字符串，方便后续的数据处理和公式构建
* **选择模式控制**：支持程序化控制区域选择的开始和结束，可以灵活集成到各种业务流程中

## 三、实现思路

### 3.1 核心技术点

#### FormulaTextBox 组件初始化

FormulaTextBox 是 SpreadJS 提供的公式文本框组件，支持区域选择模式。通过将其与 Workbook 实例绑定，可以实现与表格的交互：

```javascript
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let fbx = new GC.Spread.Sheets.FormulaTextBox.FormulaTextBox(
    document.getElementById('formulaBar'), 
    { rangeSelectMode: true }
);
fbx.workbook(spread);
```

关键配置项 `rangeSelectMode: true` 启用了区域选择模式，使得 FormulaTextBox 可以响应用户在表格中的选择操作。

#### 区域选择模式控制

通过 `startSelectMode()` 和 `endSelectMode()` 方法控制区域选择的生命周期：

```javascript
document.getElementById('start').onclick = function () {
    fbx.startSelectMode()
};

document.getElementById('end').onclick = function () {
    fbx.endSelectMode()
    document.getElementById("formula-text").value = fbx.text()
};
```

* `startSelectMode()`：激活区域选择模式，此时用户在表格中的点击和拖拽操作会被识别为区域选择
* `endSelectMode()`：退出区域选择模式，并通过 `fbx.text()` 获取选中区域的字符串表示

### 3.2 UI 交互流程

用户点击"开始选择区域"按钮 → 进入选择模式 → 在表格中点击或拖拽选择单元格区域 → 点击"结束选择区域"按钮 → 选中的区域地址显示在输入框中

### 3.3 技术栈

* SpreadJS v16.0.1：核心表格组件库
* SystemJS v0.19.22：模块加载器
* TypeScript v4.1.2：开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

安装完成后，使用本地服务器（如 Live Server、http-server）打开 `index.html` 文件。

### 4.2 操作步骤

1. 打开页面后，左侧显示 SpreadJS 表格，右侧显示控制按钮和输入框
2. 点击"开始选择区域"按钮，激活区域选择模式
3. 在表格中点击单个单元格或拖拽选择多个单元格区域
4. 点击"结束选择区域"按钮，选中的区域地址（如 "A1:C5"）会显示在输入框中
5. 可以重复步骤 2-4 进行多次选择操作

## 五、功能特点

### 5.1 优点

* **用户体验友好**：提供类似 Excel 的交互方式，降低用户学习成本
* **实现简洁**：核心代码不到 15 行，API 设计清晰易用
* **灵活可控**：支持程序化控制选择模式的开启和关闭，便于集成到复杂业务流程中

### 5.2 局限性与扩展建议

* **单次选择限制**：当前实现仅支持单次区域选择，如需支持多区域选择（如 "A1:B2,D4:E5"），需要扩展逻辑来累积多次选择结果
* **视觉反馈优化**：可以考虑在选择模式激活时改变按钮状态或添加视觉提示，让用户明确当前所处的模式
* **输入验证**：可以添加对选择结果的验证逻辑，例如限制选择区域的大小或位置

## 六、关键代码片段

### FormulaTextBox 与 Workbook 绑定

```javascript
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let fbx = new GC.Spread.Sheets.FormulaTextBox.FormulaTextBox(
    document.getElementById('formulaBar'), 
    { rangeSelectMode: true }
);
fbx.workbook(spread);
```

这段代码建立了 FormulaTextBox 与 Workbook 的关联，使得 FormulaTextBox 能够监听和响应表格中的用户操作。

### 区域选择结果获取

```javascript
document.getElementById('end').onclick = function () {
    fbx.endSelectMode()
    document.getElementById("formula-text").value = fbx.text()
};
```

通过 `fbx.text()` 方法获取选中区域的字符串表示，这个字符串可以直接用于公式构建或数据引用。

## 七、总结

本示例展示了 SpreadJS FormulaTextBox 组件在区域选择场景中的应用，开发者可以从中学到：

* FormulaTextBox 组件的基本使用方法和配置选项
* 如何实现程序化控制的区域选择功能
* 如何获取用户选择的单元格区域并转换为字符串格式
* 如何将 FormulaTextBox 与 Workbook 实例进行绑定

该方案适用于需要用户手动指定数据范围的各类场景，如自定义公式编辑器、数据源配置界面、动态报表参数设置等。通过简单的 API 调用即可实现专业的区域选择交互体验，具有良好的扩展性和实用价值。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
