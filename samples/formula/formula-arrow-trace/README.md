## 一、Demo 概述

本示例在 SpreadJS Designer 中实现类似 Excel 的"公式追踪"功能。用户选中任意公式单元格后，可通过功能区新增的"公式追踪"按钮组，以**带箭头的连接线**和**单元格底色高亮**直观展示该公式的引用单元格（前导单元格）与从属单元格（引用它的单元格）；当依赖关系跨越工作表时，则以**标记框 + 虚线**示意，点击标记即可跳转到对应工作表的被引用单元格。

示例内置了两张相互关联的演示数据表（订单表与跨表结算表），覆盖同表追踪、多层展开、跨表跳转等典型场景，完整演示了 SpreadJS 依赖追踪 API 与形状（Shape）绘制能力在公式审计场景下的集成方式。

## 二、解决的问题

- **公式可读性差**：当公式嵌套层级深、引用范围分散时，仅靠阅读公式难以理解单元格间的数据流向，本示例将依赖关系以箭头可视化呈现。
- **缺少现成的公式审计交互**：SpreadJS 提供了 `getPrecedents` / `getDependents` 依赖查询 API，但本身不提供绘制与交互 UI，本示例通过 Designer 命令扩展补全了这一能力。
- **跨表依赖难以定位**：公式引用其他工作表的单元格时，用户无法快速找到目标位置，本示例用跨表标记与点击跳转解决。
- **追踪痕迹污染文件**：箭头、高亮属于临时审计信息，直接导出会让成品文件残留追踪图形，本示例通过"干净导出管线"在保存/导出时自动清除。

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 扩展 Designer 功能区命令

示例基于 `Designer.DefaultConfig` 的深拷贝，将三个自定义命令注册进 `commandMap`，并在"公式"选项卡末尾追加"公式追踪"按钮组。命令对象通过 `traceEngine` 的惰性引用触发执行，避免模块间的循环依赖：

```javascript
const precedentsCommand = {
  title: "追踪引用单元格",
  commandName: "formulaTracePrecedents",
  execute: function () {
    if (traceEngine) traceEngine.tracePrecedents();
  },
};

designerConfig.commandMap["formulaTracePrecedents"] = precedentsCommand;
// ... dependents / removeArrows 同理

const formulasTab = designerConfig.ribbon.find(function (tab) {
  return /^formulas?$/i.test(String(tab.id || ""));
});
formulasTab.buttonGroups.push({
  label: "公式追踪",
  commandGroup: {
    children: [
      { commands: ["formulaTracePrecedents", "formulaTraceDependents", "formulaTraceRemoveArrows"] },
    ],
  },
});

const designer = new Designer.Designer("gc-designer-container", designerConfig);
```

#### 3.1.2 基于依赖查询 API 的多层展开追踪

核心是调用 `sheet.getPrecedents(row, col)` 或 `sheet.getDependents(row, col)` 获得引用信息数组，每个引用包含 `sheetName / row / col / rowCount / colCount`。引擎为每次追踪维护"访问集合 + 前沿集合"，重复点击同一按钮即可逐层向外展开依赖关系（BFS 广度优先），同时用关系键去重，避免同一条箭头被重复绘制：

```javascript
function traceNextLevel(direction) {
  const rootKey = getCellKey(sheet.name(), row, col);
  const stateKey = direction + "|" + rootKey;
  let traceState = traceStates.get(stateKey) || {
    frontier: [{ sheetName: sheet.name(), row, col }],
    visited: new Set(),
  };
  // 遍历 frontier，对每个公式单元格执行 traceReferences
  traceState.frontier.forEach(function (cell) {
    // direction === "precedents" 时取 getPrecedents，否则 getDependents
    const references = isPrecedents
      ? sheet.getPrecedents(row, col) || []
      : sheet.getDependents(row, col) || [];
    references.forEach(...); // 记录关系、绘制图形，并收集下一层单元格
  });
}
```

考虑到整行/整列等超大范围引用可能带来海量单元格，代码对超过 2000 个单元格的引用做了特殊处理——只取锚点单元格绘制，避免卡顿：

```javascript
if (rowCount * colCount > 2000) {
  const anchor = getTraceAnchor(reference); // 大范围只取左上角锚点
  return [{ sheetName, row: anchor.row, col: anchor.col }];
}
```

#### 3.1.3 箭头连接线与范围高亮

同表依赖使用直线连接器（`ConnectorType.straight`）绘制，起点/终点通过行列号加像素偏移定位到单元格中心；前导追踪用蓝色（`#4472C4`），从属追踪用绿色（`#70AD47`），并设置箭头样式。被引用范围则临时修改 `backColor` 进行高亮：

```javascript
const connector = sheet.shapes.addConnector(
  name, Shapes.ConnectorType.straight, 0, 0, 0, 0,
);
connector.startRow(start.row);
connector.startColumn(start.col);
connector.startRowOffset(sheet.getRowHeight(start.row) / 2); // 垂直居中
connector.startColumnOffset(sheet.getColumnWidth(start.col) / 2); // 水平居中

const style = connector.style();
style.line.color = "#4472C4";
style.line.width = 2;
style.line.endArrowheadStyle = Shapes.ArrowheadStyle.triangle; // 终点实心三角箭头
connector.style(style);

// 被引用单元格逐个高亮，同时记录原始底色以便还原
highlightedCells.set(key, { cell, backColor: cell.backColor() });
cell.backColor("#FFF2CC");
```

所有追踪图形统一以 `formulaTrace_` 前缀命名，并调用 `configureTraceArtifact` 关闭移动、缩放、旋转与选中，确保其不可被用户误编辑：

```javascript
function configureTraceArtifact(shape) {
  shape.allowMove(false);
  shape.allowResize(false);
  shape.allowRotate(false);
  shape.canPrint(false);
  shape.showHandle(false);
  shape.isSelected(false);
}
```

#### 3.1.4 跨表依赖的标记与跳转

当引用对象的 `sheetName` 与当前工作表不同时，引擎不再跨表画箭头，而是在当前 sheet 靠近公式单元格处放置一个矩形标记框，其文本为"`目标表!单元格`"（如 `Sheet1!D2`），并用虚线连接器指向该标记。同时把标记名与目标位置登记到 `crossSheetTargets`：

```javascript
const marker = sheet.shapes.add(
  markerName, Shapes.AutoShapeType.rectangle, 0, 0, w, h,
);
marker.text(getCrossSheetLabel(reference)); // 例如 "Sheet1!D2"
marker.alt("跳转到 " + getCrossSheetLabel(reference));
// ...

crossSheetTargets.set(markerName, {
  sheetName: reference.sheetName,
  row: reference.row, col: reference.col,
});
```

引擎通过 `bindSheet` 为每个 sheet 绑定 `ShapeSelectionChanged` 事件：用户点击标记框时自动切换到目标工作表，选中并居中显示被引用单元格：

```javascript
sheet.bind(Events.ShapeSelectionChanged, function (event, args) {
  if (!args || !args.shape || !args.shape.isSelected()) return;
  const target = crossSheetTargets.get(args.shape.name());
  if (!target) return;
  args.shape.isSelected(false);          // 取消标记的选中态
  navigateToCrossSheetTarget(target);    // setActiveSheet + setActiveCell + showCell
});
```

为了兼容运行中动态新增的工作表，`app.js` 除对现有 sheet 逐一 `bindSheet` 外，还监听了 `ActiveSheetChanged` 与 `SheetChanged` 事件为新 sheet 补绑事件。

#### 3.1.5 干净的导出管线

追踪箭头、标记与高亮都属于过程性 UI，不应随文件保存/导出。`clean-export.js` 通过**包装工作簿序列化与导出方法**实现自动清理：导出前临时还原高亮底色（序列化完成后再恢复现场）、序列化后递归剔除所有 `formulaTrace_` 前缀的图形节点，必要时还创建一个隐藏的临时工作簿承载干净数据再执行导出：

```javascript
spread.suspendPaint();
try {
  // 先临时还原被高亮单元格的底色，避免把高亮写进文件
  highlightedCells.forEach(function (state) {
    state.cell.backColor(state.backColor == null ? null : state.backColor);
  });
  json = serializeLiveWorkbook(serializationOptions); // 调用原始 toJSON
} finally {
  // 恢复高亮并重绘
  highlightedCells.forEach(function (state) { state.cell.backColor(state.backColor); });
  spread.resumePaint();
}
removeTraceArtifactsFromJson(json); // 递归删除 formulaTrace_* 图形
```

清理函数通过 `isTraceArtifact` 判断节点是否为追踪工件（按 `name` / `shapeName` 是否以 `formulaTrace_` 开头），对数组与对象做递归遍历。该管线同样包装了 `spread.export` 与 `spread.save`，仅对 Excel / SSJSON 类型生效。

### 3.2 UI 交互流程

1. 打开页面，初始定位到"Sheet2（跨表结算表）"并选中 `D7 最终应付` 公式单元格。
2. 点击功能区 **公式 → 公式追踪 → 追踪引用单元格** → 同表单元格 `D5`、`D6` 被绿色高亮并以蓝色箭头指向当前公式单元格，跨表引用 `Sheet1` 相关单元格则以蓝色标记框 + 虚线示意。
3. 再次点击同一按钮 → 继续向前扩展一层，逐级展开多级引用关系。
4. 点击标记框（如 `Sheet1!D2`）→ 自动切换到 Sheet1 并居中选中对应单元格。
5. 选中 Sheet1 中任意公式单元格，点击 **追踪从属单元格** → 以绿色箭头标出所有引用它的单元格。
6. 点击 **删除箭头** → 清除全部箭头、标记与高亮，工作表恢复原状。

### 3.3 技术栈

- **SpreadJS 19.0.3**（CDN 引入）：核心表格引擎、公式引擎与依赖追踪 API
- **SpreadJS Designer 19.0.3**：在线设计器，承载自定义功能区命令与按钮组
- **SpreadJS Shapes**：连接器与图形绘制（`gc.spread.sheets.shapes`）
- **SystemJS + TypeScript**：ES Module 加载与 TS 转译（`systemjs.config.js`）
- **spread-sheets-designer-resources-cn**：设计器中文界面

## 四、使用说明

### 4.1 运行方式

```bash
npm install        # 安装 systemjs、typescript（本地依赖）
npx http-server .  # 在示例根目录启动静态服务
# 浏览器访问 http://localhost:8080/index.html
```

### 4.2 操作步骤

1. 启动服务后打开 `index.html`，页面加载 Designer 及预置的订单表 / 跨表结算表演示数据。
2. 建议先在 Sheet2 的说明文字指引下选中任意公式单元格（页面默认已选中 `D7`），在功能区 **公式** 选项卡最右侧的 **公式追踪** 组中点击按钮测试。
3. 分别验证三种操作：追踪引用单元格（多层点击可逐级展开）、追踪从属单元格、删除箭头。
4. 点击跨表标记框验证跨工作表跳转。
5. 尝试执行保存 / 导出（Excel、SSJSON），检查导出文件中不包含箭头、标记与高亮痕迹。

## 五、功能特点

### 5.1 优点

- **沉浸式集成**：功能以设计器功能区按钮形式呈现，与 Excel 的公式审计体验一致，无需额外浮层。
- **同表/跨表全覆盖**：箭头、高亮、跨表标记 + 跳转一体，依赖关系表达完整清晰。
- **性能与体验兼顾**：超大范围引用自动降级为锚点绘制，去重机制避免重复图形，追踪图形锁定不可误操作。
- **输出干净**：导出/保存管线自动清理追踪痕迹，不影响成品文件质量。

### 5.2 局限性与扩展建议

- **视觉效果简单**：箭头为直线形式，复杂依赖下图形可能重叠遮挡，可考虑分层布局或曲线连接器。
- **追踪状态维护成本高**：当前引擎状态全部保存在闭包 Map 中，若用户在追踪期间大幅编辑数据，可能需要手动"删除箭头"后重新追踪。可扩展监听单元格变更事件自动失效追踪结果。
- **高亮占用单元格样式**：通过 `backColor` 实现的高亮会覆盖原底色，恢复依赖记录表，如遇用户中途手工改色可能存在还原误差，可考虑使用单元格条件格式或浮动覆盖层实现高亮。

## 六、关键代码片段

同表箭头与跨表标记外的第三块核心逻辑是"跨表跳转"，它把设计器交互与追踪引擎串联起来，值得单独摘出：

```javascript
function navigateToCrossSheetTarget(target) {
  spread.setActiveSheet(target.sheetName);          // 切换到目标工作表
  const targetSheet = spread.getActiveSheet();
  if (!targetSheet || targetSheet.name() !== target.sheetName) return;
  targetSheet.setActiveCell(target.row, target.col); // 选中目标单元格
  targetSheet.showCell(                              // 视口居中显示
    target.row,
    target.col,
    GC.Spread.Sheets.VerticalPosition.center,
    GC.Spread.Sheets.HorizontalPosition.center,
  );
}
```

应用入口处对工作表事件的绑定逻辑也体现了"对后续新增 sheet 保持可用"的健壮性设计：

```javascript
for (let i = 0; i < spread.getSheetCount(); i += 1) {
  traceEngine.bindSheet(spread.getSheet(i));         // 现有 sheet 逐个绑定
}
spread.bind(Events.ActiveSheetChanged, function () {
  traceEngine.bindSheet(spread.getActiveSheet());    // 切换/新建 sheet 时补绑
});
```

## 七、总结

该示例演示了如何把 SpreadJS 底层能力组合成一个完整的业务功能：**依赖追踪 API（`getPrecedents`/`getDependents`）负责"算"依赖，形状（Shapes）负责"画"依赖，Designer 命令扩展负责"操作"依赖，导出管线负责"净化"结果**。开发者可从中掌握以下知识点：

1. 如何基于 `Designer.DefaultConfig` 深拷贝定制功能区（注册命令、追加按钮组）；
2. 如何解析 `getPrecedents` / `getDependents` 返回的引用信息（含跨表 `sheetName` 与区域 `rowCount/colCount`）；
3. 如何使用连接器（`addConnector`）的锚点偏移与箭头样式绘制单元格间连线；
4. 如何通过 `ShapeSelectionChanged` 事件实现点击图形驱动的业务跳转；
5. 如何包装工作簿 `toJSON` / `export` / `save`，实现导出前数据清洗。

该方案适用于财务对账、预算模型、复杂报表等需要公式审计与依赖梳理的场景，其"引擎 + 渲染 + 命令 + 导出管线"的分层结构也易于扩展（如增加错误值追踪、引用定位弹窗、跨表关系总览图等能力）。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
