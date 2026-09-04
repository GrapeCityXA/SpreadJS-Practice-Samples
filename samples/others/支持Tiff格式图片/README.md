## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现对 TIFF 格式图片的支持。由于浏览器原生不支持 TIFF 格式图片的显示，该示例通过集成第三方 TIFF 解析库（tiff.min.js），将 TIFF 图片转换为浏览器可识别的 DataURL 格式，然后使用 SpreadJS 的 Shapes API 将图片插入到工作表中。同时，该示例也支持其他常见图片格式（BMP、GIF、JPEG、PNG）的上传和显示。

## 二、解决的问题

在实际业务场景中，用户可能需要在电子表格中插入各种格式的图片，包括医疗影像、扫描文档等常用的 TIFF 格式文件。然而，浏览器原生不支持 TIFF 格式的显示，这给 Web 端的电子表格应用带来了挑战。本示例通过以下方式解决了这个问题：

- 集成第三方 TIFF 解析库，实现 TIFF 格式的解码和转换
- 统一处理多种图片格式的上传流程
- 使用 SpreadJS Shapes API 将图片以形状的方式插入到工作表中

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 TIFF 格式检测与分流处理

通过检查上传文件的 MIME 类型，对 TIFF 格式和其他图片格式采用不同的处理方式：

```javascript
if (blob.type == 'image/tiff') {
    fileReader.onload = function (e) {
        let file = e.target.result
        let tiff = new Tiff({ buffer: file });
        sheet.shapes.addPictureShape('pic2', tiff.toDataURL(), 80, 80, 150, 150);
    };
    fileReader.readAsArrayBuffer(blob)
} else {
    fileReader.onload = function (e) {
        let file = e.target.result
        sheet.shapes.addPictureShape('pic1', file, 80, 80, 150, 150);
    };
    fileReader.readAsDataURL(blob)
}
```

对于 TIFF 格式，使用 `readAsArrayBuffer()` 读取文件为二进制数据，然后通过 Tiff 库转换为 DataURL；对于其他格式，直接使用 `readAsDataURL()` 读取。

#### 3.1.2 TIFF 图片解析与转换

使用第三方 tiff.min.js 库将 TIFF 二进制数据转换为浏览器可识别的 DataURL：

```javascript
let tiff = new Tiff({ buffer: file });
sheet.shapes.addPictureShape('pic2', tiff.toDataURL(), 80, 80, 150, 150);
```

Tiff 库的 `toDataURL()` 方法会将 TIFF 图片转换为 Base64 编码的 PNG 或 JPEG 格式 DataURL。

#### 3.1.3 使用 Shapes API 插入图片

SpreadJS 通过 Shapes API 提供了图片插入功能，`addPictureShape()` 方法接受以下参数：

```javascript
sheet.shapes.addPictureShape(name, src, left, top, width, height);
```

- `name`: 图片形状的唯一标识
- `src`: 图片的 DataURL 或 URL
- `left`, `top`: 图片在工作表中的位置（像素）
- `width`, `height`: 图片的宽度和高度（像素）

### 3.2 技术栈

- SpreadJS 16.0.1：核心电子表格组件
- @grapecity/spread-sheets-shapes 16.0.1：图形和图片支持
- tiff.min.js：TIFF 格式解析库
- SystemJS：模块加载器
- TypeScript 4.1.2：开发语言

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

然后在浏览器中打开 `index.html` 文件。

### 4.2 操作步骤

1. 点击"选择文件"按钮，从本地选择一张图片（支持 BMP、GIF、JPEG、JPG、PNG、TIFF 格式）
2. 点击"上传图片"按钮
3. 图片将自动插入到工作表的指定位置（左上角坐标 80, 80，尺寸 150x150 像素）

## 五、功能特点

### 5.1 优点

- 扩展了 SpreadJS 对图片格式的支持，解决了浏览器不支持 TIFF 格式的问题
- 代码结构清晰，通过类型判断实现了不同格式的分流处理
- 使用 FileReader API 实现了纯前端的图片处理，无需服务器端支持

### 5.2 局限性与扩展建议

- 当前实现中图片插入位置和尺寸是固定的，可以扩展为支持用户自定义位置和尺寸
- 可以添加图片预览功能，让用户在上传前查看图片效果
- 可以支持批量上传多张图片
- 可以添加图片格式验证和文件大小限制，提升用户体验和安全性

## 六、关键代码片段

### 文件上传监听器

```javascript
document.getElementById('upload').addEventListener('click', function () {
    let blob = document.querySelector('#selectedFile').files[0];
    if (!blob) {
        return;
    }
    let fileReader = new FileReader();
    // 根据文件类型选择不同的处理方式
    if (blob.type == 'image/tiff') {
        // TIFF 格式处理
        fileReader.onload = function (e) {
            let file = e.target.result
            let tiff = new Tiff({ buffer: file });
            sheet.shapes.addPictureShape('pic2', tiff.toDataURL(), 80, 80, 150, 150);
        };
        fileReader.readAsArrayBuffer(blob)
    } else {
        // 其他格式处理
        fileReader.onload = function (e) {
            let file = e.target.result
            sheet.shapes.addPictureShape('pic1', file, 80, 80, 150, 150);
        };
        fileReader.readAsDataURL(blob)
    }
})
```

## 七、总结

本示例展示了如何通过集成第三方库来扩展 SpreadJS 的功能，使其支持浏览器原生不支持的 TIFF 图片格式。开发者可以从中学到：

- 如何使用 FileReader API 读取本地文件
- 如何根据文件类型采用不同的处理策略
- 如何使用第三方库解析特殊格式的图片
- 如何使用 SpreadJS Shapes API 插入图片到工作表

该方案适用于需要在 Web 端电子表格中处理多种图片格式的场景，特别是医疗、档案管理等需要支持 TIFF 格式的行业应用。通过类似的思路，开发者还可以扩展支持其他特殊格式的文件。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/9i_sFml41k69NRQaURCF8Q/)）
