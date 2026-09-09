## 一、Demo 概述

本示例展示了如何在 SpreadJS 中为图表添加自定义右键菜单，实现图表截图并复制到系统剪贴板的功能。用户可以在选中图表后，通过右键菜单中的"复制为图片"选项，将图表以 PNG 格式复制到剪贴板，方便在其他应用程序中粘贴使用。

该示例基于 SpreadJS Designer 组件，通过扩展上下文菜单和使用 Canvas API 实现了图表的截图功能，适用于需要快速导出图表图片的业务场景。

## 二、解决的问题

- **图表快速导出**：用户无需通过复杂的导出流程，即可快速将图表复制为图片
- **剪贴板集成**：直接将图表截图写入系统剪贴板，支持在 Word、PowerPoint 等应用中直接粘贴
- **自定义右键菜单**：扩展 SpreadJS Designer 的上下文菜单，提供更符合业务需求的交互方式

## 三、实现思路

### 3.1 自定义右键菜单命令

通过修改 Designer 的配置对象，添加自定义的右键菜单命令：

```javascript
var designerConfig = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig));
designerConfig.commandMap = {
    "copyAsPicture":{
        text: "复制为图片(自定义）",
        commandName: "copyAsPicture",
        visibleContext:"ChartSelected",  // 仅在图表被选中时显示
        execute: async function(designer){
            getScreenshot(designer.getWorkbook());
        }
    }
}
designerConfig.contextMenu.unshift("copyAsPicture");  // 将命令添加到右键菜单顶部
```

关键点：
- `visibleContext: "ChartSelected"` 确保该菜单项仅在图表被选中时显示
- `contextMenu.unshift()` 将自定义命令添加到右键菜单的最前面

### 3.2 获取选中图表的 Canvas 元素

遍历当前工作表中的所有图表，找到被选中的图表并获取其 Canvas 元素：

```javascript
function getScreenshotBlob(spread) {
    return new Promise(function (resolve, reject) {
        let sheet = spread.getActiveSheet()
        let selectedChart;
        for(let i = 0; i < sheet.charts.all().length; i++){
            let chart = sheet.charts.all()[i];
            if(chart && chart.isSelected()){
                selectedChart = chart;
                break;
            }
        }

        if(!selectedChart){
            return;
        }

        let canvas = chart.getHost()[0].getElementsByTagName('canvas')[0];
        canvas.toBlob((blob) => {
            resolve(blob)
        })
    });
}
```

实现原理：
- 通过 `chart.isSelected()` 判断图表是否被选中
- 使用 `chart.getHost()` 获取图表的 DOM 容器
- 从容器中提取 Canvas 元素，调用 `toBlob()` 方法将其转换为 Blob 对象

### 3.3 写入系统剪贴板

使用现代浏览器的 Clipboard API 将图片写入剪贴板：

```javascript
let getScreenshot = async function (spread) {
    try {
        const makeImagePromise = async () => {
            return await getScreenshotBlob(spread)
        }
        // 为了支持Safari，write必须在事件中，当前的content不能因为异步改变
        await navigator.clipboard.write(
            [new ClipboardItem({ ["image/png"]: makeImagePromise() })]
        )
    } catch (err) {
        console.log(`${err.name}:  ${err.message}`)
    }
    finally{
        console.log('success')
    }
}
```

技术要点：
- 使用 `navigator.clipboard.write()` API 写入剪贴板
- 通过 `ClipboardItem` 包装 Blob 数据，指定 MIME 类型为 `image/png`
- 为了兼容 Safari 浏览器，必须在用户事件回调中直接调用 `clipboard.write()`

### 3.4 技术栈

- SpreadJS 16.0.1（核心表格组件）
- SpreadJS Designer 16.0.1（设计器组件）
- SpreadJS Charts 16.0.1（图表模块）
- TypeScript 4.1.2（开发语言）
- SystemJS 0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，会自动加载包含三个工作表的示例数据，每个工作表包含一个柱状图
2. 在任意图表上点击鼠标左键选中图表（图表周围会出现选择框）
3. 在选中的图表上点击鼠标右键，弹出上下文菜单
4. 点击菜单中的"复制为图片(自定义）"选项
5. 打开任意支持图片粘贴的应用程序（如 Word、PowerPoint、画图工具等）
6. 使用 Ctrl+V（或 Cmd+V）粘贴图片

## 五、功能特点

### 5.1 优点

- **操作便捷**：右键菜单集成，符合用户操作习惯
- **无需额外依赖**：直接使用浏览器原生 Clipboard API，无需第三方库
- **高质量输出**：直接从 Canvas 元素获取图片，保证图表质量
- **跨应用兼容**：复制到剪贴板后可在任意支持图片粘贴的应用中使用

### 5.2 局限性与扩展建议

- **浏览器兼容性**：Clipboard API 需要 HTTPS 环境或 localhost，且部分旧版浏览器不支持
- **仅支持图表**：当前实现仅针对图表，可扩展为支持形状、单元格区域等其他对象
- **扩展建议**：
  - 添加图片格式选择（JPEG、WebP 等）
  - 支持自定义图片分辨率
  - 添加下载到本地的选项

## 六、关键代码片段

### 自定义命令注册

```javascript
designerConfig.commandMap = {
    "copyAsPicture":{
        text: "复制为图片(自定义）",
        commandName: "copyAsPicture",
        visibleContext:"ChartSelected",
        execute: async function(designer){
            getScreenshot(designer.getWorkbook());
        }
    }
}
```

### Canvas 转 Blob

```javascript
let canvas = chart.getHost()[0].getElementsByTagName('canvas')[0];
canvas.toBlob((blob) => {
    resolve(blob)
})
```

### 剪贴板写入

```javascript
await navigator.clipboard.write(
    [new ClipboardItem({ ["image/png"]: makeImagePromise() })]
)
```

## 七、总结

本示例展示了如何通过扩展 SpreadJS Designer 的上下文菜单，结合浏览器原生 Clipboard API，实现图表的快速截图和复制功能。开发者可以从中学习到：

- SpreadJS Designer 自定义命令的注册方法
- 图表对象的选择状态判断和 DOM 元素访问
- Canvas 元素转换为 Blob 的技术
- 现代浏览器 Clipboard API 的使用方法
- 异步操作与 Promise 的结合使用

该方案适用于需要快速导出图表图片的场景，具有良好的扩展性，可以根据实际需求进一步定制功能。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/9y_wpY6mxkCaQt49UWXTkg/)）
