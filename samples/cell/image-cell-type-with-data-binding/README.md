## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现图片单元格的数据绑定功能。通过自定义单元格类型（CellType），将图片以 Base64 格式存储在数据源中，并在单元格中以图片形式渲染显示。用户可以点击指定单元格上传图片，图片数据会自动绑定到数据源，实现了图片数据的双向绑定。 

该示例适用于需要在表格中展示用户头像、商品图片等场景，通过数据绑定机制简化了图片数据的管理和更新。

## 二、解决的问题

* **图片数据存储**：将图片以 Base64 格式存储在数据源中，便于数据的序列化和传输
* **自定义单元格渲染**：通过自定义 CellType 实现图片在单元格中的渲染显示
* **数据绑定集成**：将图片数据与 SpreadJS 的数据绑定机制无缝集成，实现数据的自动同步

## 三、实现思路

### 3.1 自定义图片单元格类型

通过继承 `GC.Spread.Sheets.CellTypes.Text` 创建自定义的图片单元格类型，重写 `paint` 方法实现图片渲染：

```javascript
function imageCellType() { }
imageCellType.prototype = new GC.Spread.Sheets.CellTypes.Text()
imageCellType.prototype.paint = function (context, value, x, y, w, h, style, options) {
    if (!context) {
        return;
    }
    let img = document.createElement("img")
    img.src = value  // value 为 Base64 格式的图片数据
    context.drawImage(img, x, y, w, h)
}

// 将自定义单元格类型应用到指定单元格（第6行第3列，索引为5,2）
sheet.setCellType(5, 2, new imageCellType())
```

### 3.2 数据绑定配置

使用 `CellBindingSource` 建立单元格与数据源的绑定关系：

```javascript
sheet.setDataSource(new GC.Spread.Sheets.Bindings.CellBindingSource({
    name: "张三",
    avatar: ""  // avatar 字段绑定到图片单元格
}))
```

在 JSON 配置中通过 `bindingPath` 指定绑定路径：

```javascript
"2": {  // C3 单元格
    "style": {"hAlign": 1},
    "bindingPath": "name"  // 绑定到 name 字段
},
"5": {  // C6 单元格
    "style": {"hAlign": 1},
    "bindingPath": "avatar"  // 绑定到 avatar 字段
}
```

### 3.3 图片上传与数据更新

监听单元格点击事件，弹出文件选择对话框，读取图片并转换为 Base64 格式后更新到单元格：

```javascript
sheet.bind(GC.Spread.Sheets.Events.CellClick, function (e, info) {
    if (info.row != 5 || info.col != 2) {
        return
    }
    document.getElementById("selectFileModal").style.display = "block"
})

document.getElementById("save").addEventListener("click", function () {
    let file = document.getElementById("file").files[0]
    let fileReader = new FileReader()
    fileReader.onload = function () {
        let base64 = this.result
        sheet.setValue(5, 2, base64)  // 更新单元格值
        setTimeout(function () {
            sheet.repaint()  // 触发重绘
        }, 0)
        document.getElementById("selectFileModal").style.display = "none"
    }
    fileReader.readAsDataURL(file)  // 读取为 Base64 格式
})
```

### 3.4 技术栈

* SpreadJS 16.0.1：核心表格组件
* TypeScript 4.1.2：开发语言
* SystemJS 0.19.22：模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，可以看到一个包含"姓名"和"头像"字段的表格
2. 点击 C6 单元格（头像绑定单元格），会弹出文件选择对话框
3. 选择一张图片（支持 PNG 或 JPEG 格式），点击"确定"按钮
4. 图片会显示在 C6 单元格中（跨越 C6:D10 的合并区域）
5. 点击"打印数据源"按钮，可以在控制台查看数据源对象，其中 `avatar` 字段包含图片的 Base64 数据

## 五、功能特点

### 5.1 优点

* **数据绑定集成**：图片数据与普通数据字段一样参与数据绑定，便于统一管理
* **自定义渲染灵活**：通过自定义 CellType 可以实现各种复杂的单元格渲染需求
* **数据可序列化**：Base64 格式的图片数据可以直接序列化为 JSON，便于数据的保存和传输

### 5.2 局限性与扩展建议

* **性能考虑**：Base64 格式会增加约 33% 的数据体积，大量图片可能影响性能，建议对大图片进行压缩或使用图片 URL 方式
* **图片加载优化**：当前实现中每次 `paint` 都会创建新的 `img` 元素，可以考虑缓存已加载的图片对象以提升性能
* **扩展方向**：可以添加图片预览、裁剪、压缩等功能，或支持从 URL 加载图片

## 六、关键代码片段

### 自定义 CellType 的核心实现

```javascript
// 继承 Text 类型并重写 paint 方法
imageCellType.prototype.paint = function (context, value, x, y, w, h, style, options) {
    if (!context) {
        return;
    }
    let img = document.createElement("img")
    img.src = value  // value 为单元格的值（Base64 图片数据）
    context.drawImage(img, x, y, w, h)  // 在单元格区域绘制图片
}
```

### FileReader 读取图片为 Base64

```javascript
let fileReader = new FileReader()
fileReader.onload = function () {
    let base64 = this.result  // 获取 Base64 格式的图片数据
    sheet.setValue(5, 2, base64)  // 更新单元格值
    setTimeout(function () {
        sheet.repaint()  // 异步触发重绘，确保图片正确显示
    }, 0)
}
fileReader.readAsDataURL(file)  // 读取文件为 Data URL（Base64）
```

## 七、总结

本示例展示了 SpreadJS 中自定义单元格类型与数据绑定的结合使用，开发者可以从中学到：

1. 如何通过继承现有 CellType 创建自定义单元格类型
2. 如何重写 `paint` 方法实现自定义渲染逻辑
3. 如何使用 `CellBindingSource` 实现数据绑定
4. 如何使用 FileReader API 读取本地文件并转换为 Base64 格式
5. 如何监听单元格点击事件实现交互功能

该方案适用于需要在表格中展示图片数据的场景，通过数据绑定机制可以方便地实现图片数据的增删改查操作。在实际应用中，可以根据需求扩展为支持多图片上传、图片编辑等更复杂的功能。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
