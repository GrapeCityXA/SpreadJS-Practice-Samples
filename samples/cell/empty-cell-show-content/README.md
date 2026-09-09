## 一、Demo 概述

本示例演示了如何通过自定义单元格类型来控制空值的显示方式。在默认情况下，SpreadJS 中的空单元格（null 或 undefined）不显示任何内容，但在某些业务场景中，我们希望空值能够显示为特定的占位符（如 "-"、"N/A" 等），以提升数据表格的可读性和专业性。

该示例通过继承 SpreadJS 的 Text 单元格类型并重写其 paint 方法，实现了当单元格值为空时自动显示 "-" 的功能。

## 二、解决的问题

- **空值可视化**：在数据报表或统计表格中，空值如果不显示任何内容，用户可能无法区分是数据缺失还是显示异常，通过显示占位符可以明确表示该位置确实没有数据
- **提升用户体验**：统一的空值显示方式使表格看起来更加整齐规范，符合专业报表的视觉标准
- **灵活的自定义需求**：不同业务场景可能需要不同的空值占位符（如财务报表用 "-"，统计表用 "N/A"），自定义单元格类型提供了灵活的解决方案

## 三、实现思路

### 3.1 核心技术点

#### 自定义单元格类型

通过继承 SpreadJS 的 `CellTypes.Text` 类型创建新的单元格类型，并重写 `paint` 方法来控制渲染逻辑：

```javascript
var spreadNS = GC.Spread.Sheets;
function ShowValueCellType() { }

// 继承原生 Text 类型
ShowValueCellType.prototype = new spreadNS.CellTypes.Text();

// 重写 paint 方法
ShowValueCellType.prototype.paint = function (ctx, value, x, y, w, h, style, options) {
    // 判断值是否为空，如果为空则替换为 "-"
    if (value === null || value === undefined) {
        value = "-";
    }
    // 调用基类的 paint 方法进行实际渲染
    spreadNS.CellTypes.Base.prototype.paint.apply(this, [ctx, value, x, y, w, h, style, options]);
};
```

**实现原理**：
- `paint` 方法是单元格类型的核心渲染方法，接收 canvas 上下文、单元格值、位置坐标、尺寸、样式等参数
- 在渲染前拦截 value 参数，检查是否为 null 或 undefined
- 如果为空值，将其替换为 "-"（或其他自定义占位符）
- 最后调用基类的 paint 方法完成实际的绘制工作

#### 应用自定义单元格类型

将自定义的单元格类型应用到工作表的指定区域：

```javascript
// 应用到整个工作表
sheet.getRange(0, 0, sheet.getRowCount(), sheet.getColumnCount())
     .cellType(new ShowValueCellType());
```

也可以更灵活地应用到特定单元格：

```javascript
// 应用到单个单元格
sheet.setCellType(row, col, new ShowValueCellType());
```

### 3.2 技术栈

- **SpreadJS**: 15.0.0 - 核心表格组件库
- **SystemJS**: 0.19.22 - 模块加载器
- **TypeScript**: 4.1.2 - 开发语言（编译为 JavaScript）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开 index.html 文件，页面会自动加载并初始化 SpreadJS 工作表
2. 观察表格中的数据：前 7 行包含正常的数值和公式计算结果
3. 查看第 8 行（最后一行）：该行的 A8 和 B8 单元格为空，但显示为 "-"
4. 第 8 行的 C8 单元格包含公式 `=A8+B8`，由于 A8 和 B8 为空，计算结果也为空，同样显示为 "-"

## 五、功能特点

### 5.1 优点

- **实现简单**：只需继承现有单元格类型并重写一个方法，代码量少且易于理解
- **灵活可扩展**：可以根据业务需求自定义任何占位符，甚至可以根据不同条件显示不同的占位符
- **性能友好**：仅在渲染时进行判断和替换，不影响单元格的实际数据存储和计算逻辑
- **适用范围广**：可以应用到整个工作表、指定区域或单个单元格，使用灵活

### 5.2 局限性与扩展建议

**局限性**：
- 当前实现仅处理 null 和 undefined，如果需要处理空字符串或其他特殊值，需要修改判断逻辑

**扩展建议**：
- 可以扩展为根据单元格位置、数据类型或其他条件显示不同的占位符
- 可以添加配置参数，使占位符内容可配置而不是硬编码
- 可以结合条件格式，为空值单元格添加特殊的样式（如灰色文字、斜体等）

## 六、关键代码片段

### 完整的初始化代码

```javascript
function initSpread(spread) {
    var sheet = spread.getSheet(0);
    sheet.suspendPaint();

    sheet.setRowCount(8);
    sheet.setColumnCount(10);

    // 设置列标题
    sheet.setValue(0, 0, "值1", GC.Spread.Sheets.SheetArea.colHeader);
    sheet.setValue(0, 1, "值2", GC.Spread.Sheets.SheetArea.colHeader);
    sheet.setValue(0, 2, "值1+值2", GC.Spread.Sheets.SheetArea.colHeader);

    // 填充前 7 行数据
    for (var i = 0; i < sheet.getRowCount() - 1; i++) {
        sheet.setValue(i, 0, i);
        sheet.setValue(i, 1, sheet.getRowCount() - i);
        var j = i + 1;
        sheet.setFormula(i, 2, "=A" + j + "+B" + j);
        sheet.setValue(i, 2, i + 1);
    }
    
    // 应用自定义单元格类型到整个工作表
    sheet.getRange(0, 0, sheet.getRowCount(), sheet.getColumnCount())
         .cellType(new ShowValueCellType());
    
    // 第 8 行设置公式但不设置值，用于演示空值显示效果
    sheet.setFormula(7, 2, "=A8+B8");

    sheet.resumePaint();
}
```

## 七、总结

本示例展示了 SpreadJS 自定义单元格类型的强大能力，通过简单的继承和方法重写即可实现对单元格渲染行为的完全控制。开发者可以从中学到：

- **自定义单元格类型的基本方法**：继承现有类型并重写关键方法
- **paint 方法的工作原理**：理解单元格渲染的底层机制
- **原型链继承的应用**：JavaScript 面向对象编程的实践
- **灵活的单元格类型应用方式**：可以应用到不同范围的单元格

该方案适用于需要统一处理空值显示、特殊值标记、自定义数据格式化等场景，具有良好的扩展性和实用价值。通过类似的思路，开发者还可以实现更复杂的自定义单元格类型，如图标单元格、进度条单元格、自定义编辑器等。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/21yW9DBTK0Cavit_lEQsVQ/)）
