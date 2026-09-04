## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现图片的动态替换功能。通过监听图片选中事件，当用户点击表格中的图片时，会弹出一个自定义的替换框，允许用户输入新的图片 URL 来更新图片内容。该功能适用于需要在电子表格中灵活管理图片资源的场景，如产品目录、图片库管理等应用。

## 二、解决的问题

- **图片动态更新需求**：在电子表格应用中，用户经常需要更换单元格中的图片，传统方式需要删除后重新插入，操作繁琐
- **交互体验优化**：通过点击图片直接触发替换操作，提供更直观的用户交互体验
- **图片管理灵活性**：支持通过 URL 动态加载图片，便于管理远程图片资源

## 三、实现思路

### 3.1 图片对象的创建与配置

使用 SpreadJS 的 `pictures.add()` API 在工作表中添加图片对象，并配置图片的位置、尺寸和背景色等属性。

```javascript
// 添加第一张图片
let picture = sheet.pictures.add('pc1', "https://jscodemine.grapecity.com/serve/share/uFyonzEaAk2rh3r2mqCVDQ/src/love.png", 50, 50, 100, 100)
picture.backColor("black")
picture.startRow(1)
picture.startColumn(1)

// 添加第二张图片
let pc2 = sheet.pictures.add('pc2', "https://jscodemine.grapecity.com/serve/share/uFyonzEaAk2rh3r2mqCVDQ/src/colorful_love.png", 100, 100, 100, 100)
pc2.startRow(10)
pc2.startColumn(1)
pc2.backColor("green")
```

`pictures.add()` 方法的参数依次为：图片名称、图片 URL、左偏移、顶偏移、宽度、高度。通过 `startRow()` 和 `startColumn()` 方法可以精确定位图片在表格中的起始位置。

### 3.2 图片选中事件监听

通过监听 `PictureSelectionChanged` 事件来捕获图片的选中状态变化，当图片被选中时显示替换框。

```javascript
sheet.bind(GC.Spread.Sheets.Events.PictureSelectionChanged, function (e, info) {
    // 监听图片的选中状态变化事件
    document.getElementById('updatePic').style.display = 'none'
    if (info.picture.isSelected()) {
        // 如果是选中状态
        document.getElementById('updatePic').style.display = 'block'
        currentPic = info.picture
    }
});
```

事件回调函数中的 `info.picture` 对象包含了被操作的图片实例，通过 `isSelected()` 方法判断图片是否处于选中状态。将当前选中的图片保存到全局变量 `currentPic` 中，供后续替换操作使用。

### 3.3 图片替换逻辑实现

通过自定义的 HTML 弹出框接收用户输入的新图片 URL，并调用图片对象的 `src()` 方法更新图片源。

```javascript
document.getElementById('update').onclick = () => {
    // 更新图片
    currentPic.src(document.getElementById('picSrc').value)
    currentPic.isSelected(false)
    document.getElementById('picSrc').value = ''
    document.getElementById('updatePic').style.display = 'none'
}
```

替换完成后，通过 `isSelected(false)` 取消图片的选中状态，清空输入框内容，并隐藏替换框，完成整个交互流程。

### 3.4 技术栈

- **SpreadJS 15.0.0**：核心电子表格组件库
- **SystemJS 0.19.22**：模块加载器
- **TypeScript 4.1.2**：开发语言（编译为 ES5）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，可以看到表格中已经预置了两张图片
2. 点击任意一张图片，页面左上角会弹出"更换图片"对话框
3. 在输入框中输入新的图片 URL（可以使用页面提示的测试链接）
4. 点击"确定"按钮，图片会立即更新为新的图片
5. 点击其他图片可以继续进行替换操作

## 五、功能特点

### 5.1 优点

- **交互直观**：点击图片即可触发替换操作，符合用户直觉
- **实现简洁**：核心代码不到 40 行，易于理解和维护
- **扩展性强**：可以轻松扩展为支持本地上传、图片库选择等功能

### 5.2 局限性与扩展建议

- **当前限制**：仅支持通过 URL 替换图片，不支持本地文件上传
- **扩展建议**：
  - 可以集成文件上传功能，将本地图片转为 Base64 或上传到服务器后获取 URL
  - 可以添加图片预览功能，在替换前显示新图片的缩略图
  - 可以实现图片历史记录功能，支持撤销和恢复操作

## 六、关键代码片段

### 图片对象的核心 API 使用

```javascript
// 创建图片对象
let picture = sheet.pictures.add(name, src, x, y, width, height)

// 设置图片位置（基于单元格）
picture.startRow(rowIndex)
picture.startColumn(columnIndex)

// 设置图片背景色
picture.backColor(color)

// 更新图片源
picture.src(newUrl)

// 设置选中状态
picture.isSelected(boolean)
```

## 七、总结

本示例展示了 SpreadJS 中图片对象的基本操作和事件监听机制，开发者可以从中学到：

1. 如何使用 `pictures.add()` API 在工作表中添加和配置图片
2. 如何监听 `PictureSelectionChanged` 事件来响应图片选中操作
3. 如何通过 `src()` 方法动态更新图片内容
4. 如何结合原生 HTML/JavaScript 实现自定义的交互界面

该方案适用于需要在电子表格中进行图片管理的场景，如商品目录编辑、图片库管理、报表图片更新等。通过扩展该示例，可以实现更复杂的图片管理功能，如批量替换、图片裁剪、滤镜效果等。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/96jiMWdejEujO7_IIXotcg/)）
