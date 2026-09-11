## 一、Demo 概述

本示例展示了如何在 SpreadJS 中为文本类数字字符串（如 "123"）添加可视化角标提示，并提供交互式菜单将其转换为真正的数字类型。当单元格中的值是纯数字字符串时，会在单元格左上角显示绿色三角形角标，点击后弹出操作菜单，用户可以选择将其转换为数字类型。 

该功能模拟了 Excel 中对文本格式数字的警告提示机制，帮助用户识别和处理数据类型不一致的问题。

## 二、解决的问题

* **数据类型识别**：在数据导入或手动输入时，数字可能被误存储为文本类型，导致计算错误或排序异常
* **可视化提示**：通过角标标记让用户快速识别哪些单元格存在数据类型问题
* **快速修正**：提供便捷的交互式菜单，一键将文本类数字转换为真正的数字类型

## 三、实现思路

### 3.1 自定义单元格类型

通过继承 `GC.Spread.Sheets.CellTypes.Text` 创建自定义单元格类型 `TipCellType`，重写关键方法实现角标绘制和交互逻辑：

```javascript
function TipCellType() {}
TipCellType.prototype = new GC.Spread.Sheets.CellTypes.Text();
```

### 3.2 角标绘制逻辑

重写 `paint` 方法，检测单元格值是否为纯数字字符串，如果是则添加左上角绿色三角形装饰：

```javascript
TipCellType.prototype.paint = function (ctx, value, x, y, w, h, style, context) {
    if (typeof (value) == "string" && /^[0-9]+\.?[0-9]*$/.test(value)) {
        style.decoration = {
            cornerFold: {
                size: 8,
                position: GC.Spread.Sheets.CornerPosition.leftTop,
                color: "green"
            }
        }
    }
    GC.Spread.Sheets.CellTypes.Base.prototype.paint.apply(this, [ctx, value, x, y, w, h, style, context]);
}
```

关键点：

* 使用正则表达式 `/^[0-9]+\.?[0-9]*$/` 匹配纯数字字符串（支持小数）
* 通过 `style.decoration.cornerFold` 配置角标样式（大小、位置、颜色）

### 3.3 交互式菜单实现

重写 `processMouseDown` 方法，在点击带角标的单元格时动态创建提示图标和操作菜单：

```javascript
TipCellType.prototype.processMouseDown = function (hitinfo) {
    const { x, y, value, sheet, row, col } = hitinfo
    if (typeof (value) == "string" && /^[0-9]+\.?[0-9]*$/.test(value)) {
        if (!this._imgElement && !this._menuElement) {
            // 创建警告图标
            let imgElement = document.createElement("div")
            imgElement.id = 'imgContainer'
            imgElement.innerHTML = "<svg>...</svg>" // 警告图标 SVG
            
            // 创建操作菜单
            let menuElement = document.createElement("div")
            menuElement.id = 'menuList'
            menuElement.innerHTML = "<ul><li id='changeNum'>转换为数字</li></ul>"
            
            // 定位元素
            imgElement.style.top = y + "px"
            imgElement.style.left = (x - 20) + "px"
            menuElement.style.top = (y + 20) + "px"
            menuElement.style.left = (x - 100) + "px"
            
            // 绑定点击事件
            imgElement.addEventListener("click", function () {
                menuElement.style.display = "block"
            })
            
            document.getElementById("changeNum").addEventListener("click", function () {
                sheet.setValue(row, col, parseInt(hitinfo.value))
                imgElement.style.display = "none"
                menuElement.style.display = "none"
            })
        }
    }
}
```

### 3.4 位置计算

通过 `getHitInfo` 方法获取单元格的绝对坐标，确保浮动元素准确定位：

```javascript
TipCellType.prototype.getHitInfo = function (x, y, cellStyle, cellRect, context) {
    let cellRect = context.sheet.getCellRect(context.row, context.col);
    return {
        x: cellRect.x + containerPosition.left,
        y: cellRect.y + containerPosition.top,
        row: context.row,
        col: context.col,
        value: context.sheet.getValue(context.row, context.col)
    };
}
```

### 3.5 技术栈

* SpreadJS 16.0.1：核心表格控件
* SystemJS：模块加载器
* TypeScript 4.1.2：开发语言（编译为 JavaScript）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，表格中已预设两个文本类数字字符串（"123"）在单元格 D4 和 F6
2. 观察这些单元格左上角的绿色三角形角标
3. 点击带角标的单元格，会在单元格左上方显示警告图标
4. 点击警告图标，弹出"转换为数字"菜单
5. 点击菜单项，单元格值将转换为数字类型，角标和菜单消失

## 五、功能特点

### 5.1 优点

* **类 Excel 体验**：模拟 Excel 的数据类型警告机制，降低用户学习成本
* **可扩展性强**：自定义单元格类型可以轻松添加更多数据验证和转换功能
* **视觉反馈清晰**：绿色角标和 SVG 图标提供直观的视觉提示

### 5.2 局限性与扩展建议

* **元素复用机制**：当前实现中，图标和菜单元素在首次创建后会被复用，但事件监听器可能重复绑定（代码中使用 `AbortController` 尝试解决，但实现不完整）
* **建议改进**：
    * 使用事件委托或在复用时先移除旧监听器
    * 考虑将浮动元素封装为独立组件
    * 支持批量转换多个单元格

## 六、关键代码片段

### 正则表达式匹配

```javascript
/^[0-9]+\.?[0-9]*$/.test(value)
```

该正则表达式匹配纯数字字符串，支持整数和小数（如 "123"、"45.67"）。

### 数据类型转换

```javascript
sheet.setValue(row, col, parseInt(hitinfo.value))
```

使用 `parseInt` 将字符串转换为整数后重新设置单元格值，转换后角标自动消失（因为值不再是字符串类型）。

## 七、总结

本示例展示了 SpreadJS 自定义单元格类型的强大能力，通过重写 `paint` 和 `processMouseDown` 方法实现了复杂的视觉提示和交互逻辑。开发者可以从中学到：

* 如何继承和扩展 SpreadJS 内置单元格类型
* 使用 `style.decoration.cornerFold` 添加单元格角标
* 结合 DOM 操作实现自定义交互界面
* 动态计算单元格绝对坐标进行元素定位

该方案适用于需要对特定数据格式进行可视化标记和快速修正的场景，如数据导入验证、数据清洗工具等。通过扩展菜单选项，还可以支持更多数据转换功能（如日期格式化、货币转换等）。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
