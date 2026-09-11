## 一、Demo 概述

本示例展示了如何使用 SpreadJS 将工作表内容导出为图片格式（PNG）。通过拦截打印事件，将打印预览中生成的图片提取出来，并使用 Canvas API 转换为可下载的图片文件。该方案适用于需要将表格数据以图片形式保存或分享的场景。 

## 二、解决的问题

* **图片导出需求**：在某些业务场景中，用户需要将表格内容导出为图片格式，而不是 Excel 或 PDF 文件
* **打印预览复用**：利用 SpreadJS 的打印功能生成高质量的表格图片，无需额外的渲染逻辑
* **批量导出**：支持将工作簿中的多个工作表分别导出为独立的图片文件

## 三、实现思路

### 3.1 配置打印信息

为了生成高质量的图片，需要配置打印参数。关键点是将 `qualityFactor` 设置为大于 4 的值，这样 SpreadJS 才会在打印预览中生成图片而非矢量图形。

```javascript
let printInfo = sheet.printInfo() || new GC.Spread.Sheets.Print.PrintInfo()
printInfo.qualityFactor(9)  // 打印质量大于4时才会生成图片
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
printInfo.paperSize(new GC.Spread.Sheets.Print.PaperSize(GC.Spread.Sheets.Print.PaperKind.a3))
```

### 3.2 拦截打印事件并提取图片

通过监听 `BeforePrint` 事件，在打印预览生成后拦截 iframe 中的图片元素，使用 Canvas API 将图片转换为 Blob 对象并触发下载。

```javascript
spread.bind(GC.Spread.Sheets.Events.BeforePrint, (s, e) => {
    let iframe = e.iframe
    let imgs = iframe.contentWindow.document.getElementsByTagName("img")
    
    for (let i = 0; i < imgs.length; i++) {
        let img = imgs[i]
        let canvas = document.createElement("canvas")
        canvas.height = img.naturalHeight
        canvas.width = img.naturalWidth
        let ctx = canvas.getContext('2d')
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
        canvas.toBlob((blob) => {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "test" + i + ".png";
            link.click();
            link.remove();
        })
        e.cancel = true  // 取消实际的打印操作
    }
})
```

### 3.3 触发导出

通过按钮点击事件调用 `spread.print()` 方法，触发打印流程，进而触发 `BeforePrint` 事件完成图片导出。

```javascript
document.getElementById('exportImgs').onclick = () => {
    spread.print()
}
```

### 3.4 技术栈

* SpreadJS 15.0.0（核心表格组件）
* @grapecity/spread-sheets-print 15.0.0（打印功能）
* @grapecity/spread-sheets-pdf 15.0.0（PDF 支持）
* Canvas API（图片转换）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 使用本地服务器打开 index.html（如 Live Server）
```

### 4.2 操作步骤

1. 在浏览器中打开 index.html
2. 页面会显示一个包含示例数据的表格
3. 点击"导出图片"按钮
4. 浏览器会自动下载生成的 PNG 图片文件（文件名为 test0.png、test1.png 等）

## 五、功能特点

### 5.1 优点

* **高质量输出**：通过 `qualityFactor` 参数控制图片质量，确保导出的图片清晰度
* **实现简单**：复用打印功能，无需额外的渲染逻辑
* **灵活配置**：可以自定义纸张大小、边距、是否显示行列标题等打印参数

### 5.2 局限性与扩展建议

* **同步下载限制**：当前实现会同时触发多个下载，浏览器可能会拦截。建议改为异步队列下载或打包为 ZIP
* **文件命名**：当前使用固定的 "test" + 索引命名，建议根据工作表名称或用户输入自定义文件名
* **格式扩展**：可以通过修改 `canvas.toBlob()` 的参数支持 JPEG 等其他图片格式

## 六、关键代码片段

### Canvas 图片转换逻辑

```javascript
let canvas = document.createElement("canvas")
canvas.height = img.naturalHeight
canvas.width = img.naturalWidth
let ctx = canvas.getContext('2d')
ctx.fillStyle = '#fff'
ctx.fillRect(0, 0, canvas.width, canvas.height)  // 填充白色背景
ctx.drawImage(img, 0, 0)  // 绘制图片
canvas.toBlob((blob) => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "test" + i + ".png";
    link.click();
    link.remove();
})
```

该代码段的关键点：

* 使用 `naturalHeight` 和 `naturalWidth` 获取图片原始尺寸
* 先填充白色背景，避免透明区域显示为黑色
* 使用 `toBlob()` 异步生成 Blob 对象，避免阻塞主线程

## 七、总结

本示例展示了一种巧妙的图片导出方案，通过拦截打印事件复用 SpreadJS 的渲染能力。开发者可以从中学到：

* SpreadJS 打印功能的配置方法
* `BeforePrint` 事件的使用技巧
* Canvas API 进行图片格式转换的实现
* 浏览器端文件下载的触发方式

该方案适用于需要将表格内容快速导出为图片的场景，特别是在不需要复杂排版的情况下。如需更精细的控制，可以考虑结合 PDF 导出功能或使用服务端渲染方案。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
