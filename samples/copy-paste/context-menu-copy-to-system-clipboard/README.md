## 一、Demo 概述

本示例演示了如何在 SpreadJS 中实现右键菜单复制时将数据写入系统剪贴板的功能。通过监听 ClipboardChanging 事件并使用浏览器的 Clipboard API，实现了将表格数据（包括 HTML 格式和纯文本格式）同步写入系统剪贴板，使用户可以在外部应用程序（如 Excel）中直接粘贴带格式的数据。

## 二、解决的问题

在默认情况下，SpreadJS 的复制操作可能无法完全将格式化数据写入系统剪贴板，导致用户在外部应用程序中粘贴时丢失样式和格式。本示例解决了以下问题：

* 确保右键复制操作能够将 HTML 格式的数据写入系统剪贴板
* 同时提供纯文本格式作为备选，提高兼容性
* 实现 SpreadJS 与外部应用程序（如 Excel、Word）之间的无缝数据交换

## 三、实现思路

### 3.1 核心技术点

#### 监听剪贴板变化事件

通过绑定 `ClipboardChanging` 事件来拦截复制操作，获取复制的数据内容：

```javascript
spread.bind(GC.Spread.Sheets.Events.ClipboardChanging, function (e, info) {
    if (info.copyData && info.copyData.html) {
        // 处理复制数据
    }
})
```

该事件在剪贴板内容即将改变时触发，`info.copyData` 包含了复制的数据对象，其中 `html` 属性包含 HTML 格式的数据，`text` 属性包含纯文本数据。

#### 使用 Clipboard API 写入系统剪贴板

利用现代浏览器的 `navigator.clipboard.write()` API 将多种格式的数据写入系统剪贴板：

```javascript
navigator.clipboard.write([new ClipboardItem({
    "text/html": new Blob([info.copyData.html], { type: "text/html" }),
    "text/plain": new Blob([info.copyData.text], { type: "text/plain" })
})])
```

通过 `ClipboardItem` 对象同时写入 HTML 和纯文本两种格式，确保在不同应用程序中粘贴时都能获得最佳效果。

#### 初始化示例数据

在工作表中设置示例数据和样式，用于测试复制功能：

```javascript
let sheet = spread.getActiveSheet()
sheet.setValue(1, 1, "GrapeCity")
sheet.setValue(2, 2, "SpreadJS")
let style = new GC.Spread.Sheets.Style()
style.backColor = "green"
sheet.setStyle(1, 1, style)
```

### 3.2 技术栈

* @grapecity/spread-sheets: 17.0.8（核心表格组件）
* @grapecity/spread-sheets-designer: 17.0.8（设计器组件）
* SystemJS: 0.19.22（模块加载器）
* Clipboard API（浏览器原生 API）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 在浏览器中打开示例页面
2. 选中表格中的任意区域（例如包含 "GrapeCity" 的绿色单元格）
3. 右键点击选中区域，选择"复制"
4. 打开本地 Excel 或其他支持粘贴的应用程序
5. 执行粘贴操作（Ctrl+V），验证数据和格式是否正确保留

## 五、功能特点

### 5.1 优点

* 支持多格式写入：同时写入 HTML 和纯文本格式，提高兼容性
* 保留样式信息：HTML 格式能够保留单元格的背景色、字体等样式
* 无缝集成：与 SpreadJS 的原生复制功能完美配合
* 跨应用支持：可在 Excel、Word 等多种应用程序中粘贴

### 5.2 局限性与扩展建议

* 浏览器兼容性：Clipboard API 需要 HTTPS 环境或 localhost，且部分旧版浏览器不支持
* 权限要求：首次使用时浏览器可能会请求剪贴板访问权限
* 扩展建议：可以添加错误处理机制，在 Clipboard API 不可用时提供降级方案

## 六、关键代码片段

完整的事件绑定和剪贴板写入逻辑：

```javascript
spread.bind(GC.Spread.Sheets.Events.ClipboardChanging, function (e, info) {
    // 检查是否存在复制数据和 HTML 格式
    if (info.copyData && info.copyData.html) {
        // 使用 Clipboard API 写入系统剪贴板
        navigator.clipboard.write([new ClipboardItem({
            "text/html": new Blob([info.copyData.html], { type: "text/html" }),
            "text/plain": new Blob([info.copyData.text], { type: "text/plain" })
        })])
    }
})
```

## 七、总结

本示例展示了如何通过监听 SpreadJS 的剪贴板事件并结合浏览器的 Clipboard API，实现将表格数据完整地写入系统剪贴板。开发者可以从中学到：

* SpreadJS 剪贴板事件的使用方法
* 浏览器 Clipboard API 的实际应用
* 多格式数据的剪贴板写入技巧
* SpreadJS 与外部应用程序的数据交互方案

该方案适用于需要在 SpreadJS 与其他办公软件之间频繁交换数据的场景，具有良好的扩展性，可以根据实际需求添加更多数据格式或自定义处理逻辑。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
