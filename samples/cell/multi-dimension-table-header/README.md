## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现多维度表头功能，通过自定义单元格类型（CellType）将单个单元格划分为多个区域，每个区域显示不同的文本内容。该功能通过从单元格左上角向右下方绘制多条分割线，将单元格按面积均分，形成扇形分布的多维度表头效果。 

该示例集成了 SpreadJS Designer 设计器，在功能区添加了自定义的"表头分区"按钮，用户可以通过可视化界面设置分区数量和内容，实现灵活的表头布局。

## 二、解决的问题

在实际业务场景中，表格表头经常需要展示多个维度的信息。传统的合并单元格方式只能实现矩形区域的合并，无法在单个单元格内展示多个维度的信息。本示例解决了以下问题：

* 在单个单元格内展示多个维度的标题信息，节省表格空间
* 通过扇形分割的方式，使表头更加紧凑和美观
* 提供可视化的配置界面，方便用户动态设置分区内容
* 支持在普通工作表（Worksheet）和报表（ReportSheet）中使用

## 三、实现思路

### 3.1 自定义单元格类型

核心实现是创建一个继承自 `GC.Spread.Sheets.CellTypes.Base` 的自定义单元格类型 `TableDivideCellType`，并重写其 `paint` 方法来实现自定义绘制逻辑：

```typescript
export class TableDivideCellType extends GC.Spread.Sheets.CellTypes.Base{
    size?: number
    constructor(){
        super()
        this.size = 10
    }
}

TableDivideCellType.prototype.paint = function(ctx, value, x, y, w, h, style, context) {
    if (!ctx) {
        return;
    }
    ctx.clearRect(x,y,w,h)
    ctx.lineWidth = 1
    drawContent(ctx,x,y,w,h,value)
}
```

### 3.2 面积均分算法

通过数学计算将单元格按面积均分为多个区域。算法核心是根据目标面积计算每条分割线的终点坐标：

```typescript
const drawContent = (ctx: any,x:number,y:number,width:number,height:number,content:{count:null,text:[]}) => {
    let lineCount = content.count
    let texts = content.text
    const totalArea = width * height;

    const endPoints = [];

    for (let i = 1; i <= lineCount; i++) {
        const targetArea = (totalArea / lineCount) * i;
        let xEnd, yEnd;

        // 根据面积计算终点坐标
        if (targetArea <= (width * height / 2)) {
            yEnd = (2 * targetArea) / width;
            xEnd = width;
        } else {
            yEnd = height;
            xEnd = width - (2 * (targetArea - width * height / 2)) / height;
        }

        endPoints.push({ x: xEnd, y: yEnd });

        // 绘制分割线
        ctx.beginPath();
        ctx.moveTo(x,y);
        ctx.lineTo(x+xEnd, y+yEnd);
        ctx.stroke();
    }
}
```

### 3.3 文本定位算法

在每个分区的角平分线上 2/3 位置处绘制文本，确保文本居中显示在各个区域：

```typescript
for (let i = 0; i < lineCount; i++) {
    const xPrev = i === 0 ? width : endPoints[i - 1].x;
    const yPrev = i === 0 ? 0 : endPoints[i - 1].y;
    const xCurr = endPoints[i].x;
    const yCurr = endPoints[i].y;

    // 计算角平分线上 2/3 位置
    const xText = (2 / 3) * ((xPrev + xCurr) / 2);
    const yText = (2 / 3) * ((yPrev + yCurr) / 2);

    // 绘制文本
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(texts[i], xText+x, yText+y);
}
```

### 3.4 Designer 功能区扩展

通过修改 Designer 的配置，在功能区添加自定义按钮：

```typescript
let config = (GC.Spread.Sheets as any).Designer.DefaultConfig
config.commandMap = {
    DivideArea: {
        title: "自定义功能",
        text: "表头分区",
        bigButton: "true",
        commandName: "DivideArea",
        iconClass: "divide-area",
        execute: function () {
            document.getElementById("setHeader").style.display = 'block'
        }
    }
}

config.ribbon[0].buttonGroups.unshift({
    "label": "自定义功能",
    "commandGroup": {
        "children": [
            {
                "direction": "vertical",
                "commands": ["DivideArea"]
            }
        ]
    }
});
```

### 3.5 用户交互处理

通过弹窗表单收集用户输入，验证数据后应用到当前选中的单元格：

```typescript
document.getElementById("confirm").onclick = () => {
    let content = {
        count: document.getElementById("area-count").value,
        text : document.getElementById("area-content").value.split("|")
     }
     if(content.count != content.text.length){
        alert("分区数量与分区内容不对应，请确认分区信息")
     }else{
        let sheet = spread.getActiveSheetOrSheetTab()
        if(sheet instanceof GC.Spread.Sheets.Worksheet){
            let activeRow = sheet.getActiveRowIndex()
            let activeCol = sheet.getActiveColumnIndex()
            sheet.getCell(activeRow,activeCol).value(content).cellType(new TableDivideCellType())
            document.getElementById("setHeader").style.display = 'none'
        }
     }
}
```

### 3.6 技术栈

* SpreadJS 17.0.8 — 核心表格组件
* SpreadJS Designer 17.0.8 — 可视化设计器
* TypeScript 4.8+ — 类型安全的开发语言
* SystemJS — 模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，SpreadJS Designer 会自动加载，第一个单元格已经预设了一个 4 分区的示例
2. 点击功能区的"自定义功能"选项卡，找到"表头分区"按钮
3. 选中需要设置多维度表头的单元格
4. 点击"表头分区"按钮，弹出配置对话框
5. 输入分区数量（必须 ≥2）
6. 输入分区内容，使用 `|` 分隔（例如：`班级|姓名|年龄|性别`）
7. 点击"确认"按钮，单元格会自动应用多维度表头效果

## 五、功能特点

### 5.1 优点

* 空间利用率高，在单个单元格内展示多个维度信息
* 面积均分算法确保各区域视觉平衡
* 集成 Designer 设计器，提供可视化配置界面
* 支持普通工作表和报表两种场景
* 代码结构清晰，易于扩展和维护

### 5.2 局限性与扩展建议

* 当前仅支持从左上角向右下方的扇形分割，可扩展支持其他分割方向
* 文本样式固定，可增加字体、颜色、大小等自定义配置
* 分区数量较多时文本可能重叠，可增加自动字号调整功能
* 可增加分割线样式配置（虚线、颜色、粗细等）

## 六、总结

本示例展示了 SpreadJS 自定义单元格类型的强大能力，通过重写 `paint` 方法实现了复杂的单元格内容绘制。开发者可以从中学到：

* 如何创建和使用自定义 CellType
* Canvas 绘图 API 的实际应用
* 面积均分的数学算法实现
* SpreadJS Designer 功能区的扩展方法
* 如何处理普通工作表和报表的差异

该方案适用于需要紧凑表头布局的场景，如复杂报表、数据分析表格等，具有良好的扩展性和实用价值。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
