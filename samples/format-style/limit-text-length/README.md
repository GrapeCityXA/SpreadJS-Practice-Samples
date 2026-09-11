## 一、Demo 概述

本示例演示了如何在 SpreadJS 中限制单元格输入内容的长度。通过自定义单元格类型（CellType），继承文本单元格类型并重写编辑器创建方法，实现对输入框 maxLength 属性的控制，从而在用户输入时自动截断超出限制的内容。该示例将 B2 单元格的输入长度限制为 5 个字符。

## 二、解决的问题

在实际业务场景中，经常需要对用户输入进行长度限制，例如：

* 身份证号、手机号等固定长度字段的输入控制
* 表单字段的字符数限制，防止数据库字段溢出
* 代码、编号等有格式要求的数据输入规范
* 提升用户体验，在输入阶段就进行数据验证，而非提交后再报错

## 三、实现思路

### 3.1 自定义单元格类型

通过创建自定义的 `NumberCellType` 构造函数，并继承 SpreadJS 的文本单元格类型，实现对输入长度的控制：

```javascript
// 定义NumberCellType的构造函数，默认可以输入长度为2
function NumberCellType(decimalPlace) {
    this.typeName = "NumberCellType";
    this.decimalPlace = decimalPlace ? decimalPlace : 2;
}
// 使用文本单元格类型的编辑器类型
NumberCellType.prototype = new GC.Spread.Sheets.CellTypes.Text(GC.Spread.Sheets.CellTypes.EditorType.textarea);
```

这里通过原型继承的方式，让自定义类型拥有文本单元格的所有功能，同时可以添加自定义属性 `decimalPlace` 来控制输入长度。

### 3.2 重写编辑器创建方法

关键实现在于重写 `createEditorElement` 方法，在创建编辑器时设置 HTML 原生的 `maxLength` 属性：

```javascript
NumberCellType.prototype.createEditorElement = function(){
    var textarea = GC.Spread.Sheets.CellTypes.Text.prototype.createEditorElement.apply(this, arguments);
    // 限制文本输入框中可输入内容的长度
    textarea.maxLength = this.decimalPlace;
    return textarea;
}
```

通过调用父类的 `createEditorElement` 方法获取原始编辑器元素，然后设置其 `maxLength` 属性，最后返回修改后的编辑器。这样当用户在单元格中输入时，浏览器会自动限制输入长度。

### 3.3 应用到指定单元格

将自定义的单元格类型应用到目标单元格：

```javascript
let sheet = spread.getActiveSheet();
// 将该规则应用到1,1单元格上（即B2单元格）
sheet.setCellType(1, 1, new NumberCellType(5));
```

这里使用 `setCellType` 方法，传入行索引 1、列索引 1（对应 B2 单元格），以及实例化的 `NumberCellType` 对象，参数 5 表示最大输入长度为 5 个字符。

### 3.4 技术栈

* SpreadJS 15.0.0：核心表格控件库
* SystemJS 0.19.22：模块加载器
* TypeScript 4.1.2：开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，会看到一个 SpreadJS 表格实例
2. 点击 B2 单元格进入编辑状态
3. 尝试输入超过 5 个字符的内容
4. 观察到输入框会自动限制输入，无法输入第 6 个字符

## 五、功能特点

### 5.1 优点

* 实现简单，通过继承和重写方法即可完成功能
* 利用浏览器原生的 maxLength 属性，性能优秀
* 可复用性强，通过参数控制不同的长度限制
* 用户体验好，在输入阶段就进行限制，而非事后验证

### 5.2 局限性与扩展建议

* 当前实现仅限制字符数量，不支持字节长度限制（中英文混合场景）
* 可以扩展为支持正则表达式验证，实现更复杂的输入规则
* 可以添加输入提示信息，告知用户当前输入长度和剩余可输入字符数
* 可以结合数据验证功能，在粘贴或程序设置值时也进行长度检查

## 六、关键代码片段

完整的自定义单元格类型实现：

```javascript
// 定义NumberCellType的构造函数，默认可以输入长度为2
function NumberCellType(decimalPlace) {
    this.typeName = "NumberCellType";
    this.decimalPlace = decimalPlace ? decimalPlace : 2;
}

// 使用文本单元格类型的编辑器类型
NumberCellType.prototype = new GC.Spread.Sheets.CellTypes.Text(GC.Spread.Sheets.CellTypes.EditorType.textarea);

NumberCellType.prototype.createEditorElement = function(){
    var textarea = GC.Spread.Sheets.CellTypes.Text.prototype.createEditorElement.apply(this, arguments);
    // 限制文本输入框中可输入内容的长度
    textarea.maxLength = this.decimalPlace;
    return textarea;
}

let sheet = spread.getActiveSheet();
// 将该规则应用到1,1单元格上
sheet.setCellType(1, 1, new NumberCellType(5));
```

## 七、总结

本示例展示了 SpreadJS 自定义单元格类型的基本用法，通过继承内置单元格类型并重写关键方法，可以实现各种自定义的输入控制逻辑。开发者可以从中学到：

* 如何创建自定义单元格类型
* 如何通过原型继承扩展 SpreadJS 内置功能
* 如何重写 createEditorElement 方法自定义编辑器行为
* 如何将自定义类型应用到指定单元格

该方案适用于需要对用户输入进行前端验证和限制的场景，具有良好的扩展性，可以根据实际需求添加更多的验证规则和交互逻辑。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
