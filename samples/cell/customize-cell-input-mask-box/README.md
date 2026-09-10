## 一、Demo 概述

本示例展示了如何在 SpreadJS 中创建自定义单元格类型，实现一个连续方框填写的输入控件。该控件将单元格值拆分为 4 个独立的小方框，每个方框显示一个字符，适用于身份证号、验证码、序列号等需要逐字符输入的场景。 

## 二、解决的问题

* 提供类似表单中常见的验证码输入框体验，将长字符串拆分为多个独立方框
* 增强数据输入的可视化效果，便于用户逐字符核对
* 适用于固定长度字符串的输入场景，如验证码、PIN 码等

## 三、实现思路

### 3.1 自定义单元格类型基础

通过继承 `GC.Spread.Sheets.CellTypes.Base` 创建自定义单元格类型 `ContinuousBoxCellType`：

```javascript
function ContinuousBoxCellType() {
    this.html = '<input style="margin-top:2px;display:block;float:left;height:10px;font-size:10px;line-height:10px;width:10px;text-align:center;margin-left:1px;border:1px solid #999" value="{3}"/>'
        + '<input style="margin-top:2px;display:block;float:left;height:10px;font-size:10px;line-height:10px;width:10px;text-align:center;margin-left:3px;border:1px solid #999" value="{4}"/>'
        + '<input style="margin-top:2px;display:block;float:left;height:10px;font-size:10px;line-height:10px;width:10px;text-align:center;margin-left:3px;border:1px solid #999" value="{5}"/>'
        + '<input style="margin-top:2px;display:block;float:left;height:10px;font-size:10px;line-height:10px;width:10px;text-align:center;margin-left:3px;border:1px solid #999" value="{6}"/>';
}
ContinuousBoxCellType.prototype = new spreadNS.CellTypes.Base();
```

HTML 模板定义了 4 个 input 元素，使用占位符 `{3}` 到 `{6}` 用于后续替换为实际字符。

### 3.2 SVG 渲染机制

核心的 `paint` 方法使用 SVG + foreignObject 技术将 HTML 转换为图像渲染到 Canvas：

```javascript
ContinuousBoxCellType.prototype.paint = function (ctx, value, x, y, w, h, style, context) {
    var cell = context.sheet.getCell(context.row, context.col);
    var img = cell.tag();
    
    // 如果已有缓存图像，直接绘制
    if (img) {
        ctx.save();
        ctx.rect(x, y, w, h);
        ctx.clip();
        ctx.drawImage(img, x + 2, y + 2);
        ctx.restore();
        cell.tag(null);
        return;
    }
    
    // 构建 SVG 字符串
    var svgPattern = '<svg xmlns="http://www.w3.org/2000/svg" width="{0}" height="{1}">' +
        '<foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="font:{2}">' + 
        this.html + '</div></foreignObject></svg>';
    
    // 替换占位符，将单元格值的每个字符填入对应方框
    var data = svgPattern.replace("{0}", w).replace("{1}", h).replace("{2}", style.font)
        .replace("{3}", value.toString()[0] || "")
        .replace("{4}", value.toString()[1] || "")
        .replace("{5}", value.toString()[2] || "")
        .replace("{6}", value.toString()[3] || "");
    
    // 转换为 Base64 图像
    img = new Image();
    img.src = 'data:image/svg+xml;base64,' + window.btoa(data);
    cell.tag(img);
    
    img.onload = function () {
        context.sheet.repaint(new GC.Spread.Sheets.Rect(x, y, w, h));
    };
};
```

该方法通过 `cell.tag()` 缓存生成的图像，避免重复渲染。

### 3.3 编辑器实现

自定义编辑器包含三个关键方法：

**创建编辑器元素**：

```javascript
ContinuousBoxCellType.prototype.createEditorElement = function () {
    var div = document.createElement("div");
    div.setAttribute("gcUIElement", "gcEditingInput");
    div.style.backgroundColor = "white";
    div.style.overflow = "hidden";
    div.innerHTML = '<input style="..."/>' + '<input style="..."/>' + 
                    '<input style="..."/>' + '<input style="..."/>';
    return div;
};
```

**获取编辑器值**：

```javascript
ContinuousBoxCellType.prototype.getEditorValue = function (editorContext) {
    var value = "";
    for (var i = 0; i < 4; i++) {
        value += editorContext.children[i].value;
    }
    return value;
};
```

**设置编辑器值**：

```javascript
ContinuousBoxCellType.prototype.setEditorValue = function (editorContext, value) {
    for (var i = 0; i < 4; i++) {
        if (value.toString()[i] != null)
            editorContext.children[i].value = value.toString()[i];
    }
};
```

### 3.4 数据绑定

通过 `bindColumns` 将自定义单元格类型应用到列：

```javascript
var columnInfo = [
    { name: "test", displayName: "test", cellType: new ContinuousBoxCellType(), size: 170 }
];

var source = [
    { test: "3333" },
    { test: 123 },
    { test: "456" }
];

sheet.setDataSource(source);
sheet.bindColumns(columnInfo);
```

### 3.5 技术栈

* SpreadJS 15.0.0 - 核心表格控件
* TypeScript 4.1.2 - 开发语言支持
* SystemJS 0.19.22 - 模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 使用本地服务器打开 index.html（如 Live Server）
```

### 4.2 操作步骤

1. 打开页面后，表格中已预填充三行数据
2. 双击任意单元格进入编辑模式，显示 4 个独立输入框
3. 在输入框中输入字符（每个框限一个字符）
4. 按 Enter 或点击其他单元格完成编辑，内容以方框形式显示

## 五、功能特点

### 5.1 优点

* 视觉效果清晰，适合固定长度字符串输入
* 通过 SVG 渲染保证跨浏览器兼容性
* 使用 `cell.tag()` 缓存图像，提升渲染性能
* 编辑器与显示状态分离，交互体验流畅

### 5.2 局限性与扩展建议

* 当前固定为 4 个方框，可扩展为可配置数量
* 未实现方框间自动跳转（输入一个字符后自动聚焦下一个框）
* 可增加输入验证（如限制数字、字母等）
* 建议添加键盘导航支持（左右箭头切换方框）

## 六、关键代码片段

### 键盘事件处理

```javascript
ContinuousBoxCellType.prototype.isReservedKey = function (e) {
    // 自定义单元格类型自行处理 Tab 键
    return (e.keyCode === GC.Spread.Commands.Key.tab && !e.ctrlKey && !e.shiftKey && !e.altKey);
};
```

该方法确保 Tab 键由自定义单元格类型处理，而非触发默认的单元格切换行为。

### 编辑器尺寸调整

```javascript
ContinuousBoxCellType.prototype.updateEditor = function (editorContext, cellStyle, cellRect) {
    if (editorContext) {
        editorContext.style.width = cellRect.width;
        editorContext.style.height = 100;
    }
};
```

动态调整编辑器宽度以适应单元格尺寸，高度固定为 100px。

## 七、总结

本示例展示了 SpreadJS 自定义单元格类型的完整实现流程，开发者可以学到：

* 继承 `CellTypes.Base` 创建自定义单元格类型
* 使用 SVG + foreignObject 实现复杂 HTML 渲染
* 实现自定义编辑器的创建、取值、赋值逻辑
* 通过 `cell.tag()` 优化渲染性能

该方案适用于需要特殊输入格式的业务场景，可根据实际需求调整方框数量、样式和验证规则，具有较强的扩展性。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
