## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现一键复制整个工作表（Sheet）的功能，并将复制的内容写入系统剪贴板。该功能通过监听 SpreadJS 的剪贴板变化事件，结合浏览器的 Clipboard API，实现了将整个工作表的数据（包括文本和 HTML 格式）复制到系统剪贴板，方便用户粘贴到其他应用程序中。

该示例适用于需要快速导出工作表数据、跨应用程序数据传输等场景，特别是在需要保留格式信息的数据复制操作中。

## 二、解决的问题

- **批量数据复制**：用户无需手动选择整个工作表范围，一键即可复制所有数据
- **格式保留**：同时复制文本和 HTML 格式，确保粘贴到其他应用时保留原有格式
- **跨应用数据传输**：通过系统剪贴板实现 SpreadJS 与其他应用程序之间的数据交互
- **提升用户体验**：简化复制操作流程，提高工作效率

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 自动选择整个工作表范围

通过 SpreadJS API 获取当前活动工作表的行列总数，然后使用 `addSelection` 方法选中整个工作表：

```javascript
var activeSheet = spread.getActiveSheet();
activeSheet.clearSelection()
activeSheet.addSelection(0, 0, activeSheet.getRowCount(), activeSheet.getColumnCount())
```

- `clearSelection()`：清除当前选区，避免与之前的选择冲突
- `addSelection(0, 0, rowCount, colCount)`：从第一行第一列开始，选择所有行和列

#### 3.1.2 执行复制命令

使用 SpreadJS 的命令管理器执行复制操作：

```javascript
spread.commandManager().execute({
    cmd: "copy",
    sheetName: activeSheet.name(),
    ignoreClipboard: true
})
```

- `cmd: "copy"`：指定执行复制命令
- `ignoreClipboard: true`：关键参数，阻止 SpreadJS 自动写入系统剪贴板，由自定义逻辑处理

#### 3.1.3 监听剪贴板变化事件并写入系统剪贴板

通过监听 `ClipboardChanged` 事件，获取复制的数据并使用浏览器 Clipboard API 写入系统剪贴板：

```javascript
spread.bind(GC.Spread.Sheets.Events.ClipboardChanged, function (sender, args) {
    let ci = new ClipboardItem({
        "text/plain": new Blob([args.copyData.text], { type: "text/plain" }),
        "text/html": new Blob([args.copyData.html], { type: "text/html" })
    })
    setTimeout(() => {
        navigator.clipboard.write([ci])
    }, 0);
});
```

- `args.copyData.text`：纯文本格式的复制数据
- `args.copyData.html`：HTML 格式的复制数据，保留样式和格式
- `ClipboardItem`：浏览器标准 API，支持多种 MIME 类型
- `setTimeout`：异步执行，确保剪贴板操作不阻塞主线程

### 3.2 技术栈

- **SpreadJS 16.0.1**：核心电子表格组件
- **SpreadJS Designer**：提供设计器界面
- **SystemJS**：模块加载器
- **Clipboard API**：浏览器原生剪贴板接口

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 使用本地服务器打开 index.html
# 例如使用 http-server 或 live-server
npx http-server
```

### 4.2 操作步骤

1. 在浏览器中打开示例页面
2. 在 SpreadJS Designer 中编辑工作表内容（默认已有示例数据）
3. 点击页面顶部的 "copy整个sheet" 按钮
4. 打开其他应用程序（如 Excel、Word、记事本）
5. 使用 Ctrl+V（或 Cmd+V）粘贴数据，验证格式是否保留

### 4.3 注意事项

- **HTTPS 要求**：Clipboard API 需要在 HTTPS 环境或 localhost 下运行，否则浏览器会因安全策略禁用剪贴板写入功能
- **浏览器兼容性**：需要支持 Clipboard API 的现代浏览器（Chrome 76+、Edge 79+、Safari 13.1+）

## 五、功能特点

### 5.1 优点

- **操作简便**：一键完成整个工作表的复制，无需手动选择范围
- **格式完整**：同时支持纯文本和 HTML 格式，适配不同应用场景
- **性能优化**：使用异步操作，不阻塞用户界面
- **标准化实现**：基于浏览器标准 Clipboard API，兼容性好

### 5.2 局限性与扩展建议

- **HTTPS 限制**：生产环境必须部署 HTTPS 证书，否则功能无法使用
- **大数据量性能**：当工作表数据量极大时，复制操作可能耗时较长，建议添加加载提示
- **扩展方向**：
  - 添加复制进度提示
  - 支持复制指定范围而非整个工作表
  - 提供复制成功/失败的用户反馈

## 六、关键代码片段

### 完整的按钮点击事件处理

```javascript
document.getElementById("copyBtn").addEventListener("click", function () {
    var activeSheet = spread.getActiveSheet();
    // 清除现有选区
    activeSheet.clearSelection()
    // 选择整个工作表（从 0,0 到最大行列）
    activeSheet.addSelection(0, 0, activeSheet.getRowCount(), activeSheet.getColumnCount())
    // 执行复制命令，ignoreClipboard 阻止默认剪贴板行为
    spread.commandManager().execute({
        cmd: "copy",
        sheetName: activeSheet.name(),
        ignoreClipboard: true
    })
})
```

### 剪贴板事件监听与数据写入

```javascript
spread.bind(GC.Spread.Sheets.Events.ClipboardChanged, function (sender, args) {
    // 创建包含多种格式的剪贴板项
    let ci = new ClipboardItem({
        "text/plain": new Blob([args.copyData.text], { type: "text/plain" }),
        "text/html": new Blob([args.copyData.html], { type: "text/html" })
    })
    // 异步写入系统剪贴板
    setTimeout(() => {
        navigator.clipboard.write([ci])
    }, 0);
});
```

## 七、总结

本示例展示了 SpreadJS 与浏览器 Clipboard API 的深度集成，通过监听剪贴板事件和自定义复制逻辑，实现了一键复制整个工作表的功能。开发者可以从中学到：

- SpreadJS 命令管理器的使用方法
- 剪贴板事件的监听与数据获取
- 浏览器 Clipboard API 的实际应用
- 多格式数据的剪贴板写入技巧

该方案适用于需要快速导出工作表数据的场景，可扩展为支持自定义范围复制、批量复制多个工作表等高级功能。在实际应用中，建议结合用户权限控制和数据脱敏机制，确保数据安全。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/SAQW8zK2nEqPNYwKvlCYxg/)）
