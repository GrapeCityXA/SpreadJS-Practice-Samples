## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现一个自定义单元格类型，限制用户只能输入数字。通过继承 `CellTypes.Base` 基类并重写关键方法，实现了对输入内容的实时过滤和验证。该示例在 C3 单元格应用了此功能，用户输入时会自动过滤掉非数字字符，并结合数据验证器限制输入范围为 0-999。

## 二、解决的问题

在实际业务场景中，经常需要限制某些单元格只能输入特定类型的数据。例如：

* 金额、数量等字段需要严格限制为数字输入
* 防止用户误输入文本导致数据格式错误
* 在输入阶段就进行数据校验，提升用户体验
* 避免后续数据处理时因类型错误导致的异常

本示例通过自定义单元格类型，在用户输入阶段就实时过滤非法字符，配合数据验证器进行范围校验，实现了双重保障。

## 三、实现思路

### 3.1 自定义单元格类型

核心思路是继承 `GC.Spread.Sheets.CellTypes.Base` 基类，创建一个 `NumberCellType` 类：

```javascript
function NumberCellType() {
    var self = this;
}
NumberCellType.prototype = new GC.Spread.Sheets.CellTypes.Base();
```

通过原型链继承，`NumberCellType` 获得了基础单元格类型的所有功能，然后可以重写特定方法来实现自定义行为。

### 3.2 创建自定义编辑器

重写 `createEditorElement` 方法，创建一个 HTML input 元素作为编辑器：

```javascript
NumberCellType.prototype.createEditorElement = function (sheet) {
    var input = document.createElement("input");
    input.setAttribute('data-col', sheet.col);
    input.setAttribute('data-row', sheet.row);
    return input;
};
```

该方法返回的 input 元素会在用户双击或开始编辑单元格时显示，并记录了单元格的行列位置信息。

### 3.3 实时输入过滤

重写 `activateEditor` 方法，在编辑器激活时绑定事件监听器，实现实时过滤：

```javascript
NumberCellType.prototype.activateEditor = function (editorContext, cellStyle, cellRect) {
    var self = this;
    if (editorContext) {
        GC.Spread.Sheets.CellTypes.Base.prototype.activateEditor.apply(this, arguments);
        editorContext.style.position = "absolute"
        function cb(e) {
            var value = editorContext.value;
            // 使用正则表达式过滤掉所有非数字和小数点的字符
            editorContext.value = value.replace(/[^0-9.]/g, '')
        }
        editorContext.addEventListener("input", cb)
        editorContext.addEventListener("change", cb)
    }
}
```

关键点：

* 调用父类的 `activateEditor` 方法保证基础功能正常
* 监听 `input` 和 `change` 事件
* 使用正则表达式 `/[^0-9.]/g` 过滤掉除数字和小数点外的所有字符

### 3.4 数据验证器

除了输入过滤，还使用 SpreadJS 的数据验证功能进行范围校验：

```javascript
// 创建数值验证器，限制输入范围为 0-999
let dv = GC.Spread.Sheets.DataValidation.createNumberValidator(
    GC.Spread.Sheets.ConditionalFormatting.ComparisonOperators.between, 
    0, 
    999, 
    true
);
sheet.getCell(2, 2).validator(dv);
```

当用户输入的数字超出 0-999 范围时，失焦后会显示错误提示。

### 3.5 应用自定义单元格类型

将自定义的 `NumberCellType` 应用到 C3 单元格（行索引 2，列索引 2）：

```javascript
sheet.getCell(2, 2).cellType(new NumberCellType());
```

### 3.6 技术栈

* SpreadJS 15.0.0：核心表格控件
* TypeScript 4.1.2：开发语言（编译为 JavaScript）
* SystemJS 0.19.22：模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，会看到一个表格，C3 单元格周围有箭头标识（→ ← ↓ ↑）
2. 双击 C3 单元格进入编辑模式
3. 尝试输入字母、特殊符号等非数字字符，会发现这些字符无法输入
4. 可以正常输入数字和小数点
5. 输入超出 0-999 范围的数字（如 1000），失焦后会显示验证错误提示
6. 输入合法数字（如 500），失焦后正常保存

## 五、功能特点

### 5.1 优点

* 实时过滤：用户输入时立即过滤非法字符，体验流畅
* 双重验证：输入过滤 + 数据验证器，确保数据准确性
* 可扩展性强：可以轻松修改正则表达式来支持其他输入规则
* 代码简洁：核心逻辑不到 100 行代码

### 5.2 局限性与扩展建议

当前实现的局限性：

* 正则表达式 `/[^0-9.]/g` 允许多个小数点，可能导致 `1.2.3` 这样的非法数字
* 没有限制负号输入，如果需要支持负数需要调整正则

扩展建议：

* 改进正则表达式为 `/^-?\d*\.?\d*$/` 以支持标准数字格式
* 添加千分位分隔符显示功能
* 支持科学计数法输入
* 添加输入提示或占位符文本

## 六、关键代码片段

### 编辑器值的获取与设置

```javascript
// 设置编辑器的值
NumberCellType.prototype.setEditorValue = function (editor, value) {
    if (value) {
        editor.value = value
    }
};

// 获取编辑器的值
NumberCellType.prototype.getEditorValue = function (editor) {
    return editor.value;
};
```

这两个方法负责在单元格值和编辑器之间进行数据同步，确保编辑前后数据的一致性。

### 编辑器样式更新

```javascript
NumberCellType.prototype.updateEditor = function (editorContext, cellStyle, cellRect) {
    if (editorContext) {
        editorContext.style.width = "1000px"
        editorContext.style.height = "1000px"
    }
}
```

该方法在编辑器需要更新时被调用，可以根据单元格样式和位置调整编辑器的外观。

## 七、总结

本示例展示了 SpreadJS 自定义单元格类型的核心开发流程，开发者可以从中学到：

* 如何继承 `CellTypes.Base` 创建自定义单元格类型
* 如何重写关键方法（`createEditorElement`、`activateEditor` 等）实现自定义行为
* 如何使用 DOM 事件监听实现实时输入验证
* 如何结合数据验证器实现多层次的数据校验
* 如何使用正则表达式进行输入过滤

该方案适用于需要严格控制单元格输入类型的场景，如财务报表、数据录入表单等。通过修改正则表达式和验证规则，可以轻松扩展到其他输入限制场景（如邮箱、电话号码、身份证号等）。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
