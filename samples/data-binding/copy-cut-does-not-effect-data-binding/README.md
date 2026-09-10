## 一、Demo 概述

本示例演示了如何在 SpreadJS 设计器（Designer）中，使单元格在执行**复制 / 剪切 / 粘贴**操作后仍能保持原有的数据绑定关系。示例基于 SpreadJS v19.0.3，使用 `CellBindingSource` 将工作表第 1 行单元格与一个数据源对象建立字段级绑定，随后通过监听剪贴板事件，在粘贴前后自动保存并恢复目标区域（及剪切时的源区域）的绑定路径（binding path）。

该功能的典型应用场景是数据录入与编辑类业务系统：用户在已绑定数据源的表格区域中自由地复制、剪切、粘贴数据时，既希望享受与 Excel 一致的原生剪贴板体验，又要求单元格与后台数据源之间的绑定关系不被破坏，从而保证后续的数据回写与展示正常。

## 二、解决的问题

- **复制粘贴会覆盖目标单元格的绑定路径。** 默认情况下，将一段内容粘贴到已设置字段绑定的单元格时，粘贴会用源单元格的内容整体覆盖目标单元格，连带清空其绑定路径，导致该单元格与数据源失去关联。此后单元格不再随数据源刷新，也不再参与数据回写。

- **剪切操作会同时破坏源区域与目标区域的绑定。** 剪切比复制多一个"清空源区域"的动作，粘贴结束后源区域虽然内容被移除，但其绑定路径同样丢失；若目标区域原本存在绑定，也会被一并覆盖，形成"两头都丢"的问题。

- **需要在保留原生剪贴板交互的前提下修复。** 不能简单地禁止粘贴或要求用户手动重新设置绑定，必须通过事件机制在不改动 SpreadJS 内部粘贴逻辑的前提下自动完成绑定关系的维护，使修复对用户透明。

## 三、实现思路

### 3.1 核心技术点

#### 技术点 1：在粘贴前后事件中"快照—还原"目标区域绑定路径

SpreadJS 提供了成对的剪贴板事件：`ClipboardPasting`（粘贴前触发）与 `ClipboardPasted`（粘贴完成后触发）。示例利用 `ClipboardPasting` 在粘贴尚未发生时读取目标区域每个单元格原有的绑定路径并暂存；待 `ClipboardPasted` 触发后，再将这些绑定路径逐一写回单元格，从而抵消粘贴对绑定造成的破坏。

```javascript
// 粘贴前：遍历目标区域，暂存每个单元格原有的绑定路径
spread.bind(Events.ClipboardPasting, function (sender, args) {
  targetBindingPaths = [];
  sourceBindingPaths = [];

  const sheet = args.sheet;
  const { row, col, rowCount, colCount } = args.cellRange;

  // 1. 保存目标区域的绑定路径
  for (let i = row; i < row + rowCount; i++) {
    for (let j = col; j < col + colCount; j++) {
      targetBindingPaths.push({
        row: i,
        col: j,
        bindingPath: sheet.getBindingPath(i, j),
      });
    }
  }
  // ...
});
```

```javascript
// 粘贴后：恢复目标区域原有的绑定路径
spread.bind(Events.ClipboardPasted, function (sender, args) {
  const sheet = args.sheet;
  spread.suspendPaint();

  // 2. 恢复目标区域原本的绑定路径
  for (const item of targetBindingPaths) {
    let value = sheet.getValue(item.row, item.col);
    sheet.setBindingPath(item.row, item.col, item.bindingPath);
    sheet.setValue(item.row, item.col, value);
  }

  spread.resumePaint();
});
```

这里通过 `args.cellRange` 拿到将要被粘贴覆盖的区域范围，用 `sheet.getBindingPath(row, col)` 逐格读取绑定路径并记录行列坐标，属于典型的"快照"思路。还原时使用行列坐标而非区域对象，是因为粘贴完成后区域信息可能已发生变化，坐标快照更为可靠。

#### 技术点 2：通过 `isCutting` 识别剪切操作，额外恢复源区域绑定

剪切的特征在于粘贴结束后源区域内容会被清空。事件参数中的 `args.isCutting` 用于区分复制与剪切；当为剪切时，`args.fromSheet` 与 `args.fromRange` 携带源区域信息。示例据此额外遍历源区域，把源单元格的绑定路径一并暂存，并在粘贴后恢复，保证"剪走"的单元格在内容被清空后仍然保留绑定身份。

```javascript
// 粘贴前：如果是剪切操作，还需保存源区域的绑定路径
if (args.isCutting && args.fromSheet && args.fromRange) {
  const fromSheet = args.fromSheet;
  const fromRange = args.fromRange;
  for (let i = fromRange.row; i < fromRange.row + fromRange.rowCount; i++) {
    for (
      let j = fromRange.col;
      j < fromRange.col + fromRange.colCount;
      j++
    ) {
      sourceBindingPaths.push({
        row: i,
        col: j,
        bindingPath: fromSheet.getBindingPath(i, j),
      });
    }
  }
}
```

```javascript
// 粘贴后：如果是剪切操作，恢复源区域原本的绑定路径
if (args.isCutting) {
  for (const item of sourceBindingPaths) {
    sheet.setBindingPath(item.row, item.col, item.bindingPath);
  }
}
```

#### 技术点 3：恢复绑定后回填粘贴值，避免绑定刷新覆盖粘贴内容

目标区域恢复绑定路径时有一个细节值得注意：单元格重新建立绑定后，其值可能被数据源重新驱动刷新，从而覆盖刚粘贴进来的内容。因此代码按"取值 → 恢复绑定路径 → 写回值"的顺序执行，先取出粘贴后的新值暂存，恢复绑定后再把该值写回单元格，使"新粘贴的内容"与"保留的绑定关系"两者兼得。

```javascript
for (const item of targetBindingPaths) {
  let value = sheet.getValue(item.row, item.col); // 先暂存粘贴后的值
  sheet.setBindingPath(item.row, item.col, item.bindingPath); // 再恢复绑定路径
  sheet.setValue(item.row, item.col, value); // 最后写回粘贴的值
}
```

此外，整段恢复逻辑包裹在 `spread.suspendPaint()` 与 `spread.resumePaint()` 之间。当粘贴区域较大、涉及较多单元格时，批量修改绑定路径会触发多次重绘；挂起绘制可以将这些操作合并为一次渲染，避免闪烁并提升性能。事件处理结束时清空两个暂存数组，确保下一次操作从干净状态开始。

### 3.2 UI 交互流程

页面加载准备示例数据 → 选中绑定了字段的 A2:D2 区域 → 执行复制（Ctrl+C）或剪切（Ctrl+X）→ 移动到其他区域粘贴（Ctrl+V）→ 点击设计器功能区「数据」选项卡中的工作表绑定入口 → 确认原区域与新区域的绑定路径均未改变。

### 3.3 技术栈

- **SpreadJS v19.0.3**：核心表格控件，通过官方 CDN 引入 `spread-sheets`、`spread-sheets-designer`、`spread-excelio` 等系列模块
- **SpreadJS 设计器**：以 `Designer.DefaultConfig` 为默认配置，在页面容器中创建完整设计器界面，含中文语言包
- **SystemJS + TypeScript**：浏览器端动态加载与模块转译，`src/` 下的 ESM 源码无需预编译即可运行
- 纯前端实现，无后端与构建工具参与

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

依赖仅包含 SystemJS、TypeScript 与 plugin-typescript。由于页面通过 SystemJS 从 CDN 加载 SpreadJS 各模块，需要在本地静态服务器环境下访问（直接以 `file://` 打开会受到浏览器模块加载限制）。进入示例根目录后，任选其一启动即可：

```bash
npx serve .
# 或
npx http-server .
```

然后在浏览器中打开服务地址，例如 `http://localhost:3000/index.html`。

### 4.2 操作步骤

1. 打开页面后，工作表第 0 行为标题行，第 1 行四个单元格已通过 `setBindingPath` 绑定到数据源对象（姓名、部门、年龄、城市）对应的字段。
2. 选中 A2:D2（绑定行），执行复制（Ctrl+C）或剪切（Ctrl+X）。
3. 移动到下方空白区域（如第 4 行附近），执行粘贴（Ctrl+V）。
4. 按照单元格 A5 中的文字提示，点击设计器上方的「数据」选项卡中的工作表绑定入口，检查数据绑定路径是否发生改变。
5. 可重复上述步骤多次，验证无论复制还是剪切，粘贴后目标单元格仍保留原绑定路径，绑定关系完好。

## 五、功能特点

### 5.1 优点

- **无侵入式设计**：不修改 SpreadJS 任何内部行为，仅通过对外暴露的剪贴板事件做增强，逻辑收敛在独立的 `binding-preserve.js` 模块中，通过 `installBindingPreserve(spread)` 一行代码即可安装。
- **复制与剪切场景全覆盖**：通过 `isCutting` 分支同时处理目标区域与源区域的绑定恢复，避免剪切场景下"源区域绑定丢失"的遗漏。
- **保留原生剪贴板体验**：快捷键、右键菜单等原生交互全部照常生效，用户无感知，符合 Excel 使用习惯。
- **可复用、易扩展**：功能以函数形式封装，与具体业务解耦，可方便地移植到其他绑定场景或封装为通用工具。

### 5.2 局限性与扩展建议

- **仅覆盖剪贴板粘贴路径**：拖拽填充、自动填充等其它改写单元格内容的操作仍可能破坏绑定路径，如需覆盖可参照同样的事件思路扩展。
- **跨工作表剪切未特殊处理**：当前实现假设剪切与粘贴发生在同一工作表，恢复源区域绑定时统一写回粘贴目标 sheet；若存在跨 sheet 剪切需求，应依据暂存时记录的源 sheet 对象定向恢复。
- **逐格恢复在大区域下存在性能开销**：代码已用 `suspendPaint/resumePaint` 缓解渲染压力，若粘贴区域极大，可进一步考虑按"绑定路径是否相同"分组合并操作。

## 六、关键代码片段

以下为核心模块 `binding-preserve.js` 的完整实现，集中体现了"事件快照—还原"的核心思路：

```javascript
export function installBindingPreserve(spread) {
  // 保存粘贴前源区域和目标区域的绑定路径
  let sourceBindingPaths = [];
  let targetBindingPaths = [];

  // 粘贴前：保存源区域和目标区域已有的绑定路径
  spread.bind(Events.ClipboardPasting, function (sender, args) {
    targetBindingPaths = [];
    sourceBindingPaths = [];

    const sheet = args.sheet;
    const { row, col, rowCount, colCount } = args.cellRange;

    // 1. 保存目标区域的绑定路径
    for (let i = row; i < row + rowCount; i++) {
      for (let j = col; j < col + colCount; j++) {
        targetBindingPaths.push({
          row: i,
          col: j,
          bindingPath: sheet.getBindingPath(i, j),
        });
      }
    }

    // 2. 如果是剪切操作，还要保存源区域的绑定路径
    if (args.isCutting && args.fromSheet && args.fromRange) {
      const fromSheet = args.fromSheet;
      const fromRange = args.fromRange;
      for (let i = fromRange.row; i < fromRange.row + fromRange.rowCount; i++) {
        for (
          let j = fromRange.col;
          j < fromRange.col + fromRange.colCount;
          j++
        ) {
          sourceBindingPaths.push({
            row: i,
            col: j,
            bindingPath: fromSheet.getBindingPath(i, j),
          });
        }
      }
    }
  });

  // 粘贴后：恢复源区域和目标区域原本的绑定路径
  spread.bind(Events.ClipboardPasted, function (sender, args) {
    const sheet = args.sheet;
    spread.suspendPaint();

    // 1. 如果是剪切操作，恢复源区域原本的绑定路径
    if (args.isCutting) {
      for (const item of sourceBindingPaths) {
        sheet.setBindingPath(item.row, item.col, item.bindingPath);
      }
    }

    // 2. 恢复目标区域原本的绑定路径，并回填粘贴后的值
    for (const item of targetBindingPaths) {
      let value = sheet.getValue(item.row, item.col);
      sheet.setBindingPath(item.row, item.col, item.bindingPath);
      sheet.setValue(item.row, item.col, value);
    }

    spread.resumePaint();
    targetBindingPaths = [];
    sourceBindingPaths = [];
  });
}
```

## 七、总结

本示例是"通过事件扩展增强表格默认行为"的一个典型范本。开发者可以从中学习到：

1. **剪贴板事件对的使用**：`ClipboardPasting` 与 `ClipboardPasted` 一前一后触发，是"在默认操作前后注入逻辑"的标准切入点；事件参数 `cellRange`、`isCutting`、`fromSheet`、`fromRange` 提供了判断与定位所需的信息。
2. **单元格级数据绑定的维护方式**：`getBindingPath` 与 `setBindingPath` 用于读取和设置单元格绑定路径，配合 `CellBindingSource` 与 `setDataSource` 构成完整的数据绑定链路。
3. **快照—还原的通用设计模式**：在状态可能被外部操作改写前先记录关键信息，操作完成后再恢复，可用于处理拖拽、填充等各类场景。
4. **绘制挂起与恢复**：`suspendPaint` / `resumePaint` 批量合并 UI 更新，是批量改动单元格时的性能优化手段。

该方案在数据绑定类表格应用中具有较强的通用性，凡涉及用户自由编辑且需保持数据源同步的场景均可直接复用或按需扩展，是理解 SpreadJS 数据绑定与事件机制的优质入门示例。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
