## 一、Demo 概述

本示例演示如何在 SpreadJS 中通过自定义函数实现类似 Excel 的 EVALUATE 宏功能。EVALUATE 函数可以将公式字符串动态解析并计算结果，这在需要动态构建和执行公式的场景中非常有用。该示例通过继承 SpreadJS 的 CalcEngine.Functions.Function 类，创建了一个自定义的 EVALUATE 函数，实现了公式字符串的动态计算能力。

## 二、解决的问题

* **动态公式计算**：在某些业务场景中，公式内容需要根据用户输入或其他条件动态生成，而不是预先写死在单元格中。EVALUATE 函数允许将字符串形式的公式转换为实际的计算结果。
* **Excel 兼容性**：Excel 中的 EVALUATE 函数（宏功能）在 SpreadJS 中默认不支持，通过自定义函数可以实现相同的功能，提高与 Excel 的兼容性。

## 三、实现思路

### 3.1 核心技术点

#### 自定义函数类的创建

通过继承 `GC.Spread.CalcEngine.Functions.Function` 类来创建自定义函数。需要定义函数名称、参数个数等基本属性：

```javascript
function FactorialFunction() {
    //函数名
    this.name = 'EVALUATE';
    //最大参数个数
    this.maxArgs = 1;
    //最小参数个数
    this.minArgs = 1;
};
FactorialFunction.prototype = new GC.Spread.CalcEngine.Functions.Function();
```

#### 关键方法重写

需要重写三个关键方法来实现 EVALUATE 功能：

1. **acceptsReference 方法**：设置函数是否接受单元格引用作为参数

```javascript
FactorialFunction.prototype.acceptsReference = function () {
    return true;
}
```

2. **isContextSensitive 方法**：标识函数计算是否依赖于上下文（如当前工作表）

```javascript
FactorialFunction.prototype.isContextSensitive = function () {
    return true;
}
```

3. **evaluate 方法**：实现核心计算逻辑，使用 `evaluateFormula` API 动态计算公式字符串

```javascript
FactorialFunction.prototype.evaluate = function (arg) {
    let formulaString = arg.Lf.arguments[0].value;
    //使用EvaluateFormula()方法来计算公式，而无需在表单的单元格中设置公式
    let value = GC.Spread.Sheets.CalcEngine.evaluateFormula(sheet, formulaString, 0, 0);
    return value;
}
```

#### 函数注册与使用

创建函数实例后，需要通过 `addCustomFunction` 方法将其注册到工作表中，然后就可以像使用内置函数一样使用它：

```javascript
let factorial = new FactorialFunction();
sheet.addCustomFunction(factorial); 
sheet.setFormula(3, 0, '=EVALUATE("SUM(A1:A2)")');
```

### 3.2 UI 交互流程

用户点击"添加一个自定义函数"按钮 → 系统注册 EVALUATE 自定义函数 → 在单元格 A4 中设置公式 `=EVALUATE("SUM(A1:A2)")` → 公式动态计算 A1 和 A2 的和并显示结果

### 3.3 技术栈

* **@grapecity/spread-sheets**: 15.0.0（SpreadJS 核心库）
* **TypeScript**: ^4.1.2（类型支持）
* **SystemJS**: ^0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，可以看到单元格 A1 和 A2 已经预设了值（2 和 3）
2. 点击页面顶部的"添加一个自定义函数"按钮
3. 观察单元格 A4，会显示计算结果 5（即 A1+A2 的和）
4. 可以修改 A1 或 A2 的值，A4 会自动重新计算

## 五、功能特点

### 5.1 优点

* **灵活性高**：可以动态构建和执行任意合法的 SpreadJS 公式
* **Excel 兼容**：实现了 Excel 宏中的 EVALUATE 功能，便于 Excel 文件迁移
* **易于扩展**：基于 SpreadJS 的自定义函数框架，可以方便地添加更多类似功能

### 5.2 局限性与扩展建议

* **错误处理**：当前实现未对非法公式字符串进行错误处理，建议添加 try-catch 包裹 `evaluateFormula` 调用
* **参数扩展**：可以扩展为支持多个参数，实现更复杂的动态计算场景
* **性能优化**：对于频繁调用的场景，可以考虑添加公式缓存机制

## 六、关键代码片段

### evaluateFormula API 的使用

这是实现 EVALUATE 功能的核心 API，它可以在不设置单元格公式的情况下直接计算公式字符串：

```javascript
// 参数说明：
// sheet: 工作表对象
// formulaString: 要计算的公式字符串
// 0, 0: 计算上下文的行列位置（用于相对引用）
let value = GC.Spread.Sheets.CalcEngine.evaluateFormula(sheet, formulaString, 0, 0);
```

### 完整的自定义函数实现

```javascript
function FactorialFunction() {
    this.name = 'EVALUATE';
    this.maxArgs = 1;
    this.minArgs = 1;
};
FactorialFunction.prototype = new GC.Spread.CalcEngine.Functions.Function();

FactorialFunction.prototype.acceptsReference = function () {
    return true;
}

FactorialFunction.prototype.isContextSensitive = function () {
    return true;
}

FactorialFunction.prototype.evaluate = function (arg) {
    let formulaString = arg.Lf.arguments[0].value;
    let value = GC.Spread.Sheets.CalcEngine.evaluateFormula(sheet, formulaString, 0, 0);
    return value;
}
```

## 七、总结

本示例展示了 SpreadJS 自定义函数的强大扩展能力，通过实现 EVALUATE 函数，开发者可以学到以下知识点：

1. 如何继承 `GC.Spread.CalcEngine.Functions.Function` 创建自定义函数
2. 自定义函数的关键方法（acceptsReference、isContextSensitive、evaluate）的作用和实现方式
3. 如何使用 `evaluateFormula` API 动态计算公式字符串
4. 自定义函数的注册和使用流程

该方案适用于需要动态构建公式、实现 Excel 宏功能迁移、或构建公式生成器等场景。通过类似的方式，开发者可以扩展实现更多自定义函数，满足特定业务需求。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
