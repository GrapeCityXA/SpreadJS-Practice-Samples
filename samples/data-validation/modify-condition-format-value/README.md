## 一、Demo 概述

本示例演示了如何在 SpreadJS 中动态修改已存在的条件格式规则的基准值。通过点击按钮，可以将条件格式的判断条件从"大于 5 显示绿色背景"修改为"大于 8 显示绿色背景"，实现了条件格式规则的运行时动态调整。

## 二、解决的问题

在实际业务场景中，条件格式的判断标准可能需要根据业务规则动态调整。例如：

* 数据分析场景中，需要根据不同的阈值标准高亮显示数据
* 报表系统中，用户可能需要自定义预警值
* 动态调整数据可视化的显示规则

本示例展示了如何在不重新创建条件格式的情况下，直接修改现有规则的判断基准值。

## 三、实现思路

### 3.1 初始化条件格式规则

在工作表初始化时，创建一个基于单元格值的条件格式规则，设置大于 5 的单元格显示绿色背景：

```javascript
var cfs = sheet.conditionalFormats;
var style = new GC.Spread.Sheets.Style();
style.backColor = '#CCFFCC';
cfs.addCellValueRule(
    GC.Spread.Sheets.ConditionalFormatting.ComparisonOperators.greaterThan, 
    5, 
    0, 
    style, 
    [new GC.Spread.Sheets.Range(1, 0, 10, 1)]
);
```

这段代码创建了一个条件格式规则，应用于 A2:A11 单元格区域（Range(1, 0, 10, 1)），当单元格值大于 5 时显示浅绿色背景。

### 3.2 动态修改条件格式基准值

通过按钮点击事件，获取现有规则并修改其判断基准值：

```javascript
$("#btn").click(function () {
    var cfs = sheet.conditionalFormats;
    var rule = cfs.getRules()[0];  // 获取第一个条件格式规则
    rule.value1(8);                 // 修改基准值为 8
    rule.condition(null);           // 重置条件
    cfs.clearRule();                // 清除所有规则
    cfs.addRule(rule);              // 重新添加修改后的规则
});
```

关键步骤说明：

1. `getRules()[0]` \- 获取工作表中的第一个条件格式规则对象
2. `value1(8)` \- 将比较基准值从 5 修改为 8
3. `condition(null)` \- 重置条件状态，确保规则正确更新
4. `clearRule()` \- 清除现有的所有条件格式规则
5. `addRule(rule)` \- 将修改后的规则重新添加到工作表

### 3.3 技术栈

* SpreadJS 15.0.0 - 核心表格组件
* jQuery 3.6.1 - 用于事件绑定
* TypeScript 4.1.2 - 开发语言
* SystemJS - 模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，可以看到 A 列显示了 0-9 的数值
2. 初始状态下，值大于 5 的单元格（6、7、8、9）显示绿色背景
3. 点击"修改"按钮
4. 条件格式规则更新，现在只有值大于 8 的单元格（9）显示绿色背景

## 五、功能特点

### 5.1 优点

* 无需重新创建条件格式，直接修改现有规则，性能更优
* 代码简洁，通过 API 直接操作规则对象
* 支持运行时动态调整，适合交互式应用场景

### 5.2 局限性与扩展建议

当前实现通过 `clearRule()` 和 `addRule()` 的方式更新规则，如果工作表中有多个条件格式规则，需要注意：

* `clearRule()` 会清除所有规则，如果只想修改特定规则，需要先保存其他规则
* 可以扩展为支持修改多个规则的场景
* 可以添加输入框让用户自定义基准值，而不是硬编码为 8

扩展建议：

```javascript
// 只修改特定规则，保留其他规则
var allRules = cfs.getRules();
var targetRule = allRules[0];
targetRule.value1(newValue);
targetRule.condition(null);
cfs.clearRule();
allRules.forEach(rule => cfs.addRule(rule));
```

## 六、关键代码片段

完整的条件格式修改逻辑：

```javascript
// 初始化数据和条件格式
function initSpread(spread) {
    var sheet = spread.getActiveSheet();
    sheet.setValue(0, 0, 'value');
    for (let i = 0; i < 10; i++) {
        sheet.setValue(i + 1, 0, i);
    }

    // 创建条件格式：大于 5 显示绿色
    var cfs = sheet.conditionalFormats;
    var style = new GC.Spread.Sheets.Style();
    style.backColor = '#CCFFCC';
    cfs.addCellValueRule(
        GC.Spread.Sheets.ConditionalFormatting.ComparisonOperators.greaterThan, 
        5, 
        0, 
        style, 
        [new GC.Spread.Sheets.Range(1, 0, 10, 1)]
    );

    // 按钮点击修改基准值为 8
    $("#btn").click(function () {
        var cfs = sheet.conditionalFormats;
        var rule = cfs.getRules()[0];
        rule.value1(8);
        rule.condition(null);
        cfs.clearRule();
        cfs.addRule(rule);
    });
}
```

## 七、总结

本示例展示了 SpreadJS 条件格式的动态修改能力，开发者可以学到：

* 如何使用 `addCellValueRule` 创建基于单元格值的条件格式
* 如何通过 `getRules()` 获取现有的条件格式规则对象
* 如何使用 `value1()` 方法修改规则的比较基准值
* 条件格式规则的更新流程：获取规则 → 修改属性 → 清除旧规则 → 添加新规则

该方案适用于需要根据用户交互或业务逻辑动态调整数据高亮规则的场景，具有良好的扩展性，可以进一步封装为通用的条件格式管理工具。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
