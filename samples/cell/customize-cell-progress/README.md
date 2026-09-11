## 一、Demo 概述

本示例展示了如何在 SpreadJS 中通过自定义单元格类型实现进度条效果。通过继承 `Text` 单元格类型并重写 `paint` 方法，实现了根据数值大小自动渲染不同颜色的进度条，直观地展示数据的完成度或状态。 

该示例适用于需要在表格中可视化展示进度、完成率、风险等级等场景，通过颜色和长度的组合，让数据更加直观易读。

## 二、解决的问题

* **数据可视化需求**：将枯燥的数字转换为直观的进度条，提升数据的可读性
* **状态分级展示**：通过不同颜色（绿、黄、红）表示不同的状态等级，快速识别风险或完成度
* **自定义渲染逻辑**：满足特定业务场景下对单元格展示效果的个性化需求

## 三、实现思路

### 3.1 自定义单元格类型

通过继承 SpreadJS 的 `Text` 单元格类型，创建自定义的 `DataBar` 单元格类型：

```javascript
function DataBar(){}
DataBar.prototype = new GC.Spread.Sheets.CellTypes.Text();
```

这种继承方式保留了文本单元格的基础功能，同时允许我们重写特定的渲染方法。

### 3.2 重写 paint 方法实现进度条渲染

核心实现在于重写 `paint` 方法，根据单元格的数值绘制进度条：

```javascript
var oldPaint = GC.Spread.Sheets.CellTypes.Text.prototype.paint;
DataBar.prototype.paint = function (ctx, value, x, y, w, h, style, options) {
    if(typeof(value) == "number" && value >=0 && value <=100){
        var color;
        // 根据数值范围设置颜色
        if(value>=0 && value <=60){
            color = "green";
        }
        else if(value>60 && value <=85){
            color = "yellow";
        }
        else if(value>85 && value <=100){
            color = "red";
        }
        ctx.fillStyle = color;
        // 绘制进度条，宽度按比例计算
        ctx.fillRect(x, y, value/100*w, h);
    }else{
        // 非数值或超出范围时，使用默认文本渲染
        oldPaint.call(this, ctx, value, x, y, w, h, style, options);
    }
};
```

**实现要点**：

* 保存原始 `paint` 方法的引用，用于处理非数值情况
* 使用 Canvas 2D 上下文（`ctx`）进行绘制
* 进度条宽度按 `value/100*w` 计算，实现百分比效果
* 颜色分级：0-60（绿色）、60-85（黄色）、85-100（红色）

### 3.3 应用自定义单元格类型

在工作表中设置单元格类型并赋值：

```javascript
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
var sheet = spread.getActiveSheet();

sheet.setCellType(0, 0, new DataBar());
sheet.setValue(0, 0, 30);
sheet.setCellType(1, 0, new DataBar());
sheet.setValue(1, 0, 40);
// ... 更多单元格设置
```

### 3.4 技术栈

* **@grapecity/spread-sheets**: 15.0.0（核心表格组件）
* **TypeScript**: ^4.1.2（类型支持）
* **SystemJS**: ^0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开 `index.html` 文件
2. 页面会自动加载并显示 SpreadJS 表格
3. 第一列的前 7 行会显示不同数值的进度条效果
4. 可以尝试修改单元格的值（0-100 之间的数字），观察进度条的变化

## 五、功能特点

### 5.1 优点

* **实现简单**：通过继承和重写 `paint` 方法，代码量少且易于理解
* **视觉直观**：进度条和颜色分级让数据一目了然
* **灵活可扩展**：可以轻松调整颜色阈值、进度条样式等
* **性能良好**：基于 Canvas 绘制，渲染效率高

### 5.2 局限性与扩展建议

* **当前限制**：仅支持 0-100 的数值范围，超出范围会显示为普通文本
* **扩展建议**：
    * 可以添加进度条上的文字显示（如百分比数字）
    * 支持自定义颜色阈值和颜色方案
    * 增加渐变色或图案填充效果
    * 支持负数或其他数值范围

## 六、关键代码片段

### 颜色分级逻辑

```javascript
var color;
if(value>=0 && value <=60){
    color = "green";  // 低风险/良好状态
}
else if(value>60 && value <=85){
    color = "yellow"; // 中等风险/警告状态
}
else if(value>85 && value <=100){
    color = "red";    // 高风险/危险状态
}
```

### Canvas 绘制进度条

```javascript
ctx.fillStyle = color;
ctx.fillRect(x, y, value/100*w, h);
```

`fillRect` 的参数说明：

* `x, y`：单元格的起始坐标
* `value/100*w`：进度条宽度，按百分比计算
* `h`：单元格高度

## 七、总结

本示例展示了 SpreadJS 自定义单元格类型的强大能力，通过简单的代码即可实现专业的数据可视化效果。开发者可以从中学到：

* 如何继承和扩展 SpreadJS 的内置单元格类型
* 使用 Canvas API 进行自定义渲染
* 实现条件格式化的可视化展示
* 处理不同数据类型的兼容性

该方案适用于项目管理、数据分析、风险评估等多种场景，具有良好的扩展性和实用价值。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
