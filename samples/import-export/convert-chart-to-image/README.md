## 一、Demo 概述

本示例展示了如何将 SpreadJS 中的图表转换为图片格式。通过调用 Canvas API 的 `toDataURL` 方法，可以将图表渲染的 Canvas 元素转换为 Base64 编码的 PNG 图片，并支持在新窗口中预览或批量导出所有工作表中的图表图片。

该功能适用于需要将图表导出为图片进行分享、打印或嵌入到其他文档的场景。

## 二、解决的问题

* **图表导出需求**：在实际业务中，用户经常需要将数据可视化图表导出为图片格式，用于报告、演示文稿或分享
* **批量处理场景**：当工作簿包含多个工作表和多个图表时，需要批量提取所有图表的图片数据
* **跨平台分享**：图片格式相比图表对象更易于在不同平台和应用间传递

## 三、实现思路

### 3.1 获取图表的 Canvas 元素

SpreadJS 的图表底层使用 Canvas 进行渲染。通过 `chart.getHost()` 方法可以获取图表的 DOM 容器，然后使用 `querySelector` 定位到内部的 Canvas 元素：

```javascript
var sheet = spread.getActiveSheet();
var chart = sheet.charts.all()[0];
var canvas = chart.getHost()[0].querySelector("canvas");
```

### 3.2 Canvas 转 Base64 图片

使用 Canvas API 的 `toDataURL` 方法将 Canvas 内容转换为 Base64 编码的 PNG 图片：

```javascript
var image = new Image();
image.src = canvas.toDataURL("image/png", 1);
image.style.width = "100%";
```

参数说明：

* 第一个参数 `"image/png"` 指定输出格式为 PNG
* 第二个参数 `1` 表示图片质量（0-1 之间，1 为最高质量）

### 3.3 新窗口预览图片

将生成的图片在新窗口中打开，窗口尺寸与图表尺寸一致：

```javascript
var w = window.open(image.src, 'Image', `width=${chart.width()},height=${chart.height()},resizable=1`);
w.document.write(image.outerHTML);
w.document.close();
```

### 3.4 批量转换所有图表

通过监听 `FloatingObjectLoaded` 事件，在图表加载完成时自动提取图片数据：

```javascript
var pics = [];

spread.bind(GC.Spread.Sheets.Events.FloatingObjectLoaded, function (e, info) {
    var sheet = info.sheet;
    var floatingObject = info.floatingObject;
    var canvas = floatingObject.getHost()[0].querySelector("canvas");
    if (canvas) {
        var image = new Image();
        image.src = canvas.toDataURL("image/png");
        pics.push(image.src);
    }
});
```

批量转换时，遍历所有工作表并激活每个图表，触发 `FloatingObjectLoaded` 事件：

```javascript
document.getElementById("convertAll").onclick = function () {
    pics = [];
    var sheetsCount = spread.getSheetCount();
    for (let i = 0; i < sheetsCount; i++) {
        var sheet = spread.getSheet(i);
        spread.setActiveSheet(sheet.name());
        var charts = sheet.charts.all();
        if (charts) {
            charts.forEach(function (c) {
                sheet.showRow(c.startRow(), GC.Spread.Sheets.VerticalPosition.top);
            });
        }
    }
    alert("转换成功，请打开F12查看");
    console.log(pics);
};
```

### 3.5 技术栈

* SpreadJS 15.2.0（核心表格组件）
* SpreadJS Charts 15.2.0（图表组件）
* SystemJS 0.19.22（模块加载器）
* TypeScript 4.1.2（开发语言）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，会自动加载包含三个工作表的工作簿，每个工作表包含一个图表
2. 点击"图表转图片"按钮，将当前激活工作表的第一个图表转换为图片并在新窗口中预览
3. 点击"所有图表转图片"按钮，批量转换所有工作表中的图表，转换结果保存在 `pics` 数组中
4. 打开浏览器开发者工具（F12），在控制台查看 `pics` 数组中的 Base64 图片数据

## 五、功能特点

### 5.1 优点

* **实现简单**：利用原生 Canvas API，无需额外的图片处理库
* **格式灵活**：支持 PNG、JPEG 等多种图片格式，可调整图片质量
* **批量处理**：通过事件监听机制，可高效处理多个图表的转换
* **即时预览**：支持在新窗口中直接预览转换后的图片

### 5.2 局限性与扩展建议

* **浏览器兼容性**：依赖 Canvas API 和 `toDataURL` 方法，需要现代浏览器支持
* **内存占用**：Base64 编码的图片数据较大，批量转换时需注意内存消耗
* **扩展建议**：
    * 可添加图片下载功能，将 Base64 数据转换为 Blob 并触发下载
    * 可支持自定义图片尺寸和分辨率
    * 可添加图片格式选择（PNG/JPEG/WebP）和质量调节功能

## 六、关键代码片段

### 单个图表转换核心代码

```javascript
document.getElementById("convert").onclick = function () {
    var sheet = spread.getActiveSheet();
    var chart = sheet.charts.all()[0];
    var canvas = chart.getHost()[0].querySelector("canvas");
    var image = new Image();
    image.src = canvas.toDataURL("image/png", 1);
    image.style.width = "100%";
    var w = window.open(image.src, 'Image', `width=${chart.width()},height=${chart.height()},resizable=1`);
    w.document.write(image.outerHTML);
    w.document.close();
};
```

### 批量转换事件监听

```javascript
spread.bind(GC.Spread.Sheets.Events.FloatingObjectLoaded, function (e, info) {
    var floatingObject = info.floatingObject;
    var canvas = floatingObject.getHost()[0].querySelector("canvas");
    if (canvas) {
        var image = new Image();
        image.src = canvas.toDataURL("image/png");
        pics.push(image.src);
    }
});
```

## 七、总结

本示例展示了 SpreadJS 图表转图片的完整实现方案，核心技术是利用 Canvas API 的 `toDataURL` 方法将图表渲染结果转换为 Base64 编码的图片数据。开发者可以从中学到：

* 如何获取 SpreadJS 图表的底层 Canvas 元素
* Canvas 转图片的标准方法和参数配置
* 通过 `FloatingObjectLoaded` 事件实现批量处理
* 新窗口预览图片的实现技巧

该方案适用于需要导出图表图片的各类场景，具有良好的扩展性，可根据实际需求添加下载、格式转换等功能。

[操作视频](DOCUMENT_SITE_VIDEO_BUTTON_PREFIX:https://videos.grapecity.com.cn/SpreadJS/CodeLibrary/Get%20a%20screenshot.mp4)

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/akk5bxZD5EGVWQQwjlQgJQ/){:target="_blank"}）



<br>
<br>
