## 一、Demo 概述

本示例展示了如何使用 SpreadJS Shapes API 动态生成业务流程图，并实现流程状态的可视化管理。示例以"退换货流程"为场景，通过数据驱动的方式自动计算流程节点位置、建立连接关系，并提供流程状态切换（未开始/进行中/已完成）和图片导出功能。该方案适用于需要在电子表格中嵌入可交互流程图的业务场景，如工作流管理、审批流程可视化等。

## 二、解决的问题

* **流程图自动布局**：通过算法自动计算多层级、多分支流程图的节点位置，避免手动调整坐标的繁琐工作
* **流程状态可视化**：通过颜色区分流程节点的执行状态（灰色未开始、黄色进行中、蓝色已完成），直观展示业务进度
* **数据与视图分离**：使用 JSON 数据模型描述流程结构，通过代码自动渲染为可视化图形，便于维护和扩展
* **流程图导出**：支持将流程图导出为高质量图片，方便分享和存档

## 三、实现思路

### 3.1 核心技术点

#### 数据模型设计

使用 JSON 结构描述流程图的节点（elements）和连接关系（edge）：

```javascript
let shapeInfo = {
    elements: [
        {
            id: 1,
            text: "申请退换货",
            type: normal,  // 流程节点类型（矩形/菱形）
            process: 2     // 流程状态：0未开始 1进行中 2已完成
        },
        {
            id: 2,
            text: "是否申请成功",
            type: judge,   // 决策节点（菱形）
            width: 150,
            height: 120,
            process: 2
        }
    ],
    edge: [
        {
            source: 1,
            target: 2
        },
        {
            source: 2,
            target: 3,
            flag: 1  // 决策分支标识（1为"是"，0为"否"）
        }
    ]
}
```

每个节点通过 `id` 唯一标识，`edge` 数组定义节点间的有向连接关系。

#### 自动布局算法

通过递归算法计算流程图的层级深度和节点位置：

```javascript
// 计算流程图最大层级数
function getMaxLvl(info, lvl) {
    let nextShapes = info.next()
    if (nextShapes.length == 0 || info.hasCountMax) {
        return lvl
    }
    info.hasCountMax = true
    let arr = []
    nextShapes.forEach(info => {
        arr.push(_getMaxLvl(info, lvl + nextShapes.length - 1))
    })
    return Math.max(...arr)
}

// 递归计算节点位置
function calcPosition(info) {
    if (info.hasCalcPos) return
    
    let prevs = info.prev()
    info.hasCalcPos = true
    info.x = prevs[0].x + prevs[0].width + 60  // 水平间距60px
    
    // 计算垂直位置：兄弟节点根据父节点位置上下分布
    let siblings = prevs[0].next()
    let parentMaxLvl = getMaxLvl(prevs[0], 1)
    let index = siblings.findIndex(s => s.id == info.id)
    
    let prevY = prevs.reduce((sum, p) => sum + p.y, 0) / prevs.length
    let prevH = prevs.reduce((sum, p) => sum + p.height, 0) / prevs.length
    
    info.y = prevY + (prevH - info.height) / 2 + 
             (index - (siblings.length - 1) / 2) * (prevH) * (parentMaxLvl / 2.5)
    
    info.next().forEach(i => calcPosition(i))
}
```

算法核心思路：

1. 从起始节点递归计算最大层级深度
2. 水平方向按层级依次排列，间距固定
3. 垂直方向根据兄弟节点数量和父节点位置动态分布

#### 自定义 Ribbon 命令

通过扩展 SpreadJS Designer 配置，添加流程控制按钮：

```javascript
let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))
config.ribbon.push({
    id: "process-control",
    text: "流程控制",
    buttonGroups: [{
        label: "控制按钮区",
        commandGroup: {
            children: ["unstartProcess", "inProcess", "finishProcess"]
        }
    }]
})

config.commandMap = {
    inProcess: {
        title: "设置流程为进行中",
        text: "进行中",
        iconClass: "ribbon-button-in-process",
        bigButton: "true",
        commandName: "inProcess",
        execute: function (designer) {
            let spread = designer.getWorkbook()
            let sheet = spread.getActiveSheet()
            spread.commandManager().execute({
                cmd: "changeShapeColor",
                sheetName: sheet.name(),
                flag: 1  // 1对应进行中状态
            })
        }
    }
}
```

#### 自定义撤销/重做命令

实现流程状态变更的撤销功能：

```javascript
let changeShapeColor = {
    canUndo: true,
    execute: function (spread, options, isUndo) {
        var Commands = GC.Spread.Sheets.Commands;
        if (isUndo) {
            Commands.undoTransaction(spread, options);
            return true;
        } else {
            Commands.startTransaction(spread, options);
            spread.suspendPaint();
            
            let selectedShapes = getSelectedShapes(spread)
            let flag_2_color = [not_start_color, in_process_color, finish_color]
            selectedShapes.forEach(shape => {
                let style = shape.style()
                style.fill.color = flag_2_color[options.flag]
                shape.style(style)
                getInfoFromId(shape.infoId).process = options.flag
            })
            
            spread.resumePaint();
            Commands.endTransaction(spread, options);
            return true;
        }
    }
}

// 注册自定义命令
spread.commandManager().register("changeShapeColor", changeShapeColor)
```

#### 流程图导出为图片

利用 SpreadJS 打印功能和 Canvas API 实现高质量图片导出：

```javascript
spread.bind(GC.Spread.Sheets.Events.BeforePrint, function (s, e) {
    var iframe = e.iframe;
    var images = iframe.contentWindow.document.getElementsByTagName("img");
    for (var i = 0; i < images.length; i++) {
        var img = images[i];
        var canvas = document.createElement("canvas");
        canvas.height = img.naturalHeight;
        canvas.width = img.naturalWidth;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = "#FFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(function (blob) {
            saveAs(blob, "print.jpeg");
        }, "image/jpeg", 1);
    }
    e.cancel = true;  // 取消默认打印行为
});

let printInfo = sheet.printInfo()
printInfo.qualityFactor(6)  // 设置高质量因子
printInfo.showColumnHeader(GC.Spread.Sheets.Print.PrintVisibilityType.hide)
printInfo.showRowHeader(GC.Spread.Sheets.Print.PrintVisibilityType.hide)
printInfo.paperSize(new GC.Spread.Sheets.Print.PaperSize(GC.Spread.Sheets.Print.PaperKind.a2))
spread.print();
```

### 3.2 UI 交互流程

1. 页面加载 → 读取流程数据模型 → 自动计算布局 → 渲染流程图
2. 用户选中流程节点 → 点击 Ribbon 状态按钮 → 节点颜色变更 → 数据模型同步更新
3. 用户拖动节点 → 触发 ShapeChanged 事件 → 更新连接线和决策文字位置
4. 点击导出按钮 → 触发打印流程 → 截取 Canvas 图像 → 下载 JPEG 文件

### 3.3 技术栈

* SpreadJS 16.0.1（核心表格引擎）
* @grapecity/spread-sheets-shapes（形状绘制）
* @grapecity/spread-sheets-designer（设计器组件）
* @grapecity/spread-sheets-print（打印功能）
* SystemJS（模块加载）
* TypeScript 4.1.2（类型支持）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 使用本地服务器打开 index.html（如 Live Server）
```

### 4.2 操作步骤

1. 打开页面后自动加载退换货流程图
2. 点击流程节点，使用 Ribbon 工具栏的"流程控制"选项卡切换状态
3. 拖动节点可调整位置，连接线和标签会自动跟随
4. 点击"导出图片"按钮将流程图保存为 JPEG 文件
5. 点击"打印 json"按钮可在控制台查看当前流程数据结构

## 五、功能特点

### 5.1 优点

* **智能布局**：自动计算多层级、多分支流程图的节点位置，支持复杂业务流程
* **数据驱动**：通过修改 JSON 数据即可快速调整流程结构，无需手动绘制
* **状态可视化**：三种颜色直观展示流程进度，支持撤销/重做操作
* **高质量导出**：通过 qualityFactor 参数控制导出图片质量，适合文档归档

### 5.2 局限性与扩展建议

* **布局算法限制**：当前算法适用于树状结构流程图，对于包含循环或交叉连接的复杂图结构需要优化
* **扩展建议**：
    * 支持更多形状类型（圆形、六边形等）
    * 添加流程节点的右键菜单功能
    * 实现流程图的 JSON 导入/导出功能
    * 支持流程节点的条件样式配置

## 六、关键代码片段

### 连接线位置计算

```javascript
function calcConnectPoint(startShape, endShape) {
    let startMidX = startShape.x + startShape.width / 2
    let startMidY = startShape.y + startShape.height / 2
    let endMidX = endShape.x + endShape.width / 2
    let endMidY = endShape.y + endShape.height / 2

    // 判断是否垂直连接
    if (Math.abs((startMidX - endMidX) / (startMidY - endMidY)) < 0.1) {
        if (startMidY > endMidY) {
            return [0, 2]  // 上→下
        } else {
            return [2, 0]  // 下→上
        }
    }
    
    // 判断是否水平连接
    if (Math.abs((startMidY - endMidY) / (startMidX - endMidX)) < 0.1) {
        if (startMidX > endMidX) {
            return [1, 3]  // 左→右
        } else {
            return [3, 1]  // 右→左
        }
    }

    // 斜向连接：根据角度计算最佳连接点
    let distance = Math.sqrt((startMidX - endMidX) ^ 2 + (startMidY - endMidY) ^ 2)
    let sin_alpha = parseFloat((endMidY - startMidY) / distance)
    // ... 根据角度返回连接点索引
}
```

连接点索引说明：0上、1左、2下、3右。

### 决策节点标签自动定位

```javascript
function addDecisionText() {
    spread.suspendPaint()
    shapeInfo.elements.forEach(info => {
        if (info.type != SpreadTypes.flowchartDecision) return
        
        info.connectors.forEach(c => {
            let midX = c.x() + c.width() / 2
            let midY = c.y() + c.height() / 2
            if (!c.textBox) {
                c.textBox = spread.getActiveSheet().shapes.add("", SpreadTypes.roundedRectangle)
                c.textBox.width(45)
                c.textBox.height(35)
                c.textBox.text(c.flag == 1 ? "是" : "否")
            }
            c.textBox.x(midX - 23)
            c.textBox.y(midY - 17)
        })
    })
    spread.resumePaint()
}
```

在决策节点的连接线中点位置自动添加"是/否"标签。

## 七、总结

本示例展示了 SpreadJS Shapes API 在业务流程可视化场景中的应用，开发者可以学到：

1. 使用 Shapes API 动态创建和管理图形元素
2. 实现自定义 Ribbon 命令和撤销/重做机制
3. 通过算法自动计算复杂图形的布局位置
4. 利用打印功能实现高质量图片导出
5. 数据驱动的图形渲染架构设计

该方案适用于需要在电子表格中嵌入流程图、组织架构图、思维导图等可视化图形的场景，通过修改数据模型即可快速适配不同业务需求。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
