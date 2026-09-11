## 一、Demo 概述

本示例演示了在 SpreadJS 报表插件（ReportSheet）中动态切换数据源并重新生成报表的完整流程。示例初始通过数据管理器的**远程数据源**（`remote.read`）加载一套销售数据并渲染成报表，用户点击工具栏上的"更换数据源"按钮后，程序将数据管理器中的表从远程配置替换为**本地数据**（`data`），强制重新加载数据并调用报表的重新生成接口，使报表内容立即切换到第二套数据。

该能力对应报表类应用的常见场景：报表模板（列结构、样式、绑定表达式）在运行期保持不变，而底层数据源可能来自不同的后端服务、不同的数据仓库或不同的取数周期，需要在不断开页面、不重建报表的前提下完成切换。

## 二、解决的问题

- **模板与数据解耦**：报表模板由 `setTemplateCell` 定义单元格绑定表达式（如 `表1[region]`），模板本身不持有数据。数据源变化时只需更新数据管理器中的表，无需重建工作表或重写模板。
- **远程/本地数据源的无缝切换**：实际业务中，同一张报表可能先查询远程服务，后续切换到本地缓存或用户导入的数据。示例通过修改 `table.options`（删除 `remote`、写入 `data`）实现配置级切换，而非另建一张表。
- **避免切换过程中的重复操作与状态错乱**：数据加载与报表重新生成都是异步操作，示例通过 `Promise` 串联并在 UI 层禁用按钮，防止用户在加载过程中连续点击导致的数据竞争。

## 三、实现思路

### 3.1 核心技术点

#### 技术点 1：通过数据管理器注册数据表

数据管理器（`spread.dataManager()`）是报表插件的数据中枢，所有报表绑定的数据源都需要先注册为其中的一张表。示例注册名为"表1"的数据表，并为其配置远程数据源——这里的 `read` 使用一个返回 `Promise` 的函数模拟后端接口，保证静态页面可以离线运行。

```javascript
const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const dataManager = spread.dataManager();

const table = dataManager.addTable(TABLE_NAME, {
    remote: {
        // 用函数模拟远程接口，返回 Promise
        read: () => Promise.resolve(datasetA),
    },
});
```

注册完成后，必须显式调用 `table.fetch()` 才会真正触发数据加载：

```javascript
await table.fetch();
```

#### 技术点 2：构建报表工作表与模板

报表工作表通过 `spread.addSheetTab()` 创建，类型指定为 `GC.Spread.Sheets.SheetType.reportSheet`。报表的编辑与展示分为两种渲染模式，示例先在 `Design` 模式下搭建模板，再切回 `Preview` 模式展示结果。

模板单元格使用 `setTemplateCell(row, col, {...})` 声明绑定，其中 `type: "List"` 表示该单元格是一个列表型模板单元格，会按绑定的数据字段向下展开多行：

```javascript
const reportSheet = spread.addSheetTab(
    0,
    REPORT_NAME,
    GC.Spread.Sheets.SheetType.reportSheet,
);
reportSheet.renderMode("Design");          // 进入设计模式编辑模板
const templateSheet = reportSheet.getTemplate();

// 第 0 行放表头，第 1 行放列表绑定
reportColumns.forEach((column, i) => {
    templateSheet.setColumnWidth(i, column.width);
    templateSheet.setValue(0, i, column.header);
    templateSheet.setTemplateCell(1, i, {
        type: "List",
        binding: `${TABLE_NAME}[${column.field}]`,   // 如：表1[region]
    });
});
```

注意绑定表达式的形式为 `表名[字段名]`，表名必须与 `addTable` 时注册的名称完全一致，这是模板与数据表之间唯一的关联点。

模板搭建完毕后重新刷新并切回预览模式：

```javascript
reportSheet.refresh();
reportSheet.renderMode("Preview");
```

#### 技术点 3：更换数据源的核心逻辑

数据源切换集中在 `updateReport()` 中，共四个步骤：读取表配置、删除远程配置、写入本地数据、强制重新加载并重新生成报表。

```javascript
export function updateReport(spread, dataManager, new_data) {
  let table = dataManager.tables["表1"];
  let options = table.options;
  delete options.remote;        // 1. 移除远程数据源配置
  options.data = new_data;      // 2. 写入本地数据源
  table.options = options;      // 3. 重新赋值触发配置更新
  return table.fetch(true).then(function () {
    // 4. fetch(true) 强制重新加载，忽略缓存
    let sheet = spread.getActiveSheetTab();
    sheet.regenerateReport();   // 依据新数据重新生成报表
    sheet.renderMode("Preview");
    sheet.refresh();
  });
}
```

其中两个 API 是关键：

- `table.fetch(true)`：参数 `true` 表示强制重新拉取数据。若不传该参数，数据管理器可能复用已加载的数据，导致新配置不生效。
- `sheet.regenerateReport()`：报表插件提供的重新生成接口，会依据当前数据表内容重新展开模板中的 `List` 单元格。

#### 技术点 4：UI 层与业务逻辑分离

页面交互代码被集中到 `ui.js`，对外只暴露两个函数，业务逻辑（`app.js`）不直接操作 DOM：

```javascript
export function bindChangeSource(handler) {
  changeButton.addEventListener("click", async () => {
    changeButton.disabled = true;      // 请求期间禁用按钮
    try {
      await handler();
    } finally {
      changeButton.disabled = false;   // 无论成功失败都恢复
    }
  });
}
```

`try/finally` 保证即使数据切换抛错，按钮也不会永久卡在禁用状态。

### 3.2 UI 交互流程

页面加载 → `init()` 加载初始数据并创建报表 → 报表以预览模式展示第一套数据
点击"更换数据源" → 按钮禁用，状态栏提示"正在更换数据源…" → `updateReport()` 切换为第二套数据 → 报表重新生成 → 按钮恢复，状态栏显示"数据源已更换为本地数据，报表已重新生成。"
再次点击 → 数据在 A、B 两套数据之间循环切换

数据切换的循环由一个游标变量控制：

```javascript
let cur_data = "A";
bindChangeSource(async () => {
    setStatus("正在更换数据源…");
    if (cur_data == "A") {
        await updateReport(spread, dataManager, datasetB);
        cur_data = "B";
    } else {
        await updateReport(spread, dataManager, datasetA);
        cur_data = "A";
    }
    setStatus("数据源已更换为本地数据，报表已重新生成。", "success");
});
```

### 3.3 技术栈

| 依赖 | 版本 | 作用 |
|------|------|------|
| `@grapecity-software/spread-sheets` | 19.0.3 | SpreadJS 核心库 |
| `@grapecity-software/spread-sheets-reportsheet-addon` | 19.0.3 | 报表插件，提供 ReportSheet 与数据管理器 |
| `@grapecity-software/spread-sheets-resources-zh` | 19.0.3 | 中文资源包 |
| `systemjs` | ^0.19.22 | 模块加载器，负责解析 `@grapecity-software/*` 到 CDN 地址 |

示例同时引入了打印、形状、图表、切片器、透视表、甘特图等插件，用于保证报表插件的完整运行环境。模块映射统一配置在 `systemjs.config.js` 的 `map` 字段中，所有 SpreadJS 资源均指向 CDN，因此 `node_modules` 中只需安装 `systemjs`。

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

由于示例使用 SystemJS 加载模块，需要通过 HTTP 服务访问，不能直接双击打开 `index.html`：

```bash
npx http-server -p 8080
# 或
npx serve
```

然后访问 `http://localhost:8080/index.html`。

### 4.2 操作步骤

1. 打开页面，等待状态栏由"正在初始化…"变为"报表已加载（远程数据源）"。
2. 观察表格区域，报表展示 `datasetA` 中的 5 条销售记录（华东/华北/华南等地区）。
3. 点击左上角"更换数据源"按钮，按钮短暂禁用，状态栏显示切换进度。
4. 切换完成后，报表内容更新为 `datasetB` 中的 6 条记录（出现"平板电脑""东北"等新数据），表头与列宽样式保持不变。
5. 再次点击按钮，数据切回 `datasetA`，验证反复切换的稳定性。

可以修改 `src/report-data.js` 中的 `datasetA` / `datasetB` 与 `reportColumns`，刷新页面观察数据与列结构的变化。修改 `reportColumns` 会增加或减少报表列，用于验证模板的自动适配能力。

## 五、功能特点

### 5.1 优点

- **切换成本低**：只修改数据表配置并调用 `fetch` + `regenerateReport`，不涉及工作表的销毁与重建，切换过程对用户无感知。
- **模板零改动**：列定义集中在 `reportColumns` 一处，表头、列宽、单元格绑定由同一份配置驱动，新增字段只需改数据与配置。
- **异步流程安全**：按钮在请求期间禁用，`try/finally` 保证异常路径下 UI 也能恢复，避免重复提交。
- **职责清晰**：`ui.js`（DOM 与状态）、`update-report.js`（数据源切换）、`report-data.js`（数据与列定义）、`app.js`（组装与初始化）四层分离，便于替换任意一层。

### 5.2 局限性与扩展建议

- **表名硬编码**：`updateReport()` 中直接使用 `dataManager.tables["表1"]`，与 `app.js` 中的 `TABLE_NAME` 常量重复。建议将表名作为参数传入，或直接使用 `dataManager.tables[TABLE_NAME]`。
- **切换方向由游标控制**：当前的 A/B 循环是演示逻辑，实际业务中应改为接收外部数据（如接口响应或文件解析结果）后调用 `updateReport()`。
- **未处理切换失败**：数据加载失败时仅恢复按钮状态，没有向用户反馈错误信息。建议在 `bindChangeSource` 的调用处补充 `catch`，调用 `setStatus("数据源切换失败", "error")`（`index.html` 中已预留 `data-tone` 样式的扩展位）。
- **远程数据为模拟实现**：`remote.read` 返回的是本地常量。接入真实后端时，将其替换为实际的 HTTP 请求（返回 Promise）即可，其余流程无需改动。

## 六、关键代码片段

数据源切换的完整实现（`src/update-report.js`），这是整个示例的核心：

```javascript
export function updateReport(spread, dataManager, new_data) {
  let table = dataManager.tables["表1"];
  let options = table.options;

  // 从配置中移除远程数据源，改为本地数据源
  delete options.remote;
  options.data = new_data;
  table.options = options;      // 重新赋值，使新配置生效

  // 强制重新加载数据（true = 忽略缓存）
  return table.fetch(true).then(function () {
    let sheet = spread.getActiveSheetTab();
    sheet.regenerateReport();   // 按新数据重新生成报表内容
    sheet.renderMode("Preview"); // 确保处于预览模式
    sheet.refresh();            // 刷新渲染
  });
}
```

报表模板的构建（`src/app.js` 节选），体现模板如何脱离具体数据：

```javascript
// 遍历列定义，同时完成列宽、表头、模板单元格绑定三件事
reportColumns.forEach((column, i) => {
    templateSheet.setColumnWidth(i, column.width);
    templateSheet.setValue(0, i, column.header);
    templateSheet.setTemplateCell(1, i, {
        type: "List",
        binding: `${TABLE_NAME}[${column.field}]`,
    });
});
```

## 七、总结

本示例展示了 SpreadJS 报表插件中"模板固定、数据源可变"这一设计模式的落地方式。与直接向单元格 `setValue` 写数据不同，报表插件将数据源抽象为数据管理器中的表，报表模板通过 `表名[字段]` 的绑定表达式引用字段，因此更换数据源只需操作数据表配置。

开发者可以从中学到：

1. 数据管理器的基本用法：`addTable()` 注册表、`remote.read` 定义远程取数、`fetch()` 触发加载。
2. 报表工作表的创建与两种渲染模式（`Design` 编辑模板 / `Preview` 展示结果）的切换时机。
3. `setTemplateCell()` 中 `type: "List"` 与绑定表达式 `表名[字段名]` 的配合方式。
4. 动态更换数据源的完整流程：修改 `table.options` → `fetch(true)` 强制重载 → `regenerateReport()` 重新生成。
5. 异步数据操作在 UI 层的安全处理：按钮禁用、`try/finally` 恢复、状态栏反馈。

该方案适用于报表列结构相对稳定、数据来源可能变化的场景，例如多租户报表、按周期切换数据快照、在线数据与本地导入数据对比等。若报表结构本身也需要动态变化，可在切换数据源后追加对模板单元格的重新配置，整体流程与本文一致。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
