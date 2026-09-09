## 一、Demo 概述

本示例演示了如何在 SpreadJS 中获取单元格编辑状态下的光标位置索引。当用户在单元格中输入或编辑内容时，系统能够实时捕获光标在文本中的位置，这对于实现自定义的输入辅助功能、公式编辑器或智能提示功能非常有用。

该示例通过监听 SpreadJS 的 `EditEnding` 事件，在用户退出编辑状态前获取光标在编辑器中的精确位置，并通过弹窗显示光标索引值。

## 二、解决的问题

在电子表格应用中，获取光标位置是实现高级编辑功能的基础需求：

- 实现智能公式提示：根据光标位置判断用户正在输入的函数或参数
- 自定义输入辅助：在特定位置插入预定义的文本或符号
- 编辑历史追踪：记录用户的编辑行为和光标移动轨迹
- 跨浏览器兼容：处理不同浏览器（Chrome、Firefox、IE）在光标位置获取上的差异

## 三、实现思路

### 3.1 监听编辑结束事件

通过绑定 SpreadJS 的 `EditEnding` 事件来捕获用户退出编辑状态的时机：

```javascript
sheet.bind(GC.Spread.Sheets.Events.EditEnding, function (sender, args) {
    // 获取编辑器元素
    let element = document.getElementsByClassName('gcsj-func-color-text')[0];
    // 处理光标位置获取逻辑
});
```

### 3.2 跨浏览器光标位置获取

核心技术点在于处理不同浏览器的 Selection API 差异，分为现代浏览器和 IE 浏览器两种实现方式：

**现代浏览器（Chrome、Firefox）实现：**

```javascript
if (typeof win.getSelection != "undefined") {
    sel = win.getSelection();
    if (sel.rangeCount > 0) {
        var range = win.getSelection().getRangeAt(0);
        // 克隆选中区域
        var preCaretRange = range.cloneRange();
        // 设置选中区域的节点内容为当前节点
        preCaretRange.selectNodeContents(element);
        // 重置选中区域的结束位置
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        // 通过字符串长度计算光标位置
        caretOffset = preCaretRange.toString().length;
    }
}
```

**IE 浏览器实现：**

```javascript
else if ((sel = doc.selection) && sel.type != "Control") {
    var textRange = sel.createRange();
    var preCaretTextRange = doc.body.createTextRange();
    preCaretTextRange.moveToElementText(element);
    preCaretTextRange.setEndPoint("EndToEnd", textRange);
    caretOffset = preCaretTextRange.text.length;
}
```

### 3.3 技术栈

- SpreadJS 15.0.0：核心电子表格组件
- SystemJS 0.19.22：模块加载器
- TypeScript 4.1.2：类型支持（配置环境）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后会看到一个 SpreadJS 表格
2. 双击任意单元格进入编辑状态
3. 输入一些文本内容
4. 移动光标到文本中的任意位置
5. 按 Enter 键或点击其他单元格退出编辑
6. 系统会弹出提示框显示光标停留的位置索引

## 五、功能特点

### 5.1 优点

- 跨浏览器兼容：同时支持现代浏览器和 IE 浏览器的光标位置获取
- 实时准确：能够精确获取光标在文本中的字符索引位置
- 非侵入式：通过事件监听实现，不影响 SpreadJS 的正常编辑功能

### 5.2 扩展建议

- 可以将光标位置信息用于实现自动补全功能
- 结合公式解析器实现智能函数提示
- 记录光标移动轨迹用于用户行为分析
- 实现基于光标位置的上下文菜单

## 六、关键代码片段

**获取编辑器 DOM 元素：**

```javascript
let element = document.getElementsByClassName('gcsj-func-color-text')[0];
```

SpreadJS 在编辑模式下会创建一个带有 `gcsj-func-color-text` 类名的元素作为编辑器，通过该类名可以定位到编辑器的 DOM 节点。

**Range API 核心逻辑：**

```javascript
var range = win.getSelection().getRangeAt(0);
var preCaretRange = range.cloneRange();
preCaretRange.selectNodeContents(element);
preCaretRange.setEnd(range.endContainer, range.endOffset);
caretOffset = preCaretRange.toString().length;
```

通过克隆当前选区并重置其范围，将起始点设置为编辑器开头，结束点设置为当前光标位置，然后通过字符串长度计算出光标索引。

## 七、总结

本示例展示了在 SpreadJS 中获取单元格编辑光标位置的完整实现方案，核心价值在于：

- 掌握 SpreadJS 编辑事件的监听机制
- 理解浏览器 Selection API 和 Range API 的使用方法
- 学习跨浏览器兼容性处理技巧
- 为实现高级编辑功能（如智能提示、自动补全）打下基础

该方案适用于需要精确控制编辑行为的场景，可以作为构建自定义公式编辑器、智能输入助手等高级功能的技术基础。开发者可以在此基础上扩展更多交互功能，提升用户的编辑体验。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/OkpYOgg5fEObGFZ1nBfTRQ/)）
