## 一、Demo 概述

本示例演示了如何使用 SpreadJS 实现 CSV 文件的导入功能。用户通过文件选择器选择本地 CSV 文件后，系统会自动读取文件内容并将数据导入到 SpreadJS 表格中进行展示和编辑。

该示例适用于需要将外部 CSV 数据快速导入到电子表格应用中的场景，例如数据分析、报表生成、数据迁移等业务需求。

## 二、解决的问题

* **CSV 数据导入**：实现从本地文件系统读取 CSV 文件并导入到 SpreadJS 表格
* **文件格式解析**：正确处理 CSV 文件的行分隔符和列分隔符
* **数据展示**：将导入的数据以表格形式直观展示，支持后续编辑操作

## 三、实现思路

### 3.1 核心技术点

#### 文件读取

使用浏览器原生的 FileReader API 读取用户选择的 CSV 文件内容：

```javascript
let file = document.getElementById('fileDemo').files[0]
let reader = new FileReader()
reader.readAsText(file, "UTF-8")
reader.onload = function(e){
    let fileStr = e.target.result
    sheet.setCsv(0, 0, fileStr, "\r\n", ",")
}
```

通过 `readAsText` 方法以 UTF-8 编码读取文件文本内容，读取完成后在 `onload` 回调中获取文件字符串。

#### CSV 数据导入

使用 SpreadJS 的 `setCsv` API 将 CSV 字符串导入到工作表：

```javascript
sheet.setCsv(0, 0, fileStr, "\r\n", ",")
```

参数说明：

* 第一个参数 `0`：起始行索引
* 第二个参数 `0`：起始列索引
* 第三个参数 `fileStr`：CSV 文件内容字符串
* 第四个参数 `"\r\n"`：行分隔符
* 第五个参数 `","`：列分隔符

#### 事件监听

通过监听 `change` 事件触发文件导入逻辑：

```javascript
document.addEventListener('change', csvChange)
```

当用户选择文件后，自动触发 `csvChange` 函数执行导入操作。

### 3.2 技术栈

* SpreadJS 15.0.0：核心电子表格组件
* SystemJS 0.19.22：模块加载器
* TypeScript 4.1.2：开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

安装依赖后，使用浏览器打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，点击"选择文件"按钮
2. 从本地文件系统选择一个 CSV 格式的文件
3. 文件选择完成后，数据会自动导入到表格中
4. 导入后可以在 SpreadJS 表格中查看和编辑数据

## 五、功能特点

### 5.1 优点

* **实现简单**：核心代码不到 20 行，易于理解和维护
* **即时导入**：文件选择后立即导入，无需额外操作
* **格式灵活**：支持自定义行列分隔符，适配不同格式的 CSV 文件
* **编码支持**：使用 UTF-8 编码读取，支持中文等多语言字符

### 5.2 局限性与扩展建议

* **错误处理**：当前仅在控制台输出错误信息，建议增加用户友好的错误提示
* **文件验证**：未对文件类型和大小进行验证，建议添加文件格式检查
* **导入位置**：固定从 (0,0) 位置导入，可扩展为支持用户指定导入位置
* **大文件处理**：对于超大 CSV 文件，建议增加加载进度提示或分批导入机制

## 六、关键代码片段

完整的文件导入处理函数：

```javascript
function csvChange(){
    // 读取文件的文本信息
    let file = document.getElementById('fileDemo').files[0]
    let reader = new FileReader()
    reader.readAsText(file, "UTF-8")
    reader.onload = function(e){
        let fileStr = e.target.result
        // API: https://demo.grapecity.com.cn/spreadjs/help/api/GC.Spread.Sheets.Worksheet.html#setCsv
        sheet.setCsv(0, 0, fileStr, "\r\n", ",")
    }
    reader.onerror = function(){
        console.log('error')
    }
}

document.addEventListener('change', csvChange)
```

## 七、总结

本示例展示了 SpreadJS 导入 CSV 文件的基础实现方案，开发者可以从中学习到：

* FileReader API 的使用方法
* SpreadJS 的 `setCsv` API 使用方式
* 文件上传与数据导入的基本流程
* 事件驱动的交互模式

该方案适用于需要快速实现 CSV 导入功能的场景，代码简洁高效。在实际项目中，可以根据业务需求扩展文件验证、错误处理、进度提示等功能，提升用户体验。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
