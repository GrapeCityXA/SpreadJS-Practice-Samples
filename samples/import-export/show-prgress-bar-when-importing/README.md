## 一、Demo 概述

本示例展示了如何在使用 SpreadJS 导入 Excel 文件时，通过进度条向用户实时反馈导入进度。该功能通过监听 SpreadJS 的 `import` 方法提供的 `progress` 回调，结合第三方圆形进度条组件（circle-progress），实现了友好的用户体验。当用户点击"导入 Excel"按钮后，页面会显示一个模态遮罩层和圆形进度条，实时展示文件导入的完成百分比，导入完成后自动隐藏进度提示。 

## 二、解决的问题

在实际应用中，导入大型 Excel 文件可能需要较长时间，如果没有进度反馈，用户会不清楚操作是否正在进行，容易产生焦虑或误以为程序卡死。本示例解决了以下问题：

* 提供可视化的导入进度反馈，让用户了解当前操作状态
* 通过模态遮罩层防止用户在导入过程中进行其他操作，避免冲突
* 使用美观的圆形进度条组件提升用户体验
* 导入完成后自动清理 UI 状态，无需手动关闭

## 三、实现思路

### 3.1 核心技术点

#### 使用 SpreadJS 的 progress 回调监听导入进度

SpreadJS 的 `import` 方法支持传入配置对象，其中 `progress` 回调函数会在导入过程中被多次调用，返回当前进度信息。通过监听这个回调，可以实时获取导入进度并更新 UI。

```javascript
spread.import(this.response, function () { }, function () { }, {
    fileType: GC.Spread.Sheets.FileType.excel,
    progress: function (arg) {
        showProgress(arg, progressElement, modalElement)
    }
})
```

`arg.progress` 是一个 0 到 1 之间的浮点数，表示当前导入进度的百分比。

#### 使用 XMLHttpRequest 加载 Excel 文件

通过 XMLHttpRequest 以 blob 格式加载 Excel 文件，确保文件完整加载后再进行导入操作。

```javascript
let xhr = new XMLHttpRequest()
xhr.open("get", "./static/template.xlsx")
xhr.responseType = "blob"
xhr.addEventListener("loadend", function () {
    if (this.readyState == 4 && this.status == 200) {
        spread.import(this.response, ...)
    }
})
xhr.send()
```

#### 集成第三方圆形进度条组件

使用 `js-circle-progress` 库提供的 Web Component `<circle-progress>`，通过设置 `value` 属性动态更新进度显示。

```javascript
function showProgress(arg, progressElement, modalElement) {
    progressElement.value = Math.floor(arg.progress * 100)
    if (progressElement.value == 100) {
        progressElement.style.display = "none"
        modalElement.style.display = "none"
        progressElement.value = 0
    }
}
```

#### 模态遮罩层实现

通过 CSS 创建全屏半透明遮罩层，防止用户在导入过程中进行其他操作。

```css
.modal {
    display: none;
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 100;
    background-color: rgba(0, 0, 0, 0.7);
}
```

### 3.2 UI 交互流程

用户点击"导入 Excel"按钮 → 显示模态遮罩层和进度条 → 通过 XMLHttpRequest 加载 Excel 文件 → 调用 SpreadJS 的 import 方法 → progress 回调实时更新进度条数值 → 导入完成（进度达到 100%）→ 自动隐藏遮罩层和进度条

### 3.3 技术栈

* SpreadJS 16.0.1：核心表格组件
* @grapecity/spread-sheets-io 16.0.1：提供 Excel 导入导出功能
* js-circle-progress：第三方圆形进度条组件
* SystemJS：模块加载器
* TypeScript 4.1.2：开发语言（编译为 ES5）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

然后使用本地服务器（如 Live Server、http-server 等）打开 `index.html` 文件。

### 4.2 操作步骤

1. 在浏览器中打开示例页面
2. 点击页面顶部的"导入 Excel"按钮
3. 观察页面中央出现的圆形进度条，显示导入进度百分比
4. 等待导入完成，进度条和遮罩层会自动消失
5. 查看 SpreadJS 表格中已成功导入的 Excel 数据

## 五、功能特点

### 5.1 优点

* 用户体验友好：通过可视化进度条让用户清楚了解操作状态
* 防止误操作：模态遮罩层阻止用户在导入过程中进行其他操作
* 自动化处理：导入完成后自动清理 UI 状态，无需手动干预
* 美观的 UI：使用圆形进度条组件，视觉效果现代化

### 5.2 局限性与扩展建议

* 当前示例仅支持单个固定文件的导入，可扩展为支持用户选择本地文件
* 可以添加错误处理机制，当导入失败时显示错误提示
* 可以在进度条旁边显示具体的百分比数字或导入状态文字说明
* 对于超大文件，可以考虑添加取消导入的功能

## 六、关键代码片段

### 导入 Excel 并监听进度

```javascript
document.getElementById("excel").addEventListener("click", function () {
    let progressElement = document.querySelector("#progress")
    let modalElement = document.querySelector(".modal")
    progressElement.style.display = "block"
    modalElement.style.display = "block"
    
    let xhr = new XMLHttpRequest()
    xhr.open("get", "./static/template.xlsx")
    xhr.responseType = "blob"
    xhr.addEventListener("loadend", function () {
        if (this.readyState == 4 && this.status == 200) {
            spread.import(this.response, function () { }, function () { }, {
                fileType: GC.Spread.Sheets.FileType.excel,
                progress: function (arg) {
                    showProgress(arg, progressElement, modalElement)
                }
            })
        }
    })
    xhr.send()
})
```

### 进度更新逻辑

```javascript
function showProgress(arg, progressElement, modalElement) {
    // 将 0-1 的进度值转换为 0-100 的百分比
    progressElement.value = Math.floor(arg.progress * 100)
    console.log(progressElement.value)
    
    // 导入完成时隐藏进度条和遮罩层
    if (progressElement.value == 100) {
        progressElement.style.display = "none"
        modalElement.style.display = "none"
        progressElement.value = 0
    }
}
```

## 七、总结

本示例展示了如何在 SpreadJS 中实现带进度反馈的 Excel 导入功能，是提升用户体验的重要实践。开发者可以从中学到：

* SpreadJS import 方法的 progress 回调使用方式
* 如何集成第三方 Web Component 组件
* 使用 XMLHttpRequest 加载二进制文件的方法
* 模态遮罩层的 CSS 实现技巧
* 异步操作中的 UI 状态管理

该方案适用于任何需要导入大型 Excel 文件的场景，特别是在数据量较大、导入耗时较长的情况下，能够显著改善用户体验。开发者可以根据实际需求，扩展为支持文件选择、错误处理、取消操作等更完善的功能。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
