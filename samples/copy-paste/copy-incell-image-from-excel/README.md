## 一、Demo 概述

本示例演示了如何在 SpreadJS 中实现从 Excel 或 WPS 复制单元格内嵌图片并粘贴到表格中的功能。通过监听浏览器的粘贴事件，识别剪贴板中的图片数据，并使用 SpreadJS 的 `image()` 公式将图片插入到指定单元格中，实现了与 Excel 类似的单元格内图片粘贴体验。

## 二、解决的问题

在实际业务场景中，用户经常需要从 Excel 或 WPS 中复制包含图片的单元格内容到 Web 表格应用中。该示例解决了以下核心问题：

* 识别并区分单元格内图片和浮动图片的粘贴操作
* 从剪贴板中提取图片二进制数据并转换为可用格式
* 将图片正确插入到当前活动单元格中
* 保持与 Excel/WPS 一致的用户操作体验

## 三、实现思路

### 3.1 核心技术点

#### 监听粘贴事件并解析剪贴板数据

通过监听全局 `paste` 事件，获取剪贴板中的数据项，遍历所有数据类型以识别图片内容：

```javascript
window.addEventListener("paste", function (e) {
    var clipboardData = e.clipboardData;
    var blob = void 0, items = clipboardData.items;
    var text = clipboardData.getData('text/plain');
    let hasImg = false
    for (var i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") === 0) {
            blob = items[i].getAsFile();
            if (blob) {
                hasImg = true
                break;
            }
        }
    }
}, true);
```

该代码通过检查 `clipboardData.items` 中的 MIME 类型来判断是否包含图片数据，并使用 `getAsFile()` 方法获取图片的 Blob 对象。

#### 区分单元格内图片和浮动图片

通过检查剪贴板中的纯文本内容来判断图片类型。Excel/WPS 在复制单元格内图片时会在文本数据中包含特定标识：

```javascript
if (hasImg) {
    if (text && (text.indexOf("图片") > -1 || text.toLowerCase().indexOf("dispimg") > -1)) {
        // 处理单元格内图片
        // ...
        return
    }
}
// 如果没有特定标识，则交给 SpreadJS 默认处理（浮动图片）
```

当文本中包含"图片"或"dispimg"关键字时，判定为单元格内图片；否则由 SpreadJS 的默认粘贴机制处理浮动图片。

#### 图片数据转换与插入

使用 FileReader 将 Blob 对象转换为 Base64 编码的 Data URL，然后通过 SpreadJS 的 `image()` 公式插入到单元格：

```javascript
var reader = new FileReader();
reader.onload = function (event) {
    var img = new Image();
    img.src = event.target.result;
    img.onload = function () {
        let sheet = spread.getActiveSheet()
        let row = sheet.getActiveRowIndex()
        let col = sheet.getActiveColumnIndex()
        // 单元格内图片
        sheet.setFormula(row, col, "image(\"" + img.src + "\")")
    };
};
reader.readAsDataURL(blob);
```

这段代码首先将图片加载到 Image 对象中以确保图片有效，然后获取当前活动单元格的行列索引，最后使用 `setFormula()` 方法设置 `image()` 公式，将图片嵌入到单元格中。

### 3.2 技术栈

* @grapecity/spread-sheets: 17.0.8（核心表格组件）
* SystemJS: ^0.19.22（模块加载器）
* systemjs-plugin-babel: 0.0.25（ES6 转译支持）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 在浏览器中打开 `index.html` 文件
2. 在 Excel 或 WPS 中选择包含单元格内图片的单元格
3. 使用 Ctrl+C 复制该单元格
4. 在 SpreadJS 表格中点击目标单元格
5. 使用 Ctrl+V 粘贴，图片将自动插入到当前单元格中

## 五、功能特点

### 5.1 优点

* 智能识别单元格内图片和浮动图片，分别处理
* 使用 SpreadJS 原生 `image()` 公式，保证兼容性和性能
* 支持从 Excel 和 WPS 两种主流办公软件复制图片
* 代码简洁，易于理解和维护

### 5.2 局限性与扩展建议

当前实现依赖剪贴板文本中的特定关键字来判断图片类型，可能在某些特殊场景下识别不准确。建议扩展方向：

* 增加对更多图片格式的支持（如 SVG）
* 添加图片尺寸和位置的自定义配置
* 支持批量粘贴多个单元格内图片

## 六、关键代码片段

完整的粘贴事件处理逻辑：

```javascript
window.addEventListener("paste", function (e) {
    var clipboardData = e.clipboardData;
    var blob = void 0, items = clipboardData.items;
    var text = clipboardData.getData('text/plain');
    let hasImg = false
    
    // 遍历剪贴板数据项，查找图片
    for (var i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") === 0) {
            blob = items[i].getAsFile();
            if (blob) {
                hasImg = true
                break;
            }
        }
    }
    
    // 如果包含图片且文本中有特定标识，则处理为单元格内图片
    if (hasImg) {
        if (text && (text.indexOf("图片") > -1 || text.toLowerCase().indexOf("dispimg") > -1)) {
            if (blob) {
                var reader = new FileReader();
                reader.onload = function (event) {
                    var img = new Image();
                    img.src = event.target.result;
                    img.onload = function () {
                        let sheet = spread.getActiveSheet()
                        let row = sheet.getActiveRowIndex()
                        let col = sheet.getActiveColumnIndex()
                        // 使用 image() 公式插入单元格内图片
                        sheet.setFormula(row, col, "image(\"" + img.src + "\")")
                    };
                };
                reader.readAsDataURL(blob);
            }
            return
        }
    }
    // 其他情况交给 SpreadJS 默认处理
}, true);
```

## 七、总结

本示例展示了如何通过监听浏览器粘贴事件和解析剪贴板数据，实现从 Excel/WPS 复制单元格内图片到 SpreadJS 的功能。开发者可以从中学到：

* 浏览器剪贴板 API 的使用方法
* 如何区分和处理不同类型的粘贴数据
* FileReader API 进行图片数据转换的技巧
* SpreadJS `image()` 公式的实际应用
* 事件监听和异步数据处理的最佳实践

该方案适用于需要在 Web 表格应用中支持 Excel 图片粘贴的场景，具有良好的扩展性，可根据实际需求进行功能增强。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
