## 一、Demo 概述

本示例展示了如何通过扩展 SpreadJS 的基础单元格类型（Base CellType）来实现自定义渲染效果，并演示了在运行时动态切换单元格类型的能力。示例通过重写 `paint` 方法在单元格左上角绘制蓝色三角形标记，并支持通过按钮点击将文本单元格切换为按钮单元格，同时保留自定义渲染效果。

该示例适用于需要为单元格添加特殊视觉标识（如批注标记、状态指示器）或需要根据业务逻辑动态改变单元格交互方式的场景。

## 二、解决的问题

- **自定义单元格视觉效果**：通过扩展基础单元格类型，可以在不修改 SpreadJS 核心代码的情况下添加自定义渲染逻辑，例如为特定单元格添加角标、图标或装饰效果
- **动态单元格类型切换**：支持在运行时根据用户操作或业务状态改变单元格的交互类型（如从静态文本变为可点击按钮），提升表格的交互灵活性

## 三、实现思路

### 3.1 扩展基础单元格类型

通过保存原始 `paint` 方法并重写 `Base.prototype.paint`，实现在所有单元格类型上添加自定义渲染逻辑：

```javascript
var CustomBase = spreadNS.CellTypes.Base;
var oldPaint = spreadNS.CellTypes.Base.prototype.paint;

CustomBase.prototype.paint = function (context, value, x1, y1, a1, b1, style, ctx) {
    if (!context) {
        return;
    }
    if (this.showEffect) {
        context.save();
        let base = a1 > b1 ? b1 / 2 : a1 / 2;
        context.beginPath();
        context.moveTo(x1 + base, y1);
        context.lineTo(x1, y1 + base);
        context.lineTo(x1, y1);
        
        context.fillStyle = 'blue';
        context.fill();
        context.closePath();
        context.restore();
    }
    oldPaint.apply(this, [context, value, x1, y1, a1, b1, style, ctx]);
};
```

关键点：
- 通过 `showEffect` 属性控制是否显示自定义效果
- 使用 Canvas API 绘制等腰直角三角形（根据单元格宽高自适应大小）
- 调用原始 `paint` 方法保证单元格默认内容正常渲染

### 3.2 初始化自定义文本单元格

创建带有自定义效果的文本单元格并应用到工作表：

```javascript
var myCellType = new spreadNS.CellTypes.Text();
myCellType.showEffect = true;
sheet.setCellType(0, 0, myCellType);
```

### 3.3 动态切换单元格类型

通过按钮点击事件将文本单元格切换为按钮单元格，同时保留自定义渲染效果：

```javascript
$("#change").click(function () {
    myCellType = new spreadNS.CellTypes.Button();
    myCellType.showEffect = true;
    
    myCellType.text("Margin");
    myCellType.marginLeft(15);
    myCellType.marginTop(7);
    myCellType.marginRight(15);
    myCellType.marginBottom(7);
    
    sheet.setCellType(0, 0, myCellType);
});
```

由于 `Button` 类型继承自 `Base`，重写的 `paint` 方法会自动生效，因此按钮单元格也会显示蓝色三角形标记。

### 3.4 技术栈

- SpreadJS 15.0.0（核心表格引擎）
- jQuery 3.6.1（事件处理）
- SystemJS 0.19.22（模块加载）
- TypeScript 4.1.2（开发语言支持）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件。

### 4.2 操作步骤

1. 打开页面后，观察 A1 单元格左上角的蓝色三角形标记（此时为文本单元格）
2. 点击"变更单元格类型"按钮
3. A1 单元格变为按钮类型，显示"Margin"文字，同时保留蓝色三角形标记
4. 可以点击按钮单元格触发交互（虽然本示例未绑定具体事件）

## 五、功能特点

### 5.1 优点

- **非侵入式扩展**：通过原型链重写实现功能扩展，不修改 SpreadJS 源码
- **灵活的视觉定制**：可以使用 Canvas API 绘制任意自定义图形
- **类型切换无缝衔接**：自定义效果在不同单元格类型间保持一致
- **代码简洁**：核心实现仅需约 50 行代码

### 5.2 局限性与扩展建议

- **全局影响**：当前实现会影响所有单元格类型，如需精细控制可以通过条件判断或创建独立的自定义类型类
- **性能考虑**：大量单元格使用自定义渲染时需注意 Canvas 绘制性能，可以考虑使用 `suspendPaint/resumePaint` 批量更新
- **扩展方向**：
  - 支持更多自定义参数（颜色、形状、位置）
  - 结合单元格数据状态动态显示不同标记
  - 实现更复杂的交互效果（如悬停提示、动画）

## 六、关键代码片段

### 重写 paint 方法实现自定义渲染

```javascript
CustomBase.prototype.paint = function (context, value, x1, y1, a1, b1, style, ctx) {
    if (!context) {
        return;
    }
    // 根据 showEffect 属性决定是否绘制自定义效果
    if (this.showEffect) {
        context.save();
        // 计算三角形基准尺寸（取宽高较小值的一半）
        let base = a1 > b1 ? b1 / 2 : a1 / 2;
        context.beginPath();
        context.moveTo(x1 + base, y1);      // 右顶点
        context.lineTo(x1, y1 + base);      // 下顶点
        context.lineTo(x1, y1);             // 左上顶点
        
        context.fillStyle = 'blue';
        context.fill();
        context.closePath();
        context.restore();
    }
    // 调用原始 paint 方法渲染单元格内容
    oldPaint.apply(this, [context, value, x1, y1, a1, b1, style, ctx]);
};
```

## 七、总结

本示例展示了 SpreadJS 单元格类型系统的扩展能力，开发者可以学到：

- 如何通过原型链扩展实现自定义单元格渲染
- Canvas API 在表格单元格中的应用技巧
- 动态切换单元格类型的实现方法
- `suspendPaint/resumePaint` 的性能优化实践

该方案适用于需要为单元格添加视觉标识或实现复杂交互逻辑的业务场景，具有良好的扩展性和可维护性。通过类似的方式，开发者可以创建更多自定义单元格类型来满足特定业务需求。

[操作视频](DOCUMENT_SITE_VIDEO_BUTTON_PREFIX:https://videos.grapecity.com.cn/SpreadJS/CodeLibrary/Change%20Cell%20Type.mp4)

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/O1ZVMehWrUyFYJk5wg2Z1w/)）
