## 一、Demo 概述

本示例演示了如何在 SpreadJS 中创建自定义单元格类型，实现一个只允许输入数字的单元格编辑器。通过继承 `GC.Spread.Sheets.CellTypes.Base` 基类，自定义单元格的编辑行为，在用户输入时自动过滤掉中文字符，确保单元格只接受数字输入。 

## 二、解决的问题

在实际业务场景中，经常需要对单元格的输入内容进行限制，例如：

* 金额、数量等字段需要严格限制为数字输入
* 防止用户误输入中文或其他非法字符
* 提供实时的输入验证，而不是在提交后才报错
* 自定义单元格的编辑体验，满足特定业务需求

## 三、实现思路

### 3.1 自定义单元格类型的创建

通过继承 `GC.Spread.Sheets.CellTypes.Base` 基类来创建自定义单元格类型：

```javascript
function NumberCellType() {
    var typeName = 'NumberCellType';
}

NumberCellType.prototype = new GC.Spread.Sheets.CellTypes.Base();
```

这是创建自定义单元格类型的标准方式，通过原型链继承基类的所有功能。

### 3.2 创建编辑器元素

重写 `createEditorElement` 方法来创建自定义的编辑器 DOM 元素：

```javascript
NumberCellType.prototype.createEditorElement = function(sheet) {
    var input = document.createElement('input');
    input.setAttribute('data-col', sheet.col);
    input.setAttribute('data-row', sheet.row);
    return input;
}
```

该方法返回一个标准的 HTML input 元素，并记录当前单元格的行列位置信息。

### 3.3 激活编辑器并添加输入过滤

重写 `activateEditor` 方法，在编辑器激活时添加输入事件监听，实现实时过滤中文字符：

```javascript
NumberCellType.prototype.activateEditor = function(editorContext, cellStyle, cellRect) {
    if (editorContext) {
        GC.Spread.Sheets.CellTypes.Base.prototype.activateEditor.apply(this, arguments);
        editorContext.style.position = 'absolute';
        
        editorContext.addEventListener('input', function(e) {
            var value = editorContext.value;
            value = value.replace(/[\u4e00-\u9fa5]/g, '');
            editorContext.value = value;
        });

        editorContext.addEventListener('change', function(e) {
            var value = editorContext.value;
            value = value.replace(/[\u4e00-\u9fa5]/g, '');
            editorContext.value = value;
        });
    }
}
```

关键技术点：

* 使用正则表达式 `/[\u4e00-\u9fa5]/g` 匹配所有中文字符
* 同时监听 `input` 和 `change` 事件，确保实时过滤
* 调用基类的 `activateEditor` 方法保留默认行为

### 3.4 编辑器尺寸更新

重写 `updateEditor` 方法，使编辑器尺寸与单元格保持一致：

```javascript
NumberCellType.prototype.updateEditor = function(editorContext, cellStyle, cellRect) {
    if (editorContext) {
        editorContext.style.width = cellRect.width + 'px';
        editorContext.style.height = cellRect.height + 'px';
    }
}
```

### 3.5 应用自定义单元格类型

将自定义单元格类型应用到指定单元格：

```javascript
sheet.setValue(0, 0, '自定义数字单元格：');
sheet.autoFitColumn(0);
sheet.setCellType(0, 1, new NumberCellType());
```

### 3.6 技术栈

* SpreadJS 17.0.8：核心表格组件
* SystemJS 0.19.22：模块加载器
* systemjs-plugin-babel 0.0.25：ES6 转译支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，可以看到第一行第一列显示"自定义数字单元格："
2. 点击第一行第二列的单元格进入编辑模式
3. 尝试输入中文字符，会发现中文字符无法输入
4. 输入数字或英文字符可以正常显示
5. 按 Enter 键或点击其他单元格完成编辑

## 五、功能特点

### 5.1 优点

* 实时输入验证，用户体验良好
* 通过继承基类，保留了 SpreadJS 单元格的默认功能
* 代码结构清晰，易于扩展和维护
* 可以根据需求修改正则表达式，实现不同的输入限制

### 5.2 局限性与扩展建议

当前实现只过滤了中文字符，可以根据实际需求进行扩展：

* 添加更严格的数字验证（如只允许整数、限制小数位数）
* 支持数字范围限制（最小值、最大值）
* 添加输入提示或错误提示
* 支持千分位分隔符等格式化显示

扩展示例：

```javascript
// 只允许正整数
value = value.replace(/[^0-9]/g, '');

// 只允许数字和小数点
value = value.replace(/[^0-9.]/g, '');

// 限制只能输入一个小数点
if (value.split('.').length > 2) {
    value = value.substring(0, value.length - 1);
}
```

## 六、关键代码片段

完整的自定义单元格类型实现：

```javascript
function NumberCellType() {
    var typeName = 'NumberCellType';
}

NumberCellType.prototype = new GC.Spread.Sheets.CellTypes.Base();

// 创建编辑器
NumberCellType.prototype.createEditorElement = function(sheet) {
    var input = document.createElement('input');
    input.setAttribute('data-col', sheet.col);
    input.setAttribute('data-row', sheet.row);
    return input;
}

// 激活编辑器并添加输入过滤
NumberCellType.prototype.activateEditor = function(editorContext, cellStyle, cellRect) {
    if (editorContext) {
        GC.Spread.Sheets.CellTypes.Base.prototype.activateEditor.apply(this, arguments);
        editorContext.style.position = 'absolute';
        editorContext.addEventListener('input', function(e) {
            var value = editorContext.value;
            value = value.replace(/[\u4e00-\u9fa5]/g, '');
            editorContext.value = value;
        });
    }
}

// 设置和获取编辑器的值
NumberCellType.prototype.setEditorValue = function(editor, value) {
    if (value) {
        editor.value = value;
    }
}

NumberCellType.prototype.getEditorValue = function(editor) {
    return editor.value;
}
```

## 七、总结

本示例展示了 SpreadJS 自定义单元格类型的核心开发流程，开发者可以从中学到：

* 如何继承 `CellTypes.Base` 基类创建自定义单元格类型
* 如何重写关键方法（createEditorElement、activateEditor、updateEditor 等）
* 如何使用 DOM 事件监听实现实时输入验证
* 如何使用正则表达式过滤特定字符

该方案适用于需要对单元格输入进行严格控制的场景，具有良好的扩展性，可以根据业务需求定制各种输入限制规则。通过自定义单元格类型，可以大大提升表格应用的数据质量和用户体验。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
