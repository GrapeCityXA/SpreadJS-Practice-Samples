## 一、Demo 概述

本示例演示了如何在 SpreadJS 中实现 SSJSON 格式文件的导入和导出功能。SSJSON 是 SpreadJS 的原生 JSON 序列化格式，包含了工作簿的完整状态信息（数据、样式、公式、设置等）。该示例提供了一个简洁的界面，允许用户通过文件选择器加载本地 .ssjson 文件到表格中，或将当前表格内容导出为 .ssjson 文件下载到本地。

## 二、解决的问题

- 实现 SpreadJS 工作簿数据的本地持久化存储
- 支持完整的工作簿状态保存和恢复（包括数据、样式、公式等）
- 提供轻量级的文件交换格式，便于在不同系统间传递表格数据

## 三、实现思路

### 3.1 SSJSON 导入功能

通过 HTML5 File API 读取用户选择的本地文件，使用 FileReader 将文件内容读取为文本，然后解析 JSON 并调用 SpreadJS 的 `fromJSON()` 方法恢复工作簿状态。

```javascript
function loadSsjson() {
    let file = document.getElementById('fileDemo').files[0]
    let reader = new FileReader()
    reader.readAsText(file, "UTF-8")
    reader.onload = function(e) {
        let fileStr = e.target.result
        let jsonObj = JSON.parse(fileStr)
        spread.fromJSON(jsonObj)
    }
}
```

### 3.2 SSJSON 导出功能

调用 SpreadJS 的 `toJSON()` 方法将当前工作簿序列化为 JSON 对象，然后将其转换为字符串，创建 Blob 对象并通过动态生成的 `<a>` 标签触发浏览器下载。

```javascript
function exportSsjon() {
    let fileJson = JSON.stringify(spread.toJSON())
    let eleLink = document.createElement('a');
    eleLink.download = 'test.ssjson';
    eleLink.style.display = 'none';
    // 字符转换为blob对象
    let blob = new Blob([fileJson]);
    eleLink.href = URL.createObjectURL(blob);
    document.body.appendChild(eleLink);
    // 触发点击
    eleLink.click()
    // 然后移除
    document.body.removeChild(eleLink);
}
```

### 3.3 技术栈

- SpreadJS 15.0.0：核心表格组件
- SystemJS 0.19.22：模块加载器
- TypeScript 4.1.2：开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 使用本地服务器打开 index.html（如 Live Server）
```

### 4.2 操作步骤

1. 打开页面后，会看到一个空白的 SpreadJS 表格和三个控件（文件选择器、导入按钮、导出按钮）
2. 导入操作：点击"选择文件"按钮，选择一个 .ssjson 文件，然后点击"导入ssjson"按钮，表格会加载文件中的内容
3. 导出操作：在表格中编辑数据后，点击"导出ssjson"按钮，浏览器会自动下载名为 test.ssjson 的文件

## 五、功能特点

### 5.1 优点

- 实现简单，核心代码不到 40 行
- 使用 SpreadJS 原生 API，无需第三方库
- 支持完整的工作簿状态保存（数据、样式、公式、设置等）
- 文件格式为纯文本 JSON，易于调试和版本控制

### 5.2 局限性与扩展建议

- 当前导入时会弹出 alert 显示文件内容，生产环境应移除
- 导出文件名固定为 test.ssjson，可改为动态命名
- 缺少错误处理机制（如文件格式校验、JSON 解析异常处理）
- 可扩展为支持拖拽上传、批量导入导出等功能

## 六、总结

本示例展示了 SpreadJS 中 SSJSON 格式的基本导入导出操作，适合作为学习 SpreadJS 数据持久化的入门案例。开发者可以从中学到：

- SpreadJS 的 `toJSON()` 和 `fromJSON()` API 使用方法
- HTML5 File API 的文件读取技术
- Blob 和 URL.createObjectURL 实现浏览器端文件下载
- SystemJS 模块化开发的基本配置

该方案适用于需要在浏览器端实现表格数据本地保存和加载的场景，可作为更复杂数据交换功能的基础。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/yNaQqgEmj0_CuK6wSa01dw/)）
