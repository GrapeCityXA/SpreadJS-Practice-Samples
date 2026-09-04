## 一、Demo 概述

本示例演示了如何在 SpreadJS 中创建和使用自定义异步函数，并通过一键操作触发工作表中所有异步函数的重新计算。示例创建了两个自定义异步函数（MyFUN_1 和 MyFUN_2），这些函数在工作表中被多次引用，当用户点击按钮时，通过改变单元格值来触发所有依赖该单元格的异步函数重新计算。

该示例适用于需要批量刷新异步数据的场景，例如从服务器获取实时数据、执行耗时计算或更新多个依赖相同数据源的单元格。

## 二、解决的问题

在实际业务中，经常需要在电子表格中使用异步函数来处理耗时操作（如 API 调用、复杂计算等）。本示例解决了以下问题：

- 如何在 SpreadJS 中创建和注册自定义异步函数
- 如何控制异步函数的计算时机（仅在重新计算时执行）
- 如何通过改变依赖单元格的值来批量触发所有异步函数的重新计算
- 如何在异步函数计算过程中显示加载状态

## 三、实现思路

### 3.1 自定义异步函数的创建

通过继承 `GC.Spread.CalcEngine.Functions.AsyncFunction` 类来创建自定义异步函数。每个异步函数需要实现三个关键方法：

```javascript
var MyFun1 = function() {};
MyFun1.prototype = new GC.Spread.CalcEngine.Functions.AsyncFunction("MyFUN_1", 1, 255);

// 设置默认值（加载时显示）
MyFun1.prototype.defaultValue = function() {
    return "Loading...";
};

// 异步计算逻辑
MyFun1.prototype.evaluateAsync = function(context) {
    console.log("MyFun_1 evaluateAsync");
    context.setAsyncResult(Math.random());
};

// 设置计算模式（仅在重新计算时执行）
MyFun1.prototype.evaluateMode = function() {
    return GC.Spread.CalcEngine.Functions.AsyncFunctionEvaluateMode.onRecalculation;
};
```

关键点说明：
- `AsyncFunction` 构造函数的参数：函数名、最小参数数量、最大参数数量
- `defaultValue()` 返回异步计算完成前显示的占位值
- `evaluateAsync()` 执行实际的异步计算，通过 `context.setAsyncResult()` 设置结果
- `evaluateMode()` 设置为 `onRecalculation` 模式，确保函数仅在重新计算时执行

### 3.2 函数注册与使用

将自定义异步函数添加到工作表，并在单元格中使用公式引用：

```javascript
var sheet = spread.sheets[0];
sheet.suspendPaint();

// 设置依赖单元格
sheet.setValue(0, 0, false);
sheet.getCell(0, 0).backColor("lightgreen");

// 注册自定义函数
sheet.addCustomFunction(new MyFun1());
sheet.addCustomFunction(new MyFun2());

// 在多个单元格中使用异步函数
sheet.setFormula(1, 1, "MyFUN_1(A1)");
sheet.setFormula(2, 1, "MyFUN_2(A1)");
sheet.setFormula(3, 1, "MyFUN_1(A1)");
// ... 更多公式引用

sheet.getRange(1, 1, 10, 1).foreColor("red");
sheet.resumePaint();
```

### 3.3 触发机制实现

通过改变依赖单元格（A1）的值来触发所有引用该单元格的异步函数重新计算：

```javascript
$("#trigger").click(function() {
    sheet.setValue(0, 0, !sheet.getValue(0, 0));
});
```

当 A1 单元格的值发生变化时，所有包含 `MyFUN_1(A1)` 和 `MyFUN_2(A1)` 公式的单元格都会触发重新计算，从而执行异步函数的 `evaluateAsync` 方法。

### 3.4 技术栈

- SpreadJS 15.0.0：核心电子表格引擎
- jQuery 3.6.1：用于事件绑定和 DOM 操作
- TypeScript 4.1.2：开发语言支持
- SystemJS：模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，可以看到工作表中 B2:B11 单元格显示红色文字，初始值为 "Loading..."
2. 单元格 A1 显示为绿色背景，这是所有异步函数的依赖单元格
3. 点击页面顶部的"触发所有异步函数重算"按钮
4. 观察控制台输出，可以看到所有异步函数的 `evaluateAsync` 方法被调用
5. B2:B11 单元格的值会更新为随机数（通过 `Math.random()` 生成）
6. 再次点击按钮，可以看到所有异步函数再次执行并更新结果

## 五、功能特点

### 5.1 优点

- 统一触发机制：通过改变单个依赖单元格的值，可以批量触发所有相关异步函数的重新计算
- 计算模式控制：使用 `onRecalculation` 模式避免异步函数在不必要的时候执行，提高性能
- 加载状态提示：通过 `defaultValue()` 方法为用户提供友好的加载提示
- 灵活扩展：可以轻松添加更多自定义异步函数，并通过相同的机制触发

### 5.2 局限性与扩展建议

当前实现使用 `Math.random()` 模拟异步计算，在实际应用中可以扩展为：
- 调用后端 API 获取实时数据
- 执行复杂的异步计算任务
- 从外部数据源（如数据库、文件系统）读取数据
- 添加错误处理机制，处理异步操作失败的情况
- 实现更复杂的依赖关系管理，支持多个触发源

## 六、总结

本示例展示了 SpreadJS 中自定义异步函数的完整实现流程，开发者可以从中学到：

- 如何创建和注册自定义异步函数
- 异步函数的三个核心方法（defaultValue、evaluateAsync、evaluateMode）的作用
- 如何通过依赖单元格的变化触发异步函数的批量重新计算
- 如何控制异步函数的执行时机以优化性能

该方案适用于需要批量刷新异步数据的场景，具有良好的扩展性，可以根据实际业务需求定制异步函数的计算逻辑。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/JL8NbZf-_EGDLV-7uK_xDg/)）
