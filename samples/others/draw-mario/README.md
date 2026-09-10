## 一、Demo 概述

本示例展示了如何使用 SpreadJS 的单元格背景色功能绘制像素画。通过将电子表格的单元格作为像素点，设置不同的背景颜色，实现了经典的超级马里奥角色图像。该示例采用动画效果逐个渲染单元格，形成像素画的绘制过程。

这种技术可以应用于数据可视化、游戏开发、艺术创作等场景，展示了 SpreadJS 在非传统表格应用中的创意用法。

## 二、解决的问题

* **像素画绘制**：利用电子表格单元格作为像素点，实现图像绘制功能
* **动画效果实现**：通过定时器控制单元格渲染顺序，创造动态绘制效果
* **创意应用场景**：展示 SpreadJS 在艺术创作和可视化领域的应用潜力

## 三、实现思路

### 3.1 初始化表格画布

将 SpreadJS 工作表配置为适合像素画绘制的画布，设置列宽为正方形像素点：

```javascript
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let sheet = spread.getActiveSheet();
spread.suspendPaint();
sheet.setColumnCount(50);
for (let i = 0; i < sheet.getColumnCount(); i++) {
    sheet.setColumnWidth(i, 20);
}
spread.options.scrollbarMaxAlign = true;
spread.resumePaint();
```

通过 `suspendPaint()` 和 `resumePaint()` 包裹批量操作，提升性能。设置列宽为 20 像素，使单元格接近正方形，适合像素画显示。

### 3.2 像素数据结构设计

使用命令数组存储每个像素点的位置和颜色信息：

```javascript
let commandArr = [];

for (let i = 16; i < 22; i++) {
    let command = {}
    command.row = 3;
    command.col = i;
    command.backColor = "red";
    commandArr.push(command);
}
```

每个命令对象包含三个属性：

* `row`：单元格行号
* `col`：单元格列号
* `backColor`：背景颜色（支持颜色名称、RGB 值、主题色）

### 3.3 马里奥图像数据定义

通过多个循环定义马里奥图像的不同部分，使用条件判断设置不同区域的颜色：

```javascript
// 绘制第 5 行（帽子和脸部边界）
for (let i = 15; i < 23; i++) {
    let command = {}
    command.row = 5;
    command.col = i;
    if (i < 19 || i == 21) {
        command.backColor = "Accent 2 -50";  // 棕色（帽子）
    } else {
        command.backColor = "rgb(251,162,80)";  // 肤色
    }
    commandArr.push(command);
}
```

整个马里奥图像由 16 行像素数据组成，使用三种主要颜色：

* `red`：帽子和衣服
* `Accent 2 -50`：棕色（头发、鞋子）
* `rgb(251,162,80)`：肤色

### 3.4 动画渲染实现

使用递归定时器实现逐个单元格的动画绘制效果：

```javascript
document.getElementById("work").onclick = function () {
    executeCmd(commandArr);
};

function executeCmd(cmdArr) {
    setTimeout(function () {
        let i = cmdArr.length - 1;
        // 设置单元格背景色
        sheet.getCell(cmdArr[i].row, cmdArr[i].col).backColor(cmdArr[i].backColor);
        cmdArr.pop();
        if (cmdArr.length != 0) {
            executeCmd(cmdArr)
        }
    }, 20)
}
```

每隔 20 毫秒渲染一个单元格，从数组末尾开始逐个弹出并绘制，形成动态效果。

### 3.5 技术栈

* SpreadJS 15.0.0：核心电子表格引擎
* SystemJS 0.19.22：模块加载器
* TypeScript 4.1.2：开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件。

### 4.2 操作步骤

1. 打开页面后，会看到一个空白的电子表格和"生成马里奥"按钮
2. 点击"生成马里奥"按钮
3. 观察马里奥像素画的动态绘制过程（约 3-4 秒完成）
4. 绘制完成后可以看到完整的马里奥图像

## 五、功能特点

### 5.1 优点

* **创意应用**：展示了电子表格在艺术创作领域的创新用法
* **动画效果**：通过定时器实现流畅的绘制动画，增强视觉体验
* **代码简洁**：使用循环和条件判断高效定义复杂图像数据
* **易于扩展**：可以轻松修改颜色和坐标数据来绘制其他像素画

### 5.2 局限性与扩展建议

* **手动编码**：当前需要手动编写每行的像素数据，可以考虑开发图像转换工具，自动将图片转换为像素数据
* **性能优化**：对于大型像素画，可以使用 `suspendPaint()` 包裹绘制过程，或调整定时器间隔
* **交互增强**：可以添加清除、暂停、加速等控制功能
* **图像库**：可以扩展为像素画库，支持多个图像的切换和展示

## 六、关键代码片段

### 单元格背景色设置

```javascript
sheet.getCell(row, col).backColor(color);
```

这是 SpreadJS 设置单元格背景色的核心 API，支持多种颜色格式：

* 颜色名称：`"red"`, `"blue"`
* RGB 值：`"rgb(251,162,80)"`
* 主题色：`"Accent 2 -50"`

### 递归定时器模式

```javascript
function executeCmd(cmdArr) {
    setTimeout(function () {
        // 执行操作
        cmdArr.pop();
        if (cmdArr.length != 0) {
            executeCmd(cmdArr)  // 递归调用
        }
    }, 20)
}
```

这种模式确保每次操作之间有固定的时间间隔，适合实现动画效果。

## 七、总结

本示例展示了 SpreadJS 在创意应用方面的潜力，通过简单的单元格背景色设置实现了像素画绘制功能。开发者可以从中学到：

* SpreadJS 单元格样式 API 的使用方法
* 使用递归定时器实现动画效果的技巧
* 数据结构设计：将图像数据抽象为命令数组
* 批量操作性能优化：使用 `suspendPaint()` 和 `resumePaint()`

该方案适用于数据可视化、教育演示、游戏开发等场景，具有良好的扩展性。通过修改像素数据和颜色配置，可以轻松绘制各种像素风格的图像。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
