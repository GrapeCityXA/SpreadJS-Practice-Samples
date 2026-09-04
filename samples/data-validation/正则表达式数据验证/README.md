## 一、Demo 概述

本示例展示了如何在 SpreadJS 中使用正则表达式实现自定义数据验证功能。通过继承 `ConditionalFormatting.Condition` 类并重写 `evaluate` 方法，开发者可以创建基于正则表达式的验证规则，对单元格输入的数据进行格式校验，并通过高亮显示不符合规则的数据，帮助用户快速识别和修正错误输入。

该示例演示了如何验证单元格中的数据是否为正整数，不符合规则的数据会被自动高亮显示。

## 二、解决的问题

- **灵活的数据格式验证**：内置的数据验证类型可能无法满足复杂的业务需求，通过正则表达式可以实现任意格式的数据校验（如邮箱、电话号码、身份证号等）
- **实时数据校验反馈**：通过高亮显示功能，用户可以立即看到哪些单元格的数据不符合要求，无需手动逐个检查
- **可复用的验证规则**：自定义的验证类可以在多个单元格或工作表中重复使用，提高开发效率

## 三、实现思路

### 3.1 核心技术点

#### 自定义验证条件类

通过继承 `GC.Spread.Sheets.ConditionalFormatting.Condition` 类，创建自定义的验证规则类：

```javascript
// 自定义校验规则类
function MyCondition(reg) {
    this.reg = reg;
}
// 继承 Condition 类
MyCondition.prototype = new GC.Spread.Sheets.ConditionalFormatting.Condition();
```

#### 实现 evaluate 方法

重写 `evaluate` 方法，使用正则表达式对单元格数据进行验证：

```javascript
MyCondition.prototype.evaluate = function (evaluator, baseRow, baseColumn, actualObj) {
    // 用于检测一个字符串是否匹配某个模式
    var reg = new RegExp(this.reg);
    if (reg.test(actualObj)) {
        return true;
    } else {
        return false;
    }
};
```

**注意**：如果正则表达式中使用了反斜杠（如 `\d`、`\w`、`\.`），需要写两个反斜杠（如 `\\d`、`\\w`），否则在 `new RegExp` 时正则表达式会与预期不同。

#### 应用验证规则

创建验证器并应用到指定单元格：

```javascript
// 实例化 MyCondition 对象（验证正整数）
let nCondition = new MyCondition("^[0-9]*[1-9][0-9]*$");

// 创建数据验证器
let validator = new GC.Spread.Sheets.DataValidation.DefaultDataValidator(nCondition);
validator.type(GC.Spread.Sheets.DataValidation.CriteriaType.custom);

// 启用高亮显示不满足验证规则的数据
spread.options.highlightInvalidData = true;

// 将校验规则应用到单元格
sheet.setDataValidator(0, 0, validator);
sheet.setDataValidator(1, 0, validator);
```

### 3.2 技术栈

- **SpreadJS**: 15.0.0 - 核心表格组件库
- **TypeScript**: ^4.1.2 - 类型支持（项目配置）
- **SystemJS**: ^0.19.22 - 模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 直接在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开 `index.html` 文件，页面会显示一个 SpreadJS 表格
2. 观察单元格 A1 和 A2 的初始数据：
   - A1 单元格包含 "hello"（字符串，不符合正整数规则）
   - A2 单元格包含 2（正整数，符合规则）
3. 不符合验证规则的单元格（A1）会被高亮显示
4. 尝试在其他单元格输入数据，测试验证规则的效果

## 五、功能特点

### 5.1 优点

- **高度灵活**：正则表达式可以实现几乎任意复杂的数据格式验证
- **即时反馈**：通过高亮显示功能，用户可以立即看到数据验证结果
- **易于扩展**：可以创建多个不同的验证规则类，应用于不同的业务场景
- **代码复用**：自定义的验证类可以在项目中多次使用

### 5.2 局限性与扩展建议

- **当前实现仅支持单个正则表达式验证**，可以扩展为支持多个验证规则的组合（如同时验证格式和长度）
- **可以添加自定义错误提示信息**，通过 `validator.showErrorMessage()` 方法为用户提供更友好的错误提示
- **可以结合输入消息提示**，使用 `validator.showInputMessage()` 在用户选中单元格时显示输入要求

## 六、关键代码片段

### 完整的自定义验证实现

```javascript
// 自定义校验规则类
function MyCondition(reg) {
    this.reg = reg;
}

// 继承 Condition 类
MyCondition.prototype = new GC.Spread.Sheets.ConditionalFormatting.Condition();

// 添加 evaluate 方法
MyCondition.prototype.evaluate = function (evaluator, baseRow, baseColumn, actualObj) {
    var reg = new RegExp(this.reg);
    if (reg.test(actualObj)) {
        return true;
    } else {
        return false;
    }
};

// 实例化并应用验证规则
let nCondition = new MyCondition("^[0-9]*[1-9][0-9]*$");
let validator = new GC.Spread.Sheets.DataValidation.DefaultDataValidator(nCondition);
validator.type(GC.Spread.Sheets.DataValidation.CriteriaType.custom);

// 启用高亮显示
spread.options.highlightInvalidData = true;

// 应用到单元格
sheet.setDataValidator(0, 0, validator);
```

## 七、总结

本示例展示了 SpreadJS 中自定义数据验证的强大能力。通过继承 `Condition` 类并结合正则表达式，开发者可以实现任意复杂的数据格式验证逻辑。

**学习要点**：
- 如何继承 SpreadJS 的内置类并扩展功能
- 正则表达式在数据验证中的应用
- 数据验证器的创建和应用方法
- 高亮显示功能的使用

**适用场景**：
- 表单数据录入验证（邮箱、电话、身份证等）
- 数据导入时的格式校验
- 业务规则约束（如特定格式的编号、代码等）

该方案具有良好的扩展性，可以根据实际业务需求创建多种不同的验证规则类，满足各种复杂的数据验证场景。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/bgllJNbAuUCIRZLvfT_NAQ/)）
