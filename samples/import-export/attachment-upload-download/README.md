## 一、Demo 概述

本示例展示了如何在 SpreadJS 表格中实现附件管理功能，包括上传附件到单元格、下载单元格附件、清除附件，以及将工作簿连同所有附件一起打包导出为 ZIP 文件。该功能通过自定义命令、单元格 Tag 和超链接机制实现，适用于需要在表格中关联外部文件的业务场景，如合同管理、报销单据等。 

## 二、解决的问题

* **附件与单元格关联**：在表格单元格中存储文件引用，实现文档与数据的关联管理
* **附件可视化操作**：通过超链接样式直观展示附件，支持点击下载
* **批量导出需求**：将工作簿及其关联的所有附件打包导出，便于归档和分发
* **附件生命周期管理**：支持上传、下载、删除等完整的附件操作流程

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 使用 Tag 存储附件元数据

通过单元格的 Tag 属性存储附件的类型标识和文件信息，实现附件与单元格的绑定关系：

```javascript
sheet.setTag(row, col, {
    type: hyerlinkType,        // 标识为附件类型
    fileInfo: file             // 存储文件对象（实际项目中应为文件服务器路径）
})
```

#### 3.1.2 自定义命令实现附件操作

注册自定义命令处理附件的下载和删除操作：

```javascript
// 注册下载附件命令
spread.commandManager().register("downloadAttachFile", {
    canUndo: false,
    execute: function(context, options, isUndo) {
        let sheet = context.getActiveSheet()
        let row = sheet.getActiveRowIndex()
        let col = sheet.getActiveColumnIndex()
        let cellTag = sheet.getTag(row, col)
        if(cellTag && cellTag.type == hyerlinkType) {
            saveAs(cellTag.fileInfo, cellTag.fileInfo.name)
        }
    }
})

// 注册清除附件命令
spread.commandManager().register("removeAttachFile", {
    canUndo: false,
    execute: function(context, options, isUndo) {
        let {sheet, row, col} = options
        let cellTag = sheet.getTag(row, col)
        if(cellTag && cellTag.type == hyerlinkType) {
            sheet.clear(row, col, 1, 1, 
                GC.Spread.Sheets.SheetArea.viewport,
                GC.Spread.Sheets.StorageType.data | GC.Spread.Sheets.StorageType.tag
            )
            sheet.refresh()
        }
    }
})
```

#### 3.1.3 超链接绑定自定义命令

将单元格设置为超链接样式，并绑定下载命令，实现点击下载功能：

```javascript
sheet.setHyperlink(row, col, {
    url: file.name,
    linkColor: '#0066cc',
    visitedLinkColor: '#3399ff',
    drawUnderline: true,
    command: 'downloadAttachFile'  // 绑定自定义命令
}, GC.Spread.Sheets.SheetArea.viewport)
```

#### 3.1.4 打包导出工作簿和附件

使用 JSZip 库遍历所有单元格，收集附件文件，并与导出的 Excel 文件一起打包：

```javascript
function loadAllFiles() {
    let zip = new JSZip()
    let sheetCount = spread.getSheetCount()
    
    // 遍历所有工作表和单元格，收集附件
    for(let i = 0; i < sheetCount; i++) {
        let sheet = spread.getSheet(i)
        let rowCount = sheet.getRowCount()
        let colCount = sheet.getColumnCount()
        for(let row = 0; row < rowCount; row++) {
            for(let col = 0; col < colCount; col++) {
                let cellTag = sheet.getTag(row, col)
                if(sheet.getHyperlink(row, col) && cellTag && cellTag.type == hyerlinkType) {
                    zip.file('name.jpg', cellTag.fileInfo, {binary: true})
                }
            }
        }
    }
    
    // 导出工作簿并添加到 ZIP
    spread.export(function(blob) {
        zip.file("主文件.xlsx", blob, {binary: true})
        zip.generateAsync({type: "blob"}).then((content) => {
            saveAs(content, "download.zip")
        })
    })
}
```

### 3.2 UI 交互流程

用户点击"上传附件"按钮 → 弹出文件选择对话框 → 选择文件并提交 → 当前活动单元格显示附件名称（超链接样式）→ 点击单元格超链接下载附件 → 点击"清除附件"按钮删除附件 → 点击"打包下载"按钮导出工作簿和所有附件为 ZIP 文件

### 3.3 技术栈

* SpreadJS 16.2.0：核心表格组件
* SpreadJS IO 16.2.0：Excel 导入导出功能
* JSZip 3.10.0：ZIP 文件生成
* FileSaver 2.0.5：文件下载功能
* SystemJS 0.19.22：模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 直接在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，点击表格中的任意单元格使其成为活动单元格
2. 点击"上传附件"按钮，在弹出的对话框中选择文件
3. 点击"提交"按钮，单元格将显示文件名并呈现超链接样式
4. 点击单元格中的超链接可下载该附件
5. 选中包含附件的单元格，点击"清除附件"按钮可删除附件
6. 点击"打包下载"按钮，将工作簿和所有附件打包为 ZIP 文件下载

## 五、功能特点

### 5.1 优点

* **直观的附件管理**：通过超链接样式清晰展示附件，用户体验友好
* **灵活的扩展性**：基于 Tag 和自定义命令的设计，易于扩展更多附件操作
* **完整的导出方案**：支持将工作簿和附件一起打包，满足归档需求
* **命令模式设计**：通过注册命令实现功能解耦，便于维护和复用

### 5.2 局限性与扩展建议

当前实现为纯前端 Demo，文件对象直接存储在内存中。在实际项目中需要注意：

* **文件上传**：应将文件上传到文件服务器，Tag 中的 `fileInfo` 存储文件访问路径而非 File 对象
* **文件下载**：需要通过 HTTP 请求获取文件 Blob，而非直接使用本地 File 对象
* **文件删除**：清除附件时应同步删除服务器上的文件，避免资源浪费
* **文件命名冲突**：打包导出时应使用唯一文件名（如添加时间戳或 UUID）避免覆盖

扩展建议：

* 支持多文件上传到同一单元格
* 添加附件预览功能（图片、PDF 等）
* 实现附件权限控制
* 添加附件大小和类型限制

## 六、关键代码片段

### 6.1 附件上传核心逻辑

```javascript
function hasAttachFile(sheet, row, col, file) {
    sheet.setValue(row, col, file.name)
    sheet.setTag(row, col, {
        type: hyerlinkType,
        fileInfo: file  // 实际项目中应为文件服务器路径
    })
    sheet.setHyperlink(row, col, {
        url: file.name,
        linkColor: '#0066cc',
        visitedLinkColor: '#3399ff',
        drawUnderline: true,
        command: 'downloadAttachFile'
    }, GC.Spread.Sheets.SheetArea.viewport)
}
```

### 6.2 文件保存与加载

```javascript
// 保存工作簿到内存
document.getElementById("fileSaver").onclick = function() {
    submitFile = spread.toJSON()
    spread.clearSheets()
    spread.addSheet(0)
}

// 从内存加载工作簿
document.getElementById("loadSubmitFile").onclick = function() {
    spread.fromJSON(submitFile)
}
```

## 七、总结

本示例展示了 SpreadJS 中实现附件管理的完整方案，核心价值在于：

* 掌握单元格 Tag 的高级应用，实现自定义数据存储
* 学习自定义命令的注册和执行机制
* 理解超链接与命令的绑定方式
* 掌握 JSZip 与 SpreadJS 导出功能的结合使用

该方案适用于需要在表格中关联外部文件的场景，如合同管理系统、报销审批流程、项目文档管理等。在实际应用中，需要结合后端文件服务实现完整的文件上传、存储和下载流程。开发者可以基于此方案扩展更多功能，如附件预览、批量上传、权限控制等。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
