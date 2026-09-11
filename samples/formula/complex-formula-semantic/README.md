## 一、Demo 概述

本示例展示了如何将 SpreadJS 中的复杂公式进行语义化解析和可视化展示。通过将公式解析为表达式树结构，并以层级缩进的方式展示公式的各个组成部分及其计算结果，帮助用户更直观地理解复杂公式的计算逻辑和执行过程。

该示例包含两个工作簿实例：一个用于展示原始数据和公式，另一个用于展示公式的语义化解析结果。当用户在第一个工作簿中选中包含公式的单元格时，第二个工作簿会自动显示该公式的树形结构分解。

## 二、解决的问题

在实际业务场景中，Excel 公式可能会变得非常复杂，包含多层嵌套函数、运算符和引用。这给公式的理解、调试和维护带来了挑战：

* 复杂公式难以阅读和理解，特别是包含多层嵌套的情况
* 公式调试困难，无法直观看到每个子表达式的计算结果
* 公式审计和验证耗时，需要手动拆解公式逻辑
* 团队协作时，其他人难以快速理解公式的业务逻辑

本示例通过将公式解析为树形结构，并展示每个节点的计算结果，有效解决了这些问题，提供了一种公式可视化和调试的解决方案。

## 三、实现思路

### 3.1 公式表达式树解析

核心技术是使用 SpreadJS 的 CalcEngine API 将公式字符串转换为表达式树对象：

```javascript
function buildExpTree(sheet, formula) {
    return GC.Spread.Sheets.CalcEngine.formulaToExpression(sheet, formula, 0, 0);
}
```

`formulaToExpression` 方法将公式字符串解析为一个表达式对象，该对象包含了公式的完整语法结构，包括运算符、函数、引用、常量等各种表达式类型。

### 3.2 递归遍历表达式树

通过递归函数 `buildExpStrNode` 遍历表达式树的每个节点，并根据节点类型进行不同的处理：

```javascript
function buildExpStrNode(expr, calcStack, indentLevel, sheet) {
    var operatorSymbol = ['+', '-', '%', '+', '-', '*', '/', '^', '&', '=', '<>', '<', '<=', '>', '>=', ':', ',', ' '];
    switch (expr.type) {
        case GC.Spread.CalcEngine.ExpressionType.operator:
            // 处理运算符节点
            var leftExp = expr.value,
                rightExp = expr.value2;
            calcStack.push({
                text: operatorSymbol[expr.operatorType],
                indent: indentLevel,
                value: evaluateExpression(sheet, expr)
            });
            if (leftExp) {
                buildExpStrNode(leftExp, calcStack, indentLevel + 1, sheet);
            }
            if (rightExp) {
                buildExpStrNode(rightExp, calcStack, indentLevel + 1, sheet);
            }
            break;
        case GC.Spread.CalcEngine.ExpressionType.function:
            // 处理函数节点
            calcStack.push({
                text: expr.functionName,
                indent: indentLevel,
                value: evaluateExpression(sheet, expr)
            });
            var args = expr.arguments;
            if (args && args.length > 0) {
                for (var i = 0; i < args.length; i++) {
                    buildExpStrNode(args[i], calcStack, indentLevel + 1, sheet);
                }
            }
            break;
        case GC.Spread.CalcEngine.ExpressionType.reference:
            // 处理引用节点
            calcStack.push({
                text: GC.Spread.Sheets.CalcEngine.expressionToFormula(sheet, expr, 0, 0),
                indent: indentLevel,
                value: evaluateExpression(sheet, expr)
            });
            break;
        default:
            // 处理常量节点
            if (expr.value) {
                calcStack.push({
                    text: expr.value + "",
                    indent: indentLevel,
                    value: evaluateExpression(sheet, expr)
                });
            }
            break;
    }
}
```

该函数根据表达式类型（运算符、函数、引用、常量等）进行分类处理，并使用 `indentLevel` 参数记录节点的层级深度，用于后续的缩进显示。

### 3.3 表达式求值

对于表达式树的每个节点，使用 `evaluateExpression` 函数计算其值：

```javascript
function evaluateExpression(sheet, expr) {
    var formula = GC.Spread.Sheets.CalcEngine.expressionToFormula(sheet, expr, 0, 0);
    if (formula) {
        return GC.Spread.Sheets.CalcEngine.evaluateFormula(sheet, formula, 0, 0);
    }
    return null;
}
```

该函数先将表达式对象转换回公式字符串，然后使用 `evaluateFormula` 方法计算其结果，这样可以展示每个子表达式的实际计算值。

### 3.4 树形结构可视化

将解析后的表达式树数据展示在第二个工作簿中，使用文本缩进和大纲功能实现树形结构：

```javascript
function displayTreeOnSJS(spread, calcStack) {
    var sheet = spread.getActiveSheet();
    sheet.suspendPaint();
    sheet.setDataSource(calcStack);
    for (var i = 0; i < calcStack.length; i++) {
        var item = calcStack[i];
        sheet.getCell(i, 0).textIndent(item.indent);
    }
    initOutlineColumn(sheet);
    sheet.resumePaint();
}

function initOutlineColumn(sheet) {
    sheet.setColumnWidth(0, 500);
    sheet.setColumnWidth(2, 500);
    sheet.frozenColumnCount(1);
    sheet.showRowOutline(false);
    sheet.outlineColumn.options({
        columnIndex: 0,
        showIndicator: true
    });
    sheet.options.isProtected = true;
}
```

通过 `textIndent` 设置单元格的文本缩进，通过 `outlineColumn` 启用大纲列功能，实现可折叠的树形结构展示。

### 3.5 单元格进入事件监听

通过监听 `EnterCell` 事件，实现动态更新公式解析结果：

```javascript
sheet.bind(GC.Spread.Sheets.Events.EnterCell, function(sender, args) {
    var sheet = args.sheet,
        formula = sheet.getFormula(args.row, args.col);
    if (formula) {
        var exp = buildExpTree(sheet, formula),
            calcStack = [];
        buildExpStrNode(exp, calcStack, 0, sheet);
        displayTreeOnSJS(spread1, calcStack)
    }
});
```

当用户选中不同的单元格时，如果该单元格包含公式，则自动解析并更新显示。

### 3.6 技术栈

* @grapecity/spread-sheets 15.0.0 - SpreadJS 核心库
* SystemJS 0.19.22 - 模块加载器
* TypeScript 4.1.2 - 类型支持

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，会看到两个工作簿实例
2. 上方工作簿显示原始数据，包含一个复杂的数字转英文单词的公式
3. 下方工作簿自动显示该公式的语义化解析结果
4. 点击上方工作簿中包含公式的单元格（B2 或 B3），下方工作簿会实时更新显示该公式的树形结构
5. 在下方工作簿中，可以看到公式的每个组成部分及其计算结果，通过缩进层级展示嵌套关系

## 五、功能特点

### 5.1 优点

* 直观展示复杂公式的内部结构，降低理解难度
* 显示每个子表达式的计算结果，便于调试和验证
* 支持所有类型的公式表达式（运算符、函数、引用、常量等）
* 实时响应单元格选择，提供即时反馈
* 使用树形结构和缩进，清晰展示公式的层级关系

### 5.2 局限性与扩展建议

* 当前实现仅支持单个单元格公式的解析，不支持数组公式
* 对于超大型公式，树形展示可能会占用较多空间
* 可以扩展支持公式编辑功能，允许用户在树形视图中修改子表达式
* 可以添加公式性能分析功能，标识计算耗时较长的子表达式
* 可以增加公式依赖关系图，展示单元格之间的引用关系

## 六、总结

本示例展示了 SpreadJS 强大的公式引擎 API，通过 `formulaToExpression`、`expressionToFormula` 和 `evaluateFormula` 等方法，可以实现公式的深度解析和可视化。开发者可以从中学到：

* 如何使用 CalcEngine API 解析公式表达式树
* 如何递归遍历和处理不同类型的表达式节点
* 如何计算子表达式的值
* 如何使用文本缩进和大纲功能实现树形结构展示
* 如何监听单元格事件实现动态交互

该方案适用于需要公式审计、调试、教学或可视化的场景，可以作为 SpreadJS 应用的辅助工具或独立功能模块。通过扩展，还可以实现更多高级功能，如公式优化建议、性能分析、依赖关系图等。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
