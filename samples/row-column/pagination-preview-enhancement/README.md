## 一、Demo 概述

本示例演示了如何在 SpreadJS 中基于分页信息绘制自定义分页预览线。SpreadJS 内置的打印分页线仅以细虚线标识分页位置，在数据量大、行列宽高不统一的表格中不易辨识。该示例通过 `spread.pageInfo()` 获取每一页的布局范围，再借助线型形状（Connector Shape）在每页的上下左右四条边界上绘制宽度为 2 的黑色实线，从而让分页边界清晰可见。

典型应用场景是打印前的排版预览：用户在导出 PDF 或打印之前，需要直观判断当前内容会被分割成几页、每页容纳哪些行列，以便调整纸张大小、页边距或行列宽高。

## 二、解决的问题

- **内置分页线辨识度低**：SpreadJS 原生的分页虚线颜色浅、线宽细，在密集数据区域或彩色表头背景下几乎不可见，用户难以快速定位分页位置。
- **无法直观表达"单页范围"**：原生分页线只标识分隔位置，不勾勒出每页的矩形区域。对于需要按页做版面校验的场景（例如确认某张表是否被从中间截断），用四条边框组成矩形比单根分页线更符合阅读直觉。
- **样式不可定制**：原生分页线的颜色与线型由主题固定，无法根据业务需要调整为更醒目的实线、指定颜色或指定线宽。

## 三、实现思路

### 3.1 核心技术点

#### 技术点 1：调用 `spread.pageInfo()` 获取分页布局

分页信息由 `pageInfo` 方法提供，需要传入工作表索引。返回值中的 `pages` 数组描述了每一页覆盖的行列范围。

```javascript
// 获取当前工作表的索引
const sheetIndex = getSheetIndex(spread, sheet);

// 获取分页信息
const pageInfos = spread.pageInfo(sheetIndex);

if (!pageInfos || !pageInfos.pages || pageInfos.pages.length === 0) {
  console.log("没有分页信息");
  return;
}
```

`pages` 中每一项包含 `row`、`rowCount`、`column`、`columnCount` 四个字段，分别表示该页起始行索引、跨越的行数、起始列索引与跨越的列数。例如 `{ row: 0, rowCount: 25, column: 0, columnCount: 8 }` 表示第一页覆盖第 0 至 24 行、第 0 至 7 列。

由于分页信息是针对具体工作表的，示例提供了一个辅助函数通过引用比对反查工作表索引：

```javascript
function getSheetIndex(spread, sheet) {
  for (let i = 0; i < spread.getSheetCount(); i++) {
    if (spread.getSheet(i) === sheet) {
      return i;
    }
  }
  return 0;
}
```

#### 技术点 2：将行列索引换算为像素坐标

`pageInfo` 给出的是行列索引，而绘制形状需要的是以工作表左上角为原点的像素坐标，因此需要累加行高与列宽完成换算。

```javascript
// 计算当前页的边界位置
let pageTop = 0;
for (let r = 0; r < row; r++) {
  pageTop += sheet.getRowHeight(r);
}

let pageLeft = 0;
for (let c = 0; c < column; c++) {
  pageLeft += sheet.getColumnWidth(c);
}

let pageBottom = pageTop;
for (let r = row; r < row + rowCount; r++) {
  pageBottom += sheet.getRowHeight(r);
}

let pageRight = pageLeft;
for (let c = column; c < column + columnCount; c++) {
  pageRight += sheet.getColumnWidth(c);
}
```

这里的换算必须使用 `getRowHeight` / `getColumnWidth` 逐行逐列累加，而不能简单用"行数 × 默认行高"估算，因为示例中第 0 列被显式设置为 90 像素宽，用户也可能在运行时调整任意行列尺寸。

#### 技术点 3：使用线型形状绘制分页边框

每页需要四条线，通过 `sheet.shapes.addConnector()` 创建直线型连接符。该方法的参数依次为形状名称、连接符类型、起点 X/Y 与终点 X/Y。

```javascript
// 顶部边框线
const topLine = sheet.shapes.addConnector(
  `pageBorder_top_${i}`,
  GC.Spread.Sheets.Shapes.ConnectorType.straight,
  pageLeft,
  pageTop,
  pageRight,
  pageTop,
);
const topLineStyle = topLine.style();
topLineStyle.line.color = "#000000";
topLineStyle.line.width = 2;
topLineStyle.line.lineStyle =
  GC.Spread.Sheets.Shapes.PresetLineDashStyle.solid;
topLine.style(topLineStyle);
```

样式设置遵循"取出样式对象 → 修改属性 → 整体回写"的模式。注意必须调用 `topLine.style(topLineStyle)` 将修改后的样式写回形状，仅修改 `topLineStyle` 对象本身不会生效。四条线使用相同的样式配置，仅在起止坐标上区分：横线固定 Y 值而变化 X 值，竖线固定 X 值而变化 Y 值。

#### 技术点 4：用 Set 去重相邻页的共享边

相邻两页共用同一条边界线（前一页的底边即后一页的顶边），若不加处理会导致同一位置被重复绘制。示例使用一个 `Set` 记录已绘制线条的位置特征作为去重键：

```javascript
// 用于记录已经添加过的线条位置，避免重复添加
// key格式: 横线用 "h_y_x1_x2"，竖线用 "v_x_y1_y2"
const addedLines = new Set();

// 顶部边框线
const topLineKey = `h_${pageTop}_${pageLeft}_${pageRight}`;
if (!addedLines.has(topLineKey)) {
  // ... 创建线条并设置样式
  addedLines.add(topLineKey);
}
```

横线以 `h_纵坐标_起点X_终点X` 为键，竖线以 `v_横坐标_起点Y_终点Y` 为键。这一设计不仅消除了页与页之间的重复线，也使分页线在视觉上更紧凑、不出现因重叠导致的线宽加深。

### 3.2 UI 交互流程

本示例为静态演示，不包含用户交互控件，页面加载后即完成分页线绘制：

打开 `index.html` → SystemJS 加载 `src/app.js` → 填充 40 行 × 12 列数据并设置 A4 纸张与手动分页符 → 调用 `addPageBreakLines` → 控制台输出总页数、每页范围与耗时 → 表格上显示各页的矩形边框线

### 3.3 技术栈

| 依赖 | 版本 | 作用 |
|------|------|------|
| `@grapecity-software/spread-sheets` | 19.0.3 | 核心表格控件 |
| `@grapecity-software/spread-sheets-shapes` | 19.0.3 | 提供形状与连接符绘制能力（分页线的载体） |
| `@grapecity-software/spread-sheets-print` | 19.0.3 | 提供打印与分页相关能力 |
| `@grapecity-software/spread-sheets-tablesheet` | 19.0.3 | 表格工作表扩展 |
| `systemjs` | ^0.19.22 | 浏览器端模块加载器 |
| `typescript` | ^4.1.2 | SystemJS 的浏览器内转译器 |

SpreadJS 及其扩展模块通过 `systemjs.config.js` 中的 `map` 配置指向 CDN（`cdn.grapecity.com.cn`），本地无需安装 SpreadJS 包。

## 四、使用说明

### 4.1 运行方式

```bash
# 安装模块加载与转译依赖
npm install

# 启动任意静态服务器（示例，使用 npx serve）
npx serve .
```

由于示例通过 `System.import` 加载 ES 模块，必须经由 HTTP 服务访问，直接用浏览器打开 `index.html`（`file://` 协议）会因跨域限制导致模块加载失败。启动后访问 `index.html` 所在地址即可。

### 4.2 操作步骤

1. 打开页面，表格将显示 40 行 × 12 列的示例数据，其中第 0 列宽度为 90 像素。
2. 观察表格上覆盖的黑色矩形边框线，每个矩形代表一页的范围。
3. 打开浏览器开发者工具的 Console 面板，可以看到如下输出，用于核验分页结果：
   - `总页数: N`
   - `第 i 页: 行=…, 列=…, 行数=…, 列数=…`
   - `添加分页线耗时: … ms`
4. 修改 `src/app.js` 中的 `sheet.setRowPageBreak(25, true)` 与 `sheet.setColumnPageBreak(8, true)` 参数，或调整 `ROW_COUNT` / `COL_COUNT`，刷新页面即可观察分页线的变化。
5. 若需验证纸张对分页的影响，可调整 `printInfo.paperSize(new GC.Spread.Sheets.Print.PaperSize(11906, 16838))` 中的宽高值（单位为 twips，1/20 磅），A4 对应 11906 × 16838。

## 五、功能特点

### 5.1 优点

- **分页边界一目了然**：用四条黑色实线构成闭合矩形，比原生虚线更能直观表达"这一页包含哪些内容"。
- **样式完全可控**：颜色、线宽、线型均在代码中显式指定，可根据业务主题自由调整，不受内置主题约束。
- **避免重复绘制**：通过位置去重键消除相邻页共享边产生的重复线条，绘制结果干净且减少不必要的形状数量。
- **关注点分离**：分页线绘制逻辑独立封装在 `src/page-break-lines.js` 中，以纯函数形式导出，与业务数据准备代码解耦，便于在其他示例或项目中复用。
- **绘制性能可观测**：使用 `performance.now()` 统计绘制耗时并输出到控制台，便于在数据量增大时评估性能开销。

### 5.2 局限性与扩展建议

当前实现存在以下限制：

- **仅静态绘制一次**：分页线在初始化时绘制后不会自动更新。当用户调整行列宽高、插入删除行列、修改纸张设置或缩放页面后，分页信息随之改变，但已有线条不会重绘。
- **缺少清理机制**：重复调用 `addPageBreakLines` 会以相同名称创建形状，需先删除上一次绘制的形状。
- **坐标换算未考虑隐藏行列与冻结窗格**：`getRowHeight` / `getColumnWidth` 对隐藏行列会返回 0，累加结果在隐藏行列场景下可能与实际渲染位置存在偏差。
- **绘制成本随规模增长**：每页的内层循环需累加该页所有行列的尺寸，多页大表场景下为嵌套遍历。
- **样式硬编码**：颜色 `#000000` 与线宽 `2` 直接写在函数内部，未提供配置入口。

可考虑的改进方向：

1. 将函数签名扩展为 `addPageBreakLines(spread, sheet, options)`，支持传入颜色、线宽、线型（虚线/点线）等配置。
2. 增加 `clearPageBreakLines(sheet)` 方法，按名称前缀遍历并删除已绘制形状，配合工作表变更事件实现自动重绘。
3. 监听 `RowHeightChanged`、`ColumnWidthChanged`、`RangeChanged` 等事件并做防抖处理，实现分页线的实时同步。
4. 用不同颜色区分水平分页线与垂直分页线，或为首页/末页使用差异化样式，进一步强化信息层次。
5. 导出 PDF 或打印前调用清理函数移除这些辅助形状，避免其被一并渲染进输出文件。

## 六、关键代码片段

以下是 `src/app.js` 的完整主流程，展示了数据准备、分页条件设置与分页线绘制的调用顺序：

```javascript
import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-sheets-shapes";
import "@grapecity-software/spread-sheets-print";
import { addPageBreakLines } from "./page-break-lines.js";

let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
// 批量挂起重绘，避免逐条数据写入时反复触发渲染
spread.suspendPaint();

const sheet = spread.getActiveSheet();
// 填充足够多的数据，配合纸张大小与手动分页符，让表格分成多页
const ROW_COUNT = 40;
const COL_COUNT = 12;
for (let r = 0; r < ROW_COUNT; r++) {
  for (let c = 0; c < COL_COUNT; c++) {
    sheet.setValue(r, c, `第${r + 1}行 第${c + 1}列`);
  }
}
sheet.setColumnWidth(0, 90);

// 设置打印纸张为 A4（单位 twips），并设置手动分页符，保证产生多页
const printInfo = sheet.printInfo();
printInfo.paperSize(new GC.Spread.Sheets.Print.PaperSize(11906, 16838));
sheet.setRowPageBreak(25, true);
sheet.setColumnPageBreak(8, true);

// 根据分页信息在分页位置绘制分页线
addPageBreakLines(spread, sheet);

spread.resumePaint();
```

需要注意的是，`addPageBreakLines` 内部同样调用了 `spread.suspendPaint()` 与 `spread.resumePaint()`。SpreadJS 的挂起/恢复是成对且可嵌套的，因此外层主流程的挂起不会被内层提前解除，形状创建的渲染开销被合并到最外层 `resumePaint` 时统一处理。

## 七、总结

本示例围绕"分页可视化"这一具体需求，串联了 SpreadJS 中分页计算与形状绘制两条能力线，学习价值主要体现在：

1. **分页信息的读取方式**：理解 `spread.pageInfo(sheetIndex)` 返回的数据结构，掌握从页对象中提取行列范围的方法，这是所有分页相关定制功能的起点。
2. **索引与像素坐标的双向换算**：掌握通过累加 `getRowHeight` / `getColumnWidth` 将行列索引转换为画布坐标的通用手法，该手法同样适用于自定义浮动元素、覆盖层、批注定位等场景。
3. **形状 API 的使用范式**：熟悉 `sheet.shapes.addConnector()` 的参数含义，以及"读取样式 → 修改 → 回写"的样式设置模式。
4. **绘制去重的工程思路**：用位置特征作为去重键是处理重叠几何元素的通用技巧，可迁移到单元格边框合并、区间渲染等场景。
5. **批量渲染的性能处理**：`suspendPaint` / `resumePaint` 与 `performance.now()` 计时配合，是评估和优化 SpreadJS 重绘开销的标准做法。

该方案适用于需要在表格上叠加"版面参考线"的场景，例如打印排版预览、报表分页校验、按页数据切分核对。其结构简单、无外部依赖，将绘制函数稍作配置化改造并接入事件驱动的重绘机制后，即可作为生产环境中的分页预览增强模块使用。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
