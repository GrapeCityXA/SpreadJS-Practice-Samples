## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现一个自定义的区域选择器功能。用户可以在工作表中框选任意单元格区域，系统会自动将选中区域的引用地址（如 "Sheet1!A1:C5"）实时显示在输入框中。这是一个轻量级的实现，适用于需要让用户选择单元格区域并获取其引用地址的场景，例如公式编辑器、数据源配置等功能。

## 二、解决的问题

- **区域引用获取**：在开发电子表格应用时，经常需要让用户选择一个单元格区域，并获取该区域的标准引用地址（如 A1:B10 格式）
- **实时反馈**：用户在选择区域时需要即时看到当前选中的区域引用，提升交互体验
- **跨工作表支持**：自动包含工作表名称，支持多工作表场景下的区域引用

## 三、实现思路

### 3.1 配置选择策略

通过设置工作表的选择策略和选择单位，确保用户可以自由框选单元格区域：

```javascript
activeSheet.selectionPolicy(GC.Spread.Sheets.SelectionPolicy.range);
activeSheet.selectionUnit(GC.Spread.Sheets.SelectionUnit.cell);
```

- `selectionPolicy` 设置为 `range` 模式，允许选择连续的单元格区域
- `selectionUnit` 设置为 `cell` 单位，以单元格为基本选择单位

### 3.2 监听选择变化事件

绑定 `SelectionChanged` 事件，在用户每次改变选择区域时触发回调：

```javascript
activeSheet.bind(GC.Spread.Sheets.Events.SelectionChanged, function (e, info) {
    var selection = activeSheet.getSelections()[0];
    let activeSheetName = activeSheet.name();
    document.getElementById('reference').value = activeSheetName + "!" + 
        GC.Spread.Sheets.CalcEngine.rangeToFormula(selection, 0, 0, 
        GC.Spread.Sheets.CalcEngine.RangeReferenceRelative.allRelative);
});
```

核心逻辑：
1. 获取当前选中的第一个区域 `getSelections()[0]`
2. 获取当前工作表名称 `activeSheet.name()`
3. 使用 `rangeToFormula` 方法将区域对象转换为标准的 A1 引用格式
4. 拼接工作表名称和区域引用，形成完整的引用地址（如 "Sheet1!A1:C5"）
5. 将结果实时更新到输入框中

### 3.3 技术栈

- **SpreadJS**: 15.0.0 - 核心电子表格引擎
- **SystemJS**: 0.19.22 - 模块加载器
- **TypeScript**: 4.1.2 - 类型支持（配置支持，但本示例使用 JavaScript）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 使用本地服务器打开 index.html
# 例如使用 Live Server 或其他 HTTP 服务器
```

### 4.2 操作步骤

1. 在浏览器中打开 `index.html` 文件
2. 在工作表中点击并拖动鼠标，框选任意单元格区域
3. 观察页面顶部的输入框，会实时显示选中区域的引用地址
4. 尝试选择不同的区域，输入框内容会随之更新

## 五、功能特点

### 5.1 优点

- **实现简洁**：核心代码仅 10 余行，易于理解和维护
- **实时响应**：选择区域时立即更新引用地址，无延迟
- **标准格式**：输出符合 Excel 标准的 A1 引用格式，便于后续处理
- **可扩展性强**：可轻松集成到公式编辑器、数据绑定等复杂功能中

### 5.2 扩展建议

- 支持多区域选择（当前仅获取第一个选中区域）
- 添加引用格式切换功能（A1 格式 vs R1C1 格式）
- 支持绝对引用和相对引用的切换（如 $A$1 vs A1）
- 添加区域验证功能，限制可选择的区域范围

## 六、关键代码片段

### 区域引用转换

```javascript
// 将选中区域转换为公式引用格式
GC.Spread.Sheets.CalcEngine.rangeToFormula(
    selection,  // 选中的区域对象
    0,          // 基准行（用于相对引用计算）
    0,          // 基准列（用于相对引用计算）
    GC.Spread.Sheets.CalcEngine.RangeReferenceRelative.allRelative  // 引用类型：全相对引用
);
```

`rangeToFormula` 方法的参数说明：
- 第一个参数：要转换的区域对象
- 第二、三个参数：基准位置，用于计算相对引用
- 第四个参数：引用类型，可选值包括 `allAbsolute`（绝对引用）、`allRelative`（相对引用）等

## 七、总结

本示例展示了 SpreadJS 中实现自定义区域选择器的基本方法，开发者可以从中学到：

1. 如何配置工作表的选择策略和选择单位
2. 如何监听和处理选择变化事件
3. 如何将区域对象转换为标准的引用地址格式
4. 如何获取工作表名称并构建完整的区域引用

该方案适用于需要用户输入单元格区域引用的各类场景，如公式编辑、数据验证规则配置、图表数据源选择等。代码简洁高效，可直接应用于生产环境，也可作为更复杂功能的基础进行扩展。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/D7rJg2YJfEW1ZiLMD9VfIQ/)）
