## 一、Demo 概述

本示例展示了如何将 HTML 格式的富文本内容解析并转换为 SpreadJS 的富文本对象。在检测行业等领域，经常需要从数据库中读取存储的 HTML 富文本数据并在电子表格中展示。该 Demo 实现了从 HTML DOM 节点到 SpreadJS RichText 对象的完整转换流程，支持字体样式、上下标、换行等常见富文本格式。

## 二、解决的问题

- **HTML 富文本数据导入**：将数据库或其他系统中存储的 HTML 格式富文本直接导入到 SpreadJS 单元格中
- **样式保留**：在转换过程中保留原 HTML 的字体、颜色、粗体、斜体、下划线、删除线等样式
- **特殊格式支持**：正确处理上标（sup）、下标（sub）、换行（br）等特殊 HTML 标签
- **段落识别**：自动识别段落标签（p）并在段落结尾添加换行符

## 三、实现思路

### 3.1 使用 NodeIterator 遍历 DOM 树

核心技术是使用浏览器原生的 `document.createNodeIterator` API 遍历 HTML 节点树，同时过滤元素节点和文本节点：

```javascript
let iterator = document.createNodeIterator(
    document.getElementsByClassName('rich-editor-content')[0], 
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, 
    null, 
    false
);
let root = iterator.nextNode();
let node = iterator.nextNode();
```

这种方式可以按照文档顺序依次访问所有节点，便于构建富文本对象数组。

### 3.2 样式提取与转换

通过 `getComputedStyle` 获取节点的实际渲染样式，并转换为 SpreadJS 富文本样式格式：

```javascript
function getRichStyle(style, isUnderlineNode, isLineThroughNode) { 
    return {
        font: (style.fontWeight === '700' ? 'bold ' : '') + 
              (style.fontStyle === 'italic' ? 'italic ' : '') + 
              style.fontSize + ' ' + style.fontFamily,
        foreColor: style.color,
        textDecoration: (isUnderlineNode ? 1 : 0) | (isLineThroughNode ? 2 : 0)
    };
}
```

样式对象包含：
- `font`：组合字体属性（粗体、斜体、字号、字体族）
- `foreColor`：文字颜色
- `textDecoration`：文本装饰（下划线使用位标志 1，删除线使用位标志 2）

### 3.3 上下标处理

通过向上遍历父节点链，检测 `<sup>` 和 `<sub>` 标签，设置 `vertAlign` 属性：

```javascript
function handleSuperAndSubScript(root, node, style) {
    while (node.parentNode !== root) {
        if (node.nodeName.toLowerCase() === 'sub') {
            style.vertAlign = 2;  // 下标
            break;
        }
        if (node.nodeName.toLowerCase() === 'sup') {
            style.vertAlign = 1;  // 上标
            break;
        }
        node = node.parentNode;
    }
}
```

### 3.4 段落和换行处理

- 检测 `<p>` 标签，在段落最后一个文本节点后添加 `\r\n`
- 检测 `<br>` 标签，直接插入 `\n` 换行符

```javascript
if (pNode && _getLastTextNode(pNode) === node && _getLastTextNode(root) !== node) {
    text = text + '\r\n';
    pNode = null;
}
```

### 3.5 富文本对象构建

将解析的文本和样式组装成 SpreadJS 富文本数组格式，并设置到单元格：

```javascript
sheet.setValue(2, 2, {
    richText: richtext
});
```

### 3.6 技术栈

- SpreadJS 15.0.0：电子表格核心库
- SystemJS 0.19.22：模块加载器
- TypeScript 4.1.2：类型支持

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，会自动解析页面中 `rich-editor-content` 类的 HTML 内容
2. 解析结果会显示在表格的 C3 单元格（第 2 行第 2 列）
3. 示例 HTML 内容为化学式 H₂O（包含下标格式）

## 五、功能特点

### 5.1 优点

- **完整的样式支持**：支持字体、颜色、粗体、斜体、下划线、删除线、上下标等常见富文本格式
- **原生 API 实现**：使用浏览器原生 NodeIterator API，性能高效且兼容性好
- **自动换行处理**：智能识别段落和换行标签，保持文本结构
- **可扩展性强**：代码结构清晰，易于扩展支持更多 HTML 标签和样式

### 5.2 局限性与扩展建议

- **样式覆盖范围**：当前仅支持基础文本样式，不支持背景色、边框等复杂样式
- **嵌套标签处理**：对于复杂嵌套的 HTML 结构，可能需要增强样式合并逻辑
- **扩展建议**：
  - 支持更多 HTML 标签（如 `<strong>`、`<em>`、`<span>` 等）
  - 添加样式缓存机制，优化大量文本的解析性能
  - 支持图片、链接等非文本元素的转换

## 六、关键代码片段

### 节点遍历主循环

```javascript
while (node !== null) {
    if (node.nodeType === 3 /*TextNode*/) {
        text = node.nodeValue;
        style = document.defaultView.getComputedStyle(node.parentElement, null);
        
        // 检查下划线和删除线状态
        if (underlineNode && underlineNode.contains(node) === false) {
            underlineNode = null;
        }
        if (lineThroughNode && lineThroughNode.contains(node) === false) {
            lineThroughNode = null;
        }
        
        // 处理段落结尾换行
        if (pNode && _getLastTextNode(pNode) === node && _getLastTextNode(root) !== node) {
            text = text + '\r\n';
            pNode = null;
        }
        
        let richTextStyle = getRichStyle(style, underlineNode, lineThroughNode);
        handleSuperAndSubScript(root, node, richTextStyle);
        richText.push({
            style: richTextStyle,
            text: text
        });
    } else if (node.nodeName.toLowerCase() === 'p') {
        pNode = node;
    } else if (node.nodeName.toLowerCase() === 'u') {
        underlineNode = node;
    } else if (node.nodeName.toLowerCase() === 'strike') {
        lineThroughNode = node;
    } else if (node.nodeName.toLowerCase() === 'br') {
        let richTextStyle = getRichStyle(style, underlineNode, lineThroughNode);
        handleSuperAndSubScript(root, node, richTextStyle);
        richText.push({
            style: richTextStyle,
            text: '\n'
        });
    }
    
    node = iterator.nextNode();
}
```

## 七、总结

本示例提供了一个完整的 HTML 富文本到 SpreadJS 富文本对象的转换方案，适用于需要从外部系统导入富文本数据的场景。开发者可以从中学到：

- NodeIterator API 的使用方法和遍历策略
- getComputedStyle 获取实际渲染样式的技巧
- SpreadJS 富文本对象的数据结构和样式配置
- DOM 树遍历中的状态管理和节点关系判断
- 文本装饰属性的位标志（bitwise）操作

该方案具有良好的扩展性，可以根据实际业务需求增加对更多 HTML 标签和样式的支持，是实现富文本数据互通的实用参考。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/7mRPr_wNlUyj7sIQBksOuA/)）
