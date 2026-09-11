## 一、Demo 概述

本示例演示如何在 SpreadJS 中统计选中区域内通过条件格式规则验证的单元格数量。通过遍历选中区域的每个单元格，检查其应用的条件格式规则，并使用 `evaluate()` 方法判断单元格值是否满足规则条件，最终返回符合条件的单元格总数。

该功能适用于需要快速统计数据验证结果的场景，例如质量检查、数据审核等业务需求。

## 二、解决的问题

在实际业务中，用户经常需要了解数据表中有多少单元格满足特定的条件格式规则。例如：

* 统计销售数据中有多少单元格的值大于目标值（显示为绿色）
* 检查财务报表中有多少异常数据（通过条件格式标记）
* 验证数据录入的准确性，统计符合验证规则的单元格数量

手动检查大量数据既耗时又容易出错，本示例提供了一种编程方式来自动化这一过程。

## 三、实现思路

### 3.1 核心技术点

#### 获取选中区域的条件格式规则

通过 `sheet.conditionalFormats.getRules(row, col)` 方法获取指定单元格应用的所有条件格式规则：

```javascript
var rules = sheet.conditionalFormats.getRules(i, j);
if (rules && rules.length) {
    // 处理规则
}
```

该方法返回一个规则数组，如果单元格没有应用条件格式，则返回空数组或 null。

#### 使用 evaluate() 方法验证规则

条件格式规则对象提供了 `evaluate()` 方法，用于判断单元格值是否满足规则条件：

```javascript
if (rule.evaluate(sheet, 0, 0, sheet.getValue(i, j))) {
    count++;
    break;
}
```

`evaluate()` 方法的参数说明：

* 第一个参数：工作表对象
* 第二、三个参数：基准行列索引（通常为 0, 0）
* 第四个参数：要验证的单元格值

如果单元格值满足规则条件，方法返回 `true`，否则返回 `false`。

#### 遍历选中区域并统计

核心函数 `getPassConditionCount()` 通过双重循环遍历选中区域的所有单元格：

```javascript
function getPassConditionCount(sheet, row, col, rowCount, colCount) {
    var count = 0;
    
    for (var i = row; i < row + rowCount; i++) {
        for (var j = col; j < col + colCount; j++) {
            var rules = sheet.conditionalFormats.getRules(i, j);
            if (rules && rules.length) {
                for (var k = 0; k < rules.length; k++) {
                    var rule = rules[k];
                    if (rule.evaluate(sheet, 0, 0, sheet.getValue(i, j))) {
                        count++;
                        break; // 单元格只计数一次
                    }
                }
            }
        }
    }
    
    return count;
}
```

注意使用 `break` 语句确保每个单元格只被计数一次，即使它满足多个条件格式规则。

### 3.2 UI 交互流程

用户操作流程：

1. 在工作表中选择一个或多个单元格区域
2. 点击"获取选中区域通过条件格式验证数量"按钮
3. 系统自动统计选中区域内满足条件格式规则的单元格数量
4. 通过 alert 弹窗显示统计结果

### 3.3 技术栈

* SpreadJS 15.0.0：核心电子表格组件
* SystemJS 0.19.22：模块加载器
* TypeScript 4.1.2：开发语言（编译为 JavaScript）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开示例页面，工作表中已预设了条件格式规则（大于 0 的单元格显示为绿色）
2. 使用鼠标选择要统计的单元格区域
3. 点击页面顶部的"获取选中区域通过条件格式验证数量"按钮
4. 查看弹窗显示的统计结果

测试建议：

* 尝试选择不同的区域，观察统计结果的变化
* 修改单元格的值，验证统计功能的准确性
* 在 `template.js` 中添加更多条件格式规则进行测试

## 五、功能特点

### 5.1 优点

* 自动化统计：无需手动检查，快速获取统计结果
* 支持多规则：可以处理单元格应用多个条件格式规则的情况
* 灵活选择：支持任意区域的选择和统计
* 准确可靠：使用 SpreadJS 官方 API，确保验证逻辑的准确性

### 5.2 局限性与扩展建议

当前实现的局限性：

* 只统计通过验证的单元格数量，不区分具体是哪个规则
* 使用 alert 弹窗显示结果，用户体验有待提升

扩展建议：

* 返回详细的统计信息，包括每个规则的匹配数量
* 将结果显示在页面的专用区域，而不是使用 alert
* 支持导出统计报告
* 添加高亮显示功能，标记出通过验证的单元格

## 六、关键代码片段

### 条件格式规则定义

在 `template.js` 中定义的条件格式规则示例：

```javascript
"conditionalFormats": {
    "rules": [{
        "ruleType": 1,           // 单元格值规则
        "style": {
            "foreColor": "green"  // 满足条件时文字显示为绿色
        },
        "operator": 2,            // 大于操作符
        "priority": 2,
        "ranges": [{
            "row": 0,
            "rowCount": 7,
            "col": 0,
            "colCount": 4
        }],
        "value1": "0",            // 比较值
        "value2": ""
    }]
}
```

该规则表示：在 A1:D7 区域内，所有大于 0 的单元格文字显示为绿色。

### 按钮事件绑定

```javascript
function checkCount(){
    var sheet = spread.getActiveSheet();
    var sel = sheet.getSelections()[0];
    alert(getPassConditionCount(sheet, sel.row, sel.col, sel.rowCount, sel.colCount));
}
document.getElementById("checkCount").onclick = checkCount;
```

## 七、总结

本示例展示了如何利用 SpreadJS 的条件格式 API 实现单元格验证统计功能。开发者可以从中学到：

* 如何获取和遍历单元格的条件格式规则
* 如何使用 `evaluate()` 方法验证单元格值是否满足规则条件
* 如何处理选中区域并进行批量数据处理
* 条件格式规则的数据结构和配置方式

该方案适用于需要对大量数据进行条件验证和统计的场景，具有良好的扩展性。开发者可以在此基础上添加更复杂的统计逻辑、可视化展示或数据导出功能，以满足更多业务需求。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
