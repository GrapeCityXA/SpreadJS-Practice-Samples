## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现自定义数据校验功能。通过继承 `ConditionalFormatting.Condition` 类，开发者可以创建自定义的校验规则，对特定列的数据进行验证。示例中实现了对"数值"列的数字类型校验，当用户输入非数字值时，系统会自动圈选提醒，帮助用户快速识别和修正错误数据。

该示例适用于需要对表格数据进行严格格式控制的场景，如财务报表、数据录入系统等。

## 二、解决的问题

* 数据录入规范性：确保用户在特定列中只能输入符合要求的数据类型（如数值列只能输入数字）
* 错误数据可视化：通过高亮显示的方式，让用户直观地看到哪些单元格的数据不符合规则
* 灵活的校验逻辑：支持开发者根据业务需求自定义复杂的校验条件，不局限于 SpreadJS 内置的校验类型

## 三、实现思路

### 3.1 自定义校验条件类

核心是创建一个继承自 `GC.Spread.Sheets.ConditionalFormatting.Condition` 的自定义类，并重写 `evaluate` 方法来定义校验逻辑：

```javascript
function CustomerCondition() {
    var self = this;
    // 当前自定义条件名称
    self.conditionType = "CustomerCondition";
}
CustomerCondition.prototype = new GC.Spread.Sheets.ConditionalFormatting.Condition();
CustomerCondition.prototype.evaluate = function (evaluator, baseRow, baseColumn, actualValue) {
    // 在此设置判断条件，非数判断
    if (isNaN(parseFloat(actualValue))) {
        return false;  // 不符合条件
    } else {
        return true;   // 符合条件
    }
}
```

`evaluate` 方法接收四个参数：

* `evaluator`：计算器对象
* `baseRow`：基准行索引
* `baseColumn`：基准列索引
* `actualValue`：待校验的单元格值

返回 `true` 表示数据有效，返回 `false` 表示数据无效。

### 3.2 应用数据校验器

创建 `DefaultDataValidator` 实例并配置校验规则，然后应用到指定列：

```javascript
// 先设置高亮显示
spread.options.highlightInvalidData = true;

// 创建校验条件，自定义
var cCondition = new CustomerCondition();
var validator1 = new GC.Spread.Sheets.DataValidation.DefaultDataValidator(cCondition);
validator1.ignoreBlank(false);  // 不忽略空白单元格
validator1.type(GC.Spread.Sheets.DataValidation.CriteriaType.custom);

// 应用到第2列（索引为1）的所有行（-1表示所有行）
sheet.setDataValidator(-1, 1, validator1);
```

关键配置：

* `highlightInvalidData`：启用无效数据高亮显示
* `ignoreBlank(false)`：空白单元格也会被校验
* `setDataValidator(-1, 1, validator1)`：第一个参数 `-1` 表示应用到整列

### 3.3 技术栈

* SpreadJS 15.0.0：核心电子表格组件
* TypeScript 4.1.2：开发语言
* SystemJS 0.19.22：模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，可以看到一个包含"名称"和"数值"两列的表格
2. 观察"数值"列中的数据，其中 `'非法值'` 和空字符串 `""` 会被红色圈选标记
3. 尝试在"数值"列的空白单元格中输入非数字内容（如文本），单元格会立即显示红色圈选提醒
4. 输入有效的数字，圈选标记会自动消失

## 五、功能特点

### 5.1 优点

* 灵活性高：通过继承 `Condition` 类，可以实现任意复杂的校验逻辑
* 实时反馈：用户输入后立即显示校验结果，无需额外操作
* 视觉直观：通过红色圈选标记，用户可以快速定位错误数据
* 易于扩展：可以为不同列设置不同的校验规则

### 5.2 局限性与扩展建议

* 当前示例只实现了数字类型校验，可以扩展为更复杂的规则（如日期格式、正则表达式匹配等）
* 可以添加自定义错误提示信息，在用户输入无效数据时显示具体的错误原因
* 可以结合 `InputMessage` 和 `ErrorMessage` 提供更友好的用户提示

## 六、关键代码片段

### 数据绑定与合并单元格

```javascript
function initSpread(spread, data) {
    spread.suspendPaint();
    const sheet = spread.getActiveSheet();
    sheet.reset();
    
    const colInfos = [{
        name: 'name',
        displayName: '名称',
        size: 100,
    }, {
        name: 'value',
        displayName: '数值',
        size: 100,
    }];
    
    sheet.setDataSource(data);
    sheet.bindColumns(colInfos);
    
    // 合并相同名称的单元格
    const merges = addSpanShow(data, ['name'], [0]);
    merges.forEach((item) => {
        const { row, col, rowspan, colspan } = item;
        sheet.addSpan(row, col, rowspan, colspan);
        sheet.getCell(row, col).vAlign(GC.Spread.Sheets.VerticalAlign.center);
    });
    
    spread.resumePaint();
}
```

该函数展示了如何使用 `setDataSource` 和 `bindColumns` 进行数据绑定，以及如何通过 `addSpan` 实现单元格合并。

## 七、总结

本示例展示了 SpreadJS 自定义数据校验的核心实现方法，开发者可以从中学到：

1. 如何继承 `ConditionalFormatting.Condition` 类创建自定义校验条件
2. 如何使用 `DefaultDataValidator` 配置和应用校验规则
3. 如何启用无效数据的高亮显示功能
4. 如何将校验器应用到特定的行或列

该方案适用于需要对用户输入进行严格控制的场景，通过自定义校验逻辑，可以满足各种复杂的业务需求。开发者可以在此基础上扩展更多校验规则，如日期范围校验、字符串长度限制、正则表达式匹配等，构建更加健壮的数据录入系统。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
