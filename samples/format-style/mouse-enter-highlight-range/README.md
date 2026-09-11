## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现鼠标悬停高亮功能。当鼠标进入指定区域（A1:J10）时，该区域会自动高亮显示；当鼠标离开时，恢复默认样式。这种交互效果常用于数据表格中，帮助用户快速识别当前关注的数据区域，提升用户体验。

## 二、解决的问题

* **视觉反馈增强**：通过鼠标悬停高亮，为用户提供即时的视觉反馈，明确当前操作区域
* **数据区域识别**：在复杂的表格中，帮助用户快速定位和识别特定的数据区域
* **交互体验优化**：提供类似 Web 应用中常见的 hover 效果，使表格操作更加直观友好

## 三、实现思路

### 3.1 自定义单元格类型

通过继承 SpreadJS 的 `Text` 单元格类型，创建自定义单元格类型来实现鼠标事件监听：

```javascript
function customCellType() { }
// 继承Text类型
customCellType.prototype = new GC.Spread.Sheets.CellTypes.Text()
```

这种方式允许我们在保留原有文本单元格功能的基础上，扩展鼠标交互行为。

### 3.2 鼠标进入事件处理

重写 `processMouseEnter` 方法来监听鼠标进入事件，并根据鼠标位置判断是否进入特定区域：

```javascript
customCellType.prototype.processMouseEnter = function (hitinfo) {
    let enter = specialRange.intersect(hitinfo.row, hitinfo.col, 1, 1)
    if(hasEnter == enter) {
        return
    }
    hasEnter = enter
    let cellRange = hitinfo.sheet.getRange(specialRange.row, specialRange.col, specialRange.rowCount, specialRange.colCount)
    if(enter) {
        cellRange.setStyle(specialStyle)
    } else {
        cellRange.setStyle(defaultStyle)
    }
}
```

核心逻辑：

* 使用 `specialRange.intersect()` 判断鼠标是否进入目标区域
* 通过 `hasEnter` 标志位避免重复设置样式
* 根据进入/离开状态切换样式

### 3.3 命中测试信息获取

重写 `getHitInfo` 方法，返回当前鼠标所在单元格的行列信息：

```javascript
customCellType.prototype.getHitInfo = function (x, y, cellStyle, cellRect, context) {
    return {
        row: context.row,
        col: context.col
    }
}
```

### 3.4 样式配置

定义默认样式和高亮样式，并应用自定义单元格类型：

```javascript
let specialRange = new GC.Spread.Sheets.Range(0, 0, 10, 10)
let hasEnter = false

let border = new GC.Spread.Sheets.LineBorder("#dddddd", GC.Spread.Sheets.LineStyle.thin);

// 默认样式
let defaultStyle = sheet.getDefaultStyle()
defaultStyle.cellType = new customCellType()
defaultStyle.borderTop = border
defaultStyle.borderRight = border
defaultStyle.borderBottom = border
defaultStyle.borderLeft = border
sheet.setDefaultStyle(defaultStyle)

// 高亮样式
let specialStyle = new GC.Spread.Sheets.Style()
specialStyle.cellType = new customCellType()
specialStyle.backColor = "#ecf5ff"
specialStyle.borderTop = border
specialStyle.borderRight = border
specialStyle.borderBottom = border
specialStyle.borderLeft = border
```

### 3.5 技术栈

* SpreadJS 17.0.8：核心表格组件
* SystemJS 0.19.22：模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，会看到一个空白的 SpreadJS 表格
2. 将鼠标移动到 A1:J10 区域内的任意单元格
3. 观察整个 A1:J10 区域会立即高亮显示（浅蓝色背景）
4. 将鼠标移出该区域，高亮效果消失，恢复默认样式

## 五、功能特点

### 5.1 优点

* **性能优化**：通过 `hasEnter` 标志位避免重复渲染，减少不必要的样式更新
* **扩展性强**：基于自定义单元格类型实现，可以轻松扩展到其他交互效果
* **用户体验好**：提供即时的视觉反馈，增强表格的交互性

### 5.2 局限性与扩展建议

* **固定区域**：当前实现中高亮区域是硬编码的 A1:J10，可以扩展为动态配置
* **单一区域**：只支持一个高亮区域，可以扩展为支持多个区域
* **样式单一**：高亮样式固定，可以扩展为支持自定义样式配置

扩展建议：

* 支持通过参数配置高亮区域范围
* 支持多个区域的独立高亮效果
* 添加高亮动画效果，使过渡更加平滑
* 支持自定义高亮样式（颜色、边框等）

## 六、总结

本示例展示了如何通过自定义单元格类型实现鼠标悬停高亮效果。开发者可以从中学到：

* 如何继承和扩展 SpreadJS 的内置单元格类型
* 如何处理单元格的鼠标事件（`processMouseEnter`）
* 如何使用 Range 对象进行区域判断和样式设置
* 如何通过标志位优化性能，避免重复渲染

该方案适用于需要增强表格交互体验的场景，特别是在数据密集型应用中，可以帮助用户更好地聚焦当前操作区域。通过简单的扩展，可以实现更复杂的交互效果，如行列高亮、多区域联动等。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
