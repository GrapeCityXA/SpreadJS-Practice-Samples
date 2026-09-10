## 一、Demo 概述

本示例演示了如何在不同网页间复制粘贴 SpreadJS 单元格时保留 Tag 信息。在默认情况下，浏览器的剪贴板只会复制单元格的值和样式，而不会携带自定义的 Tag 数据。该示例通过监听剪贴板事件，将 Tag 信息序列化后嵌入到 HTML 剪贴板数据中，实现跨页面的 Tag 数据传递。

## 二、解决的问题

在实际业务场景中，开发者经常需要为单元格附加额外的元数据（如数据来源、业务标识、关联 ID 等），这些信息通过 SpreadJS 的 Tag 功能存储。但当用户在不同浏览器标签页或窗口间复制粘贴单元格时，Tag 信息会丢失，导致数据关联断裂。本示例解决了这一痛点，确保 Tag 信息能够随单元格数据一起传递。

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 监听剪贴板复制事件并提取 Tag 信息

通过监听 `ClipboardChanged` 事件，在用户复制单元格时遍历选中区域，提取每个单元格的 Tag 数据并构建二维数组结构：

```javascript
spread.bind(GC.Spread.Sheets.Events.ClipboardChanged, function (sender, args) {
    let tags = [];
    let selectedRange = args.sheet.getSelections()[0]
    for (let r = selectedRange.row; r < selectedRange.row + selectedRange.rowCount; r++) {
        tags[`${r - selectedRange.row}`] = []
        for (let c = selectedRange.col; c < selectedRange.col + selectedRange.colCount; c++) {
            tags[`${r - selectedRange.row}`][`${c - selectedRange.col}`] = { tag: args.sheet.getTag(r, c) }
        }
    }
    // 将 Tag 数据嵌入 HTML 剪贴板
    let html = args.copyData.html.split("</html>")[0] + `<tagcontent>${JSON.stringify(tags)}</tagcontent></html>`
    let ci = new ClipboardItem({
        "text/plain": new Blob([args.copyData.text], { type: "text/plain" }),
        "text/html": new Blob([html], { type: "text/html" })
    })
    setTimeout(() => {
        navigator.clipboard.write([ci])
    }, 0);
});
```

关键点：

* 使用相对坐标（`r - selectedRange.row`）存储 Tag，确保粘贴到不同位置时能正确映射
* 将 Tag 数据序列化为 JSON 并嵌入自定义 `<tagcontent>` 标签
* 使用 `navigator.clipboard.write()` 覆盖系统剪贴板

#### 3.1.2 监听粘贴事件并恢复 Tag 信息

通过监听 `ClipboardPasting` 事件，在粘贴时解析 HTML 中的 Tag 数据并恢复到目标单元格：

```javascript
spread.bind(GC.Spread.Sheets.Events.ClipboardPasting, function (sender, args) {
    if (args.pasteData.html.indexOf("<tagcontent") == -1) {
        return
    }
    let dom = document.createElement("div")
    dom.innerHTML = args.pasteData.html
    let tags = dom.querySelector("tagcontent").innerText
    if (!tags) {
        return
    }
    tags = JSON.parse(tags)
    setTimeout(() => {
        let selectedRange = args.sheet.getSelections()[0]
        for (let r = selectedRange.row; r < selectedRange.row + selectedRange.rowCount; r++) {
            for (let c = selectedRange.col; c < selectedRange.col + selectedRange.colCount; c++) {
                let tag = tags[`${r - selectedRange.row}`][`${c - selectedRange.col}`].tag
                if (tag) {
                    args.sheet.setTag(r, c, tag)
                }
            }
        }
    }, 0);
});
```

关键点：

* 检查 HTML 中是否包含 `<tagcontent>` 标签，避免处理普通粘贴
* 使用 DOM 解析提取 Tag 数据
* 使用 `setTimeout` 确保在 SpreadJS 完成默认粘贴后再设置 Tag

### 3.2 技术栈

* SpreadJS 16.0.1（核心表格组件）
* SpreadJS Designer 16.0.1（设计器组件）
* Clipboard API（浏览器剪贴板接口）
* SystemJS（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件（需要本地 Web 服务器或支持 ES 模块的环境）。

### 4.2 操作步骤

1. 同时打开两个浏览器标签页，加载该示例
2. 在页面 1 中，选中包含 Tag 的单元格（示例已预设 4 个单元格的 Tag 数据）
3. 按 `Ctrl+C` 复制单元格
4. 切换到页面 2，选中目标位置
5. 按 `Ctrl+V` 粘贴
6. 在页面 2 中通过 `sheet.getTag(row, col)` 验证 Tag 是否成功传递

## 五、功能特点

### 5.1 优点

* 无需服务器支持，纯前端实现跨页面数据传递
* 兼容 SpreadJS 原生复制粘贴功能，不影响正常使用
* Tag 数据结构灵活，支持任意 JSON 可序列化对象

### 5.2 局限性与扩展建议

* **HTTPS 限制**：`navigator.clipboard.write()` 在非 HTTPS 环境下会被浏览器安全策略阻止，部署时需配置 SSL 证书
* **浏览器兼容性**：Clipboard API 在旧版浏览器中可能不支持，建议添加降级方案
* **扩展建议**：可以将该方案扩展到其他自定义数据（如公式元数据、验证规则等）

## 六、关键代码片段

### 初始化示例数据

```javascript
let sheet = spread.getActiveSheet()

sheet.setValue(1, 1, 1)
sheet.setTag(1, 1, "tag1")

sheet.setValue(1, 2, 2)
sheet.setTag(1, 2, "tag2")

sheet.setValue(2, 1, 3)
sheet.setTag(2, 1, "tag3")

sheet.setValue(2, 2, 4)
sheet.setTag(2, 2, "tag4")
```

该代码在工作表中创建了一个 2x2 的数据区域，每个单元格都附加了对应的 Tag 标识。

## 七、总结

本示例展示了如何通过浏览器 Clipboard API 和 SpreadJS 事件机制实现跨网页的 Tag 数据传递。开发者可以从中学到：

1. SpreadJS 剪贴板事件的监听和数据拦截方法
2. 浏览器 Clipboard API 的使用和安全限制
3. 自定义数据在 HTML 剪贴板中的嵌入和提取技术
4. 异步操作中 `setTimeout` 的时序控制技巧

该方案适用于需要在多窗口或多标签页间保持数据完整性的场景，如协同编辑、数据审核、跨系统数据迁移等。通过类似的思路，还可以扩展到其他自定义元数据的传递需求。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
