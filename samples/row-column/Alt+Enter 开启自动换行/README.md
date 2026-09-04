## 一、Demo 概述

本示例演示了如何在 SpreadJS 中实现类似 Excel 的 Alt+Enter 自动换行功能。当用户在单元格中输入包含换行符的内容时，系统会自动检测并启用该单元格的自动换行属性，同时自动调整行高以完整显示内容。这是一个轻量级的用户体验优化方案，无需用户手动设置单元格格式。

## 二、解决的问题

在 Excel 中，用户可以通过 Alt+Enter 快捷键在单元格内插入换行符，实现多行文本输入。SpreadJS 作为 Excel 兼容的表格控件，同样支持换行符输入，但需要开发者主动处理换行后的显示效果。本示例解决了以下问题：

- 自动识别用户输入的换行符，无需手动设置单元格格式
- 自动启用单元格的 wordWrap 属性，确保多行文本正确显示
- 自动调整行高，避免内容被截断
- 提升用户体验，使操作更接近原生 Excel 行为

## 三、实现思路

### 3.1 核心技术点

#### 监听单元格值变化事件

通过监听 `ValueChanged` 事件，在用户输入内容后立即检测是否包含换行符：

```javascript
spread.bind(GC.Spread.Sheets.Events.ValueChanged, function (sender, args) {
    let str = args.newValue;
    if (str.indexOf("\n") >= 0) {
        args.sheet.getCell(args.row, args.col).wordWrap(true);
        args.sheet.autoFitRow(args.row);
    }
});
```

**实现原理**：
- `ValueChanged` 事件在单元格值发生变化时触发
- `args.newValue` 获取用户输入的新值
- 使用 `indexOf("\n")` 检测是否包含换行符（`\n`）
- 如果包含换行符，则执行自动换行和行高调整逻辑

#### 动态设置单元格自动换行

当检测到换行符后，通过 `wordWrap(true)` 方法启用单元格的自动换行属性：

```javascript
args.sheet.getCell(args.row, args.col).wordWrap(true);
```

**实现原理**：
- `getCell(row, col)` 获取指定单元格对象
- `wordWrap(true)` 启用自动换行，使单元格内容按换行符分行显示

#### 自动调整行高

启用自动换行后，调用 `autoFitRow()` 方法自动调整行高以适应内容：

```javascript
args.sheet.autoFitRow(args.row);
```

**实现原理**：
- `autoFitRow(row)` 根据单元格内容自动计算并设置行高
- 确保多行文本完整显示，不会被截断

### 3.2 技术栈

- **@grapecity/spread-sheets**: 17.0.8（SpreadJS 核心库）
- **SystemJS**: 0.19.22（模块加载器）
- **systemjs-plugin-babel**: 0.0.25（ES6 转译插件）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
# 或使用本地服务器（如 Live Server）运行
```

### 4.2 操作步骤

1. 打开示例页面，SpreadJS 表格会自动加载
2. 点击任意单元格进入编辑状态
3. 输入文本内容，按 Alt+Enter（Windows）或 Option+Enter（Mac）插入换行符
4. 继续输入第二行内容
5. 按 Enter 键或点击其他单元格完成输入
6. 观察单元格自动启用换行并调整行高，多行文本完整显示

## 五、功能特点

### 5.1 优点

- **自动化处理**：无需用户手动设置单元格格式，系统自动识别并处理换行
- **用户体验优化**：操作方式与 Excel 完全一致，降低学习成本
- **代码简洁**：仅需 7 行核心代码即可实现完整功能
- **性能高效**：事件驱动机制，仅在值变化时触发，不影响整体性能

### 5.2 局限性与扩展建议

**局限性**：
- 仅在输入包含换行符时触发，如果用户先输入内容再手动设置换行，不会自动调整行高
- 未处理删除换行符的场景（如用户删除换行符后，wordWrap 属性仍为 true）

**扩展建议**：
- 可以增加对删除换行符的检测，当内容不再包含换行符时自动关闭 wordWrap
- 可以添加配置选项，允许开发者自定义是否启用此功能
- 可以扩展为支持批量单元格的自动换行处理

## 六、关键代码片段

### 完整的事件监听逻辑

```javascript
import * as GC from "@grapecity/spread-sheets";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));

// 监听单元格值变化事件
spread.bind(GC.Spread.Sheets.Events.ValueChanged, function (sender, args) {
    let str = args.newValue;
    // 检测是否包含换行符
    if (str.indexOf("\n") >= 0) {
        // 启用自动换行
        args.sheet.getCell(args.row, args.col).wordWrap(true);
        // 自动调整行高
        args.sheet.autoFitRow(args.row);
    }
});
```

**代码说明**：
- 第 1 行：导入 SpreadJS 核心库
- 第 4 行：初始化 Workbook 实例
- 第 7 行：绑定 `ValueChanged` 事件
- 第 8 行：获取用户输入的新值
- 第 9 行：使用 `indexOf()` 检测换行符
- 第 10 行：启用单元格自动换行属性
- 第 11 行：自动调整行高以适应内容

## 七、总结

本示例展示了如何通过简单的事件监听机制实现 SpreadJS 的自动换行功能，核心价值在于提升用户体验，使操作更接近原生 Excel。开发者可以从中学到以下知识点：

- SpreadJS 事件系统的使用方法（`ValueChanged` 事件）
- 单元格属性的动态设置（`wordWrap` 方法）
- 行高的自动调整（`autoFitRow` 方法）
- 字符串换行符的检测技巧（`indexOf("\n")`）

该方案适用于需要优化多行文本输入体验的场景，代码简洁高效，易于集成到现有项目中。开发者可以在此基础上扩展更多自动化格式处理功能，如自动调整列宽、自动设置文本对齐方式等。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/rRmTDr5bvUaW3AdznAdVDg/)）
