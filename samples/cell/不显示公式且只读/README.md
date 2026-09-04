## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现一个特殊的单元格类型，使包含公式的单元格在界面上只显示计算结果值而不显示公式本身，同时在编辑时也保持显示计算值而非公式文本。这种自定义单元格类型通过继承 `CellTypes.Base` 并重写关键方法来实现对单元格渲染和编辑行为的完全控制。

该示例适用于需要向最终用户隐藏公式逻辑、只展示计算结果的业务场景，例如财务报表、数据看板等对公式保密性有要求的应用。

## 二、解决的问题

- **公式隐藏需求**：在某些业务场景中，需要向用户展示计算结果，但不希望暴露底层的公式逻辑，避免用户看到或修改计算规则
- **编辑器行为定制**：默认情况下，双击包含公式的单元格会在编辑器中显示公式文本（如 `=A1+B1`），本示例实现了编辑时仍显示计算值的效果
- **单元格类型扩展**：演示了如何通过自定义 CellType 来实现复杂的单元格行为控制，为开发者提供了扩展 SpreadJS 功能的标准范式

## 三、实现思路

### 3.1 自定义 CellType 类

通过继承 `spreadNS.CellTypes.Base` 创建自定义单元格类型 `ShowValueCellType`，这是实现自定义渲染和编辑行为的基础：

```javascript
function ShowValueCellType() {}
ShowValueCellType.prototype = new spreadNS.CellTypes.Base();
```

### 3.2 重写 paint 方法控制渲染

`paint` 方法负责单元格的渲染显示，通过直接传递 `value`（计算值）而非公式文本来实现只显示结果：

```javascript
ShowValueCellType.prototype.paint = function(ctx, value, x, y, w, h, style, options) {
    if (value || value === 0) {
        // 直接渲染计算值，不显示公式
        spreadNS.CellTypes.Base.prototype.paint.apply(this, [ctx, value, x, y, w, h, style, options]);
    }
};
```

### 3.3 自定义编辑器创建

通过 `createEditorElement` 方法创建自定义的编辑器 DOM 结构，使用 `div` 包裹 `input` 元素，并设置 `gcUIElement` 属性以便 SpreadJS 识别：

```javascript
ShowValueCellType.prototype.createEditorElement = function() {
    var div = document.createElement("div");
    div.setAttribute("gcUIElement", "gcEditingInput");
    div.style.backgroundColor = "white";
    div.style.overflow = "hidden";
    var input1 = document.createElement("input");
    var type = document.createAttribute('type');
    type.nodeValue = "text";
    input1.setAttributeNode(type);
    div.appendChild(input1);
    return div;
};
```

### 3.4 编辑器值的读写控制

通过 `setEditorValue` 和 `getEditorValue` 方法控制编辑器中显示和获取的内容：

```javascript
// 设置编辑器值时显示计算结果而非公式
ShowValueCellType.prototype.setEditorValue = function(editorContext, value, cell) {
    if (editorContext && editorContext.children.length === 1) {
        if (value || value === 0) {
            var input1 = editorContext.children[0];
            var row = cell.row, col = cell.col;
            var sheet = cell.sheet;
            var text = sheet.getText(row, col); // 获取显示文本（计算值）
            var formula = sheet.getFormula(row, col); // 获取公式
            input1.value = text; // 显示计算值
            if (formula) {
                input1.formula = formula; // 将公式存储在自定义属性中
            }
        }
    }
};

// 获取编辑器值时返回公式或输入值
ShowValueCellType.prototype.getEditorValue = function(editorContext) {
    if (editorContext && editorContext.children.length === 1) {
        var input1 = editorContext.children[0];
        if (input1.formula) {
            return "=" + input1.formula; // 如果有公式，返回公式
        }
        return input1.value; // 否则返回输入值
    }
};
```

### 3.5 应用自定义 CellType

在工作表中为包含公式的单元格应用自定义类型：

```javascript
for (var i = 0; i < sheet.getRowCount() - 1; i++) {
    sheet.setValue(i, 0, i);
    sheet.setValue(i, 1, sheet.getRowCount() - i);
    var j = i + 1;
    sheet.setFormula(i, 2, "=A" + j + "+B" + j); // 设置公式
    sheet.setValue(i, 2, i + 1); // 设置显示值
    sheet.setCellType(i, 2, new ShowValueCellType()); // 应用自定义类型
}
```

### 3.6 技术栈

- SpreadJS 15.0.0：核心表格控件库
- SystemJS 0.19.22：模块加载器
- TypeScript 4.1.2：开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，可以看到一个包含 3 列的表格：值1、值2、值1+值2
2. 第 3 列（值1+值2）的单元格包含公式 `=A1+B1`，但界面上只显示计算结果
3. 双击第 3 列的任意单元格进入编辑模式，编辑器中显示的是计算值而非公式文本
4. 修改第 1 列或第 2 列的值，第 3 列会自动重新计算，但始终只显示结果值

## 五、功能特点

### 5.1 优点

- **公式保密性**：有效隐藏公式逻辑，保护业务规则不被最终用户查看或修改
- **用户体验优化**：对于不需要了解公式细节的用户，只显示结果值可以简化界面，降低理解成本
- **灵活的扩展性**：通过自定义 CellType 的方式，可以根据业务需求灵活定制单元格的渲染和编辑行为
- **完整的生命周期控制**：覆盖了单元格的渲染（paint）、编辑器创建（createEditorElement）、值读写（getEditorValue/setEditorValue）等完整生命周期

### 5.2 局限性与扩展建议

- **编辑限制**：当前实现中，用户在编辑器中看到的是计算值，如果用户修改该值，会导致公式丢失。如需保持公式不可编辑，可以在 `setEditorValue` 中设置 `input` 为只读状态
- **公式可见性**：虽然界面上隐藏了公式，但通过 `getFormula` API 仍可获取公式内容。如需更强的保护，可以结合权限控制或数据加密方案
- **扩展方向**：可以进一步扩展该 CellType，例如添加自定义的格式化逻辑、验证规则、或者实现更复杂的编辑器交互

## 六、关键代码片段

### 编辑器值设置的核心逻辑

```javascript
ShowValueCellType.prototype.setEditorValue = function(editorContext, value, cell) {
    if (editorContext && editorContext.children.length === 1) {
        if (value || value === 0) {
            var input1 = editorContext.children[0];
            var row = cell.row, col = cell.col;
            var sheet = cell.sheet;
            // 关键：使用 getText 获取显示文本（计算值），而非 getFormula
            var text = sheet.getText(row, col);
            var formula = sheet.getFormula(row, col);
            input1.value = text; // 编辑器显示计算值
            if (formula) {
                input1.formula = formula; // 将公式存储在自定义属性中备用
            }
        }
    }
};
```

这

[操作视频](DOCUMENT_SITE_VIDEO_BUTTON_PREFIX:https://videos.grapecity.com.cn/SpreadJS/CodeLibrary/Formula%20cell%20does%20not%20display%20formula%20and%20cannot%20be%20changed.mp4)

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/k2zy0yUf702saxtBCJ6mgw/)）
