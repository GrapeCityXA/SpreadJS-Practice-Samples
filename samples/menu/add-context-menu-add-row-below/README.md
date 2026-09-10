## 一、Demo 概述

本示例演示了如何通过自定义命令（Command）与扩展上下文菜单（ContextMenu），将 SpreadJS 行头右键菜单中的「插入行」行为由默认的**向上插入**改为**向下插入**。

在 Excel 与 SpreadJS 的默认行为中，通过行头右键插入的行总是出现在当前选中行的上方。而在实际业务中（如按序号逐条追加记录、在表尾继续填写数据），用户往往希望新行出现在当前行下方。本示例通过替换内置菜单项绑定的命令，在不改动 SpreadJS 源码的前提下实现了这一交互习惯。

## 二、解决的问题

- **插入方向与业务直觉不符**：默认「向上插入」在批量录入场景下会导致用户需要不断调整光标位置，本示例将插入位置改为当前行的下一行。
- **自定义操作需要支持撤销重做**：直接调用 `addRows` 修改表格会绕过命令系统，Ctrl+Z 无法回退。示例通过命令 + 事务的方式保证了撤销栈的正确性。
- **内置菜单难以定制**：SpreadJS 的右键菜单项由框架内部维护，示例通过继承 `ContextMenu` 并重写 `onOpenMenu` 钩子，在菜单显示前动态改写菜单项绑定的命令，属于官方推荐的扩展方式。

## 三、实现思路

整体思路分为三步：先注册一个「向下插入行」的自定义命令，再继承上下文菜单类并替换内置菜单项的命令名，最后将自定义菜单实例挂载到 workbook 上。

### 3.1 核心技术点

#### 3.1.1 注册自定义命令 insertRowsBelow

SpreadJS 的所有用户操作都应通过命令系统执行，这样才能被撤销栈正确记录。自定义命令需要实现 `execute(context, options, isUndo)` 方法，其中 `context` 为命令上下文（通常即 workbook 实例），`options` 中携带了触发命令时传入的参数。

```javascript
let insertRowsBelow = {
    canUndo: true,                          // 声明该命令可撤销
    name: "insertRowsBelow",
    execute: function (context, options, isUndo) {
        var Commands = GC.Spread.Sheets.Commands;
        if (isUndo) {
            // 撤销分支：回滚事务
            Commands.undoTransaction(context, options);
            return true;
        } else {
            Commands.startTransaction(context, options);
            var sheet = context.getSheetFromName(options.sheetName);
            sheet.suspendPaint();
            // 向下插入行
            if (options.selections && options.selections.length) {
                var row = options.selections[0].row + 1;      // 关键：起始行 +1
                var rowCount = options.selections[0].rowCount;
                sheet.addRows(row, rowCount);
            }
            sheet.resumePaint();
            Commands.endTransaction(context, options);
            return true;
        }
    }
};
```

几个要点：

- `canUndo: true` 让命令进入撤销栈，用户可通过 Ctrl+Z 或工具栏撤销。
- `startTransaction` / `endTransaction` 将 `addRows` 的修改打包为一个原子操作，避免撤销时出现「行插入了但样式没跟着走」之类的中间状态。
- `sheet.suspendPaint()` / `resumePaint()` 用于挂起与恢复重绘，避免在批量化修改过程中产生多余的渲染开销。
- `options.selections[0].row + 1` 是本示例实现「向下插入」的核心：把插入位置从当前行移动到当前行的下一行。`rowCount` 则保证多行选中时插入相同数量的行。

命令注册后即可被菜单、快捷键或代码调用：

```javascript
spread.commandManager().register("insertRowsBelow", insertRowsBelow);
```

#### 3.1.2 扩展右键菜单 ContextMenu

SpreadJS 允许通过继承 `GC.Spread.Sheets.ContextMenu.ContextMenu` 来定制右键菜单。这里使用原型继承的方式创建一个子类，并重写 `onOpenMenu` 钩子：

```javascript
function MyContextMenu() {}
MyContextMenu.prototype = new GC.Spread.Sheets.ContextMenu.ContextMenu(spread);

MyContextMenu.prototype.onOpenMenu = function (menuData, itemsDataForShown, hitInfo, spread) {
    itemsDataForShown.forEach(function (item, index) {
        if (item && item.name === "gc.spread.insertRows") {
            item.command = "insertRowsBelow";   // 替换内置菜单项绑定的命令
        }
    });
};

var contextMenu = new MyContextMenu();
spread.contextMenu = contextMenu;
```

`onOpenMenu` 的四个参数含义如下：

| 参数 | 说明 |
|------|------|
| `menuData` | 完整的菜单数据结构 |
| `itemsDataForShown` | **即将显示的**菜单项数组，可直接修改其中的属性来影响最终渲染 |
| `hitInfo` | 触发右键时的命中信息（区域、行列索引等） |
| `spread` | 当前 workbook 实例 |

由于 `itemsDataForShown` 是「即将显示」的菜单项集合，直接改写其中 `name === "gc.spread.insertRows"` 的菜单项，把它的 `command` 从内置命令换成 `insertRowsBelow`，就能在保留原有菜单文案、图标与排序的前提下改变其行为。

需要注意：`onOpenMenu` 中**不要**修改 `menuData`，它表示的是菜单的完整定义而非当前可见项，修改它可能在后续打开菜单时产生不一致。

### 3.2 UI 交互流程

加载页面 → 表格显示 1、2、4、5 五行数据与一行操作提示 → 点击行头选中第 2 行 → 在行头区域点击右键 → 在弹出的菜单中选择「插入」 → 新行出现在第 2 行下方（即第 3 行位置） → 按 Ctrl+Z 可撤销该次插入。

### 3.3 技术栈

| 依赖 | 版本 | 说明 |
|------|------|------|
| `@grapecity-software/spread-sheets` | 19.0.3 | SpreadJS 核心表格库（通过 CDN 引入） |
| `@grapecity-software/spread-sheets-resources-zh` | 19.0.3 | 中文资源包，用于右键菜单等内置文案的本地化 |
| SystemJS | ^0.19.22 | 模块加载器，负责解析 `import` 语句并按 `systemjs.config.js` 中的映射加载 CDN 资源 |
| TypeScript / plugin-typescript | ^4.1.2 / ^8.0.0 | SystemJS 的 TS 转译支持（本示例实际为纯 JS） |

## 四、使用说明

### 4.1 运行方式

```bash
# 1. 安装依赖（SystemJS 本体与转译插件）
npm install

# 2. 启动一个静态服务器（SystemJS 通过 http 加载模块，直接双击 index.html 会因 file:// 协议受限）
npx http-server . -p 8080
# 或使用 Python: python -m http.server 8080
```

浏览器访问 `http://localhost:8080/index.html`。SpreadJS 与中文资源包均从 `cdn.grapecity.com.cn` 加载，需要保证网络可访问该域名。

### 4.2 操作步骤

1. 打开页面后，A 列自上而下显示 `1`、`2`、提示文案、`4`、`5`。
2. 点击行头（最左侧的行号区域）选中第 2 行（值为 `2` 的那一行）。
3. 在该行行头上点击鼠标右键，弹出上下文菜单。
4. 选择菜单中的「插入」项。
5. 观察结果：空白新行出现在第 2 行与提示行之间，原第 3 行及之后的数据整体下移。
6. 按 `Ctrl+Z` 撤销，表格恢复为插入前的状态。

可以进一步验证：选中连续多行后执行插入，会一次性插入相同数量的行；在编辑状态下插入行后撤销，数据与样式应当同时回滚。

## 五、功能特点

### 5.1 优点

- **零侵入定制**：通过重写 `onOpenMenu` 钩子替换命令，无需修改 SpreadJS 源码，也不影响其他内置菜单项。
- **完整支持撤销重做**：基于命令系统与事务实现，符合 SpreadJS 的交互规范，撤销栈行为与内置功能一致。
- **扩展成本低**：整个示例的核心逻辑不足 40 行，且模式可复用——任何内置菜单项都可以用同样的方式挂接自定义命令。

### 5.2 局限性与扩展建议

- **只替换了「插入行」一项**：行头菜单中的其他插入类菜单项仍保持默认行为，若产品要求全部向下插入，需要按同样的方式逐一处理。
- **仅处理首个选区**：`options.selections[0]` 只取第一个选区，多选区场景下不会逐个插入。如需支持，可遍历 `options.selections` 并按行号倒序插入，避免前面的插入影响后续行索引。
- **没有「向上/向下」的用户选择**：当前实现把行为硬编码为向下插入。更灵活的做法是保留原菜单项，另新增一个自定义菜单项（在 `onOpenMenu` 中向 `itemsDataForShown` 追加对象，配置 `name`、`text`、`command`），让用户自行选择插入方向。
- **未保留原始命令名**：改写 `command` 后若需要调用原「向上插入」逻辑，应记录原始命令名而非直接覆盖。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
