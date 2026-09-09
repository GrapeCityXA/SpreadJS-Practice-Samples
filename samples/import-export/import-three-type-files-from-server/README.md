## 一、Demo 概述

本示例演示了如何在 SpreadJS 中从服务端导入三种不同格式的文件：SJS（SpreadJS 原生格式）、Excel（.xlsx）和 SSJSON（SpreadJS JSON 格式）。通过 XMLHttpRequest 异步获取服务端文件，并使用 SpreadJS 提供的 `open()` 和 `import()` API 将文件内容加载到工作簿中。

该示例适用于需要从服务器动态加载表格数据的场景，例如报表系统、数据分析平台等，用户可以通过点击按钮选择不同格式的文件进行导入。

## 二、解决的问题

- **多格式文件支持**：业务系统中可能存储了不同格式的表格文件，需要统一的导入方案
- **异步加载**：从服务端获取文件需要异步处理，避免阻塞页面渲染
- **跨浏览器兼容**：不同浏览器对 Blob 和 File 对象的处理存在差异，需要统一的处理方式

## 三、实现思路

### 3.1 核心技术点

#### 使用 XMLHttpRequest 获取服务端文件

通过 XMLHttpRequest 的 `responseType = "blob"` 设置，将服务端返回的文件内容作为二进制数据处理：

```javascript
let xhr = new XMLHttpRequest()
xhr.open("get", "./static/test.sjs")
xhr.responseType = "blob"
xhr.addEventListener("loadend", function () {
    if (this.readyState == 4 && this.status == 200) {
        let file = new File([this.response], 'test.sjs')
        spread.open(file)
    }
})
xhr.send()
```

#### SJS 格式导入

SJS 是 SpreadJS 的原生格式，使用 `spread.open()` 方法直接打开：

```javascript
document.getElementById("sjs").addEventListener("click", function () {
    let xhr = new XMLHttpRequest()
    xhr.open("get", "./static/test.sjs")
    xhr.responseType = "blob"
    xhr.addEventListener("loadend", function () {
        if (this.readyState == 4 && this.status == 200) {
            let file = new File([this.response],'test.sjs')
            // 也可以封装成blob，spread.open()中直接传递blob即可
            // var blob = new Blob([this.response], {type:'application/zip'});
            spread.open(file)
        }
    })
    xhr.send()
})
```

#### Excel 格式导入

Excel 文件使用 `spread.import()` 方法，并指定 `fileType` 为 `GC.Spread.Sheets.FileType.excel`：

```javascript
document.getElementById("excel").addEventListener("click", function () {
    let xhr = new XMLHttpRequest()
    xhr.open("get", "./static/test.xlsx")
    xhr.responseType = "blob"
    xhr.addEventListener("loadend", function () {
        if (this.readyState == 4 && this.status == 200) {
            let file = new File([this.response], "test.xlsx")
            //对于chrome浏览器，import第一个参数直接传递this.response也可以，safari则会报错，必须传递file。
            spread.import(file, function() {}, function() {}, {
                fileType: GC.Spread.Sheets.FileType.excel
            })
        }
    })
    xhr.send()
})
```

#### SSJSON 格式导入

SSJSON 是 SpreadJS 的 JSON 序列化格式，同样使用 `spread.import()` 方法，指定 `fileType` 为 `GC.Spread.Sheets.FileType.ssjson`：

```javascript
document.getElementById("ssjson").addEventListener("click", function () {
    let xhr = new XMLHttpRequest()
    xhr.open("get", "./static/test.ssjson")
    xhr.responseType = "blob"
    xhr.addEventListener("loadend", function () {
        if (this.readyState == 4 && this.status == 200) {
            let file = new File([this.response], "test.ssjson")
            //import方法中第一个参数直接使用this.response也可
            spread.import(file, function() {}, function() {}, {
                fileType: GC.Spread.Sheets.FileType.ssjson
            })
        }
    })
    xhr.send()
})
```

### 3.2 UI 交互流程

用户点击按钮 → 发起 XMLHttpRequest 请求 → 服务端返回文件 → 将响应转换为 File 对象 → 调用 SpreadJS API 导入 → 工作簿显示文件内容

### 3.3 技术栈

- **@grapecity/spread-sheets**: 16.0.1（SpreadJS 核心库）
- **@grapecity/spread-sheets-io**: 16.0.1（文件导入导出模块）
- **SystemJS**: 0.19.22（模块加载器）
- **TypeScript**: 4.1.2（类型支持）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 启动本地服务器（需要 HTTP 服务器，如 http-server 或 live-server）
npx http-server -p 8080
```

在浏览器中打开 `http://localhost:8080/index.html`

### 4.2 操作步骤

1. 打开页面后，会看到三个按钮：导入SJS、导入Excel、导入SSJSON
2. 点击任意按钮，系统会从 `static/` 目录加载对应格式的测试文件
3. 文件加载成功后，内容会自动显示在下方的 SpreadJS 工作簿中
4. 可以切换不同按钮测试不同格式的导入效果

## 五、功能特点

### 5.1 优点

- **多格式支持**：统一处理 SJS、Excel、SSJSON 三种常见格式
- **异步加载**：使用 XMLHttpRequest 异步获取文件，不阻塞页面
- **跨浏览器兼容**：通过 File 对象封装，解决了 Safari 等浏览器的兼容性问题
- **代码简洁**：每种格式的导入逻辑清晰，易于维护和扩展

### 5.2 局限性与扩展建议

- **错误处理**：当前代码缺少对网络请求失败、文件格式错误的处理，建议添加错误回调
- **加载提示**：文件较大时缺少加载进度提示，可以添加 loading 状态
- **扩展建议**：
  - 可以使用 Fetch API 替代 XMLHttpRequest，代码更简洁
  - 添加文件上传功能，支持用户选择本地文件导入
  - 支持更多格式（如 CSV）的导入

## 六、关键代码片段

### File 对象与 Blob 对象的使用

```javascript
// 方式1：使用 File 对象（推荐，兼容性更好）
let file = new File([this.response], 'test.sjs')
spread.open(file)

// 方式2：使用 Blob 对象（部分浏览器可能不支持）
var blob = new Blob([this.response], {type:'application/zip'});
spread.open(blob)
```

### spread.open() 与 spread.import() 的区别

```javascript
// open() 方法：用于 SJS 格式，直接打开文件
spread.open(file)

// import() 方法：用于 Excel、SSJSON 等格式，需要指定 fileType
spread.import(file, successCallback, errorCallback, {
    fileType: GC.Spread.Sheets.FileType.excel
})
```

## 七、总结

本示例展示了 SpreadJS 从服务端导入多种格式文件的完整流程，开发者可以学到：

1. 如何使用 XMLHttpRequest 异步获取服务端文件
2. SpreadJS 中 `open()` 和 `import()` API 的使用场景和区别
3. File 对象和 Blob 对象在文件导入中的应用
4. 如何处理不同浏览器的兼容性问题

该方案适用于需要从服务端动态加载表格数据的场景，代码结构清晰，易于扩展。开发者可以在此基础上添加错误处理、进度提示等功能，或集成到实际的业务系统中。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/Ks3akIoTa0eBV8frDYkWLQ/)）
