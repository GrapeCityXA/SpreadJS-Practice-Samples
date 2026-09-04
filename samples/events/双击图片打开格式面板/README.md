## 一、Demo 概述

本示例展示了如何在 SpreadJS Designer 中实现双击图片自动打开格式面板的功能。通过监听双击事件并结合坐标命中测试，当用户双击工作表中的图片时，系统会自动打开 Designer 的格式面板，方便用户快速编辑图片属性。

该功能提升了用户体验，使图片编辑操作更加直观和高效，特别适用于需要频繁调整图片样式的场景。

## 二、解决的问题

- **简化图片编辑流程**：传统方式需要先选中图片，再通过菜单或右键打开格式面板，操作步骤较多。双击直接打开格式面板，减少了操作步骤。
- **提升交互体验**：双击是用户熟悉的交互方式，符合常见办公软件的操作习惯，降低学习成本。
- **精准定位图片对象**：通过坐标命中测试准确判断用户点击的是否为图片区域，避免误触发。

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 双击事件监听与坐标转换

在 Designer 容器上监听 `dblclick` 事件，并将页面坐标转换为 SpreadJS 内部坐标系：

```javascript
document.getElementById('designer-container').addEventListener('dblclick', function (e) {
    let canvas = document.querySelector('canvas[gcuielement="gcWorksheetCanvas"]')
    let xx = e.pageX - this.offsetLeft
    let yy = e.pageY - this.offsetTop - canvas.getBoundingClientRect().top
    let result = spread.hitTest(xx, yy)
    var { row, col } = getHitAreaName(result);
    // ...
});
```

关键点：
- 通过 `e.pageX` 和 `e.pageY` 获取鼠标点击的页面坐标
- 减去容器偏移量和 canvas 顶部位置，转换为相对于工作表的坐标
- 使用 `spread.hitTest()` 方法获取命中测试结果

#### 3.1.2 命中测试与单元格定位

通过 `hitTest` 结果解析出被点击的单元格行列号：

```javascript
function getHitAreaName(result) {
    if (!result) return;
    var str = '';
    if (result.worksheetHitInfo) {
        let type = result.worksheetHitInfo.hitTestType
        switch (type) {
            case 0:
                str = 'corner';
            case 1:
                str = 'colHeader';
            case 2:
                str = 'rowHeader';
            case 3:
                return { row: result.worksheetHitInfo.row, col: result.worksheetHitInfo.col }
        }
    }
}
```

`hitTestType` 为 3 时表示点击的是单元格区域，返回具体的行列坐标。

#### 3.1.3 图片范围判断与格式面板打开

遍历工作表中的所有图片，判断点击位置是否在图片范围内，如果是则打开格式面板：

```javascript
let shapes = spread.getActiveSheet().shapes.all()
for (let i = 0; i < shapes.length; i++) {
    if (shapes[i] instanceof GC.Spread.Sheets.Shapes.PictureShape) {
        let pic = shapes[i]
        let startRow = pic.startRow()
        let endRow = pic.endRow()
        let startColumn = pic.startColumn()
        let endColumn = pic.endColumn()
        if (row >= startRow && row <= endRow && col >= startColumn && col <= endColumn) {
            let command = GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.FormatPane);
            command.execute(designer)
        }
    }
}
```

关键逻辑：
- 使用 `shapes.all()` 获取所有形状对象
- 通过 `instanceof` 判断是否为 `PictureShape` 类型
- 比较点击的行列号是否在图片的起始和结束行列范围内
- 使用 `getCommand()` 获取格式面板命令并执行

#### 3.1.4 加载预设文件

示例通过 `fetch` 加载预设的 `.sjs` 文件，该文件包含已插入的图片：

```javascript
fetch("src/shape.sjs").then(res => {
    return res.blob()
}).then(blob => {
    spread.open(blob)
})
```

### 3.2 技术栈

- **SpreadJS**: 17.0.8（核心表格组件）
- **SpreadJS Designer**: 17.0.8（设计器组件）
- **SpreadJS Shapes**: 17.0.8（形状和图片支持）
- **SystemJS**: 0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 使用本地服务器打开 index.html
# 例如使用 VS Code 的 Live Server 插件，或者使用 http-server
npx http-server -p 8080
```

### 4.2 操作步骤

1. 在浏览器中打开 `index.html`
2. 页面会自动加载包含图片的工作表
3. 双击工作表中的任意图片
4. 右侧会自动弹出格式面板，显示图片的属性设置选项
5. 可以在格式面板中调整图片的大小、位置、边框等属性

## 五、功能特点

### 5.1 优点

- **操作便捷**：双击即可打开格式面板，符合用户直觉
- **精准识别**：通过坐标范围判断，准确识别图片对象
- **无侵入性**：基于事件监听实现，不影响 Designer 的其他功能
- **扩展性强**：可以轻松扩展到其他形状类型（如图表、文本框等）

### 5.2 局限性与扩展建议

- **性能优化**：当工作表中图片数量较多时，遍历所有图片可能影响性能。建议使用空间索引或缓存机制优化。
- **多图层叠**：当多个图片重叠时，当前实现会打开第一个匹配的图片格式面板。可以考虑增加 z-index 判断，优先处理顶层图片。
- **扩展到其他形状**：可以将 `PictureShape` 的判断扩展为所有 `Shape` 类型，实现双击任意形状打开格式面板。

## 六、关键代码片段

### 坐标转换与命中测试

```javascript
// 获取 canvas 元素
let canvas = document.querySelector('canvas[gcuielement="gcWorksheetCanvas"]')

// 计算相对于工作表的坐标
let xx = e.pageX - this.offsetLeft
let yy = e.pageY - this.offsetTop - canvas.getBoundingClientRect().top

// 执行命中测试
let result = spread.hitTest(xx, yy)
```

### 图片范围判断

```javascript
// 获取图片的起始和结束行列
let startRow = pic.startRow()
let endRow = pic.endRow()
let startColumn = pic.startColumn()
let endColumn = pic.endColumn()

// 判断点击位置是否在图片范围内
if (row >= startRow && row <= endRow && col >= startColumn && col <= endColumn) {
    // 打开格式面板
    let command = GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.FormatPane);
    command.execute(designer)
}
```

## 七、总结

本示例展示了如何通过事件监听、坐标转换和命中测试实现双击图片打开格式面板的功能。开发者可以从中学到：

- SpreadJS 的坐标系统和命中测试机制
- 如何获取和判断图片对象的位置范围
- Designer 命令系统的使用方法
- 事件监听与 SpreadJS API 的结合应用

该方案适用于需要增强图片编辑交互体验的场景，代码简洁易懂，可以作为自定义交互功能的参考模板。通过类似的思路，还可以实现双击图表、形状等其他对象的快捷操作。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/7lXpdDK3Ekm3GS6jMx5Jrw/)）
