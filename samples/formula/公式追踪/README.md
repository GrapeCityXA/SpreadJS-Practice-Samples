## 一、Demo 概述

本示例展示了如何使用 SpreadJS 实现公式依赖关系的可视化追踪功能。通过该示例，用户可以选择包含公式的单元格，然后以树形图的方式查看该单元格的引用关系（Precedents）和从属关系（Dependents），帮助开发者理解复杂工作表中的公式依赖链条。

该功能在财务建模、数据分析等场景中非常实用，可以快速定位公式错误来源，理解数据流向，提高工作表的可维护性。

## 二、解决的问题

在复杂的电子表格应用中，公式之间往往存在多层嵌套的依赖关系。本示例解决了以下核心问题：

- 可视化展示公式的引用单元格（该单元格引用了哪些其他单元格）
- 可视化展示公式的从属单元格（该单元格被哪些其他单元格引用）
- 支持递归追踪多层依赖关系，最多追踪 5 层深度
- 提供交互式导航功能，双击依赖树中的节点可快速跳转到源工作表的对应单元格

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 获取单元格依赖关系

SpreadJS 提供了 `getPrecedents()` 和 `getDependents()` 两个核心 API 来获取单元格的依赖关系：

```javascript
// 获取引用单元格（该单元格引用了哪些单元格）
childNodes = sheet.getPrecedents(row, col);

// 获取从属单元格（该单元格被哪些单元格引用）
childNodes = sheet.getDependents(row, col);
```

这两个方法返回的是一个数组，包含所有相关单元格的位置信息（行、列、行数、列数、工作表名称）。

#### 3.1.2 递归构建依赖树

通过递归算法构建完整的依赖树结构，支持多层嵌套关系：

```javascript
function getNodeChild(rootNode, sheet, trackType) {
    let childNodeArray = [];
    let childNodes = [];
    let row = rootNode.row, col = rootNode.col, deep = rootNode.deep;
    
    // 根据追踪类型获取子节点
    if (trackType == "Precedents") {
        childNodes = sheet.getPrecedents(row, col);
    } else {
        childNodes = sheet.getDependents(row, col);
    }
    
    if (childNodes.length >= 1) {
        childNodes.forEach(function(node) {
            let newNode = creatNode(row, col, sheet, deep + 1, trackType);
            // 递归追踪，最大深度为 5 层
            if (deep < maxDeep) {
                getNodeChild(newNode, sheet, trackType);
            }
            childNodeArray.push(newNode);
        });
    }
    rootNode.childNodes = childNodeArray;
}
```

#### 3.1.3 使用 Shape 绘制可视化树形图

使用 SpreadJS 的 Shapes 功能绘制矩形节点和连接线，实现依赖关系的可视化：

```javascript
// 绘制矩形节点
function getRectShape(sheetForShow, name, x, y, width, height, nodeTree) {
    var rectShape = sheetForShow.shapes.add(name, 
        GC.Spread.Sheets.Shapes.AutoShapeType.rectangle, x, y, width, height);
    var oldStyle = rectShape.style();
    
    oldStyle.fill.color = "#2894FF";
    oldStyle.textEffect.font = "bold 15px Calibri";
    // 根节点使用黄色文字，子节点使用白色文字
    if (nodeTree.deep === 0) {
        oldStyle.textEffect.color = "yellow";
    } else {
        oldStyle.textEffect.color = "white";
    }
    rectShape.style(oldStyle);
    
    var _description = "Value: " + nodeTree.value + "    deep:" + nodeTree.deep + 
                       "\nCell: " + nodeTree.position;
    rectShape.text(_description);
    
    return rectShape;
}

// 添加连接线
function getConnectorShape(sheetForShow) {
    return sheetForShow.shapes.addConnector("", 
        GC.Spread.Sheets.Shapes.ConnectorType.elbow);
}
```

#### 3.1.4 双击导航功能

通过监听工作簿的双击事件，实现点击依赖树节点跳转到源单元格的功能：

```javascript
function workbookDblClicked(e) {
    var sheet = spreadForShow.getActiveSheet();
    var x = e.pageX - left, y = e.pageY - top;
    var hitTest = sheet.hitTest(x, y);
    
    // 检查是否点击了 Shape
    if (!hitTest || !hitTest.shapeHitInfo) {
        return;
    }
    
    // 获取选中的 Shape
    var shapes = sheet.shapes.all(), activeShape = null;
    for (var i = 0; i < shapes.length; i++) {
        if (shapes[i].isSelected()) {
            activeShape = shapes[i];
            break;
        }
    }
    
    // 解析 Shape 名称中的单元格信息并跳转
    if (activeShape && activeShape.type() === 
        GC.Spread.Sheets.Shapes.AutoShapeType.rectangle) {
        let item = getCellInfo(activeShape.name());
        let sheet = sourceSpread.getSheetFromName(item.sheetName);
        if (sheet) {
            sourceSpread.setActiveSheet(item.sheetName);
            sheet.setActiveCell(item.row, item.col);
            sheet.showCell(item.row, item.col, 
                GC.Spread.Sheets.VerticalPosition.center, 
                GC.Spread.Sheets.HorizontalPosition.center);
        }
    }
}
```

### 3.2 UI 交互流程

用户操作流程：选择包含公式的单元格 → 点击"追踪引用单元格"/"追踪从属单元格"/"追踪所有单元格"按钮 → 在下方工作表中查看可视化依赖树 → 双击树中的节点 → 自动跳转到源工作表的对应单元格位置

### 3.3 技术栈

- @grapecity/spread-sheets: 15.0.0（核心表格组件）
- @grapecity/spread-sheets-shapes: 15.0.0（图形绘制功能）
- jQuery: 3.6.1（事件处理辅助）
- SystemJS: 0.19.22（模块加载）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开示例页面，上方工作表中已预设了包含公式的单元格（B3 和 B4）
2. 在上方工作表中选择一个包含公式的单元格（如 B3，公式为 =SUM(B1:B2)）
3. 点击"追踪引用单元格"按钮，下方工作表将显示该单元格引用了哪些单元格
4. 点击"追踪从属单元格"按钮，下方工作表将显示哪些单元格引用了该单元格
5. 点击"追踪所有单元格"按钮，同时显示引用和从属关系
6. 双击依赖树中的任意节点，自动跳转到源工作表的对应单元格

## 五、功能特点

### 5.1 优点

- 直观的树形可视化展示，清晰呈现公式依赖关系
- 支持双向追踪（引用和从属），全面了解单元格的依赖链条
- 递归追踪最多 5 层深度，适应复杂的嵌套公式场景
- 交互式导航功能，双击节点即可快速定位源单元格
- 自动布局算法，合理安排节点位置避免重叠

### 5.2 局限性与扩展建议

- 当前最大追踪深度限制为 5 层，对于超深层嵌套的公式可能无法完全展示
- 建议扩展：可以添加搜索功能，快速定位特定单元格在依赖树中的位置
- 建议扩展：支持导出依赖关系为图片或 JSON 格式，便于文档化和分析

## 六、关键代码片段

### 节点数据结构

```javascript
function creatNode(row, col, sheet, deep, trackType) {
    var node = {
        value: sheet.getValue(row, col),
        position: sheet.name() + "!" + 
            GC.Spread.Sheets.CalcEngine.rangeToFormula(
                new GC.Spread.Sheets.Range(row, col, 1, 1)),
        deep: deep,
        sheetName: sheet.name(),
        row: row,
        col: col,
        trackType: trackType
    };
    return node;
}
```

### 递归绘制依赖树

```javascript
function paintDataTreeFromRoot(sheetForShow, rootNode, childLength, fatherShape, deepInfo) {
    var childNodes = rootNode.childNodes;
    if (childNodes) {
        for (let index = 0; index < childNodes.length; index++) {
            let nodeTree = childNodes[index];
            
            // 计算子节点位置
            var x = fatherShape.x() + spacingWidth;
            if (nodeTree.trackType == "Precedents") {
                x = fatherShape.x() - spacingWidth;
            }
            var y = firstShapeY + startIndex * (rectHeight + shapeGap);
            
            // 绘制子节点矩形
            var name = nodeTree.sheetName + "*" + nodeTree.row + "*" + 
                       nodeTree.col + "*" + Math.random().toString();
            let rectShape = getRectShape(sheetForShow, name, x, y, 
                                         rectWidth, rectHeight, nodeTree);
            
            // 绘制连接线
            var connectorShape = getConnectorShape(sheetForShow);
            connectorShape.startConnector({name: fatherShape.name(), index: 1});
            connectorShape.endConnector({name: rectShape.name(), index: 3});
            
            // 递归绘制子节点
            if (nodeTree.childNodes && nodeTree.childNodes.length) {
                paintDataTreeFromRoot(sheetForShow, nodeTree, 
                    nodeTree.childNodes.length, rectShape, deepInfo);
            }
        }
    }
}
```

## 七、总结

本示例展示了 SpreadJS 在公式依赖关系可视化方面的强大能力。开发者可以从中学到：

- 如何使用 `getPrecedents()` 和 `getDependents()` API 获取单元格依赖关系
- 如何使用递归算法构建多层依赖树结构
- 如何使用 Shapes API 绘制自定义图形和连接线
- 如何实现 Shape 的交互事件处理和单元格导航功能
- 如何设计自动布局算法处理复杂的树形结构

该方案适用于需要分析和展示电子表格公式依赖关系的场景，如财务审计工具、数据血缘分析、公式调试器等。通过扩展该示例，可以构建更强大的公式分析和可视化工具。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/dEVRxWai30_izJMQG0sNwA/)）
