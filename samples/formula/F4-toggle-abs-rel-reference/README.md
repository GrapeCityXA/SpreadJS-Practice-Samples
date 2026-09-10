## 一、Demo 概述

本示例演示了如何在 SpreadJS 中使用 F4 快捷键切换公式中的单元格引用类型（相对引用、绝对引用、混合引用）。这是 Excel 中常用的功能，允许用户在编辑公式时快速切换引用格式，例如从 `A1` 切换到 `$A$1`、`$A1` 或 `A$1`。

## 二、解决的问题

在电子表格应用中，用户经常需要在公式中使用不同类型的单元格引用：

* 相对引用（A1）：复制公式时引用会自动调整
* 绝对引用（$A$1）：复制公式时引用保持不变
* 混合引用（$A1 或 A$1）：行或列固定，另一维度自动调整

手动输入 `$` 符号效率低下且容易出错，通过 F4 快捷键可以快速循环切换这些引用类型，提升用户体验。

## 三、实现思路

### 3.1 核心技术点

#### 绑定 F4 快捷键到内置命令

SpreadJS 提供了 `changeFormulaReference` 内置命令用于切换公式引用类型。通过 `commandManager().setShortcutKey()` 方法将 F4 键（键码 115）绑定到该命令：

```javascript
spread.commandManager().setShortcutKey(
    "changeFormulaReference", 115, false, false, false, false
);
```

参数说明：

* 第一个参数：命令名称 `"changeFormulaReference"`
* 第二个参数：键码 `115`（F4 键）
* 后续四个布尔参数：依次表示是否需要 Ctrl、Shift、Alt、Meta 键配合（均为 false 表示单独按 F4 即可触发）

#### 初始化示例数据

创建简单的求和公式用于测试 F4 功能：

```javascript
sheet.setValue(0, 0, 1);
sheet.setValue(0, 1, 2);
sheet.setFormula(1, 1, "=SUM(A1, B1)");
```

这段代码在 A1 和 B1 单元格设置数值，在 B2 单元格设置求和公式。

### 3.2 技术栈

* SpreadJS：17.0.8（核心电子表格引擎）
* SystemJS：0.19.22（模块加载器）
* systemjs-plugin-babel：0.0.25（ES6 转译支持）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

安装完成后，使用浏览器打开 `index.html` 文件。

### 4.2 操作步骤

1. 双击 B2 单元格进入编辑模式
2. 将光标移动到公式中的 `A1` 或 `B1` 引用处
3. 按下 F4 键，观察引用格式的变化：
    * 第一次按下：`A1` → `$A$1`（绝对引用）
    * 第二次按下：`$A$1` → `A$1`（行绝对引用）
    * 第三次按下：`A$1` → `$A1`（列绝对引用）
    * 第四次按下：`$A1` → `A1`（回到相对引用）

## 五、功能特点

### 5.1 优点

* 操作简单：单键切换，无需手动输入 `$` 符号
* 符合 Excel 习惯：与 Excel 的 F4 功能保持一致，降低学习成本
* 提升效率：快速切换引用类型，特别适合复杂公式编辑场景

### 5.2 局限性与扩展建议

当前示例仅展示基础功能，实际应用中可以考虑：

* 支持多单元格选区的批量引用切换
* 在公式栏中显示当前引用类型的提示
* 添加撤销/重做功能以便快速恢复误操作

## 六、关键代码片段

完整的初始化代码：

```javascript
import * as GC from "@grapecity/spread-sheets";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();

// 设置示例数据
sheet.setValue(0, 0, 1);
sheet.setValue(0, 1, 2);
sheet.setFormula(1, 1, "=SUM(A1, B1)");

// 绑定 F4 快捷键
spread.commandManager().setShortcutKey(
    "changeFormulaReference", 115, false, false, false, false
);
```

## 七、总结

本示例展示了 SpreadJS 中快捷键绑定和内置命令的使用方法。开发者可以从中学到：

1. 如何使用 `commandManager().setShortcutKey()` 自定义快捷键
2. SpreadJS 内置的 `changeFormulaReference` 命令用法
3. 键码（keyCode）与快捷键的映射关系
4. 如何通过简单配置实现 Excel 兼容的用户体验

该方案适用于需要提供类 Excel 编辑体验的 Web 应用，特别是涉及大量公式编辑的财务、数据分析等场景。通过类似方式，开发者还可以绑定其他自定义命令到快捷键，实现更丰富的键盘操作支持。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
