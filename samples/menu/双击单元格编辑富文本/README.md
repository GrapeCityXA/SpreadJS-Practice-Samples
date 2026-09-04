## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现富文本单元格的自定义编辑功能。通过扩展右键菜单和监听双击事件，用户可以在弹出的模态对话框中对单元格的富文本内容进行可视化编辑，包括字体、字号、颜色、粗体、斜体、下划线、删除线、上标、下标等格式设置。

该示例适用于需要在表格中展示复杂格式文本的场景，如科学公式（万有引力定律、化学方程式）、品牌 Logo（Google 彩色字母）等。

## 二、解决的问题

SpreadJS 原生支持富文本单元格，但默认的单元格编辑模式无法直观地编辑富文本格式。本示例通过自定义编辑器解决了以下问题：

- 提供可视化的富文本编辑界面，用户可以直接看到格式效果
- 支持通过右键菜单快速进入富文本编辑模式
- 支持双击富文本单元格直接编辑，提升用户体验
- 实现富文本格式与 SpreadJS 内部数据结构的双向转换

## 三、实现思路

### 3.1 核心技术点

#### 富文本数据结构定义

SpreadJS 的富文本使用 `richText` 数组表示，每个元素包含 `style` 和 `text` 属性：

```javascript
let lawOfUniversalGravitation = {
    richText: [
        {
            style: {
                font: "normal 24px Calibri"
            },
            text: "F = (G * M"
        },
        {
            style: {
                font: "normal 24px Calibri",
                vertAlign: 2  // 下标
            },
            text: "1"
        }
    ]
};
```

其中 `vertAlign` 属性控制上下标：`1` 表示上标，`2` 表示下标。

#### 自定义右键菜单项

通过 `contextMenu.menuData` 添加自定义菜单项，并注册对应的命令：

```javascript
// 移除可能冲突的菜单项
spread.contextMenu.menuData.forEach(function (item, index) {
    if (item && item.name === "richText") {
        spread.contextMenu.menuData.splice(index, 1);
    }
});

// 添加自定义菜单项
let richText = {
    text: "编辑富文本",
    name: "richText",
    command: "richText",
    workArea: "viewport"
};
spread.contextMenu.menuData.push(richText);

// 注册命令
let richTextCommand = {
    canUndo: false,
    execute: function () {
        $('#subEditor').modal('show');
        spread.focus(false);
    }
};
commandManager.register("richText", richTextCommand);
```

#### 双击事件监听

监听 `CellDoubleClick` 事件，判断是否为富文本单元格：

```javascript
spread.bind(GC.Spread.Sheets.Events.CellDoubleClick, function (sender, args) {
    let rich = args.sheet.getValue(args.row, args.col, 
        GC.Spread.Sheets.SheetArea.viewport, 
        GC.Spread.Sheets.ValueType.richText);
    
    if (rich !== null && rich !== args.sheet.getValue(args.row, args.col)) {
        $('#subEditor').modal('show');
        $('#subEditor').on("shown.bs.modal", function () {
            args.sheet.endEdit(true);
            spread.focus(false);  // 让 spread 失去焦点，使富文本编辑框能够获取焦点
        });
    }
});
```

#### 富文本编辑器实现

使用 `contentEditable` 的 div 作为编辑区域，通过 `document.execCommand` 实现格式化功能：

```javascript
let content = createElement("div");
content.contentEditable = true;
content.className = classes.content;

// 格式化按钮示例
bold: {
    icon: "<b>B</b>",
    title: "Bold",
    state: function () {
        return queryCommandState("bold");
    },
    result: function () {
        return exec("bold");  // 执行 document.execCommand("bold")
    }
}
```

#### 富文本数据转换

**从 SpreadJS 富文本到 HTML**（`onSpreadEnterCell` 函数）：

```javascript
function onSpreadEnterCell() {
    let contentText = sheet.getValue(
        sheet.getActiveRowIndex(),
        sheet.getActiveColumnIndex(),
        3, 1  // richText 类型
    );
    
    if (contentText && contentText.richText) {
        for (let i = 0; i < contentText.richText.length; i++) {
            // 解析 style 属性，创建对应的 HTML 元素
            switch (styleProperty) {
                case "vertAlign":
                    if (value === 2) elemAttr.push("subscript");
                    else if (value === 1) elemAttr.push("superscript");
                    break;
                case "foreColor":
                    elemAttr.push({ name: "foreColor", value: value });
                    break;
            }
        }
    }
}
```

**从 HTML 到 SpreadJS 富文本**（`_getRichText` 函数）：

```javascript
function _getRichText() {
    let iterator = document.createNodeIterator(
        document.getElementsByClassName("rich-editor-content")[0],
        NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
    );
    
    let richText = [];
    let node = iterator.nextNode();
    
    while (node !== null) {
        if (node.nodeType === 3) {  // 文本节点
            let style = document.defaultView.getComputedStyle(node.parentElement);
            let richTextStyle = _getRichStyle(style, underlineNode, lineThroughNode);
            _handleSuperAndSubScript(root, node, richTextStyle);
            richText.push({ style: richTextStyle, text: node.nodeValue });
        }
        node = iterator.nextNode();
    }
    return richText;
}
```

### 3.2 UI 交互流程

用户操作 → 双击富文本单元格或右键选择"编辑富文本" → 弹出 Bootstrap 模态对话框 → 在可视化编辑器中修改格式 → 点击"确定"按钮 → 将 HTML 转换为富文本数据 → 更新单元格内容

### 3.3 技术栈

- SpreadJS 15.0.0：电子表格核心库
- Bootstrap 4.6.1：模态对话框和样式
- jQuery 3.1.1：DOM 操作和事件处理
- SystemJS 0.19.22：模块加载器
- TypeScript 4.1.2：类型支持

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件。

### 4.2 操作步骤

1. 页面加载后，表格中已预置三个富文本示例（万有引力定律、化学反应方程式、Google Logo）
2. 双击任意富文本单元格，弹出富文本编辑器
3. 或右键点击单元格，选择"编辑富文本"菜单项
4. 在编辑器中选中文本，使用工具栏按钮设置格式：
   - 字体选择（下拉菜单）
   - 字号选择（10/13/16/18/24/32/48）
   - 粗体、斜体、下划线、删除线
   - 文字颜色（12 种预设颜色）
   - 上标、下标
5. 点击"确定"按钮保存修改，点击"取消"放弃修改

## 五、功能特点

### 5.1 优点

- 提供直观的所见即所得编辑体验，用户无需了解富文本数据结构
- 支持多种触发方式（双击、右键菜单），操作灵活
- 完整实现富文本格式与 HTML 的双向转换，保证数据一致性
- 使用标准的 `document.execCommand` API，兼容性好

### 5.2 局限性与扩展建议

- 字号选择受限于 HTML `<font>` 标签的 `size` 属性（1-7），映射到固定的像素值
- 颜色选择器仅提供 12 种预设颜色，可扩展为完整的颜色拾取器
- 编辑器功能相对基础，可考虑集成成熟的富文本编辑器库（如 Quill、TinyMCE）
- 当前实现依赖 jQuery 和 Bootstrap，可考虑使用现代框架（React、Vue）重构

## 六、关键代码片段

### 富文本格式解析

```javascript
function _getRichStyle(style, isUnderlineNode, isLineThroughNode) {
    return {
        font:
            (style.fontWeight === "700" ? "bold " : "") +
            (style.fontStyle === "italic" ? "italic " : "") +
            style.fontSize + " " + style.fontFamily,
        foreColor: style.color,
        textDecoration: (isUnderlineNode ? 1 : 0) | (isLineThroughNode ? 2 : 0)
    };
}
```

### 上下标处理

```javascript
function _handleSuperAndSubScript(root, node, style) {
    while (node.parentNode !== root) {
        if (node.nodeName.toLowerCase() === "sub") {
            style.vertAlign = 2;  // 下标
            break;
        }
        if (node.nodeName.toLowerCase() === "sup") {
            style.vertAlign = 1;  // 上标
            break;
        }
        node = node.parentNode;
    }
}
```

## 七、总结

本示例展示了如何在 SpreadJS 中实现自定义富文本编辑功能，核心价值在于：

- 掌握 SpreadJS 富文本数据结构的定义和使用
- 学习如何扩展右键菜单和注册自定义命令
- 理解富文本格式与 HTML DOM 之间的转换逻辑
- 掌握 `document.execCommand` API 的使用方法

该方案适用于需要在电子表格中展示和编辑复杂格式文本的场景，如科学计算、教育培训、文档编辑等领域。开发者可以在此基础上扩展更多格式化功能，或集成第三方富文本编辑器以提升用户体验。


### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/hSDVzOibG0Srxl-kmUvxUQ/)）
