## 一、Demo 概述

本示例演示了如何在 SpreadJS 中创建一个支持引用区域参数的自定义函数，并将引用区域的计算结果拼接到字符串模板中。该功能允许开发者在自定义函数中接收单元格引用作为参数，获取引用区域的实际值进行计算，然后将计算结果动态替换到字符串模板的占位符中，最终返回拼接后的字符串。

这种技术在需要构建动态查询字符串、生成带参数的 URL 或构造复杂表达式时非常有用，特别适合需要将表格数据与外部系统（如数据库查询、API 调用）进行集成的场景。

## 二、解决的问题

* **动态字符串拼接**：在公式中需要将单元格引用的计算结果动态插入到字符串模板中，而不是直接显示引用地址
* **引用区域处理**：自定义函数默认接收的是引用区域的值，而非引用对象本身，无法获取引用区域的行列信息进行自定义计算
* **灵活的参数替换**：支持在字符串模板中使用占位符，根据传入的不同参数类型（引用区域或表达式）进行相应的处理和替换

## 三、实现思路

### 3.1 启用引用参数接收

自定义函数默认接收的是参数的计算值，要获取引用区域对象，需要重写 `acceptsReference` 方法：

```javascript
TestFunction.prototype.acceptsReference = function () {
    return true;
};
```

返回 `true` 后，当函数参数是单元格引用时，将接收到引用对象而非计算值，该对象包含 `getRow()`、`getColumn()`、`getRowCount()`、`getColumnCount()` 等方法。

### 3.2 解析字符串模板占位符

使用正则表达式提取字符串模板中的单引号占位符：

```javascript
function getArgsArr(str) {
    var result = str.match(/\\'(.*?)'/g);
    if (result)
        return result.map(function (element) {
            return element;
        });
}
```

该函数匹配所有 `'arg'` 格式的占位符，返回占位符数组，用于后续的参数替换。

### 3.3 区分引用类型和表达式类型参数

在自定义函数的 `evaluate` 方法中，通过检查参数是否具有 `getRow` 方法来判断参数类型：

```javascript
TestFunction.prototype.evaluate = function (arg1) {
    var result = arg1;
    if (arguments.length > 1) {
        var args = getArgsArr(result);
        if (args && args.length > 0) {
            for (let i = 0; i < args.length; i++) {
                if (arguments[i + 1]) {
                    let _arg = arguments[i + 1];
                    // 如果参数是引用类型，获取引用区域
                    if (_arg.getRow) {
                        let row = _arg.getRow();
                        let col = _arg.getColumn();
                        let rowCount = _arg.getRowCount();
                        let colCount = _arg.getColumnCount();
                        let val = 1;
                        // 这里用累乘演示
                        for (let r = row; r < row + rowCount; r++) {
                            for (let c = col; c < col + colCount; c++) {
                                val *= sheet.getValue(r, c);
                            }
                        }
                        result = result.replace(args[i], val);
                    } else {
                        // 如果参数是表达式，直接拼接结果即可
                        result = result.replace(args[i], _arg);
                    }
                }
            }
        }
    }
    return result;
};
```

* **引用类型参数**：遍历引用区域的所有单元格，进行累乘计算（示例中使用累乘，实际可根据需求修改），然后将计算结果替换到占位符位置
* **表达式类型参数**：直接将表达式的计算结果替换到占位符位置

### 3.4 技术栈

* SpreadJS 15.0.0
* SystemJS 0.19.22（模块加载）
* TypeScript 4.1.2

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，表格会自动初始化，A 列显示数值 1-5
2. 查看 C4 单元格，显示演示 1 的结果：`cube('arg1')||entity{19594}->period{'arg2'}` 中的占位符被替换为 A1:A5 的累乘结果（120）和 A1+A5 的结果（6）
3. 查看 C5 单元格，显示演示 2 的结果：占位符被替换为 A2\*A5 的结果（10）和 SUM(A1:A3) 的结果（6）

## 五、功能特点

### 5.1 优点

* **灵活的参数处理**：同时支持引用区域和表达式参数，自动识别参数类型并进行相应处理
* **动态字符串构建**：可以根据表格数据动态生成复杂的字符串表达式，适合与外部系统集成
* **可扩展性强**：累乘计算只是示例，开发者可以根据实际需求修改引用区域的计算逻辑（如求和、求平均、拼接等）

### 5.2 局限性与扩展建议

* **占位符格式固定**：当前实现仅支持单引号格式的占位符，可以扩展支持更多占位符格式（如 `{arg}` 或 `$arg`）
* **计算逻辑单一**：示例中对引用区域使用累乘计算，实际应用中可能需要根据占位符名称或位置选择不同的计算方式
* **错误处理缺失**：建议增加参数数量校验和占位符匹配校验，避免参数不匹配导致的错误

## 六、关键代码片段

### 自定义函数定义

```javascript
function TestFunction() {
    this.name = "TEST";
    this.maxArgs = 100;
    this.minArgs = 1;
}
TestFunction.prototype = new GC.Spread.CalcEngine.Functions.Function();
```

定义了一个名为 `TEST` 的自定义函数，支持 1-100 个参数。

### 公式使用示例

```javascript
sheet.setFormula(3, 2, '=test("cube(\\'arg1\\')||entity{19594}->period{\\'arg2\\'}",A1:A5,A1+A5)');
sheet.setFormula(4, 2, '=test("cube(\\'参数\\')||entity{19594}->period{\\'anyString\\'}",A2*A5, SUM(A1:A3))');
```

第一个参数是字符串模板，包含占位符；后续参数可以是引用区域（如 `A1:A5`）或表达式（如 `A1+A5`、`SUM(A1:A3)`）。

## 七、总结

本示例展示了 SpreadJS 自定义函数的高级用法，通过启用引用参数接收功能，开发者可以在自定义函数中获取单元格引用的详细信息，进行自定义计算后动态拼接到字符串模板中。

开发者可以从中学到：

1. 如何通过 `acceptsReference` 方法让自定义函数接收引用对象
2. 如何使用正则表达式解析字符串模板中的占位符
3. 如何区分引用类型参数和表达式类型参数
4. 如何遍历引用区域的单元格并进行自定义计算
5. 如何实现动态字符串拼接功能

该方案适用于需要将表格数据与外部系统集成的场景，如构建数据库查询语句、生成 API 请求 URL、构造复杂的业务表达式等，具有很强的实用性和扩展性。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
