## 一、Demo 概述

本示例展示了如何在 SpreadJS Designer 中实现自定义右键菜单功能，允许用户通过右键菜单将选中的单元格区域复制为图片并保存到系统剪贴板。该功能利用 SpreadJS 的打印 API 生成高质量的单元格截图，并通过现代浏览器的 Clipboard API 实现图片复制。

## 二、解决的问题

* **快速导出单元格内容为图片**：用户可以将表格中的特定区域快速转换为图片格式，方便在文档、演示文稿或其他应用中使用
* **自定义右键菜单扩展**：演示如何在 SpreadJS Designer 中添加自定义命令到右键菜单，增强用户交互体验
* **跨应用数据共享**：通过剪贴板 API 实现与其他应用程序的无缝数据交换

## 三、实现思路

### 3.1 自定义右键菜单命令

通过修改 Designer 的配置对象，在 `commandMap` 中注册自定义命令，并将其添加到右键菜单中：

```javascript
var designerConfig = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig));
designerConfig.commandMap = {
    "copyAsPicture":{
        text: "复制为图片（自定义）",
        commandName: "copyAsPicture",
        visibleContext:"ClickViewport",
        execute: async function(designer){
            getScreenshot(designer.getWorkbook());
        }
    }
}
designerConfig.contextMenu.unshift("copyAsPicture");
```

### 3.2 利用打印 API 生成截图

核心技术是通过配置 `PrintInfo` 对象，将选中区域作为打印范围，并在打印前事件中拦截生成的图片：

```javascript
function getScreenshotBlbo(spread) {
    return new Promise(function (resolve, reject) {
        let sheet = spread.getActiveSheet()
        let printInfo = new GC.Spread.Sheets.Print.PrintInfo()
        
        // 设置高质量打印参数
        printInfo.qualityFactor(5)  // 打印质量大于4时才会生成图片
        printInfo.margin({ top: 0, bottom: 0, left: 0, right: 0, header: 0, footer: 0 });
        printInfo.showColumnHeader(GC.Spread.Sheets.Print.PrintVisibilityType.hide)
        printInfo.showRowHeader(GC.Spread.Sheets.Print.PrintVisibilityType.hide)
        printInfo.showBorder(false)
        
        // 根据选中区域设置打印范围
        let selection = sheet.getSelections()[0]
        printInfo.rowStart(selection.row);
        printInfo.rowEnd(selection.row + selection.rowCount - 1);
        printInfo.columnStart(selection.col);
        printInfo.columnEnd(selection.col + selection.colCount - 1);
        printInfo.fitPagesTall(1);
        printInfo.fitPagesWide(1);
        
        sheet.printInfo(printInfo)
        
        // 监听打印前事件，拦截生成的图片
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
                e.cancel = true  // 取消实际打印操作
                spread.unbind(GC.Spread.Sheets.Events.BeforePrint + ".screenshot")
            }
        })
        
        spread.print(spread.getActiveSheetIndex());
    });
}
```

### 3.3 使用 Clipboard API 复制图片

通过现代浏览器的 Clipboard API 将生成的图片 Blob 写入剪贴板：

```javascript
let getScreenshot = async function (spread) {
    try {
        const makeImagePromise = async () => {
            return await getScreenshotBlbo(spread)
        }
        // 为了支持Safari，write必须在事件中，当前的content不能因为异步改变
        await navigator.clipboard.write(
            [new ClipboardItem({ ["image/png"]: makeImagePromise() })]
        )
    } catch (err) {
        console.log(`${err.name}:  ${err.message}`)
    }
}
```

### 3.4 技术栈

* SpreadJS 16.0.1（核心表格组件）
* SpreadJS Designer 16.0.1（设计器组件）
* SpreadJS Print 16.0.1（打印功能模块）
* SystemJS 0.19.22（模块加载器）
* TypeScript 4.1.2（开发语言）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件。

### 4.2 操作步骤

1. 页面加载后会显示一个包含示例数据的 SpreadJS Designer 界面
2. 使用鼠标框选任意单元格区域
3. 在选中区域上点击鼠标右键
4. 在右键菜单中选择"复制为图片（自定义）"选项
5. 图片将自动复制到系统剪贴板
6. 可以在任意支持图片粘贴的应用中使用 Ctrl+V 粘贴图片

## 五、功能特点

### 5.1 优点

* **高质量截图**：通过 `qualityFactor(5)` 设置确保生成高清晰度的图片
* **精确区域控制**：支持任意单元格区域的截图，自动适配选中范围
* **无边框干净输出**：隐藏行列标题和边框，输出纯净的单元格内容
* **浏览器兼容性**：使用 Promise 包装确保在 Safari 等浏览器中正常工作

### 5.2 局限性与扩展建议

* **浏览器限制**：Clipboard API 需要 HTTPS 环境或 localhost，且部分旧版浏览器不支持
* **扩展方向**：
    * 可以添加图片格式选择（PNG、JPEG）
    * 支持自定义图片质量参数
    * 添加下载到本地文件的选项
    * 支持批量截图功能

## 六、关键代码片段

### 打印配置与事件拦截

```javascript
// 配置打印参数
let printInfo = new GC.Spread.Sheets.Print.PrintInfo()
printInfo.qualityFactor(5)  // 关键：质量因子必须大于4才会生成图片
printInfo.fitPagesTall(1);
printInfo.fitPagesWide(1);

// 拦截打印事件获取图片
spread.bind(GC.Spread.Sheets.Events.BeforePrint + ".screenshot", (s, e) => {
    let iframe = e.iframe
    let imgs = iframe.contentWindow.document.getElementsByTagName("img")
    if (imgs && imgs.length) {
        let img = imgs[0]
        // 使用 Canvas 转换为 Blob
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
        e.cancel = true  // 取消实际打印
    }
})
```

## 七、总结

本示例展示了 SpreadJS 的高级扩展能力，通过巧妙利用打印 API 和事件机制实现了单元格截图功能。开发者可以从中学到：

* SpreadJS Designer 自定义命令和右键菜单的扩展方法
* 打印 API 的非常规应用场景（生成图片而非打印）
* 现代浏览器 Clipboard API 的使用技巧
* Promise 和 async/await 在异步操作中的实践
* Canvas API 进行图片处理的基本方法

该方案适用于需要将表格数据快速转换为图片的场景，如报表导出、数据分享、文档编辑等，具有良好的扩展性和实用价值。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
