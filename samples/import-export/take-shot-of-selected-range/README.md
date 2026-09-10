## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现选择区域的截图功能，并将截图自动复制到系统剪切板。用户可以在表格中选择任意区域，点击按钮后即可获取该区域的高质量截图，支持 Chrome 和 Safari 浏览器的剪切板 API。该功能适用于需要快速导出表格局部数据为图片的场景，如报表分享、数据展示等。 

## 二、解决的问题

* 快速导出表格选中区域为图片，无需手动截屏或使用第三方工具
* 自动将截图放入系统剪切板，方便用户直接粘贴到其他应用程序
* 生成高质量的表格截图，保留单元格格式和样式
* 支持现代浏览器的异步剪切板 API，提升用户体验

## 三、实现思路

### 3.1 核心技术点

#### 利用打印功能生成图片

SpreadJS 本身不直接提供截图 API，但可以通过打印功能（Print API）来生成图片。核心思路是配置打印参数，将选中区域作为打印范围，并在打印前拦截生成的图片数据。

```javascript
let printInfo = new GC.Spread.Sheets.Print.PrintInfo()
// 打印质量大于4时才会生成图片
printInfo.qualityFactor(5)
printInfo.margin({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    header: 0,
    footer: 0
});
printInfo.showColumnHeader(GC.Spread.Sheets.Print.PrintVisibilityType.hide)
printInfo.showRowHeader(GC.Spread.Sheets.Print.PrintVisibilityType.hide)
printInfo.showBorder(false)
```

关键参数说明：

* `qualityFactor(5)`：设置打印质量为 5，确保生成图片而非 PDF
* `margin` 设置为 0：去除所有边距，确保截图紧凑
* 隐藏行列标题和边框：生成纯净的表格内容

#### 动态设置打印区域为选中区域

通过 `getSelections()` 获取用户当前选中的区域，并将其设置为打印范围：

```javascript
let selection = sheet.getSelections()[0]
printInfo.rowStart(selection.row);
printInfo.rowEnd(selection.row + selection.rowCount - 1);
printInfo.columnStart(selection.col);
printInfo.columnEnd(selection.col + selection.colCount - 1);
printInfo.fitPagesTall(1);
printInfo.fitPagesWide(1);
```

`fitPagesTall(1)` 和 `fitPagesWide(1)` 确保选中区域缩放到一页内，避免分页。

#### 拦截打印事件获取图片数据

通过监听 `BeforePrint` 事件，在打印前从 iframe 中提取生成的图片，并转换为 Blob 对象：

```javascript
spread.bind(GC.Spread.Sheets.Events.BeforePrint + ".screenshot", (s, e) => {
    let iframe = e.iframe
    let imgs = iframe.contentWindow.document.getElementsByTagName("img")
    if (imgs && imgs.length) {
        let img = imgs[0]
        let canvas = document.createElement("canvas")
        canvas.height = img.naturalHeight
        canvas.width = img.naturalWidth
        let ctx = canvas.getContext('2d')
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
        canvas.toBlob((blob) => {
            resolve(blob)
        })
        e.cancel = true
        spread.unbind(GC.Spread.Sheets.Events.BeforePrint + ".screenshot")
        sheet.printInfo(oldPrintInfo)
    }
})
spread.print(spread.getActiveSheetIndex());
```

关键步骤：

1. 从打印 iframe 中获取生成的 img 元素
2. 创建 Canvas 并绘制白色背景（避免透明背景）
3. 将图片绘制到 Canvas 上
4. 使用 `toBlob()` 转换为 Blob 对象
5. 取消打印操作（`e.cancel = true`）并恢复原打印配置

#### 使用异步剪切板 API 写入图片

为了兼容 Safari 浏览器，使用 `navigator.clipboard.write()` 配合 `ClipboardItem` 和 Promise：

```javascript
const makeImagePromise = async () => {
    return await getScreenshotBlbo()
}
// 为了支持Safari，write必须在事件中，当前的content不能因为异步改变
await navigator.clipboard.write(
    [new ClipboardItem({ ["image/png"]: makeImagePromise() })]
)
```

Safari 要求 `clipboard.write()` 必须在用户事件处理函数中同步调用，因此将异步的图片生成逻辑封装为 Promise，传递给 `ClipboardItem`。

### 3.2 UI 交互流程

用户选择表格区域 → 点击"获取截图"按钮 → 按钮禁用（防止重复点击）→ 生成截图并写入剪切板 → 弹出成功提示 → 按钮恢复可用

### 3.3 技术栈

* SpreadJS 15.2.0：核心表格组件
* SpreadJS Designer 15.2.0：设计器组件
* SpreadJS Print 15.2.0：打印功能模块
* SystemJS：模块加载器
* TypeScript 4.1.2：开发语言

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 使用本地服务器打开 index.html（如 Live Server）
```

### 4.2 操作步骤

1. 在表格中选择任意区域（单个单元格或多个单元格）
2. 点击页面顶部的"获取截图"按钮
3. 等待截图生成（按钮会暂时禁用）
4. 看到"截图成功，已放置在系统剪切板！"提示后，可在其他应用中粘贴（Ctrl+V 或 Cmd+V）

## 五、功能特点

### 5.1 优点

* 无需第三方截图工具，纯前端实现
* 自动复制到剪切板，操作便捷
* 支持任意区域选择，灵活性高
* 生成高质量图片（qualityFactor 为 5）

### 5.2 局限性与扩展建议

* 仅支持 Chrome 和 Safari 浏览器（依赖 Clipboard API）
* 不支持跨工作表的多选区域截图
* 扩展建议：
    * 添加下载功能，支持不兼容剪切板 API 的浏览器
    * 支持自定义图片格式（JPEG、WebP）
    * 添加图片质量和尺寸的配置选项

## 六、关键代码片段

### 暂停和恢复计算服务

在截图过程中暂停计算服务，避免性能影响：

```javascript
spread.suspendCalcService(true);
// ... 截图逻辑
spread.resumeCalcService(false)
```

### 防止重复点击

通过禁用按钮和 `setTimeout` 延迟执行，避免用户重复触发：

```javascript
document.getElementById("screenshot").disabled = true;
setTimeout(async function(){
    // ... 截图逻辑
    document.getElementById("screenshot").disabled = false;
}, 50);
```

## 七、总结

本示例展示了如何利用 SpreadJS 的打印功能实现表格区域截图，并结合现代浏览器的剪切板 API 提供流畅的用户体验。开发者可以从中学到：

* SpreadJS Print API 的高级用法（打印配置、事件拦截）
* Canvas 图片处理技术（绘制背景、转换 Blob）
* 异步剪切板 API 的正确使用方式（兼容 Safari）
* 用户交互优化技巧（按钮状态管理、错误处理）

该方案适用于需要快速导出表格局部数据为图片的场景，代码简洁且易于扩展，可根据实际需求添加下载、格式选择等功能。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
