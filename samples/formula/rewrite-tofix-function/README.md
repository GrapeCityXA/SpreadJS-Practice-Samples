## 一、Demo 概述

本示例展示了如何通过重写 JavaScript 原生的 `toFixed()` 和 `toPrecision()` 方法来解决 SpreadJS 中浮点数精度过高导致的显示和计算问题。同时演示了 SpreadJS 的核心功能，包括基本公式应用、INDIRECT 函数、自定义函数、数组公式以及异步函数的实现。

该示例适用于需要精确控制数值精度的财务报表、数据统计等场景，特别是在处理大量浮点数运算时，可以有效避免 JavaScript 浮点数精度问题带来的显示异常。

## 二、解决的问题

* **浮点数精度溢出**：JavaScript 原生的 `toFixed()` 和 `toPrecision()` 方法在处理高精度浮点数时可能导致精度溢出，影响 SpreadJS 单元格的显示效果
* **公式计算精度控制**：在复杂的公式计算场景中，需要统一控制数值精度，避免出现过长的小数位数
* **动态引用需求**：通过 INDIRECT 函数实现单元格的动态引用，提升公式的灵活性
* **业务逻辑封装**：通过自定义函数将特定业务逻辑（如三角形面积计算）封装为可复用的公式函数

## 三、实现思路

### 3.1 核心技术点

#### 重写 Number.prototype.toFixed 方法

通过重写 JavaScript 原生的 `toFixed()` 方法，限制精度最大值为 11 位，防止精度溢出导致的显示问题。

```javascript
var toFixFn = Number.prototype.toFixed;
Number.prototype.toFixed = function (precision) {
    precision = Math.min(11, precision);
    return toFixFn.apply(this, arguments);
}
```

这段代码保存了原始的 `toFixed` 方法引用，然后重写原型方法，在调用原方法前先将精度参数限制在 11 以内。

#### 重写 Number.prototype.toPrecision 方法

同样的思路应用于 `toPrecision()` 方法，确保数值精度的统一控制。

```javascript
var toPrecisionFn = Number.prototype.toPrecision;
Number.prototype.toPrecision = function (precision) {
    precision = Math.min(11, precision);
    var number = toPrecisionFn.apply(this, arguments);
    return number;
}
```

#### 基本公式应用

示例中使用了多种 SpreadJS 内置公式，包括统计函数和条件计数函数：

```javascript
sheet.setFormula(9, 2, '=AVERAGE(C4:C8)');  // 平均值
sheet.setFormula(10, 2, '=SUM(C4:C8)');     // 求和
sheet.setFormula(11, 2, '=MAX(C4:C8)');     // 最大值
sheet.setFormula(12, 2, '=MIN(C4:C8)');     // 最小值
sheet.setFormula(13, 2, 'COUNTIF(B4:B8,"*杨*")');  // 包含"杨"的计数
sheet.setFormula(14, 2, 'COUNTIF(B4:B8,"杨*")');   // 以"杨"开头的计数
```

#### INDIRECT 函数动态引用

INDIRECT 函数可以将文本字符串转换为单元格引用，实现动态引用：

```javascript
sheet.setFormula(5, 6, '=INDIRECT("E1")');           // 直接引用
sheet.setFormula(6, 6, '=INDIRECT("B3")');           // 直接引用
sheet.setFormula(7, 6, '=INDIRECT("E"&(1+2))');      // 拼接引用
sheet.setFormula(8, 6, '=INDIRECT(E4)');             // 通过单元格值引用
```

#### 自定义函数实现

通过继承 `GC.Spread.CalcEngine.Functions.Function` 创建自定义函数，封装三角形面积计算逻辑：

```javascript
function calcuArea() {
    this.name = "area";
    this.maxArgs = 2;
    this.minArgs = 2;
}
calcuArea.prototype = new GC.Spread.CalcEngine.Functions.Function();
calcuArea.prototype.evaluate = function (arg1, arg2) {
    if (arguments.length == 2 && !isNaN(parseInt(arg1)) && !isNaN(parseInt(arg2))) {
        return (arg1 * arg2) / 2;
    }
    return "#value"
};
var area = new calcuArea();
sheet2.addCustomFunction(area);
sheet2.setFormula(3, 4, "=area(C4,D4)");
```

#### 数组公式批量计算

使用 `setArrayFormula` 方法对多个单元格同时应用公式，提升计算效率：

```javascript
sheet2.setArrayFormula(4, 4, 3, 1, "=(C5:C7*D5:D7)/2");
```

这行代码会在 E5:E7 三个单元格中分别计算对应行的三角形面积。

#### 异步函数实现

通过继承 `AsyncFunction` 实现异步计算函数，适用于耗时操作或需要延迟更新的场景：

```javascript
var asyncSum = function () {
    this.name = "asyncArea";
    this.maxArgs = 2;
    this.minArgs = 2;
};
asyncSum.prototype = new GC.Spread.CalcEngine.Functions.AsyncFunction("ASUM", 1, 10);
asyncSum.prototype.defaultValue = function () {
    return "计算中...";
};
asyncSum.prototype.evaluateAsync = function (context) {
    var args = arguments;
    var result = 0;
    setTimeout(function () {
        result = (args[1] * args[2]) / 2;
        context.setAsyncResult(result);
    }, 3000);
};
```

异步函数在计算完成前会显示默认值"计算中..."，3 秒后更新为实际计算结果。

### 3.2 技术栈

* SpreadJS 15.0.0：核心电子表格组件
* jQuery 3.6.1：DOM 操作和事件处理
* SystemJS 0.19.22：模块加载器
* TypeScript 4.1.2：类型支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开 index.html 文件，页面会自动加载 SpreadJS 组件
2. 第一个工作表展示基本公式和 INDIRECT 函数的使用效果
3. 切换到第二个工作表查看自定义函数、数组公式和异步函数的演示
4. 观察异步函数单元格，会先显示"计算中..."，3 秒后显示计算结果
5. 查看"当前时间"单元格，每秒自动更新一次

## 五、功能特点

### 5.1 优点

* **精度控制**：通过重写原生方法，从根源上解决浮点数精度问题，适用于所有 SpreadJS 计算场景
* **函数扩展性强**：支持自定义同步/异步函数，可以封装复杂业务逻辑
* **批量计算高效**：数组公式可以一次性对多个单元格应用相同计算逻辑
* **动态引用灵活**：INDIRECT 函数支持通过字符串拼接和单元格值动态构建引用

### 5.2 局限性与扩展建议

* **全局影响**：重写 Number 原型方法会影响整个应用的数值处理，需要谨慎评估影响范围
* **异步函数性能**：频繁触发异步函数（如示例中的 setInterval）可能影响性能，建议根据实际需求优化触发频率
* **扩展建议**：可以考虑将精度限制值（11）配置化，支持不同场景的精度需求

## 六、关键代码片段

### 浮点数精度控制

```javascript
// 保存原始方法引用
var toFixFn = Number.prototype.toFixed;
var toPrecisionFn = Number.prototype.toPrecision;

// 重写 toFixed 方法，限制最大精度为 11
Number.prototype.toFixed = function (precision) {
    precision = Math.min(11, precision);
    return toFixFn.apply(this, arguments);
}

// 重写 toPrecision 方法，限制最大精度为 11
Number.prototype.toPrecision = function (precision) {
    precision = Math.min(11, precision);
    var number = toPrecisionFn.apply(this, arguments);
    return number;
}
```

### 自定义函数注册

```javascript
// 定义函数构造器
function calcuArea() {
    this.name = "area";
    this.maxArgs = 2;
    this.minArgs = 2;
}

// 继承 SpreadJS 函数基类
calcuArea.prototype = new GC.Spread.CalcEngine.Functions.Function();

// 实现计算逻辑
calcuArea.prototype.evaluate = function (arg1, arg2) {
    if (arguments.length == 2 && !isNaN(parseInt(arg1)) && !isNaN(parseInt(arg2))) {
        return (arg1 * arg2) / 2;
    }
    return "#value"
};

// 注册到工作表
var area = new calcuArea();
sheet2.addCustomFunction(area);
```

## 七、总结

本示例展示了 SpreadJS 在处理浮点数精度问题时的解决方案，以及公式系统的多种高级用法。开发者可以从中学到：

* 如何通过重写 JavaScript 原生方法解决浮点数精度问题
* SpreadJS 内置公式的使用方法（统计函数、条件函数、动态引用函数）
* 自定义同步/异步函数的实现和注册流程
* 数组公式的批量计算应用
* 异步函数在实时数据更新场景中的应用

该方案适用于需要精确控制数值精度的财务、统计类应用，同时为复杂业务逻辑的封装提供了灵活的扩展机制。开发者可以根据实际需求调整精度限制值，或扩展更多自定义函数来满足特定业务场景。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
