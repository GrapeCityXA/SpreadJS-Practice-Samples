## 一、Demo 概述

本示例演示了如何在单次点击操作中将多个 SpreadJS 工作簿批量导出为 Excel 文件，并自动打包成 ZIP 压缩包供用户下载。该方案通过前端技术实现了多文件的批量导出和打包，无需后端服务器参与，适用于需要一次性导出多个独立工作簿的业务场景。

## 二、解决的问题

在实际业务中，用户可能需要同时导出多个独立的 SpreadJS 工作簿（例如不同部门的报表、多个数据分析结果等）。如果逐个导出，用户需要多次点击下载按钮，操作繁琐且效率低下。本示例通过以下方式解决了这一问题：

* 一键批量导出多个工作簿为独立的 Excel 文件
* 自动将所有文件打包成 ZIP 压缩包
* 纯前端实现，无需服务器端处理
* 提供友好的用户体验，减少操作步骤

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 创建多个 SpreadJS 工作簿实例

示例中创建了三个独立的 SpreadJS 工作簿实例，分别绑定到不同的 DOM 容器：

```javascript
var spread1 = new GC.Spread.Sheets.Workbook(document.getElementById("ss1"));
spread1.getActiveSheet().setValue(0, 0, "spread1");
var spread2 = new GC.Spread.Sheets.Workbook(document.getElementById("ss2"));
spread2.getActiveSheet().setValue(0, 0, "spread2");
var spread3 = new GC.Spread.Sheets.Workbook(document.getElementById("ss3"));
spread3.getActiveSheet().setValue(0, 0, "spread3");

var spreads = [spread1, spread2, spread3];
```

通过数组 `spreads` 统一管理所有工作簿实例，便于后续批量操作。

#### 3.1.2 使用 JSZip 进行前端文件打包

核心实现使用 JSZip 库在浏览器端创建 ZIP 压缩包：

```javascript
const zip = new JSZip();
if (!zip && spreads.length === 0) {
    return;
}

var fileName = "spread";
for (let i = 0; i < spreads.length; i++) {
    var spread = spreads[i];
    let file = "";
    spread.export(function (blob) {
        file = blob;
        // 将导出的 Excel 文件添加到 ZIP 包中
        zip.file(fileName + (i + 1) + ".xlsx", file);
    }, function (e) {
        console.log(e);
    });
}
```

每个工作簿通过 `spread.export()` 方法导出为 Blob 对象，然后使用 `zip.file()` 方法将其添加到压缩包中。

#### 3.1.3 异步导出完成检测机制

由于 `spread.export()` 是异步操作，需要等待所有文件导出完成后才能生成最终的 ZIP 包。示例使用定时器轮询检测：

```javascript
var intervalId = setInterval(function () {
    var files = zip.files;
    var len = 0;
    for (let file in files) {
        len++;
    }
    if (len === spreads.length) {
        // 所有文件导出完成，生成并下载 ZIP 包
        zip.generateAsync({
            type: "blob"
        }).then(content => {
            saveAs(content, "spreads.zip");
        }).catch((err) => {
            console.log(err)
        });
        clearInterval(intervalId);
    }
}, 500);
```

每 500 毫秒检查一次 ZIP 包中的文件数量，当文件数量等于工作簿数量时，说明所有导出操作已完成，此时调用 `zip.generateAsync()` 生成最终的 ZIP 文件并触发下载。

#### 3.1.4 使用 FileSaver.js 触发文件下载

通过 FileSaver.js 库的 `saveAs()` 方法触发浏览器下载：

```javascript
saveAs(content, "spreads.zip");
```

该方法兼容各主流浏览器，提供统一的文件下载体验。

### 3.2 技术栈

* SpreadJS 16.2.0：电子表格组件核心库
* @grapecity/spread-sheets-io 16.2.0：提供 Excel 导入导出功能
* JSZip 3.1.5：前端 ZIP 文件生成库
* FileSaver.js：浏览器文件下载工具库
* jQuery 3.6.1：简化 DOM 操作和事件绑定
* SystemJS 0.19.22：模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，会看到三个 SpreadJS 工作簿实例，每个工作簿的 A1 单元格分别显示 "spread1"、"spread2"、"spread3"
2. 点击页面顶部的"导出 Excel"按钮
3. 等待约 1-2 秒（取决于工作簿数据量），浏览器会自动下载名为 `spreads.zip` 的压缩包
4. 解压 ZIP 文件，可以看到三个独立的 Excel 文件：`spread1.xlsx`、`spread2.xlsx`、`spread3.xlsx`

## 五、功能特点

### 5.1 优点

* 纯前端实现，无需服务器端支持，降低系统复杂度
* 一键批量导出，提升用户操作效率
* 自动打包成 ZIP 文件，方便用户统一管理和分发
* 代码结构清晰，易于扩展到更多工作簿的批量导出场景

### 5.2 局限性与扩展建议

当前实现使用定时器轮询检测导出完成状态，存在以下局限性：

* 固定的 500ms 轮询间隔可能导致不必要的性能开销
* 无法准确获知每个工作簿的导出进度
* 如果某个工作簿导出失败，无法及时发现和处理

扩展建议：

1. 使用 Promise.all() 改进异步控制流程，更优雅地等待所有导出操作完成
2. 添加导出进度提示，提升用户体验
3. 增加错误处理机制，对导出失败的工作簿进行重试或提示
4. 支持自定义文件名和 ZIP 包名称
5. 对于大量工作簿的场景，可以考虑分批导出以避免浏览器内存压力

## 六、关键代码片段

### 6.1 完整的批量导出逻辑

```javascript
$("#saveExcel").click(function () {
    const zip = new JSZip();
    if (!zip && spreads.length === 0) {
        return;
    }

    var fileName = "spread";
    // 遍历所有工作簿，逐个导出
    for (let i = 0; i < spreads.length; i++) {
        var spread = spreads[i];
        let file = "";
        spread.export(function (blob) {
            file = blob;
            zip.file(fileName + (i + 1) + ".xlsx", file);
        }, function (e) {
            console.log(e);
        });
    }

    // 轮询检测所有文件是否导出完成
    var intervalId = setInterval(function () {
        var files = zip.files;
        var len = 0;
        for (let file in files) {
            len++;
        }
        if (len === spreads.length) {
            zip.generateAsync({
                type: "blob"
            }).then(content => {
                saveAs(content, "spreads.zip");
            }).catch((err) => {
                console.log(err)
            });
            clearInterval(intervalId);
        }
    }, 500);
});
```

## 七、总结

本示例展示了如何使用 SpreadJS 结合 JSZip 和 FileSaver.js 实现多个工作簿的批量导出和打包下载功能。开发者可以从中学到：

* SpreadJS 的 export() 方法使用和异步处理
* JSZip 库在前端进行文件打包的实现方式
* 异步操作完成检测的轮询机制
* FileSaver.js 触发浏览器文件下载的方法

该方案适用于需要批量导出多个独立报表、数据分析结果或其他 Excel 文件的场景，通过纯前端实现降低了系统复杂度，提升了用户体验。在实际应用中，建议根据业务需求优化异步控制流程和错误处理机制，以提供更稳定可靠的批量导出功能。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
