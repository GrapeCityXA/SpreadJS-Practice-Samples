## 一、Demo 概述

本示例展示了如何在 SpreadJS 中通过自定义单元格类型（Custom Cell Type）实现类似 ElementUI 风格的可交互单元格。该示例创建了一个具有悬停变色、鼠标指针变化和点击响应功能的自定义单元格，模拟了 ElementUI 中常见的操作按钮样式和交互效果。 

通过继承 `GC.Spread.Sheets.CellTypes.Text` 并重写关键方法，实现了单元格的自定义渲染、鼠标事件处理和视觉反馈，为开发者提供了一种在表格中嵌入交互式操作按钮的解决方案。

## 二、解决的问题

* **表格内操作按钮需求**：在数据表格中，常需要为每行数据提供"编辑"、"删除"等操作按钮，传统的超链接或按钮控件难以与单元格完美融合
* **统一的 UI 风格**：需要让 SpreadJS 表格中的交互元素与现代前端框架（如 ElementUI）的视觉风格保持一致
* **灵活的交互反馈**：需要实现鼠标悬停变色、指针变化、点击响应等完整的交互体验

## 三、实现思路

### 3.1 自定义单元格类型继承

通过继承 `GC.Spread.Sheets.CellTypes.Text` 创建自定义单元格类型，保留文本单元格的基础功能，同时扩展自定义行为：

```javascript
function HyperLinkCellType(){
    // 自定义一个单元格类型
    this._width = 0;
}

HyperLinkCellType.prototype = new GC.Spread.Sheets.CellTypes.Text()
```

### 3.2 自定义渲染逻辑

重写 `paint` 方法实现单元格的自定义渲染，设置默认的居中对齐方式，并保存单元格宽度供后续命中测试使用：

```javascript
HyperLinkCellType.prototype.paint = function(ctx, value, x, y, w, h, style, context){
    // 默认修改单元格对齐方式
    style.hAlign = GC.Spread.Sheets.HorizontalAlign.center;
    style.vAlign = GC.Spread.Sheets.VerticalAlign.center;
    this._width = w
    // 继承原逻辑
    GC.Spread.Sheets.CellTypes.Text.prototype.paint.call(this, ctx, value, x , y, w, h, style,context)
}
```

### 3.3 命中测试机制

实现 `getHitInfo` 方法，用于判断鼠标是否在目标单元格区域内，为后续的鼠标事件处理提供依据：

```javascript
HyperLinkCellType.prototype.getHitInfo = function (x, y, cellStyle, cellRect, context) {
    var info = {
        x: x,         
        y: y,        
        row: context.row,   
        col: context.col,      
        cellStyle: cellStyle,    
        cellRect: cellRect,
        sheetArea: context.sheetArea
    };
    if(x >= cellRect.x && x <= cellRect.x + this._width && y >= cellRect.y && y <= cellRect.y + cellRect.height){
        // 自己加一个标志，判断是不是目标区域
        info.isReservedLocation = true;
    }
    return info;
};
```

### 3.4 鼠标事件处理

实现三个关键的鼠标事件处理方法，提供完整的交互体验：

**鼠标移动事件**（悬停变色和指针变化）：

```javascript
HyperLinkCellType.prototype.processMouseMove = function (hitInfo) {
    var {sheet,row,col} = hitInfo;
    sheet.getCell(row,col).foreColor('#66b1ff')
    var div = sheet.getParent().getHost();
    var canvasId = div.id + "vp_vp";
    var canvas = document.getElementById(canvasId);
    if (sheet && hitInfo.isReservedLocation) {
        canvas.style.cursor = 'pointer';
        return true;
    } else {
        canvas.style.cursor = 'default';
    }
    return false;
}
```

**鼠标点击事件**（触发操作）：

```javascript
HyperLinkCellType.prototype.processMouseUp = function (hitInfo) {
    var sheet = hitInfo.sheet;
    if (sheet && hitInfo.isReservedLocation) {
        var {row,col} = hitInfo;
        // 在这里可以做一些操作,例如删除数据，修改数据等等
        alert(`你正在操作的单元格是：${row},${col}`)
        return true;
    }
    return false;
};
```

**鼠标离开事件**（恢复原始颜色）：

```javascript
HyperLinkCellType.prototype.processMouseLeave = function(hitInfo){
    var sheet = hitInfo.sheet;
    if (sheet && hitInfo.isReservedLocation) {
        var {row,col} = hitInfo
        // 变一个文字颜色
        sheet.getCell(row,col).foreColor('#409eff')
        return true;
    }
    return false;
}
```

### 3.5 应用自定义单元格

创建自定义单元格实例并应用到指定区域：

```javascript
let linkCell = new HyperLinkCellType()

let sheet = spread.getActiveSheet()
sheet.defaults.rowHeight = 40
sheet.getRange(0,0,3,3).cellType(linkCell).value('编辑').foreColor('#409eff')
```

### 3.6 技术栈

* SpreadJS 15.0.0：核心表格控件
* SystemJS 0.19.22：模块加载器
* TypeScript 4.1.2：开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 使用本地服务器打开 index.html
# 推荐使用 Live Server 或其他 HTTP 服务器
```

### 4.2 操作步骤

1. 在浏览器中打开 `index.html` 文件
2. 观察表格中前 3 行 3 列的"编辑"单元格
3. 将鼠标悬停在"编辑"单元格上，观察文字颜色变化（从 `#409eff` 变为 `#66b1ff`）和鼠标指针变化（变为手型）
4. 点击"编辑"单元格，会弹出提示框显示当前操作的行列信息
5. 鼠标移出单元格后，文字颜色恢复为原始的 `#409eff`

## 五、功能特点

### 5.1 优点

* **完整的交互体验**：实现了悬停、点击、离开的完整鼠标事件响应，提供流畅的用户体验
* **视觉风格统一**：使用 ElementUI 的经典蓝色色系（`#409eff`、`#66b1ff`），与现代前端框架风格一致
* **高度可扩展**：在 `processMouseUp` 方法中可以轻松扩展为删除数据、打开编辑弹窗等实际业务操作
* **性能优化**：通过命中测试机制精确判断鼠标位置，避免不必要的事件处理

### 5.2 局限性与扩展建议

* **当前实现的局限**：点击事件仅弹出提示框，未实现真实的编辑功能
* **扩展建议**：
    * 在 `processMouseUp` 中集成实际的数据编辑逻辑
    * 支持不同的操作类型（编辑、删除、查看等），通过单元格值或自定义属性区分
    * 添加图标支持，使用 Canvas 绘制图标或嵌入 SVG
    * 支持禁用状态，根据数据权限动态控制单元格的可交互性

## 六、关键代码片段

### 6.1 颜色配置

示例使用了 ElementUI 的标准蓝色色系：

```javascript
// 默认颜色（静态状态）
sheet.getRange(0,0,3,3).foreColor('#409eff')

// 悬停颜色（鼠标移入）
sheet.getCell(row,col).foreColor('#66b1ff')

// 恢复颜色（鼠标移出）
sheet.getCell(row,col).foreColor('#409eff')
```

### 6.2 Canvas 指针控制

通过直接操作 Canvas 元素的 CSS 样式实现指针变化：

```javascript
var div = sheet.getParent().getHost();
var canvasId = div.id + "vp_vp";
var canvas = document.getElementById(canvasId);
if (sheet && hitInfo.isReservedLocation) {
    canvas.style.cursor = 'pointer';
} else {
    canvas.style.cursor = 'default';
}
```

## 七、总结

本示例展示了 SpreadJS 自定义单元格类型的强大能力，通过继承和重写关键方法，实现了类似现代前端框架的交互式单元格。开发者可以从中学到：

* 自定义单元格类型的创建和继承机制
* 单元格渲染流程的自定义（`paint` 方法）
* 鼠标事件处理的完整流程（`getHitInfo`、`processMouseMove`、`processMouseUp`、`processMouseLeave`）
* Canvas 元素的直接操作技巧

该方案适用于需要在表格中嵌入操作按钮、实现富交互体验的场景，具有良好的扩展性和实用价值。通过修改事件处理逻辑，可以轻松适配各种业务需求，如数据编辑、删除确认、权限控制等。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
