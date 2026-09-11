## 一、Demo 概述

本示例展示了如何在 SpreadJS Designer 中添加自定义公式函数，并将其集成到工具栏的公式下拉列表和插入函数对话框中。示例实现了一个名为 `FACTORIAL` 的自定义阶乘函数，演示了从函数定义、注册到 UI 集成的完整流程。

该示例适用于需要扩展 SpreadJS 内置函数库的场景，例如添加企业特定的业务计算公式、数学算法或自定义数据处理函数。

## 二、解决的问题

* **扩展公式库**：SpreadJS 内置函数无法满足特定业务需求时，需要添加自定义计算逻辑
* **UI 集成**：自定义函数需要像内置函数一样出现在工具栏和插入函数对话框中，方便用户使用
* **函数描述**：为自定义函数提供中文描述和参数说明，提升用户体验

## 三、实现思路

### 3.1 定义自定义函数类

通过继承 `GC.Spread.CalcEngine.Functions.Function` 创建自定义函数类，实现阶乘计算逻辑：

```javascript
function FactorialFunction() {
    this.name = "FACTORIAL";
    this.maxArgs = 1;
    this.minArgs = 1;
    this.description = function () {
        return {
            description: "菲波那切数列",
            parameters: [
                {
                    name: 'number01',
                    repeatable: false,
                    optional: false
                }
            ]
        }
    }
}
FactorialFunction.prototype = new GC.Spread.CalcEngine.Functions.Function();
FactorialFunction.prototype.evaluate = function (arg) {
    var result = 1;
    if (arguments.length === 1 && !isNaN(parseInt(arg))) {
        for (var i = 1; i <= arg; i++) {
            result = i * result;
        }
        return result;
    }
    return "#VALUE!";
};
```

关键点：

* `name` 属性定义函数名称
* `maxArgs` 和 `minArgs` 限制参数数量
* `description` 方法返回函数的中文描述和参数信息
* `evaluate` 方法实现具体的计算逻辑，参数错误时返回 `#VALUE!` 错误

### 3.2 注册全局自定义函数

使用 `defineGlobalCustomFunction` 将函数注册到 SpreadJS 计算引擎：

```javascript
GC.Spread.CalcEngine.Functions.defineGlobalCustomFunction("FACTORIAL", new FactorialFunction());
```

### 3.3 修改插入函数对话框模板

通过递归遍历模板树，将自定义函数添加到"数学与三角函数"分类：

```javascript
function customFontFamilyInFormatDialogTemplate(templateNode) {
    if (templateNode.bindingPath && templateNode.bindingPath === 'functionDesc.mathAndTrigonometryFunction' && templateNode.items) {
        templateNode.items.unshift({ text: "FACTORIAL", value: "FACTORIAL" })
        return
    }
    let nodes = templateNode.content || templateNode.children;
    if (nodes && nodes instanceof Array) {
        nodes.forEach((subNode) => customFontFamilyInFormatDialogTemplate(subNode))
    }
}
let tamplate = GC.Spread.Sheets.Designer.getTemplate(GC.Spread.Sheets.Designer.TemplateNames.InsertFunctionDialogTemplate)
customFontFamilyInFormatDialogTemplate(tamplate)
GC.Spread.Sheets.Designer.registerTemplate(GC.Spread.Sheets.Designer.TemplateNames.InsertFunctionDialogTemplate, tamplate)
```

### 3.4 添加到工具栏下拉列表

修改 Designer 配置，将自定义函数添加到工具栏的"数学与三角函数"下拉列表顶部：

```javascript
let designerConfig = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig));
let formulaMathTrigCmd = GC.Spread.Sheets.Designer.getCommand("formulaMathTrig");
let customFormula = [
    { value: "FACTORIAL", text: "FACTORIAL" }
];
formulaMathTrigCmd.dropdownList = customFormula.concat(formulaMathTrigCmd.dropdownList);
designerConfig.commandMap = {};
designerConfig.commandMap["formulaMathTrig"] = formulaMathTrigCmd

designer = new GC.Spread.Sheets.Designer.Designer("designer-container", designerConfig)
```

### 3.5 技术栈

* SpreadJS 16.0.1（核心表格引擎）
* SpreadJS Designer 16.0.1（设计器组件）
* TypeScript 4.1.2（开发语言）
* SystemJS 0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 使用本地服务器打开 index.html（如 Live Server）
```

### 4.2 操作步骤

1. 打开页面后，在 SpreadJS Designer 界面中点击工具栏的"公式"选项卡
2. 点击"数学与三角函数"下拉按钮，可以看到 `FACTORIAL` 函数出现在列表顶部
3. 在单元格中输入 `=FACTORIAL(5)`，按回车键，单元格显示 `120`（5 的阶乘）
4. 点击"插入函数"按钮，在对话框的"数学与三角函数"分类中可以找到 `FACTORIAL` 函数及其中文描述

## 五、功能特点

### 5.1 优点

* **完整的 UI 集成**：自定义函数与内置函数体验一致，用户无需记忆函数名
* **灵活的分类管理**：可以将函数添加到任意内置分类中
* **中文化支持**：支持为函数提供中文描述和参数说明
* **可扩展性强**：可以轻松添加多个自定义函数

### 5.2 局限性与扩展建议

* **模板修改复杂**：需要通过 `bindingPath` 定位模板节点，调试成本较高
* **扩展建议**：可以创建独立的自定义函数分类，避免与内置分类混合；可以为复杂函数添加参数验证和错误提示

## 六、关键代码片段

### 函数注册到 Workbook

除了全局注册，还需要将函数实例添加到具体的 Workbook 中：

```javascript
var factorial = new FactorialFunction();
spread.addCustomFunction(factorial)
```

这确保了函数在当前工作簿中可用。

## 七、总结

本示例展示了 SpreadJS 自定义函数的完整开发流程，开发者可以学到：

* 如何定义符合 SpreadJS 规范的自定义函数类
* 如何修改 Designer 模板和配置实现 UI 集成
* 如何为自定义函数提供中文化描述
* 如何将函数注册到全局和工作簿实例

该方案适用于需要扩展 SpreadJS 计算能力的场景，通过简单的配置即可让自定义函数像内置函数一样易用。开发者可以基于此模式添加更多业务相关的计算函数，构建企业级的表格应用。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
