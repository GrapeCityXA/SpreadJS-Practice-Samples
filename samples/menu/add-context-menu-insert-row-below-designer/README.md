## 一、Demo 概述

本示例演示了如何在 SpreadJS Designer（设计器）中扩展右键菜单，新增一个「向下插入行」命令。原生的插入行功能是在当前行**上方**插入，而实际业务中经常需要在选中行**下方**追加数据行，本示例通过 Designer 的 `config` 配置机制，将自定义命令挂载到行头右键菜单中，并保证该操作支持 `Ctrl+Z` 撤销。

示例基于 SpreadJS 19.0.3 的纯 JavaScript 版本，使用 SystemJS 作为模块加载器，页面直接嵌入完整的设计器组件（含 Ribbon 工具栏），适用于需要在设计器环境中补充 Excel 习惯操作（Excel 的右键菜单本身即提供"插入"选项）的场景。

## 二、解决的问题

- **补齐原生菜单缺失的操作**：SpreadJS 设计器默认的插入行命令是向上插入，无法直接满足"在选中行下方新增一行"的高频操作习惯。
- **自定义操作需要可撤销**：直接调用 `sheet.addRows()` 虽然能实现插入，但不会进入命令栈，用户无法通过 `Ctrl+Z` 恢复；必须将其封装为符合 SpreadJS 命令规范的 `Command`（命令）。
- **菜单项的按需显示**：插入行只在用户对**行头**（Row Header）右键时才有意义，需要控制菜单项的可见上下文，避免在单元格右键时出现无意义的选项。

## 三、实现思路

### 3.1 核心技术点

#### 技术点一：基于 `DefaultConfig` 扩展设计器配置

设计器的所有 UI 元素（Ribbon、右键菜单等）都由一个配置对象驱动。示例先深拷贝默认配置，再在其上做增量修改，避免污染全局的 `DefaultConfig`：

```javascript
// index.html -> src/app.js
let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))

// 在默认右键菜单数组的头部插入自定义命令名
config.contextMenu.unshift("insertRowBelow");

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", config)
```

`contextMenu` 是一个字符串数组，数组中的每一项对应 `commandMap` 中的一个键名。使用 `unshift` 可将菜单项置于右键菜单最顶部，便于用户快速发现。

#### 技术点二：在 `commandMap` 中声明菜单项

菜单项的显示文本、触发条件与执行逻辑集中在 `commandMap` 中定义：

```javascript
config.commandMap = {
    insertRowBelow: {
        text: "向下插入行",                 // 菜单显示文本
        commandName: "insertRowBelow",     // 命令名
        visibleContext: "ClickRowHeader",  // 仅在行头右键时可见
        execute: async (context, propertyName, fontItalicChecked) => {
            let spread = context.getWorkbook();
            // 转交给注册在 Spread 命令管理器上的具体命令执行
            spread.commandManager().execute({
                cmd: "insertRowBelowCmd"
            })
        }
    }
}
```

关键在于 `visibleContext` 字段：`"ClickRowHeader"` 表示该菜单项只在用户于行头区域点击右键时出现。如果希望在列头或单元格右键时显示，可分别改为 `"ClickColumnHeader"`、`"ClickCell"` 等上下文标识。

另外注意，`commandMap` 的 `execute` 回调接收的第一个参数是设计器的上下文对象，通过 `context.getWorkbook()` 可以拿到当前的设计器工作簿实例。

#### 技术点三：注册支持撤销的自定义命令

菜单项本身只负责"触发"，真正的业务逻辑通过 `commandManager().register()` 注册为一个标准命令：

```javascript
spread.commandManager().register("insertRowBelowCmd", {
    canUndo: true,   // 声明该命令支持撤销
    execute: function (context, options, isUndo) {
        let Commands = GC.Spread.Sheets.Commands;
        options.cmd = "insertRowBelowCmd";

        if (isUndo) {
            // 撤销分支：回滚事务
            Commands.undoTransaction(context, options);
            return true;
        } else {
            let sheet = spread.getActiveSheet();
            // 注意：需要在 options 中定义 sheetName，否则撤销行为可能无效
            options.sheetName = sheet.name();
            Commands.startTransaction(context, options);

            // 遍历所有选区，在每个选区的起始行下方插入对应行数
            let sels = sheet.getSelections();
            if (sels && sels.length > 0) {
                for (let i = 0; i < sels.length; i++) {
                    let sel = sels[i];
                    sheet.addRows(sel.row + 1, sel.rowCount);
                }
            }

            Commands.endTransaction(context, options);
            return true;
        }
    }
});
```

这段代码体现了 SpreadJS 自定义命令的三个必要约定：

| 约定 | 作用 |
|------|------|
| `options.cmd` | 命令标识，撤销栈依靠它定位对应的命令实现 |
| `options.sheetName` | 告知撤销机制操作发生在哪个工作表，缺少时可能导致撤销失效 |
| `startTransaction` / `endTransaction` | 将区间内的所有改动打包为一个原子操作，撤销时整体回滚 |
| `isUndo` 分支 | 撤销时调用 `undoTransaction` 回滚事务，不再重复执行业务逻辑 |

### 3.2 UI 交互流程

```
打开页面 → 在行头区域点击右键 → 右键菜单顶部出现「向下插入行」
   → 点击该项 → 选区下方插入同数量的空行 → 按 Ctrl+Z 可撤销插入
```

页面初始化时还预置了一行提示文本，引导用户到行头右键：

```javascript
sheet.setValue(2, 0, "⬅️请在行头右键点击，查看新增的菜单")
```

### 3.3 技术栈

| 依赖 | 版本 | 作用 |
|------|------|------|
| `@grapecity-software/spread-sheets` | 19.0.3 | 核心表格控件 |
| `@grapecity-software/spread-sheets-designer` | 19.0.3 | 设计器组件（Ribbon + 右键菜单） |
| `@grapecity-software/spread-sheets-designer-resources-en` | 19.0.3 | 设计器英文资源包 |
| `@grapecity-software/spread-excelio` / `-charts` / `-print` / `-pdf` / `-barcode` / `-shapes` / `-pivot-addon` / `-tablesheet` / `-languagepackages` | 19.0.3 | 设计器功能模块，按需引入以启用对应的 Ribbon 能力 |
| `systemjs` | ^0.19.22 | 浏览器端模块加载器，将裸模块名映射到 CDN 地址 |
| `typescript` + `plugin-typescript` | ^4.1.2 / ^8.0.0 | SystemJS 的 TS 转译插件（本示例为 JS，仅作为环境配置保留） |

所有 SpreadJS 相关模块均通过 `systemjs.config.js` 中的 `map` 字段映射到葡萄城 CDN，因此无需在本地安装 SpreadJS 包。

## 四、使用说明

### 4.1 运行方式

```bash
# 1. 安装依赖（systemjs、typescript 等加载器依赖）
npm install

# 2. 启动一个静态服务器（SystemJS 需要通过 HTTP 加载模块，file:// 协议会因跨域被拦截）
npx http-server -p 8080
```

然后在浏览器中访问 `http://localhost:8080/index.html`。

此外，页面需要在 `src/app.js` 顶部配置有效的 `GC.Spread.Sheets.Designer.LicenseKey` 与 `GC.Spread.Sheets.LicenseKey`，否则设计器会显示授权水印。

### 4.2 操作步骤

1. 打开页面后，等待设计器加载完成，A 列可见预置的 1、2、3、4 与一行提示文本。
2. 将鼠标移动到左侧**行号区域（行头）**，在任意行上点击右键。
3. 在右键菜单顶部找到「向下插入行」并点击。
4. 观察：在选中行下方插入了新的空行。选中多行时，会在该选区起始行的下方插入与选区行数相同的行数。
5. 按 `Ctrl+Z`（或点击 Ribbon 上的撤销按钮），验证插入操作可被完整撤销。
6. 对照测试：在**单元格区域**点击右键，确认「向下插入行」不会出现（受 `visibleContext` 控制）。

## 五、功能特点

### 5.1 优点

- **非侵入式扩展**：通过深拷贝 `DefaultConfig` 后再修改的方式定制设计器，不修改 SpreadJS 源码，升级版本时冲突小。
- **符合撤销栈规范**：使用 `startTransaction` / `endTransaction` 与 `undoTransaction` 实现命令，使自定义操作与设计器内置操作在撤销行为上保持一致。
- **上下文感知**：借助 `visibleContext` 精确控制菜单项的出现时机，避免菜单污染。
- **职责分离清晰**：`commandMap` 负责 UI 声明，`commandManager().register()` 负责业务逻辑，两者通过命令名解耦。

### 5.2 局限性与扩展建议

- **多选区插入位置不精确**：`sheet.addRows(sel.row + 1, sel.rowCount)` 是在选区**起始行**的下方插入，而非整个选区的下方。若用户选中了第 1~3 行，新行会插入到第 2 行位置。若需严格"插入到选区末尾之后"，应改为 `sheet.addRows(sel.row + sel.rowCount, sel.rowCount)`。此外，循环插入多个选区时，前面的插入会导致后续选区的行号偏移，需要补充行号修正逻辑。
- **配置合并方式**：示例中 `config.commandMap = { ... }` 是整体赋值，会覆盖默认配置中的 `commandMap`。若需保留设计器内置的命令定义，建议改为按属性合并，例如 `config.commandMap.insertRowBelow = { ... }`。
- **依赖闭包变量**：命令实现内部直接引用了外层作用域的 `spread` 变量，而非使用 `execute(context, ...)` 传入的 `context`。多工作簿场景下建议统一通过 `context` 获取实例。
- **遗留调试语句**：代码中保留了两处 `debugger` 语句（位于 `commandMap.execute` 与命令实现的 `execute` 中），上线前应移除。
- **可扩展方向**：同样的模式可直接复制出「向上插入行」「向右插入列」「在下方插入列」「复制当前行到下方」等菜单项，只需更换菜单文本、`visibleContext`（列操作用 `"ClickColumnHeader"`）以及命令实现中的 `addRows` / `addColumns` 调用。

## 六、关键代码片段

最核心的两段代码（`commandMap` 声明与 `insertRowBelowCmd` 命令注册）已在上文"实现思路"中完整给出。此处补充菜单项的挂载与设计器实例化部分：

```javascript
// 1. 深拷贝默认配置，避免修改全局 DefaultConfig
let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))

// 2. 声明自定义菜单项（见 3.1 技术点二）
config.commandMap = { insertRowBelow: { /* ... */ } }

// 3. 将命令名插入右键菜单数组首位
config.contextMenu.unshift("insertRowBelow");

// 4. 实例化设计器，第二个参数即为定制后的配置
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", config)

// 5. 获取工作簿与活动工作表，写入演示数据
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()
sheet.setValue(0, 0, 1)
sheet.setValue(1, 0, 2)
sheet.setValue(2, 0, "⬅️请在行头右键点击，查看新增的菜单")
```

`index.html` 中只需提供一个容器并启动 SystemJS 的模块加载：

```html




```

## 七、总结

本示例代码量小（核心逻辑约 60 行），但完整覆盖了 SpreadJS 设计器二次开发中最常见的一类需求：**在既有 UI 上安全地增加自定义命令**。其学习价值集中在以下三点：

1. **设计器配置的定制范式**：`DefaultConfig` 深拷贝 → 增量修改 → 传入 `Designer` 构造函数，这是所有设计器定制（自定义 Ribbon 按钮、隐藏内置菜单、调整面板布局）的通用起点。
2. **SpreadJS 命令系统的完整写法**：`canUndo`、`options.cmd`、`options.sheetName`、`startTransaction` / `endTransaction` / `undoTransaction` 构成了自定义命令支持撤销的最小完整集合，是开发任何"需要进入撤销栈"的功能时必须掌握的模板。
3. **`visibleContext` 的上下文控制**：理解菜单项并非全局可见，而是由右键点击的位置决定，这为构建贴合业务场景的上下文菜单提供了基础。

该方案适用于已集成 SpreadJS Designer、需要按业务习惯微调交互的在线表格产品；扩展时只需沿用同一套模式追加 `commandMap` 条目与对应的命令注册即可，无需改动设计器本身的代码。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
