## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现单元格手写输入功能，并通过 OCR（光学字符识别）技术将手写内容自动转换为文本。用户可以在指定单元格中双击进入手写模式，使用鼠标或触控笔在画布上书写，退出编辑后系统会自动识别手写内容并填充到单元格中。 

该示例适用于需要手写输入的场景，如移动端表单填写、签名采集、手写笔记录入等业务需求。

## 二、解决的问题

* 在电子表格中提供手写输入能力，满足触控设备和手写笔用户的输入需求
* 通过 OCR 技术自动识别手写内容，避免手动转录，提高数据录入效率
* 保留手写原始图像数据，支持重新编辑和查看手写内容
* 为移动端和平板设备提供更自然的输入方式

## 三、实现思路

### 3.1 自定义单元格类型

通过继承 `GC.Spread.Sheets.CellTypes.Base` 创建自定义的手写输入单元格类型，重写关键方法实现手写编辑器：

```javascript
function HandwritingCellType() { }

HandwritingCellType.prototype = new spreadNS.CellTypes.Base();

// 创建编辑器元素 - 返回 Canvas 画布
HandwritingCellType.prototype.createEditorElement = function (context) {
    var canvas = document.createElement('canvas');
    canvas.className = 'handwriting-canvas';
    canvas.width = context.sheet.getColumnWidth(context.col);
    canvas.height = context.sheet.getRowHeight(context.row);
    
    var isDrawing = false;
    var ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    
    // 监听鼠标/触控事件实现绘制
    canvas.addEventListener('pointerdown', function (e) {
        isDrawing = true;
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    });
    
    canvas.addEventListener('pointermove', function (e) {
        if (isDrawing) {
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
        }
    });
    
    canvas.addEventListener('pointerup', function () {
        isDrawing = false;
    });
    
    return canvas;
};
```

### 3.2 手写内容持久化

使用单元格的 Tag 属性存储手写图像的 Base64 数据，确保手写内容可以被保存和重新加载：

```javascript
function saveCanvasToTag(canvas, sheet, row, col) {
    var dataURL = canvas.toDataURL();
    sheet.setTag(row, col, dataURL);
}

HandwritingCellType.prototype.setEditorValue = function (editorContext, cellStyle, cellRect, context) {
    var canvas = editorContext;
    var ctx = canvas.getContext("2d");
    
    // 加载之前保存的图片内容
    var tag = cellRect.sheet.getTag(cellRect.row, cellRect.col);
    
    if (tag) {
        var img = new Image();
        img.src = tag;
        img.onload = function () {
            ctx.drawImage(img, 0, 0);
        };
    }
};
```

### 3.3 OCR 识别集成

使用 Tesseract.js 库对手写内容进行 OCR 识别，支持中英文混合识别：

```javascript
async function recognizeHandwriting(dataURL) {
    try {
        const result = await Tesseract.recognize(
            dataURL,
            'eng+chi_sim', // 英文 + 简体中文语言包
            {
                logger: m => console.log(m)
            }
        );
        return result.data.text;
    } catch (err) {
        console.error('OCR recognition error:', err);
        throw err;
    }
}

HandwritingCellType.prototype.getEditorValue = function (editorContext, context) {
    var canvas = editorContext;
    saveCanvasToTag(canvas, sheet, context.row, context.col);
    
    try {
        recognizeHandwriting(canvas.toDataURL()).then(res => {
            context.sheet.setValue(context.row, context.col, res);
            spread.refresh();
        });
    } catch (err) {
        console.error('OCR 识别出错:', err);
    }
};
```

### 3.4 UI 交互流程

用户操作 → 双击 B2 单元格 → 进入手写编辑模式（Canvas 画布） → 使用鼠标/触控笔绘制 → 点击其他区域退出编辑 → 自动保存手写图像到 Tag → 调用 OCR 识别 → 将识别结果填充到单元格

### 3.5 技术栈

* SpreadJS 17.0.8：电子表格核心库
* SpreadJS Designer 17.0.8：设计器组件
* Tesseract.js：开源 OCR 识别引擎（需在 HTML 中引入）
* SystemJS：模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在 index.html 中添加 Tesseract.js CDN 引用（代码中已使用但 HTML 未引入）
<script src="https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js"></script>

# 使用本地服务器打开 index.html
# 例如使用 VS Code 的 Live Server 插件或其他 HTTP 服务器
```

### 4.2 操作步骤

1. 打开页面后会看到 SpreadJS Designer 界面
2. 在 A2 单元格会显示提示文字："请在B2单元格双击进入手写模式"
3. 双击 B2 单元格进入编辑模式，此时会显示一个 Canvas 画布
4. 使用鼠标或触控笔在画布上书写文字或数字
5. 点击其他单元格或按 Enter 键退出编辑
6. 系统会自动进行 OCR 识别，识别结果会显示在单元格中
7. 再次双击 B2 单元格，可以看到之前的手写内容被重新加载

## 五、功能特点

### 5.1 优点

* 提供直观的手写输入体验，适合触控设备使用
* 自动 OCR 识别，无需手动转录手写内容
* 手写图像持久化存储，支持重新编辑和查看原始手写内容
* 支持中英文混合识别，适用范围广

### 5.2 局限性与扩展建议

当前实现的局限性：

* OCR 识别准确率依赖于手写质量和 Tesseract.js 引擎能力
* 未提供清除画布、撤销等辅助功能
* 识别过程是异步的，用户体验可能不够流畅
* 未处理识别失败的错误提示

扩展建议：

* 添加工具栏：提供清除、撤销、重做、调整笔触粗细等功能
* 优化 UI 反馈：在识别过程中显示加载动画，识别完成后提供确认/修改选项
* 支持多种 OCR 引擎：集成更高精度的商业 OCR API（如百度 OCR、腾讯 OCR）
* 添加手写训练模式：允许用户纠正识别结果以提高准确率
* 支持手写签名场景：保留原始手写图像作为单元格背景，识别文本作为数据值

## 六、关键代码片段

### 动态调整编辑器尺寸

当单元格尺寸变化时，自动调整 Canvas 画布大小：

```javascript
HandwritingCellType.prototype.updateEditor = function (editorContext, cellStyle, cellRect) {
    if (editorContext) {
        editorContext.style.width = cellRect.width + 'px';
        editorContext.style.height = cellRect.height + 'px';
    }
};
```

### 应用自定义单元格类型

将手写单元格类型应用到指定单元格：

```javascript
var handwritingCellType = new HandwritingCellType();
sheet.getCell(1, 1).cellType(handwritingCellType); // B2 单元格（行列索引从 0 开始）
```

## 七、总结

本示例展示了 SpreadJS 自定义单元格类型的强大扩展能力，通过结合 Canvas 绘图和 OCR 识别技术，实现了手写输入到文本转换的完整流程。开发者可以从中学到：

* 如何创建自定义单元格类型并重写编辑器行为
* Canvas 绘图 API 的基本使用和事件处理
* 使用单元格 Tag 属性存储自定义数据
* 集成第三方 OCR 库进行图像识别
* 异步操作与 SpreadJS 数据更新的协调

该方案适用于需要手写输入的移动端应用、签名采集系统、手写笔记应用等场景，具有良好的扩展性和实用价值。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
