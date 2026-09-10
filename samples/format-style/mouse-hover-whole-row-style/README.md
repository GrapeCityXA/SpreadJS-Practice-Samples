## 一、Demo 概述

本示例展示了如何在 SpreadJS 表格中实现鼠标悬浮时整行和整列的高亮效果。当用户将鼠标移动到表格的某个单元格上时，该单元格所在的行和列会自动显示半透明的背景色，从而帮助用户更清晰地定位和查看数据。这种交互效果在处理大型数据表格时特别有用，能够显著提升用户体验和数据可读性。

## 二、解决的问题

在处理包含大量行列的电子表格时，用户常常难以快速定位当前单元格所在的行列位置，尤其是在没有网格线或数据密集的情况下。本示例通过实现鼠标悬浮高亮功能，解决了以下问题：

* 提升数据定位效率：用户可以快速识别当前关注的行列
* 改善视觉体验：通过视觉反馈减少用户在大型表格中的视觉疲劳
* 增强数据关联性：帮助用户理解同一行或同一列中的数据关系

## 三、实现思路

### 3.1 核心技术点

#### 使用条件格式的行列状态规则

SpreadJS 提供了 `addRowStateRule` 和 `addColumnStateRule` 方法，可以根据行列的状态（如 hover）自动应用样式。这是实现悬浮高亮的核心技术。

```javascript
function initHoverStateSheet(spread) {
    const sheet = spread.getSheet(0);
    sheet.name('hover')
    const cfs = sheet.conditionalFormats
    const style = new GC.Spread.Sheets.Style()
    style.backColor = "rgba(200,100,100,0.1)"
    const rowRange = new GC.Spread.Sheets.Range(0, 0, 200, 20)
    sheet.suspendPaint()
    cfs.addRowStateRule(GC.Spread.Sheets.RowColumnStates.hover, style, [rowRange])
    cfs.addColumnStateRule(GC.Spread.Sheets.RowColumnStates.hover, style, [rowRange])
    sheet.resumePaint()
}
```

#### 性能优化：暂停和恢复绘制

在批量设置条件格式规则时，使用 `suspendPaint()` 和 `resumePaint()` 可以避免多次重绘，提升性能。

```javascript
sheet.suspendPaint()
// 批量设置规则
cfs.addRowStateRule(...)
cfs.addColumnStateRule(...)
sheet.resumePaint()
```

#### 定义高亮样式

通过创建 `Style` 对象并设置半透明背景色，实现柔和的高亮效果，不会遮挡原有数据。

```javascript
const style = new GC.Spread.Sheets.Style()
style.backColor = "rgba(200,100,100,0.1)"
```

### 3.2 技术栈

* SpreadJS 15.0.0：核心表格控件库
* SystemJS 0.19.22：模块加载器
* TypeScript 4.1.2：类型支持

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行示例。

### 4.2 操作步骤

1. 打开示例页面，会看到一个包含产品数据的表格
2. 将鼠标移动到表格的任意单元格上
3. 观察该单元格所在的整行和整列会显示淡红色半透明背景
4. 移动鼠标到不同单元格，高亮效果会实时跟随

## 五、功能特点

### 5.1 优点

* 实现简单：仅需几行代码即可实现行列高亮效果
* 性能优异：基于 SpreadJS 内置的条件格式机制，无需手动监听鼠标事件
* 视觉友好：使用半透明背景色，不影响原有数据的显示
* 可定制性强：可以轻松修改高亮颜色、透明度和应用范围

### 5.2 局限性与扩展建议

* 当前高亮范围固定为 200 行 × 20 列，如果表格数据超出此范围，需要调整 `Range` 参数
* 可以扩展为支持多种高亮模式（仅行、仅列、行列交叉）
* 可以添加配置选项，允许用户动态切换高亮颜色和透明度

## 六、关键代码片段

### 初始化悬浮高亮功能

```javascript
function initHoverStateSheet(spread) {
    const sheet = spread.getSheet(0);
    sheet.name('hover')
    const cfs = sheet.conditionalFormats
    const style = new GC.Spread.Sheets.Style()
    style.backColor = "rgba(200,100,100,0.1)"
    const rowRange = new GC.Spread.Sheets.Range(0, 0, 200, 20)
    sheet.suspendPaint()
    cfs.addRowStateRule(GC.Spread.Sheets.RowColumnStates.hover, style, [rowRange])
    cfs.addColumnStateRule(GC.Spread.Sheets.RowColumnStates.hover, style, [rowRange])
    sheet.resumePaint()
}
```

### 应用到工作簿

```javascript
import data from "./template.js"
spread.fromJSON(JSON.parse(data.json))
initHoverStateSheet(spread)
```

## 七、总结

本示例展示了如何利用 SpreadJS 的条件格式和行列状态规则实现鼠标悬浮高亮功能。开发者可以从中学到：

* 如何使用 `addRowStateRule` 和 `addColumnStateRule` 实现状态驱动的样式
* 如何通过 `suspendPaint` 和 `resumePaint` 优化批量操作性能
* 如何使用半透明颜色创建友好的视觉反馈效果

该方案适用于需要增强数据可读性的表格应用场景，特别是在数据密集型的报表和数据分析工具中。通过简单的配置即可显著提升用户体验，具有很高的实用价值和扩展性。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
