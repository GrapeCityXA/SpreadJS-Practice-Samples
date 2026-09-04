## 一、Demo 概述

本示例展示了如何将 SpreadJS 工作簿导出为图片格式（JPEG）。通过拦截打印事件，将打印预览中生成的图片元素转换为 Canvas，最终保存为本地图片文件。该方案巧妙地利用了 SpreadJS 的打印功能来实现工作表的图片导出。

## 二、解决的问题

在实际业务场景中，用户经常需要将电子表格内容导出为图片格式，用于报告、分享或存档。该示例解决了以下问题：

- 将 SpreadJS 工作表内容转换为图片格式
- 控制导出图片的质量和尺寸
- 隐藏打印时的行列头，使导出的图片更简洁
- 过滤异常比例的图片元素，避免导出无效内容

## 三、实现思路

### 3.1 核心技术点

#### 利用打印事件拦截图片生成

该示例的核心思路是监听 `BeforePrint` 事件，在打印预览生成后拦截其中的图片元素。SpreadJS 的打印功能会在 iframe 中生成工作表的图片预览，通过访问 iframe 中的 DOM 元素，可以获取这些图片并进行处理。

```javascript
spread.bind(GC.Spread.Sheets.Events.BeforePrint, function (s, e) {
    var iframe = e.iframe;
    var images = iframe.contentWindow.document.getElementsByTagName("img");
    // 遍历所有图片元素进行处理
    for (var i = 0; i < images.length; i++) {
        var img = images[i];
        // 过滤异常比例的图片
        let width = img.style.width.split("px")[0]
        let height = img.style.height.split("px")[0]
        if(parseFloat(width) / parseFloat(height) > 10) {
            continue
        }
        // 将图片转换为 Canvas 并保存
    }
    e.cancel = true; // 取消实际打印操作
});
```

#### Canvas 转换与图片保存

获取到图片元素后，使用 Canvas API 将其绘制到画布上，然后通过 `toBlob` 方法转换为 Blob 对象，最后使用 FileSaver.js 库保存到本地。

```javascript
var canvas = document.createElement("canvas");
canvas.height = img.naturalHeight;
canvas.width = img.naturalWidth;
var ctx = canvas.getContext('2d');
ctx.fillStyle = "#FFF";
ctx.fillRect(0, 0, canvas.width, canvas.height); // 填充白色背景
ctx.drawImage(img, 0, 0);
canvas.toBlob(function (blob) {
    saveAs(blob, "print.jpeg");
}, "image/jpeg", 1); // 质量参数为 1（最高质量）
```

#### 打印配置优化

通过配置 `printInfo` 对象，可以控制导出图片的质量和显示内容：

```javascript
let printInfo = sheet.printInfo()
// 质量因子大于 4 才会生成图片，设置为 6 保证高质量
printInfo.qualityFactor(6)
// 打印时隐藏列头和行头
printInfo.showColumnHeader(GC.Spread.Sheets.Print.PrintVisibilityType.hide)
printInfo.showRowHeader(GC.Spread.Sheets.Print.PrintVisibilityType.hide)
// 设置打印纸张为 A3，确保内容在一张图片中
printInfo.paperSize(new GC.Spread.Sheets.Print.PaperSize(GC.Spread.Sheets.Print.PaperKind.a3))
```

#### 防止重复触发

使用 `isPrinting` 标志位防止用户在导出过程中重复点击按钮，并在导出完成后解绑事件监听器：

```javascript
let isPrinting = false
document.getElementById("save").addEventListener("click", function () {
    if (isPrinting) {
        return; // 正在导出时直接返回
    }
    isPrinting = true;
    // ... 导出逻辑
    setTimeout(function () {
        isPrinting = false;
        spread.unbind(GC.Spread.Sheets.Events.BeforePrint)
    }, 10)
});
```

### 3.2 技术栈

- SpreadJS 16.0.1：核心电子表格组件
- @grapecity/spread-sheets-print 16.0.1：打印功能扩展
- @grapecity/spread-sheets-pdf 16.0.1：PDF 导出支持
- FileSaver.js 2.0.5：文件保存库
- SystemJS：模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，工作表中会显示预设的测试文本
2. 点击页面顶部的"保存为图片"按钮
3. 浏览器会自动下载生成的 `print.jpeg` 图片文件
4. 打开下载的图片，可以看到工作表内容已被导出为图片

## 五、功能特点

### 5.1 优点

- 实现简单，利用现有的打印功能，无需额外的图片渲染逻辑
- 支持自定义图片质量和纸张大小
- 可以灵活控制导出内容（如隐藏行列头）
- 使用 Canvas 技术，兼容性好

### 5.2 局限性与扩展建议

- 当前实现只导出活动工作表，如需导出多个工作表，需要遍历所有 sheet
- 文件名固定为 `print.jpeg`，可以扩展为支持自定义文件名
- 如果工作表内容较多，可能需要调整纸张大小或分页导出
- 可以扩展支持 PNG 格式，通过修改 `toBlob` 的 MIME 类型参数实现

## 六、总结

本示例展示了一种巧妙的工作表导出方案，通过拦截打印事件来实现图片导出功能。开发者可以从中学到：

- SpreadJS 打印事件的使用方式
- Canvas API 的图片处理技巧
- 如何配置打印参数以优化导出效果
- 事件监听器的绑定与解绑管理

该方案适用于需要将电子表格内容快速导出为图片的场景，特别是在不需要复杂格式转换的情况下，是一种高效实用的解决方案。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/xrbYXTsPZE201nna2LlzUA/)）
