## 一、Demo 概述

本示例演示了如何在 SpreadJS 中实现从本地文件系统加载图片并插入到指定单元格位置的功能。用户通过文件选择器选择本地图片文件后，系统会自动将图片插入到当前激活的单元格位置，图片的位置和大小根据单元格的行列索引和尺寸自动计算。

该示例适用于需要在电子表格中动态插入图片的场景，如报表制作、数据可视化、图文混排等业务需求。

## 二、解决的问题

- **本地图片导入**：提供了一种简单的方式让用户从本地文件系统选择图片并插入到表格中
- **动态位置定位**：根据当前激活的单元格自动计算图片插入位置，无需手动指定坐标
- **异步文件读取**：使用 FileReader API 实现异步文件读取，避免阻塞主线程

## 三、实现思路

### 3.1 核心技术点

#### 使用 FileReader API 读取本地图片

通过 HTML5 的 FileReader API 实现本地图片文件的异步读取，将图片内容转换为 Base64 编码格式：

```javascript
file = document.getElementById('fileDemo').files[0]
reader = new FileReader()
// 将文件内容以 base64 编码输出
reader.readAsDataURL(file)
// 文件内容读取成功之后添加到表单中
reader.onload = function(){
    timestamp = Date.parse(new Date())
    picture = sheet.pictures.add(timestamp.toString(),this.result,startCol*colWidth,startRow*rowHeight)
}
```

#### 动态计算图片插入位置

根据当前激活单元格的行列索引和单元格尺寸，计算图片在工作表中的像素坐标：

```javascript
startRow = sheet.getActiveRowIndex()
startCol = sheet.getActiveColumnIndex()
rowHeight = sheet.getRowHeight()
colWidth = sheet.getColumnWidth()
```

插入图片时，使用 `startCol*colWidth` 和 `startRow*rowHeight` 计算出精确的像素位置。

#### 使用 SpreadJS Pictures API 插入图片

通过 `sheet.pictures.add()` 方法将图片添加到工作表中，该方法接受四个参数：

```javascript
picture = sheet.pictures.add(
    timestamp.toString(),  // 图片唯一标识符
    this.result,           // Base64 编码的图片数据
    startCol*colWidth,     // X 坐标（像素）
    startRow*rowHeight     // Y 坐标（像素）
)
```

### 3.2 UI 交互流程

用户选择文件 → 触发 change 事件 → 读取文件内容 → 转换为 Base64 → 获取当前单元格位置 → 计算插入坐标 → 插入图片到工作表

### 3.3 技术栈

- **SpreadJS**: 15.0.0（核心电子表格组件）
- **SystemJS**: 0.19.22（模块加载器）
- **TypeScript**: 4.1.2（开发语言支持）
- **FileReader API**: HTML5 原生 API（文件读取）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
# 或使用本地服务器运行（推荐）
npx http-server
```

### 4.2 操作步骤

1. 在浏览器中打开示例页面
2. 点击工作表中的任意单元格，使其成为激活状态
3. 点击页面顶部的"选择文件"按钮
4. 从本地文件系统中选择一张图片文件（支持常见图片格式如 JPG、PNG、GIF 等）
5. 图片会自动插入到之前选中的单元格位置

## 五、功能特点

### 5.1 优点

- **操作简单**：用户只需选择文件即可完成图片插入，无需复杂配置
- **位置智能**：自动根据当前激活单元格定位图片位置，符合用户操作习惯
- **异步处理**：使用 FileReader 异步读取文件，不会阻塞页面响应
- **唯一标识**：使用时间戳作为图片 ID，避免重复插入时的命名冲突

### 5.2 局限性与扩展建议

- **图片尺寸固定**：当前实现未对图片尺寸进行调整，可以扩展为根据单元格大小自动缩放图片
- **文件类型验证缺失**：建议添加文件类型和大小验证，防止用户选择非图片文件或过大文件
- **错误处理不足**：可以增加文件读取失败的错误提示和处理逻辑
- **批量插入**：可以扩展为支持一次选择多个图片文件并批量插入

## 六、关键代码片段

### 完整的图片插入逻辑

```javascript
// 定义插入图片相关变量，比如位置，大小等
let startRow,startCol,rowHeight,colWidth,file,reader,timestamp

// 添加图片的操作
function addPic(){
    // 获取当前激活单元格的行列索引
    startRow = sheet.getActiveRowIndex()
    startCol = sheet.getActiveColumnIndex()
    // 获取单元格的高度和宽度
    rowHeight = sheet.getRowHeight()
    colWidth = sheet.getColumnWidth()
    
    // 获取用户选择的文件
    file = document.getElementById('fileDemo').files[0]
    reader = new FileReader()
    // 将文件内容以 base64 编码输出
    reader.readAsDataURL(file)
    
    // 文件内容读取成功之后添加到表单中
    reader.onload = function(){
        timestamp = Date.parse(new Date())
        picture = sheet.pictures.add(
            timestamp.toString(),
            this.result,
            startCol*colWidth,
            startRow*rowHeight
        )
    }
}

// 监听文件选择器的 change 事件
document.getElementById('fileDemo').addEventListener('change',addPic)
```

## 七、总结

本示例展示了 SpreadJS 中图片插入功能的基础实现方式，开发者可以从中学习到：

- FileReader API 的使用方法和异步文件读取机制
- SpreadJS Pictures API 的基本用法
- 如何根据单元格位置动态计算图片插入坐标
- 事件监听机制在文件上传场景中的应用

该方案适用于需要在电子表格中插入本地图片的场景，代码简洁易懂，可以作为更复杂图片处理功能的基础。开发者可以在此基础上扩展图片缩放、裁剪、批量上传等高级功能。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/61NOXfYISESmHSv-k_TxaQ/)）
