## 一、Demo 概述

本示例展示了如何在 SpreadJS 中创建自定义单元格类型，实现类似移动端常见的 Switch 开关效果。通过继承 CheckBox 单元格类型并重写其 paint 方法,将传统的复选框替换为更美观的图形化开关按钮。该示例适用于需要在表格中实现更友好的布尔值交互界面的场景。

## 二、解决的问题

- 提供比默认 CheckBox 更美观的开关交互界面
- 实现自定义单元格类型的绘制逻辑
- 展示如何使用 Canvas API 在单元格中渲染图片

## 三、实现思路

### 3.1 自定义单元格类型定义

通过继承 SpreadJS 内置的 CheckBox 单元格类型来创建自定义的 Switch 开关单元格:

```javascript
function SwitchCellType() { }
// 以checkBox为基础，做修改
SwitchCellType.prototype = new GC.Spread.Sheets.CellTypes.CheckBox();
```

这种继承方式保留了 CheckBox 的基础功能(如点击切换状态),只需重写视觉呈现部分。

### 3.2 重写 paint 方法实现自定义绘制

核心实现在于重写 paint 方法,根据单元格的值(true/false)绘制不同状态的开关图片:

```javascript
SwitchCellType.prototype.paint = function (ctx, value, x, y, w, h, style, context) {
    let cell = context.sheet.getCell(context.row, context.col);
    let img = cell.tag();
    
    if (img) {
        try {
            ctx.save();
            ctx.rect(x, y, w, h);
            ctx.translate(w / 2, h / 2)
            ctx.scale(0.2, 0.2)
            ctx.clip();
            ctx.drawImage(img, x, y)
            ctx.restore();
            cell.tag(null);
            return;
        } catch (err) {
            GC.Spread.Sheets.CustomCellType.prototype.paint.apply(this, 
                [ctx, "#HTMLError", x, y, w, h, style, context])
            cell.tag(null);
            return;
        }
    }
    
    let picBase64
    if (value) {
        // checkbox为true时的图片
        picBase64 = 'data:image/png;base64,iVBORw0KGgo...' // 开启状态图片
    } else {
        picBase64 = 'data:image/png;base64,iVBORw0KGgo...' // 关闭状态图片
    }
    
    img = new Image();
    img.src = picBase64;
    cell.tag(img);
    img.onload = function () {
        context.sheet.repaint(new GC.Spread.Sheets.Rect(x, y, w, h));
    }
}
```

**实现要点:**
- 使用 `cell.tag()` 临时存储图片对象,避免重复创建
- 通过 Canvas 的 `translate` 和 `scale` 方法调整图片位置和大小
- 图片加载完成后调用 `repaint` 触发重绘
- 使用 Base64 编码的图片数据,无需外部资源

### 3.3 应用自定义单元格类型

将自定义的 Switch 单元格类型应用到指定单元格:

```javascript
let sheet = spread.getActiveSheet()
sheet.setCellType(0, 0, new SwitchCellType())
sheet.setRowHeight(0, 40)
```

同时调整行高以适应开关图片的显示尺寸。

### 3.4 技术栈

- SpreadJS 16.0.1 - 核心表格组件
- SystemJS 0.19.22 - 模块加载器
- TypeScript 4.1.2 - 开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

安装完成后,在浏览器中打开 `index.html` 文件即可运行示例。

### 4.2 操作步骤

1. 打开页面后,可以看到第一行第一列单元格显示为关闭状态的开关
2. 点击该单元格,开关会切换到开启状态
3. 再次点击,开关恢复到关闭状态
4. 单元格的实际值为布尔类型(true/false),可通过 API 读取

## 五、功能特点

### 5.1 优点

- 视觉效果更现代化,符合移动端交互习惯
- 继承 CheckBox 功能,保留原有的数据绑定和事件机制
- 使用 Base64 图片,无需额外的资源文件管理
- 实现简洁,易于理解和扩展

### 5.2 局限性与扩展建议

- 当前使用固定的 Base64 图片,文件体积较大,可考虑使用外部图片资源或 SVG
- 开关样式固定,可扩展为支持自定义颜色和尺寸的参数化实现
- 可以添加过渡动画效果,提升交互体验

## 六、关键代码片段

### Canvas 绘制图片的坐标变换

```javascript
ctx.save();
ctx.rect(x, y, w, h);
ctx.translate(w / 2, h / 2)  // 移动坐标原点到单元格中心
ctx.scale(0.2, 0.2)          // 缩放图片到合适大小
ctx.clip();
ctx.drawImage(img, x, y)
ctx.restore();
```

这段代码展示了如何使用 Canvas 的坐标变换功能,将图片精确绘制在单元格中心位置。

## 七、总结

本示例展示了 SpreadJS 自定义单元格类型的核心开发流程,开发者可以从中学到:

- 如何继承内置单元格类型并扩展功能
- Canvas API 在单元格绘制中的应用技巧
- 使用 tag 属性缓存对象以优化性能
- 图片异步加载与重绘机制的配合

该方案适用于需要在表格中实现自定义视觉效果的场景,具有良好的扩展性。开发者可以基于此思路实现更多样式的自定义单元格,如评分星级、进度条、标签等组件。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/aSqGegSoc0ilZuvnjNwyJQ/)）
