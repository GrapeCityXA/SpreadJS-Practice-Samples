## 一、Demo 概述

本示例展示了如何通过自定义单元格类型（Custom Cell Type）实现鼠标悬浮时在单元格内显示图标的交互效果。当用户将鼠标移动到特定单元格上时，单元格会动态显示一个小图标（如 VIP 徽章），鼠标移开后图标消失，恢复显示原始文本内容。

该示例适用于需要在表格中为特定用户或数据添加视觉标识的场景，例如会员等级标识、状态提示图标等。

## 二、解决的问题

在实际业务场景中，常需要为表格单元格添加动态交互效果：

- 为 VIP 用户、特殊状态的数据行添加视觉标识，但不希望图标始终占据单元格空间
- 实现鼠标悬浮时的动态提示效果，提升用户体验
- 在不修改单元格原始数据的前提下，增强表格的交互性和信息展示能力

## 三、实现思路

### 3.1 核心技术点

#### 自定义单元格类型

通过继承 SpreadJS 的 `Text` 单元格类型，创建自定义的 `FigureCellType`，并重写关键方法实现鼠标交互：

```javascript
function FigureCellType() { }
// 继承文本类型单元格
FigureCellType.prototype = new GC.Spread.Sheets.CellTypes.Text()
```

#### 重写 paint 方法实现动态渲染

根据鼠标状态（`_mouseEnter` 标志位）动态改变单元格的渲染内容：

```javascript
FigureCellType.prototype.paint = function (ctx, value, x, y, width, height, style, context) {
    if (this._mouseEnter) {
        style.backgroundImage = src;  // 设置背景图片
        x = x + width / 2 + 70 / 2;   // 调整图标位置
        y = y + (height - 16) / 2;
        width = 16;                    // 图标尺寸
        height = 16;
        value = "";                    // 清空文本显示
    }
    GC.Spread.Sheets.CellTypes.Text.prototype.paint.apply(this, arguments);
}
```

#### 实现鼠标事件监听

通过 `getHitInfo` 方法返回单元格的命中信息，使单元格能够响应鼠标事件：

```javascript
FigureCellType.prototype.getHitInfo = function (x, y, cellStyle, cellRect, context) {
    if (context) {
        return {
            x: x,
            y: y,
            row: context.row,
            col: context.col,
            cellRect: cellRect,
            cellStyle: cellStyle,
            sheetArea: context.sheetArea,
            isReservedLocation: true,  // 标记为保留位置，启用鼠标事件
            sheet: context.sheet,
            context: context
        };
    }
    return null;
}
```

#### 处理鼠标进入和离开事件

通过 `processMouseEnter` 和 `processMouseLeave` 方法切换状态并触发重绘：

```javascript
// 鼠标进入
FigureCellType.prototype.processMouseEnter = function (hitInfo) {
    this._mouseEnter = true;
    let sheet = hitInfo.sheet;
    sheet.repaint(new GC.Spread.Sheets.Rect(hitInfo.cellRect.x, hitInfo.cellRect.y, 
                                             hitInfo.cellRect.width, hitInfo.cellRect.height));
}

// 鼠标离开
FigureCellType.prototype.processMouseLeave = function (hitInfo) {
    this._mouseEnter = false;
    let sheet = hitInfo.sheet;
    sheet.repaint(new GC.Spread.Sheets.Rect(hitInfo.cellRect.x, hitInfo.cellRect.y, 
                                             hitInfo.cellRect.width, hitInfo.cellRect.height));
}
```

### 3.2 技术栈

- SpreadJS 15.0.0：核心表格组件库
- SystemJS 0.19.22：模块加载器
- TypeScript 4.1.2：类型支持

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，可以看到单元格 A1 显示文本"Hello，金牌用户"
2. 将鼠标移动到该单元格上，文本消失，显示一个小图标
3. 将鼠标移开，图标消失，恢复显示原始文本

## 五、功能特点

### 5.1 优点

- 实现简洁：通过继承和重写少量方法即可实现复杂交互
- 性能优化：仅在鼠标事件触发时重绘指定单元格区域，避免全局刷新
- 扩展性强：可轻松扩展到多个单元格或添加更多交互效果

### 5.2 局限性与扩展建议

- 当前实现仅支持单个单元格，可扩展为批量应用到多个单元格
- 图标位置采用硬编码计算，可改进为根据单元格尺寸自适应
- 可扩展为支持多种图标类型，根据单元格数据动态选择显示的图标

## 六、总结

本示例展示了 SpreadJS 自定义单元格类型的强大能力，通过继承基础单元格类型并重写关键方法，开发者可以实现丰富的交互效果。该方案的核心价值在于：

- 掌握自定义单元格类型的创建方法
- 理解 SpreadJS 的渲染机制和事件处理流程
- 学习如何通过局部重绘优化性能

该方案适用于需要为表格添加动态视觉效果的场景，具有良好的扩展性和实用价值。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/Vm1G8lL7NU6F7hEHGKtg7Q/)）
