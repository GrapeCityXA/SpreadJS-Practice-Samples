## 一、Demo 概述

本示例演示了如何在 SpreadJS 中自定义单元格类型，实现对计算错误值（如 `#DIV/0!`）的自定义显示。当单元格中的公式计算结果为除零错误时，系统会自动将错误信息替换为用户友好的提示文本，而不是显示默认的错误代码。

该示例通过继承 `Text` 单元格类型并重写 `paint` 方法，在渲染阶段拦截错误值并进行替换，从而实现了对计算异常的优雅处理。

## 二、解决的问题

* **提升用户体验**：将技术性的错误代码（如 `#DIV/0!`）替换为易于理解的中文提示信息，降低用户的理解成本
* **统一错误展示**：为特定列或区域的计算错误提供统一的显示样式，保持界面的一致性
* **灵活的错误处理**：通过自定义单元格类型，可以针对不同的错误类型实现差异化的显示逻辑

## 三、实现思路

### 3.1 自定义单元格类型

核心实现是创建一个继承自 `Text` 单元格类型的自定义类型 `ShowValueCellType`，并重写其 `paint` 方法来拦截和替换错误值：

```javascript
function ShowValueCellType() {
}
ShowValueCellType.prototype = new spreadNS.CellTypes.Text();
ShowValueCellType.prototype.paint = function (ctx, value, x, y, w, h, style, options) {
    if (value && value._error === "#DIV/0!") {
        // 在这里改变值
        value = "我是错误值";
    }
    spreadNS.CellTypes.Text.prototype.paint.apply(this, [ctx, value, x, y, w, h, style, options]);
};
```

**实现原理**：

* 通过原型链继承 `Text` 单元格类型的所有功能
* 在 `paint` 方法中检查 `value._error` 属性，判断是否为 `#DIV/0!` 错误
* 如果检测到错误，将 `value` 替换为自定义文本
* 调用父类的 `paint` 方法完成实际渲染

### 3.2 应用自定义单元格类型到列

将自定义单元格类型应用到整个列（第 3 列），使该列的所有单元格都具备错误值替换功能：

```javascript
// 为整列添加自定义单元格类型
sheet.setCellType(-1, 2, new ShowValueCellType());
```

**参数说明**：

* 第一个参数 `-1` 表示应用到整列
* 第二个参数 `2` 表示第 3 列（索引从 0 开始）
* 第三个参数是自定义单元格类型的实例

### 3.3 构造测试数据

示例创建了多个除零公式来触发 `#DIV/0!` 错误，以便验证自定义显示效果：

```javascript
for (var i = 0; i < sheet.getRowCount() - 1; i++) {
    sheet.setValue(i, 0, i);
    sheet.setValue(i, 1, 0);  // 除数设为 0
    var j = i + 1;
    sheet.setFormula(i, 2, "=A" + j + "/B" + j);  // 构造除零公式
}
sheet.setValue(3, 1, 2);  // 将第 4 行的除数改为 2，验证正常计算
```

### 3.4 技术栈

* **SpreadJS**: 15.0.0（核心表格组件）
* **SystemJS**: 0.19.22（模块加载器）
* **TypeScript**: 4.1.2（开发语言支持）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，可以看到一个包含 3 列的表格：值1、值2、值1/值2
2. 观察第 3 列的计算结果：
    * 大部分行显示"我是错误值"（因为除数为 0）
    * 第 4 行显示正常的计算结果（除数为 2）
3. 可以尝试修改第 2 列的值，观察第 3 列的显示变化：
    * 将除数改为 0，会显示"我是错误值"
    * 将除数改为非零值，会显示正常的计算结果

## 五、功能特点

### 5.1 优点

* **非侵入式**：通过自定义单元格类型实现，不影响公式的实际计算逻辑和数据存储
* **可扩展性强**：可以轻松扩展到处理其他类型的错误（如 `#N/A`、`#VALUE!` 等）
* **灵活应用**：可以针对特定单元格、行、列或区域应用自定义显示逻辑
* **保留原始数据**：只改变显示效果，不修改单元格的实际值和公式

### 5.2 扩展建议

* **多错误类型处理**：可以在 `paint` 方法中添加更多错误类型的判断，为不同错误提供不同的提示信息
* **样式定制**：可以在替换文本的同时修改字体颜色、背景色等样式，进一步增强视觉效果
* **国际化支持**：根据语言环境动态选择提示文本，支持多语言场景

## 六、关键代码片段

### 错误值检测与替换逻辑

```javascript
ShowValueCellType.prototype.paint = function (ctx, value, x, y, w, h, style, options) {
    if (value && value._error === "#DIV/0!") {
        // 检测到除零错误时，替换为自定义文本
        value = "我是错误值";
    }
    // 调用父类方法完成渲染
    spreadNS.CellTypes.Text.prototype.paint.apply(this, [ctx, value, x, y, w, h, style, options]);
};
```

**关键点**：

* `value._error` 属性包含了 SpreadJS 内部的错误类型标识
* 替换操作在渲染阶段进行，不影响单元格的实际数据
* 使用 `apply` 方法确保父类方法在正确的上下文中执行

## 七、总结

本示例展示了 SpreadJS 中自定义单元格类型的强大能力，通过简单的继承和方法重写，即可实现对计算错误的优雅处理。开发者可以从中学到：

* 如何继承和扩展 SpreadJS 的内置单元格类型
* 如何在渲染阶段拦截和修改单元格的显示内容
* 如何将自定义单元格类型应用到特定的行、列或区域
* 如何处理 SpreadJS 中的计算错误和异常情况

该方案特别适用于需要向最终用户隐藏技术细节、提供友好错误提示的业务场景，具有良好的可维护性和扩展性。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
