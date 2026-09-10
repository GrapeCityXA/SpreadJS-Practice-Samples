## 一、Demo 概述

本示例演示如何在 SpreadJS 设计器（Designer）环境下，为数据透视表、列头筛选器和工具栏排序按钮统一接入**中文拼音排序**规则。默认情况下，SpreadJS 对文本字段的排序基于字符编码或默认 locale 顺序，中文姓名会呈现为随机顺序；本示例通过注入自定义比较函数，使"张伟、王芳、李娜"等中文内容按拼音字母顺序排列。

示例同时包含一个小的交互增强：在筛选场景下，若用户只选中了数据区中的单个单元格，会自动用 BFS 算法推断出与之连通的数据区域并应用筛选器，无需手动框选整张表。

## 二、解决的问题

1. **中文文本排序不符合业务直觉**：透视表行标签、列头筛选排序、工具栏排序三个入口的排序结果不一致且不符合拼音习惯，业务人员难以核对数据。
2. **同一套排序规则需要覆盖多个入口**：SpreadJS 中筛选排序、透视表排序、命令排序走的是三套不同的 API，本示例给出统一封装的做法。
3. **排序规则需要可解释**：示例定义了明确的排序优先级——非汉字 < 汉字（按拼音）< 空白项，使空值稳定地排在末尾而非随机穿插。
4. **筛选区域需要自动识别**：设计器默认的筛选命令要求用户先选中完整数据区，选中单个单元格时无法正确推断区域。

## 三、实现思路

### 3.1 核心技术点

#### 技术点一：可复用的拼音比较函数 HZPinyin

排序的核心是一个签名与 `Array.prototype.sort` 兼容、但多接收一个 `sortType` 参数的比较函数。它先把值归为三大类并赋权重，再在类内比较：

```javascript
export function HZPinyin(value1, value2, sortType) {
  function isBlank(v) {
    v = String(v ?? "").trim();
    return v === "" || v === "(空白)";
  }
  function hasHanzi(v) {
    // CJK 扩展 A + CJK 统一表意文字 + CJK 兼容表意文字
    return /[㐀-䶿一-鿿豈-﫿]/.test(v);
  }
  function getType(v) {
    if (isBlank(v)) return 2;   // "(空白)" 最大，恒排末尾
    if (hasHanzi(v)) return 1;  // 汉字
    return 0;                   // 非汉字
  }

  const v1 = String(value1 ?? ""), v2 = String(value2 ?? "");
  const t1 = getType(v1), t2 = getType(v2);
  let result = 0;

  if (t1 !== t2) {
    result = t1 < t2 ? -1 : 1;          // 先按大类排
  } else if (t1 === 0) {
    result = v1.localeCompare(v2, "en", { sensitivity: "base" });
  } else if (t1 === 1) {
    // 关键：使用 Unicode 排序扩展 u-co-pinyin 指定拼音排序规则
    result = v1.localeCompare(v2, "zh-CN-u-co-pinyin", { sensitivity: "base" });
  }

  result = result < 0 ? -1 : result > 0 ? 1 : 0;  // 归一化为 -1/0/1
  return sortType === 1 ? -result : result;        // 1 = 降序
}
```

透视表中的空白项在 API 层会以字符串 `"(空白)"` 的形式传给比较函数，因此需要把它识别为"空"并固定排在最后。

#### 技术点二：筛选器排序——RangeSorting 事件注入比较函数

工作表列头的筛选菜单触发排序时，SpreadJS 会抛出 `RangeSorting` 事件。该事件对象上的 `compareFunction` 属性可被替换，从而接管排序规则：

```javascript
function installFilterSortHandler(spread) {
  spread.bind(GC.Spread.Sheets.Events.RangeSorting, function (E, args) {
    var sortType = args.ascending;   // 0 = 升序，1 = 降序
    args.compareFunction = function (value1, value2) {
      return HZPinyin(value1, value2, sortType);
    };
  });
}
```

注意 `args.compareFunction` 只接收两个参数，因此需要借助闭包捕获 `args.ascending`。

#### 技术点三：透视表排序——PivotTableChanged 事件 + customSortCallback

透视表的排序是异步声明式的：用户点击行标签下拉按钮选择排序后，触发 `PivotTableChanged` 事件。此时检查是否满足"文本字段 + 无值字段排序"的条件，满足则用 `SortType.custom` 重新下发一次排序：

```javascript
function installPivotSortHandler(spread) {
  spread.bind(GC.Spread.Sheets.Events.PivotTableChanged, function (e, args) {
    let pt = spread.getActiveSheet().pivotTables.get(args.pivotTableName);
    if (
      pt &&
      args.type === "sort" &&          // 仅处理排序类型的变更
      args.fieldName &&
      pt.getField(args.fieldName)?.dataType === 1 &&  // 1 = 文本字段
      (!args.sortInfo || !args.sortInfo.sortValueFieldName)  // 排除"按值排序"
    ) {
      pt.sort(args.fieldName, {
        sortType: GC.Spread.Pivot.SortType.custom,
        customSortCallback: function (fieldItemNameArray) {
          // 回调接收全部字段项名称，返回重排后的数组
          return fieldItemNameArray.sort((value1, value2) =>
            HZPinyin(value1, value2, args.sortType)
          );
        },
      });
    }
  });
}
```

`customSortCallback` 的入参是**该字段所有项的名称数组**而非两个值，因此这里直接对其调用原生 `Array.sort`，并把 `args.sortType`（透视表自身的升/降序标记）透传给 `HZPinyin`。

#### 技术点四：工具栏排序——拦截 Designer.sortRange 命令

设计器 Ribbon 上的排序按钮最终会执行 `Designer.sortRange` 命令。通过 `commandManager().addListener("-", ...)` 监听全部命令，识别到该命令后自行调用 `sheet.sortRange` 并以自定义比较函数重排：

```javascript
function installRibbonSortHandler(spread) {
  spread.commandManager().addListener("-", function (arg) {
    if (arg.command && arg.command.cmd === "Designer.sortRange") {
      var sheet = spread.getActiveSheet();
      var { row, col, rowCount, colCount } = arg.command.selections[0];
      sheet.sortRange(row, col, rowCount, colCount, true, [
        {
          index: col,
          ascending: arg.command.ascending,
          compareFunction: function (value1, value2) {
            return HZPinyin(value1, value2, arg.command.ascending);
          },
        },
      ]);
    }
  });
}
```

`sortRange` 的第 6 个参数是排序条件数组，每项可携带 `compareFunction`，这是与筛选器排序不同的注入点。

#### 技术点五：筛选范围自动推断与设计器命令改写

`designer-commands.js` 解决"选中单个单元格时筛选范围无法确定"的问题。`findConnectedDataRegion` 用 BFS 从起始单元格出发，沿上下左右四个方向扩散，收集所有有值的连通单元格，最终返回其外接矩形：

```javascript
export function findConnectedDataRegion(sheet, startRow, startCol) {
  let visited = {}, queue = [];
  let minRow = startRow, maxRow = startRow;
  let minCol = startCol, maxCol = startCol;

  function hasCellData(row, col) {
    let value = sheet.getValue(row, col);
    return value !== null && value !== undefined && value !== "";
  }
  // ... 起始点无数据则直接返回单单元格范围
  queue.push({ row: startRow, col: startCol });
  visited[`${startRow}_${startCol}`] = true;

  while (queue.length > 0) {
    let current = queue.shift();
    minRow = Math.min(minRow, current.row);
    maxRow = Math.max(maxRow, current.row);
    minCol = Math.min(minCol, current.col);
    maxCol = Math.max(maxCol, current.col);
    // 四个方向扩散，未访问且有数据的入队
    // ...
  }
  return { row: minRow, col: minCol,
           rowCount: maxRow - minRow + 1, colCount: maxCol - minCol + 1 };
}
```

在此基础上，`applyFilterFromSelection` 统一处理筛选逻辑：选区落在 Table 内时返回 `null`（回退到设计器默认行为）、已有筛选器时移除、否则推断范围并**跳过标题行**（`row + 1`）后创建 `HideRowFilter`。

`buildFilterCommandMap()` 用装饰器模式包装设计器内置的 `setFilter` / `setFilterData` 命令，先尝试自定义逻辑，返回 `null` 时才调用原始的 `execute`：

```javascript
export function buildFilterCommandMap() {
  const commandMap = {};
  const setFilterCmd = GC.Spread.Sheets.Designer.getCommand(
    GC.Spread.Sheets.Designer.CommandNames.SetFilter,
  );
  const oldFilterExecute = setFilterCmd.execute;
  setFilterCmd.execute = function (context) {
    const handled = applyFilterFromSelection(context.getWorkbook().getActiveSheet());
    if (handled === null) {
      oldFilterExecute.call(this, context);   // 回退到默认实现
    }
  };
  commandMap.setFilter = setFilterCmd;
  // setFilterData 同理 ...
  return commandMap;
}
```

改写的命令通过合并进 `designerConfig.commandMap` 生效，必须在 `new Designer.Designer()` **之前**完成：

```javascript
const designerConfig = JSON.parse(JSON.stringify(Designer.DefaultConfig));
designerConfig.commandMap = Object.assign({}, designerConfig.commandMap, buildFilterCommandMap());
const designer = new Designer.Designer("gc-designer-container", designerConfig);
const spread = designer.getWorkbook();

registerSheetFilterContextCommand(spread);  // 注册可撤销的右键菜单筛选命令
installSortHandlers(spread);                // 安装三处拼音排序
```

### 3.2 UI 交互流程

**透视表排序：**

打开页面（默认停在"销售透视"表） → 点击 B2 单元格"姓名"行标签的下拉按钮 → 选择"升序"或"降序" → 触发 `PivotTableChanged`（`type: "sort"`）→ 以 `customSortCallback` 重排 → 行标签按拼音顺序显示

**筛选器排序：**

切换到"销售数据"表 → 点击列头筛选按钮 → 选择"升序"/"降序" → 触发 `RangeSorting` → 注入 `HZPinyin` 比较函数 → 数据按拼音重排

**智能筛选：**

选中数据区任意单元格 → 点击 Ribbon"筛选"按钮 → BFS 推断连通区域 → 自动应用行筛选器（已存在则移除）

### 3.3 技术栈

| 依赖 | 版本 | 作用 |
|------|------|------|
| `@grapecity-software/spread-sheets` | 19.0.3 | 表格核心库 |
| `spread-sheets-designer` + `designer-resources-cn` | 19.0.3 | 设计器 UI 与中文资源包 |
| `spread-sheets-pivot-addon` | 19.0.3 | 数据透视表插件 |
| `systemjs` | ^0.19.22 | 浏览器端模块加载器 |
| `typescript` | ^4.1.2 | SystemJS 内置转译器，运行时编译 ES Module |

SpreadJS 相关包通过 `systemjs.config.js` 映射到 CDN 加载（`format: 'global'`，均挂载到 `window.GC`），`package.json` 中仅需安装 `systemjs` 与 `typescript`。

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

由于页面通过 SystemJS 以模块方式加载 `./src/app`，**必须通过 HTTP 协议访问**（`file://` 会因跨域限制失败）。任选一种静态服务器：

```bash
npx http-server -p 8080 -c-1
# 或使用 VS Code Live Server 插件打开 index.html
```

然后访问 `http://localhost:8080/index.html`。

### 4.2 操作步骤

1. 页面加载后默认激活"销售透视"工作表，E2/E3 单元格给出了操作提示。
2. 点击 B2 单元格（行标签"姓名"）右侧的下拉按钮，分别选择"升序"和"降序"。
3. 观察行标签的排列顺序——应按 `陈晨、李娜、孙丽、王芳、吴敏、张伟、赵磊、周杰` 的拼音首字母顺序排列，而非字符编码顺序。
4. 切换到"销售数据"工作表，点击列头"姓名"的筛选按钮，执行升/降序，验证筛选场景下排序规则一致。
5. 选中数据区域内任意一个单元格，点击 Ribbon 工具栏的"筛选"按钮，观察筛选器是否自动覆盖整个连通数据区（并正确跳过标题行）；再次点击可移除筛选器。

## 五、功能特点

### 5.1 优点

1. **规则集中、入口统一**：`HZPinyin` 是纯函数，三处排序入口共用同一份比较逻辑，修改排序规则只需改一个地方。
2. **排序语义明确**：显式定义了"非汉字 < 汉字 < 空白"的三级权重，空值行为稳定可预期，避免了 `localeCompare` 默认行为导致的空值穿插。
3. **设计器命令可安全改写**：采用"包装原 `execute` + 条件回退"的方式扩展设计器行为，Table 场景仍走官方逻辑，兼容性风险低。
4. **交互细节完善**：BFS 自动识别数据区、跳过标题行、右键菜单命令以 `startTransaction/endTransaction` 包裹从而支持撤销。

### 5.2 局限性与扩展建议

- **依赖 `u-co-pinyin` 排序扩展**：`localeCompare(v, "zh-CN-u-co-pinyin")` 依赖浏览器对 Unicode 排序扩展的支持，部分旧版浏览器或非 Chromium 内核可能退化为默认顺序。若需严格一致，可引入 `pinyin` / `pinyin-pro` 库先把汉字转成拼音串再比较。
- **多音字处理**：`localeCompare` 的拼音排序对多音字采用通用读音，如需按姓氏读音（如"单""仇"）排序，需自建读音字典。
- **`RangeSorting` 是全局事件**：`spread.bind` 绑在 Workbook 上，所有工作表的筛选排序都会被改写，示例中未做工作表级别的过滤。如需限定范围，可在回调中判断 `spread.getActiveSheet().name()`。
- **Ribbon 排序为叠加式干预**：`commandManager` 的监听器无法取消原命令，自定义排序是在默认排序之后再次执行；若追求更干净的实现，可参照 `buildFilterCommandMap` 的做法直接改写 `Designer.sortRange` 命令。

## 六、关键代码片段

示例数据的准备工作同样值得关注——数据透视表通过 `pivotTables.add` 直接以二维数组作为数据源创建，无需先写入工作表：

```javascript
// 1. 写入源数据并加粗表头
const sourceData = [
  ["姓名", "地区", "产品", "数量", "金额"],
  ["张伟", "华东", "笔记本电脑", 12, 96000],
  // ...
];
dataSheet.setArray(0, 0, sourceData);
dataSheet.getRange(0, 0, 1, 5).font("bold 11pt Calibri");

// 2. 为数据区添加筛选器，使用户可直接体验拼音排序
const filter = new GC.Spread.Sheets.Filter.HideRowFilter(
  new GC.Spread.Sheets.Range(0, 0, sourceData.length, 5),
);
dataSheet.rowFilter(filter);

// 3. 在独立工作表中创建透视表，直接传入数组数据源
const pivotSheet = new GC.Spread.Sheets.Worksheet("销售透视");
spread.addSheet(1, pivotSheet);
const pt = pivotSheet.pivotTables.add(
  "销售透视表",
  sourceData,                                  // 数据源：二维数组
  1, 1,                                        // 放置位置 B2
  GC.Spread.Pivot.PivotTableLayoutType.compact, // 紧凑布局
  GC.Spread.Pivot.PivotTableThemes.medium2,     // 内置主题
  { showRowHeader: true, showColumnHeader: true },
);
pt.add("姓名", "姓名", GC.Spread.Pivot.PivotTableFieldType.rowField);
pt.add(
  "金额",
  "金额合计",
  GC.Spread.Pivot.PivotTableFieldType.valueField,
  GC.default.Pivot.SubtotalType.sum,           // 值字段汇总方式：求和
);
```

`pt.add` 的第 3 个参数决定字段角色（`rowField` / `columnField` / `valueField` / `filterField`），值字段需额外传入汇总类型。

## 七、总结

本示例的价值在于打通了 SpreadJS 中三条互不相通的排序链路，并以一个小而完整的自定义排序规则贯穿始终。

可以从中学习到的知识点：

1. **三处排序注入点的差异**：筛选排序用 `RangeSorting` 事件的 `compareFunction`，透视表排序用 `pt.sort({ sortType: SortType.custom, customSortCallback })`，命令排序用 `sheet.sortRange` 的排序条件数组——三者的回调签名并不相同（比较函数 vs 数组重排函数）。
2. **透视表字段模型**：`getField(name).dataType` 用于区分文本字段与数值字段，`sortInfo.sortValueFieldName` 用于区分字段排序与按值排序，这是避免误改用户意图的关键判断。
3. **设计器命令的扩展范式**：通过 `Designer.getCommand()` 取出内置命令、包装其 `execute`，再合并进 `designerConfig.commandMap`，可在不修改源码的前提下定制设计器行为。
4. **自定义命令的可撤销实现**：`startTransaction` / `endTransaction` / `undoTransaction` 三件套是让自定义命令支持 Ctrl+Z 的标准写法。
5. **连通区域算法在表格场景的应用**：BFS 推断数据区块是处理"用户只选中一个单元格"这类模糊输入的通用思路。

该方案适用于任何需要覆盖默认排序语义的场景（如按部门优先级、按自定义编码排序），只需替换 `HZPinyin` 中的比较逻辑即可复用全部三处注入代码。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
