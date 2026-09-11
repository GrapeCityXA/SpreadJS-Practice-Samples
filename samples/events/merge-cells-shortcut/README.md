## 一、Demo 概述

本示例为 SpreadJS 工作簿注册 `Ctrl+M` 快捷键，实现选中单元格的合并与取消合并切换。用户选中多个单元格后按下 `Ctrl+M`，选区被合并为一个单元格；再次按下 `Ctrl+M` 可撤销合并，恢复原始单元格结构，整个过程支持撤销（Undo）与重做（Redo）。

该功能对标 Excel 中常用的单元格合并交互，适用于需要快速整理报表布局、拼接表头、构建跨行跨列表格的业务场景，可让操作者摆脱右键菜单或工具栏的多次点击，提升编辑效率。

## 二、解决的问题

- **操作繁琐**：SpreadJS 默认的合并/取消合并入口在右键菜单或 Ribbon 工具栏中，高频操作下往返点击成本高。通过自定义快捷键可一键完成。
- **合并状态切换**：合并与取消合并是两种互斥操作，需要根据选区当前是否已包含合并区域动态判断执行方向。
- **撤销一致性**：直接用 API 调用 `addSpan`/`removeSpan` 不会进入命令栈，无法被撤销。需要把操作包装成自定义命令并接入事务机制。
- **选区边界处理**：用户可能整行或整列选中（行/列坐标为 -1），需要把这种特殊选区换算成实际单元格范围后再判断能否合并。

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 通过 CommandManager 注册带快捷键的自定义命令

SpreadJS 的 `CommandManager` 负责命令的注册、分发与撤销管理。调用其 `register()` 方法时，除命令名与命令对象外，还可以传入快捷键参数：第 3 个参数为键盘键码，之后依次指定是否需要按住 `Ctrl`、`Shift`、`Alt`、`Meta`。示例中传入键码 `77`（即字母 `M`）且 `Ctrl` 为 `true`，从而将命令绑定到 `Ctrl+M`。

```javascript
commandManager.register(
  "toggleMergeCells",
  {
    canUndo: true,

    execute: function (context, options, isUndo) {
      const sheet = context.getSheetFromName(options.sheetName);
      if (!sheet) {
        return false;
      }

      // 交由 SpreadJS 的命令系统处理撤销。
      if (isUndo) {
        GC.Spread.Sheets.Commands.undoTransaction(context, options);
        return true;
      }

      GC.Spread.Sheets.Commands.startTransaction(context, options);
      try {
        toggleMerge(sheet);
      } finally {
        GC.Spread.Sheets.Commands.endTransaction(context, options);
      }
      return true;
    },
  },
  77,   // M 键
  true, // Ctrl
  false,
  false,
  false
);
```

自定义命令对象包含两个关键成员：

- `canUndo: true`：声明该命令可撤销，命令执行后会被记录到撤销栈中。
- `execute(context, options, isUndo)`：命令执行体。`isUndo` 为 `true` 时表示当前是在执行撤销，应调用 `undoTransaction` 交由命令系统回滚；否则通过 `startTransaction` / `endTransaction` 包裹实际业务逻辑，使命令系统可以捕获变化并支持撤销与重做。

#### 3.1.2 合并 / 取消合并切换逻辑

核心函数 `toggleMerge` 先读取当前选区，再查找所有与选区相交的合并区域（Span）。判断依据是：**选区内已有合并区域则取消合并，否则当选区跨多行或多列时执行合并**。

```javascript
function toggleMerge(sheet) {
  const selections = sheet.getSelections();
  if (!selections || selections.length === 0) {
    return;
  }

  const selection = normalizeRange(sheet, selections[selections.length - 1]);
  const intersectingSpans = getIntersectingSpans(sheet, selection);

  sheet.suspendPaint();
  try {
    if (intersectingSpans.length > 0) {
      // 选区中存在合并区域：取消这些合并区域。
      intersectingSpans.forEach(function (span) {
        sheet.removeSpan(span.row, span.col);
      });
    } else if (selection.rowCount > 1 || selection.colCount > 1) {
      // 多单元格选区且不存在合并区域：执行合并。
      sheet.addSpan(
        selection.row,
        selection.col,
        selection.rowCount,
        selection.colCount
      );
    }
  } finally {
    sheet.resumePaint();
  }
}
```

合并单元格使用 `sheet.addSpan(row, col, rowCount, colCount)`，取消合并使用 `sheet.removeSpan(row, col)`。这里有两个值得注意的细节：

- **批量重绘优化**：合并与取消合并可能涉及多个区域，操作前调用 `suspendPaint()` 挂起绘制、结束后在 `finally` 中调用 `resumePaint()` 恢复，避免中间态的多次重绘闪烁。
- **相交检测**：`getSpans()` 会返回工作表上的全部合并区域，通过矩形相交算法（`rangesIntersect`）筛选出与当前选区重叠的部分。这样当用户在一个合并单元格内再拖选周边单元格时，可以准确识别出应取消的合并区域。

#### 3.1.3 整行 / 整列选区的归一化

在 SpreadJS 中，选区坐标 `row === -1` 表示选中整列，`col === -1` 表示选中整行。直接对这类选区执行合并会造成异常，因此需要将无限范围的选区换算为工作表实际的行列范围。

```javascript
function normalizeRange(sheet, range) {
  let row = range.row;
  let col = range.col;
  let rowCount = range.rowCount;
  let colCount = range.colCount;

  // row === -1 表示整列，col === -1 表示整行
  if (row === -1) {
    row = 0;
    rowCount = sheet.getRowCount();
  }
  if (col === -1) {
    col = 0;
    colCount = sheet.getColumnCount();
  }

  return { row, col, rowCount, colCount };
}
```

归一化后得到的实际范围在行数或列数大于 1 时即可安全地调用 `addSpan` 完成整行或整列场景的合并。

#### 3.1.4 工作簿初始化与示例数据

`app.js` 中完成 SpreadJS 工作簿的创建、示例数据的填充以及快捷键的注册。合并命令通过独立模块 `merge-command.js` 导出，入口文件只负责装配，职责清晰、便于复用。

```javascript
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));

const sheet = spread.getActiveSheet();

// 示例数据
sheet.setValue(0, 0, "选中多个单元格");
sheet.setValue(1, 0, "按 Ctrl+M 合并");
sheet.setValue(2, 0, "再次按 Ctrl+M 取消合并");
sheet.setColumnWidth(0, 180);

registerMergeShortcut(spread);
```

### 3.2 UI 交互流程

操作者与示例的交互路径为：

1. 打开页面，工作表 A 列显示三步操作提示 → 2. 鼠标拖选 A1:A2 两个单元格 → 3. 按下 `Ctrl+M`，选区合并为一个单元格 → 4. 再次按下 `Ctrl+M`，合并被取消、恢复为两个单元格 → 5. 可继续尝试三行整选、跨列选区等不同场景。

### 3.3 技术栈

| 库 / 资源 | 版本 | 作用 |
|------|------|------|
| `@grapecity-software/spread-sheets` | 19.0.3（CDN 引入） | SpreadJS 核心表格控件，提供工作簿、工作表、命令系统与合并单元格 API |
| `typescript` | ^4.1.2 | 本地依赖，被 SystemJS 用作浏览器端脚本转译器 |
| `systemjs` | ^0.19.22 | 浏览器端模块加载器，负责按 `systemjs.config.js` 的映射加载 ES Module |

示例采用 SystemJS 加载 ES Module 的方式组织代码，SpreadJS 各包均通过 CDN（`cdn.grapecity.com.cn`）按 19.0.3 版本统一引入，无需本地打包。

## 四、使用说明

### 4.1 运行方式

1. 在示例目录下安装依赖：

```bash
npm install
```

2. 由于 SpreadJS 通过 CDN 引入，需要启动一个本地静态服务（而非直接双击打开 HTML），例如：

```bash
npx http-server .
```

3. 浏览器访问 `http://localhost:8080`（端口以服务输出为准）。

### 4.2 操作步骤

1. 页面加载后，在空白区域拖选多个连续单元格（例如 A1:A2）。
2. 按下 `Ctrl+M`，观察所选单元格被合并为单个单元格。
3. 再次按下 `Ctrl+M`，合并被取消，单元格恢复原状。
4. 按 `Ctrl+Z` 撤销、`Ctrl+Y` 重做，验证合并/取消合并操作进入了撤销栈。
5. 尝试点击行号整行选中后按 `Ctrl+M`，验证整行选区也能正确合并。

## 五、功能特点

### 5.1 优点

- **交互高效**：将合并/取消合并收敛为单一快捷键，两种互斥操作根据选区状态自动切换，贴合 Excel 用户习惯。
- **撤销友好**：基于 CommandManager 事务机制实现，天然支持 Undo/Redo，不会破坏编辑历史。
- **健壮的边界处理**：对整行/整列选区做了归一化，对与合并区域相交的选区做了精确检测，避免异常合并或遗漏取消。
- **代码组织清晰**：快捷键注册封装为独立模块并被导出，可在其他工作簿中直接复用；批量操作配合 `suspendPaint`/`resumePaint` 保证了渲染性能。

### 5.2 局限性与扩展建议

- **合并方向固定**：只要选区内存在任何合并区域就执行"取消合并"。若用户希望保留某个合并区域、只合并其他单元格，现有逻辑无法区分，可进一步细化相交检测的粒度（例如仅当合并区域与选区完全重合时才取消）。
- **键位不可配置**：快捷键为写死的 `Ctrl+M`，与部分浏览器或输入法的快捷键可能存在冲突。可扩展为通过配置项或设置面板动态注册键位。
- **可扩展操作类型**：当前仅覆盖合并/取消合并，参考同一模式可继续扩展出"合并后保留值"（取左上角或拼接文本）、跨选中区域批量合并等命令。

## 六、关键代码片段

除 3.1 中展示的命令注册、合并切换与范围归一化外，矩形相交判断是支撑整个切换逻辑正确性的基础工具函数：

```javascript
/**
 * 判断两个单元格范围是否相交。
 */
function rangesIntersect(a, b) {
  const aLastRow = a.row + a.rowCount - 1;
  const aLastCol = a.col + a.colCount - 1;
  const bLastRow = b.row + b.rowCount - 1;
  const bLastCol = b.col + b.colCount - 1;

  return !(
    aLastRow < b.row ||
    bLastRow < a.row ||
    aLastCol < b.col ||
    bLastCol < a.col
  );
}
```

判断思路是：两个范围若不相交，则必然满足"一方完全位于另一方上方、下方、左侧或右侧"中的一种情形。将四种不相交的情形取反，即为相交条件。该判断同样适用于 `getSelections()` 返回的多选区与合并区域间的重叠计算。

## 七、总结

本示例展示了 SpreadJS 命令系统的完整使用范式：从 `CommandManager` 注册带快捷键的自定义命令，到用事务机制包装业务逻辑以获得撤销能力，再到合并单元格 API 与选区边界情况的处理，是一条可复用的"为 SpreadJS 添加键盘快捷操作"的路径。

开发者可从中学到：

1. `commandManager.register()` 的完整签名，以及如何将命令与 `Ctrl` 等修饰键组合绑定。
2. `canUndo`、`execute`、`startTransaction`/`endTransaction`/`undoTransaction` 在自定义命令中的分工与写法。
3. `addSpan`/`removeSpan` 实现合并与取消合并，以及 `getSpans` 结合相交算法检测重叠区域的方法。
4. 整行/整列选区（坐标为 -1）的识别与归一化处理。
5. `suspendPaint`/`resumePaint` 在批量修改场景下的性能优化实践。

该方案适合任何需要在 SpreadJS 中提供"类 Excel"快捷操作的产品，将自定义命令、快捷键与命令栈三者打通后，即可低成本扩展出更多编辑快捷方式。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
