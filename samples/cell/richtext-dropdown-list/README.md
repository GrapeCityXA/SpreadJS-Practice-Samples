## 一、Demo 概述

本示例在 SpreadJS Designer 环境中实现了一个支持**富文本选项**的自定义单元格类型（CellType）——`RichTextDropdownCellType`。它不同于内置的普通下拉列表：每个下拉选项可以携带独立的排版信息，例如**加粗、上标、下标、文字颜色**。单元格右侧会自绘一个下拉按钮，点击后在页面内弹出一个富文本选项列表，用户选择任意一项后，单元格内会以 SpreadJS 原生支持的富文本值（`richText`）写入对应内容。

示例内置了三个科学公式风格的默认选项（万有引力公式 `F = (G*M₁*M₂) / R²`、化学式 `H₂SO₄`、质能方程 `E = mc²`），直观地展示了化学方程式、科学公式、带角标注释等内容的录入场景。同时，示例把"设置 / 编辑 / 清除"入口以自定义命令的形式注入到设计器"开始"选项卡的功能区中，最终形成一条完整链路：**功能区命令 → 配置弹框 → 富文本编辑 → 单元格类型实例 → 自绘下拉按钮 → 富文本值写入单元格**。

## 二、解决的问题

- **内置下拉列表不支持富文本选项。** SpreadJS 内置的 ComboBox 等单元格类型以纯文本字符串作为选项与值，无法表达带上下标、颜色等排版的科学表达式。本示例通过自定义 CellType + 富文本值方案绕开了这一限制。
- **富文本的"编辑、预览、弹层展示、单元格写入"四处表现难以保持一致。** 示例抽出一个统一的"片段模型"，所有展示与写入都经由同一套转换逻辑，避免同一内容在不同位置渲染不一致。
- **需要一种可批量应用于任意单元格区域的交互单元。** 自定义单元格类型天然支持通过 `setCellType` 设置到任意单元格或选区，配合设计器命令可以做到无代码的交互式配置。
- **需要在设计器功能区暴露操作入口。** 通过扩展 `Designer.DefaultConfig`，把"设置 / 编辑 / 清除"包装成功能区按钮，让最终用户可以在 UI 上直接完成配置，而不必依赖代码接口。

## 三、实现思路

整体代码按职责拆分为多个 ES Module，互相之间只通过明确的导出/导入协作，核心文件结构如下：

| 文件 | 职责 |
|------|------|
| `src/app.js` | 入口：初始化 Designer、注入功能区命令、填充示例工作簿 |
| `src/rich-text-dropdown-cell-type.js` | 自定义单元格类型：绘制、命中检测、鼠标事件、序列化 |
| `src/rich-text.js` | 富文本 HTML 与"片段模型"的互转、生成 `richText` 单元格值 |
| `src/ui.js` | 页面 UI：下拉弹层、配置弹框、富文本编辑器与事件绑定 |
| `src/state.js` | 共享状态与常量（设计器实例、弹层/弹框临时状态、映射表） |
| `src/style.css` | 弹层、弹框、编辑器的全部样式 |
| `systemjs.config.js` | 通过 SystemJS 把 SpreadJS 各包映射到葡萄城 CDN |

### 3.1 核心技术点

**技术点 1：继承 Text 单元格类型并自绘右侧下拉按钮**

`RichTextDropdownCellType` 使用原型链方式继承 `GC.Spread.Sheets.CellTypes.Text`，在 `paint` 中把文本绘制区域裁剪为"总宽度 - 按钮宽度（24px）"，再在右侧绘制一个带三角箭头的按钮；通过 `getHitInfo` 把按钮区域标记为 `isReservedLocation`，随后在 `processMouseUp` 中识别"点在按钮上"这一事件。

```javascript
// 绘制：内容区让出右侧 24px 给下拉按钮
RichTextDropdownCellType.prototype.paint = function (ctx, value, x, y, width, height, style, context) {
  const contentWidth = Math.max(0, width - BUTTON_WIDTH);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, contentWidth, height);
  ctx.clip(); // 富文本内容只绘制在内容区，避免溢出到按钮上
  GC.Spread.Sheets.CellTypes.Text.prototype.paint.apply(this,
    [ctx, value, x, y, contentWidth, height, style, context]);
  ctx.restore();
  paintDropdownButton(ctx, x + width - BUTTON_WIDTH, y, BUTTON_WIDTH, height);
};

// 命中检测：仅在“左键点击右侧按钮区域”时视为保留位置
RichTextDropdownCellType.prototype.getHitInfo = function (x, y, cellStyle, cellRect, context) {
  if (!context || !cellRect) return null;
  const buttonLeft = cellRect.x + cellRect.width - BUTTON_WIDTH;
  const isLeftButton = !context.event || context.event.button === 0;
  const info = { x, y, row: context.row, col: context.col,
                 cellRect, sheetArea: context.sheetArea, sheet: context.sheet };
  info.isReservedLocation = isLeftButton &&
    x >= buttonLeft && x <= cellRect.x + cellRect.width &&
    y >= cellRect.y && y <= cellRect.y + cellRect.height;
  return info;
};

// 鼠标抬起：命中保留位置时调用注入的“打开弹层”回调
RichTextDropdownCellType.prototype.processMouseUp = function (hitInfo) {
  if (!hitInfo || !hitInfo.isReservedLocation) return false;
  const sheet = hitInfo.sheet || (state.spread && state.spread.getActiveSheet());
  if (sheet && dropdownOpener) {
    dropdownOpener(sheet, hitInfo.row, hitInfo.col);
    return true;
  }
  return false;
};
```

值得注意的一点：单元格类型模块并不直接依赖任何页面 UI。打开下拉弹层的回调由 `app.js` 通过 `setDropdownOpener(...)` 注入，从而规避了 cellType 模块与 ui 模块之间的循环依赖。

**技术点 2：统一的"片段模型"承担富文本的中间表示**

页面各处（编辑器 HTML、弹层预览、单元格值）如果各写一套逻辑必然产生偏差。示例引入一个中间结构——片段模型，每个片段为 `{ text, bold, vertical, color }`，其中 `vertical` 取值 `normal / sup / sub`：

- `editorHtmlToSegments`：递归遍历 `contenteditable` 产生的 DOM，把 `b/sup/sub` 标签与内联样式（`color`、`verticalAlign`、`fontWeight`）逐层继承下来，再将相邻且样式完全一致的分段合并，得到精简的片段数组；
- `optionSegmentsToHtml`：把片段数组还原为带样式的 HTML 字符串，供弹层与预览直接渲染；
- `escapeHtml`：对文本做超文本转义，避免把用户输入当作标签执行。

```javascript
// 片段 → HTML（加粗 + 颜色 + 上/下标包裹）
export function optionSegmentsToHtml(segments) {
  return segments.map(function (segment) {
    const style = "color:" + escapeHtml(segment.color || DEFAULT_COLOR) + ";"
      + "font-weight:" + (segment.bold ? "700" : "400") + ";";
    const content = '' + escapeHtml(segment.text || "") + "";
    if (segment.vertical === "sup") return "" + content + "";
    if (segment.vertical === "sub") return "" + content + "";
    return content;
  }).join("");
}
```

**技术点 3：转换为 SpreadJS 原生 `richText` 值写入单元格**

下拉项被选中后，最终写入单元格的是一个符合 SpreadJS 富文本值契约的对象：`{ richText: [{ text, style: { font, foreColor, vertAlign } }, ...] }`。每个 run 的字体由"加粗/正常 + 字号 + Cambria Math 字体"拼出，`vertAlign` 通过 `VERTICAL_ALIGN_MAP`（`normal:0 / sup:1 / sub:2`）映射为表格控件约定的取值，上、下标使用略小的字号。

```javascript
export function createRichTextValue(option) {
  return {
    richText: option.segments
      .filter(function (segment) { return segment.text !== ""; })
      .map(function (segment) {
        return {
          text: segment.text,
          style: {
            font: (segment.bold ? "bold " : "normal ") + segment.fontSize + "px Cambria Math",
            foreColor: segment.color,
            vertAlign: VERTICAL_ALIGN_MAP[segment.vertical]
          }
        };
      })
  };
}
```

写入单元格时直接 `sheet.setValue`，随后 `autoFitRow` 让行高自适应富文本内容：

```javascript
function writeOptionToCell(sheet, row, col, option) {
  sheet.setValue(row, col, createRichTextValue(option));
  sheet.autoFitRow(row);
  if (sheet.getRowHeight(row) < 34) sheet.setRowHeight(row, 34);
}
```

**技术点 4：扩展 Designer 配置，向"开始"选项卡注入功能区命令**

`app.js` 基于 `GC.Spread.Sheets.Designer.DefaultConfig` 增加三条命令，并整体插入一个 `buttonGroups` 分组。命令对象中的 `execute` 直接调用 ui 模块暴露的函数，实现"设置 / 编辑 / 清除"三种操作；图标则由 `iconClass` 指向 CSS 中以 SVG data URI 形式定义的内联图标。

```javascript
commandMap.richDropdownSet = {
  title: "设置富文本下拉", text: "设置", bigButton: true,
  iconClass: "rich-dropdown-ribbon-icon-set", commandName: "richDropdownSet",
  execute: function () { openCellTypeConfigModal(false); }
};
// richDropdownEdit / richDropdownClear 结构类似……

homeTab.buttonGroups.unshift({
  label: "富文本下拉列表",
  commandGroup: {
    children: [{ direction: "horizontal",
      commands: ["richDropdownSet", "richDropdownEdit", "richDropdownClear"] }]
  }
});
```

**技术点 5：下拉弹层的定位与防误关处理**

弹层位置根据单元格的实际屏幕坐标计算：通过 `sheet.getCellRect(row, col)` 拿到单元格在工作簿宿主内的像素矩形，再叠加宿主相对工作区的偏移换算成绝对定位，并对弹层上下左右做边界钳制，防止超出可视区域。为规避"点击按钮打开弹层时冒泡触发的 document click 立即把它关掉"，用 `state.ignoreDocumentClickUntil` 记录一个时间戳，在这段时间内的全局点击不触发关闭。

```javascript
const cellRect = sheet.getCellRect(row, col);   // 单元格在工作簿中的像素坐标
const hostRect = host.getBoundingClientRect();
const paneRect = workspace.getBoundingClientRect();
let left = hostRect.left - paneRect.left + cellRect.x + cellRect.width - 380;
let top  = hostRect.top  - paneRect.top  + cellRect.y + cellRect.height + 10;
left = Math.max(14, Math.min(left, workspace.clientWidth - 394));   // 边界钳制
top  = Math.max(70, Math.min(top,  workspace.clientHeight - 410));
```

### 3.2 UI 交互流程

设置并使用的完整流程如下：

1. 在表内选中一个单元格或区域 → 功能区"开始"选项卡中找到新增的"富文本下拉列表"分组；
2. 点击"设置"（或选中已有富文本下拉单元格后点"编辑"，编辑模式会读取该单元格当前的选项配置）；
3. 在弹框中通过"新增选项 / 删除当前选项"维护下拉项，用富文本编辑框及其工具栏（加粗 `B`、上标 `x²`、下标 `x₂`、清格式、取色器）排版每一项内容，左侧列表与预览区实时刷新；
4. 点击"保存并应用到当前选区"，选中区域内的每个单元格都会被设置上 `RichTextDropdownCellType`，右侧出现自绘下拉箭头；
5. 点击任意单元格右侧的箭头 → 弹出富文本选项列表 → 点击某一项，该单元格即以富文本形式写入选中内容，行高自动适应；
6. 需要移除时，选中单元格点击"清除"即可；按 `Esc` 或在弹层外点击可关闭弹层/弹框。

### 3.3 技术栈

- **SpreadJS V19**（示例页面样式引用 19.1.3，脚本通过 SystemJS 映射加载 19.0.3 系列 CDN 包），包含表格、Designer、ExcelIO、图表、打印、PDF、形状、透视表、条形码、中文资源包等模块；
- **SpreadJS Designer 设计器**：承载工作簿并托管功能区，示例通过其 `DefaultConfig` 扩展命令与按钮组；
- **SystemJS + plugin-typescript + TypeScript**：作为前端模块加载与转译工具，从 `node_modules` 本地加载，SpreadJS 各包统一映射至葡萄城 CDN；
- **原生 Web 能力**：`contenteditable` 富文本编辑框配合 `document.execCommand`，以及标准 ES Module、CSS 变量等；
- 示例在 `app.js` 中内置了 GrapeCity 授权的试用 `LicenseKey`，并设置中文区域（`culture("zh-cn")`）。

## 四、使用说明

### 4.1 运行方式

示例需通过本地 HTTP 服务访问（页面通过相对路径引用 `node_modules/systemjs`）。在示例根目录执行：

```bash
npm install
```

然后启动任意静态文件服务器，例如：

```bash
npx http-server . -p 8080
```

浏览器打开 `http://localhost:8080` 即可看到带设计器的示例页面（需要能访问葡萄城 CDN 以加载 SpreadJS 包与样式）。

### 4.2 操作步骤

1. **观察预置示例**：工作簿 A 列是指南，B 列第 7~9 行存放了三个富文本值（万有引力公式、`H₂SO₄`、`E = mc²`），C 列第 7~9 行是对应的富文本下拉单元格，可先点击其右侧下拉按钮查看弹层效果。
2. **设置新单元格**：选中 C 列某个空白单元格，点击功能区"开始 → 富文本下拉列表 → 设置"。
3. **编辑下拉选项**：在弹框中点"新增选项"，在富文本编辑框输入内容（例如先输入 `H2SO4`，选中 `2` 和 `4` 后点 `x₂` 变为下标），可用取色器改变颜色。
4. **应用并测试**：点"保存并应用到当前选区"，随后点击该单元格右侧的自绘下拉箭头，在弹层中任选一项，验证写入的富文本（加粗/颜色/上下标）与行高自适应效果。
5. **编辑与清除**：选中已配置的单元格后点"编辑"可读取并修改其选项配置；点"清除"可移除该单元格类型。

## 五、功能特点

### 5.1 优点

- **数据符合表格控件原生契约**：单元格值使用 SpreadJS 的 `richText` 结构，可与普通数据一样参与序列化与后续导出，而不是自定义的旁路数据。
- **四处展示一致**：编辑框、配置列表、弹层、单元格写入共享同一"片段模型"转换链，任何一处排版都不会失真。
- **配置可序列化**：选项保存在单元格类型实例上，并实现了 `toJSON / fromJSON`，方便随工作簿结构观察、迁移与恢复。
- **与设计器深度融合**：通过功能区命令完成设置/编辑/清除，交互闭环，业务用户无需编写代码。
- **模块职责清晰**：状态、富文本转换、单元格类型、页面 UI 各自独立，且以依赖注入避免循环引用，易于复用到纯表格（非 Designer）场景。

### 5.2 局限性与扩展建议

- **依赖已废弃的 `document.execCommand`**：当前主流浏览器仍可用，但属于遗留 API。如需产品化，建议把富文本编辑框替换为 Lexical、ProseMirror 等现代编辑器，再通过各自的序列化结果适配"片段模型"。
- **弹层为自定义 DOM 浮层**：定位逻辑为手动计算且受页面布局影响，也没有键盘导航、ARIA 等无障碍支持。可扩展为监听方向键/回车选择，并补充可访问性标记。
- **上下标依赖 `Cambria Math` 字体栈**：在缺少该字体的系统上会回退到衬线字体，展示细节可能略有差异。
- **`fromJSON` 为实例方法**：本示例未演示"导出后再导入时如何重建类型"。实际生产环境通常需要维护一个自定义类型注册表，在反序列化时按 `typeName` 恢复对应的单元格类型。

## 六、关键代码片段

下拉弹层采用事件委托：点击任意 `.popup-item` 时，按 `data-option-id` 找到对应选项配置，再写入 `state.popupContext` 中记录的单元格：

```javascript
document.getElementById("popup-items").addEventListener("click", function (event) {
  const button = event.target.closest("[data-option-id]");
  if (!button || !state.popupContext) return;
  const optionConfig = state.dropdownPopupOptionConfigs.find(function (item) {
    return item.id === button.dataset.optionId;
  });
  if (!optionConfig) return;
  writeOptionToCell(
    state.popupContext.sheet, state.popupContext.row, state.popupContext.col,
    optionConfigToOption(optionConfig)   // 配置 → { id, segments }
  );
  hideDropdownPopup();
});
```

预置的默认选项以 HTML 字符串给出，例如化学式 `H₂SO₄`，它清晰展示了"HTML → 片段模型 → richText 值"这条转换链的输入形态：

```javascript
{
  id: "chemistry",
  html:
    'H' +
    '2' +
    'SO' +
    '4'
}
```

## 七、总结

本示例是学习 SpreadJS **自定义单元格类型**与**设计器扩展**的一份完整范本。开发者可以从中掌握：

1. **自定义 CellType 的标准写法**——继承现有类型、重写 `paint` / `getHitInfo` / `processMouseUp` 实现自绘区域与局部交互，以及用 `toJSON / fromJSON` 支撑序列化；
2. **富文本值的写入方式**——`sheet.setValue` + `{ richText: [...] }` 结构，以及每个 run 的 `font` / `foreColor` / `vertAlign` 组织方式；
3. **数据模型先行**——用一个统一的"片段模型"作为 HTML、预览与控件值之间的中间表示，从根本上避免多端渲染不一致；
4. **模块解耦与依赖注入**——单元格类型模块通过注入回调打开 UI 弹层，避免与 DOM 逻辑相互依赖；
5. **Designer 功能区的扩展方法**——基于 `DefaultConfig` 添加命令与按钮组，把自定义能力接入设计器 UI。

该方案适用于科学计算、化学/数学录入、带格式的业务标签选择等需要"预设富文本内容快速录入"的场景；由于配置与交互逻辑与特定 UI 解耦，也可以很方便地移植到仅使用 SpreadJS 表格（不加载 Designer）的应用中。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
