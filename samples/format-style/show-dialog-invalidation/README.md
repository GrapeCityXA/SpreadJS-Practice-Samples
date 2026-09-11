## 一、Demo 概述

本示例演示了如何在 SpreadJS 中实现数据验证功能，并在用户输入不符合验证规则的数据时弹出自定义错误提示框。该示例通过监听 `ValidationError` 事件，拦截默认的验证错误处理流程，使用自定义的弹窗（如 `alert`）来提示用户输入错误，并支持恢复原值或重新编辑。

该功能适用于需要对用户输入进行严格控制的场景，例如表单填写、数据录入系统等，可以提供更友好的错误提示和更灵活的错误处理逻辑。

## 二、解决的问题

* **自定义验证错误提示**：SpreadJS 默认的数据验证错误提示可能无法满足特定的 UI 需求，通过监听 `ValidationError` 事件，可以使用自定义的弹窗组件（如 Modal、Dialog）替代默认提示
* **灵活的错误处理**：在验证失败时，可以根据业务需求选择不同的处理方式，如阻止输入、恢复原值、重新编辑或仅显示警告
* **增强用户体验**：通过自定义弹窗，可以提供更详细的错误信息、操作指引，提升用户的数据录入体验

## 三、实现思路

### 3.1 配置数据验证规则

使用 SpreadJS 的 `DataValidation` API 创建列表验证器，限制用户只能输入指定的选项。通过 `setDataValidator` 方法将验证规则应用到指定的单元格区域。

```javascript
// 创建列表验证器，限制输入为 "Fruit"、"Vegetable" 或 "Food"
var dv1 = new GC.Spread.Sheets.DataValidation.createListValidator("Fruit,Vegetable,Food");
dv1.inputTitle("Please choose a category:");
dv1.inputMessage("Fruit, Vegetable, Food");
dv1.ignoreBlank(false);

// 配置验证失败时的高亮样式
dv1.highlightStyle({
    type: GC.Spread.Sheets.DataValidation.HighlightType.icon,
    color: "gold",
    position: GC.Spread.Sheets.DataValidation.HighlightPosition.outsideRight,
});

// 启用错误消息显示
dv1.showErrorMessage(true);
dv1.errorStyle(GC.Spread.Sheets.DataValidation.ErrorStyle.stop);
dv1.errorTitle("Err");
dv1.errorMessage("Please choose a category");

// 将验证规则应用到 C 列（第 2 列）的前 11 行
for (var i = 0; i < 11; i++) {
    sheet.setDataValidator(i, 2, dv1);
}
```

### 3.2 监听验证错误事件并自定义弹窗

通过监听 `ValidationError` 事件，拦截默认的错误处理流程，使用自定义的弹窗（如 `alert`）显示错误信息。通过设置 `validationResult` 属性，可以控制验证失败后的行为。

```javascript
sheet.bind(GC.Spread.Sheets.Events.ValidationError, function(e, args) {
    var validator = args.validator;
    if(validator.showErrorMessage()){
        var oldValue = args.sheet.getValue(args.row, args.col);
        var errorTitle = validator.errorTitle();
        var errorMessage = validator.errorMessage();
        
        // 根据错误类型弹出不同的提示框
        if(validator.errorStyle() === GC.Spread.Sheets.DataValidation.ErrorStyle.stop){
            // 设置验证结果为 retry，阻止输入并保持编辑状态
            args.validationResult = GC.Spread.Sheets.DataValidation.DataValidationResult.retry;
            
            // 弹出错误提示
            alert(errorMessage);
            
            // 如果使用异步弹窗（如自定义 Modal），可以使用以下代码恢复原值并重新编辑
            // setTimeout(function(){
            //     args.sheet.setActiveCell(args.row, args.col);
            //     args.sheet.setValue(args.row, args.col, oldValue);
            //     args.sheet.startEdit(true);
            // }, 10);
        }
    }
});
```

### 3.3 技术栈

* **SpreadJS 15.0.0**：核心表格控件，提供数据验证和事件监听功能
* **SystemJS 0.19.22**：模块加载器，用于加载 ES6 模块
* **TypeScript 4.1.2**：支持 TypeScript 开发（本示例使用 JavaScript）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开 `index.html` 文件，页面会显示一个 SpreadJS 表格
2. 在 C 列（第 3 列）的任意单元格中输入任意值（如 "Test"）
3. 按下 Enter 键或点击其他单元格，触发数据验证
4. 如果输入的值不在 "Fruit"、"Vegetable"、"Food" 列表中，会弹出错误提示框
5. 点击确定后，单元格会保持编辑状态，可以重新输入正确的值
6. 输入正确的值（如 "Fruit"）后，验证通过，数据成功保存

## 五、功能特点

### 5.1 优点

* **灵活的错误处理**：通过 `validationResult` 属性，可以控制验证失败后的行为（retry、discard、forceApply），满足不同的业务需求
* **自定义弹窗支持**：可以使用任意弹窗组件（如 Modal、Dialog、Notification）替代默认的错误提示，提供更好的用户体验
* **异步弹窗兼容**：示例中提供了异步弹窗的处理方案，可以在弹窗关闭后恢复原值并重新编辑
* **易于扩展**：可以根据不同的验证类型（stop、warning、information）显示不同样式的弹窗

### 5.2 局限性与扩展建议

* **同步弹窗限制**：示例中使用的 `alert` 是同步弹窗，会阻塞 JavaScript 执行。在实际项目中，建议使用异步弹窗组件（如 UI 框架提供的 Modal），并参考注释中的异步处理代码
* **扩展建议**：
    * 可以根据 `errorStyle` 的不同值（stop、warning、information）显示不同样式的弹窗
    * 可以在弹窗中提供更多操作选项，如"恢复原值"、"忽略错误"、"查看帮助"等
    * 可以记录验证错误日志，用于数据质量分析

## 六、关键代码片段

### 6.1 验证结果控制

通过设置 `args.validationResult` 属性，可以控制验证失败后的行为：

```javascript
// retry：阻止输入，保持编辑状态
args.validationResult = GC.Spread.Sheets.DataValidation.DataValidationResult.retry;

// discard：丢弃输入，恢复原值
// args.validationResult = GC.Spread.Sheets.DataValidation.DataValidationResult.discard;

// forceApply：强制应用输入，忽略验证错误
// args.validationResult = GC.Spread.Sheets.DataValidation.DataValidationResult.forceApply;
```

### 6.2 异步弹窗处理

如果使用异步弹窗（如自定义 Modal），需要在弹窗关闭后手动恢复原值并重新编辑：

```javascript
setTimeout(function(){
    args.sheet.setActiveCell(args.row, args.col);  // 设置活动单元格
    args.sheet.setValue(args.row, args.col, oldValue);  // 恢复原值
    args.sheet.startEdit(true);  // 重新进入编辑状态
}, 10);
```

## 七、总结

本示例展示了如何在 SpreadJS 中实现自定义的数据验证错误处理流程，通过监听 `ValidationError` 事件，可以灵活地控制验证失败后的行为，并使用自定义的弹窗组件提供更好的用户体验。

开发者可以从中学到：

1. 如何使用 SpreadJS 的 `DataValidation` API 创建和配置数据验证规则
2. 如何监听 `ValidationError` 事件并拦截默认的错误处理流程
3. 如何通过 `validationResult` 属性控制验证失败后的行为
4. 如何处理异步弹窗场景下的单元格状态恢复和重新编辑
5. 如何根据不同的验证类型实现差异化的错误提示

该方案适用于需要对用户输入进行严格控制的场景，具有良好的扩展性，可以根据实际业务需求定制错误提示和处理逻辑。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
