## 一、Demo 概述

本示例展示了如何在 SpreadJS 单元格中绘制角标装饰效果。角标是一种常见的视觉标记，通常用于标识单元格的特殊状态、优先级或其他重要信息。该示例演示了 SpreadJS 16.1.0 版本引入的单元格装饰（Cell Decoration）新特性，通过简洁的 API 实现单元格角标的绘制。 

## 二、解决的问题

在实际业务场景中，经常需要对特定单元格添加视觉标记来传达额外信息，例如：

* 标记必填字段或重要数据
* 显示数据状态（已修改、待审核等）
* 突出显示优先级或紧急程度
* 区分不同类型的数据条目

传统方案需要通过重写单元格类型的 `paint` 方法来实现自定义绘制，代码复杂且维护成本高。SpreadJS 16.1.0 版本提供的单元格装饰特性大大简化了这一需求的实现。

## 三、实现思路

### 3.1 核心技术点

#### 使用单元格装饰 API 绘制角标

SpreadJS 16.1.0 版本引入了 `decoration` 样式属性，通过配置 `cornerFold` 对象即可实现角标效果：

```javascript
let style = new GC.Spread.Sheets.Style()
let posType = GC.Spread.Sheets.CornerPosition
style.decoration = {
    cornerFold: {
        size: 20,  // 角标大小
        position: posType.leftTop | posType.rightBottom,  // 角标位置
        color: "#5b9bd5"  // 角标颜色
    }
}
```

关键配置说明：

* `size`：控制角标的尺寸（像素）
* `position`：使用 `CornerPosition` 枚举指定角标位置，支持四个角（leftTop、rightTop、leftBottom、rightBottom），可通过位运算符 `|` 组合多个位置
* `color`：角标的填充颜色

#### 应用样式到单元格

创建样式对象后，通过 `setStyle` 方法将其应用到指定单元格：

```javascript
let sheet = spread.getActiveSheet()
sheet.setRowHeight(0, 60)
sheet.setColumnWidth(0, 150)
sheet.setStyle(0, 0, style)
```

### 3.2 技术栈

* SpreadJS 16.2.0
* TypeScript 4.1.2
* SystemJS 0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开 `index.html` 文件
2. 页面加载后，可以看到第一个单元格（A1）的左上角和右下角显示蓝色角标
3. 可以修改 `src/app.js` 中的配置参数来调整角标的大小、位置和颜色

## 五、功能特点

### 5.1 优点

* **API 简洁**：相比旧版本需要重写 `paint` 方法，新 API 只需配置样式对象即可
* **灵活配置**：支持自定义角标大小、颜色和位置（四个角任意组合）
* **性能优化**：内置实现比自定义绘制更高效
* **易于维护**：声明式配置方式降低代码复杂度

### 5.2 版本兼容性说明

代码中保留了 16.1.0 版本之前的实现方案（已注释），该方案通过重写 `CellTypes.Base.prototype.paint` 方法实现自定义绘制。虽然功能可实现，但代码复杂度较高，不推荐在新项目中使用。

## 六、关键代码片段

### 旧版实现方案（16.1.0 之前）

```javascript
let oldPaint = spreadNS.CellTypes.Base.prototype.paint;

CustomBase.prototype.paint = function (context, value, x1, y1, a1, b1, style, ctx) {
    if (this.showEffect) {
        context.save();
        let base = a1 > b1 ? b1 / 2 : a1 / 2;
        context.beginPath();
        context.moveTo(x1 + a1, y1);
        context.lineTo(x1 + a1, y1 + base);
        context.lineTo(x1 + a1 - base, y1);
        context.fillStyle = 'red';
        context.fill();
        context.closePath();
        context.restore();
    }
    oldPaint.apply(this, [context, value, x1, y1, a1, b1, style, ctx]);
};
```

该方案需要手动计算角标的绘制坐标，并通过 Canvas API 进行绘制，代码量大且不易维护。

## 七、总结

本示例展示了 SpreadJS 单元格装饰特性的基本用法，开发者可以从中学到：

* SpreadJS 16.1.0+ 版本的单元格装饰 API 使用方法
* 如何通过样式配置实现单元格角标效果
* 位运算符在多位置组合中的应用
* 新旧 API 方案的对比和选择

该方案适用于需要在单元格中添加视觉标记的场景，如数据状态标识、优先级标记等。通过简单的配置即可实现专业的视觉效果，显著提升开发效率。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
