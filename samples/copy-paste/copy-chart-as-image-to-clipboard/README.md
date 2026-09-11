## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现将图表复制到系统剪贴板的功能。用户可以通过 Ctrl+C 快捷键或右键菜单复制选中的图表，然后在任意支持图片输入的应用程序（如 Word、Excel、微信输入框等）中粘贴该图表的图片形式。

该功能通过监听 SpreadJS 的剪贴板事件，将图表转换为 PNG 图片格式，并利用浏览器的 Clipboard API 写入系统剪贴板，实现了跨应用程序的图表复制粘贴。

## 二、解决的问题

在实际业务场景中，用户经常需要将 SpreadJS 中的图表分享到其他应用程序中。传统的截图方式操作繁琐且可能损失图片质量。本示例解决了以下问题：

* 提供便捷的图表导出方式，用户可以像操作原生 Excel 一样复制图表
* 支持跨应用程序粘贴，无需额外的导出和导入步骤
* 保持图表的清晰度，通过程序化方式生成高质量的 PNG 图片

## 三、实现思路

### 3.1 监听剪贴板变化事件

通过监听 SpreadJS 的 `ClipboardChanging` 事件，可以在用户执行复制操作时拦截并处理图表对象：

```javascript
spread.bind(GC.Spread.Sheets.Events.ClipboardChanging, function (e, info) {
    if (info.objects && info.objects[0] instanceof GC.Spread.Sheets.Charts.Chart) {
        // 复制时将图表写入剪贴板
        writeChart2Clipboard(info.objects[0])
    }
})
```

该事件会在剪贴板内容发生变化时触发，通过检查 `info.objects` 是否为图表对象，可以判断用户是否正在复制图表。

### 3.2 图表转换为图片并写入剪贴板

核心实现函数 `writeChart2Clipboard` 负责将图表转换为 PNG 图片并写入系统剪贴板：

```javascript
function writeChart2Clipboard(chart) {
    if (chart.isSelected()) {
        fetch(chart.toImageSrc()).then(res => {
            res.blob().then(b => {
                let item = new ClipboardItem({
                    "image/png": b
                })
                navigator.clipboard.write([item])
            })
        })
    }
}
```

实现步骤：

1. 检查图表是否被选中
2. 调用 `chart.toImageSrc()` 方法获取图表的 Base64 图片数据 URL
3. 使用 `fetch` 将 Data URL 转换为 Blob 对象
4. 创建 `ClipboardItem` 对象，指定 MIME 类型为 `image/png`
5. 调用 `navigator.clipboard.write()` 将图片写入系统剪贴板

### 3.3 技术栈

* SpreadJS 17.1.5：核心表格控件
* SpreadJS Charts 17.1.5：图表功能模块
* SpreadJS Designer 17.1.5：设计器组件
* Clipboard API：浏览器原生剪贴板接口

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行示例。

### 4.2 操作步骤

1. 打开示例页面，页面会自动加载包含饼图的工作簿
2. 点击选中页面中的图表
3. 使用 Ctrl+C 快捷键或右键菜单选择"复制"
4. 打开任意支持图片输入的应用程序（如 Word、微信聊天窗口）
5. 使用 Ctrl+V 粘贴，图表将以 PNG 图片形式插入

## 五、功能特点

### 5.1 优点

* 操作简便：用户使用标准的复制粘贴快捷键即可完成操作
* 跨应用兼容：支持粘贴到任何接受图片输入的应用程序
* 图片质量高：通过程序化方式生成图片，保证清晰度

### 5.2 局限性与扩展建议

* 浏览器兼容性：Clipboard API 需要 HTTPS 环境或 localhost，且部分旧版浏览器不支持
* 图片格式固定：当前仅支持 PNG 格式，可扩展支持 JPEG、SVG 等格式
* 扩展建议：可以添加图片分辨率配置选项，允许用户自定义导出图片的尺寸和质量

## 六、关键代码片段

### 初始化 SpreadJS Designer

```javascript
import * as GC from "@grapecity/spread-sheets";
import "@grapecity/spread-sheets-charts"
import "@grapecity/spread-sheets-designer"

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
let spread = designer.getWorkbook()
spread.fromJSON(JSON.parse(getData()))
```

该代码创建了 SpreadJS Designer 实例，并加载预定义的工作簿数据（包含一个饼图）。

## 七、总结

本示例展示了如何利用 SpreadJS 的图表 API 和浏览器的 Clipboard API 实现图表的跨应用复制功能。开发者可以从中学到：

* SpreadJS 剪贴板事件的监听和处理
* 图表对象的类型判断和状态检查
* 图表转换为图片的方法（`toImageSrc()`）
* 浏览器 Clipboard API 的使用方式

该方案适用于需要将 SpreadJS 图表分享到其他应用程序的场景，具有良好的用户体验和扩展性。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
