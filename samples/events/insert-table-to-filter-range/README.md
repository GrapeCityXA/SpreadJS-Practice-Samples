## 一、Demo 概述

本示例基于 SpreadJS 设计器（SpreadJS V19.0.3），演示如何扩展设计器内置的 `insertTable` 命令，使“插入表格（Table）”功能在已设置行筛选器（`HideRowFilter`）的数据区域上也能正常使用。默认情况下，当活动选区位于带筛选的区域内时，设计器会因命令 `enableContext` 中包含 `filterSelected` 判断而禁用“插入表格”按钮；即使绕过禁用强行插入，新建表格与原筛选器也会发生冲突。

补丁从命令的启用条件与执行流程两个层面入手：一方面移除 `enableContext` 中对筛选选区的限制，让按钮恢复可用；另一方面在“插入表格”对话框点击“确定”时自动清除区域上的筛选器，保证表格能够顺利创建。该方案适用于“先对明细数据做筛选定位，再将其一键转换为结构化表格”的业务场景。

## 二、解决的问题

- **默认限制**：带筛选的数据区域无法直接插入表格。设计器通过 `enableContext` 中的 `filterSelected` 条件将“插入表格”按钮置灰，用户必须先手动清除筛选器，操作链被中断。
- **功能冲突**：表格（Table）自带筛选行，若与区域上已有的 `HideRowFilter` 同时存在会互相冲突，因此不能只简单放开按钮禁用。
- **扩展诉求**：在尽量不改动设计器整体配置的前提下，仅对某一个内置命令做定制，并保留设计器原生的“插入表格”对话框与交互方式。

上述问题常见于报表整理、数据清洗等场景：用户先用筛选器定位重点关注的行（例如“华东”大区、数量较大的记录），随后希望把这些行套用表格样式、开启表格自动汇总与结构化引用。

## 三、实现思路

整体思路是先取得设计器内置的 `insertTable` 命令，修改其 `enableContext` 放开“筛选选区”限制，再重写 `execute` 在用户确认插入前移除筛选器；最后把补丁后的命令注册回设计器配置的 `commandMap`。

### 3.1 核心技术点

#### 3.1.1 命令补丁与注册

`patchInsertTableCommand()` 通过 `GC.Spread.Sheets.Designer.getCommand("insertTable")` 取得内置命令，在 `app.js` 中把补丁后的命令挂到设计器配置的 `commandMap.insertTable` 上，从而覆盖默认命令：

```javascript
import { patchInsertTableCommand } from "./insert-table-patch.js";

const Designer = GC.Spread.Sheets.Designer;

// 获取并修补 insertTable 命令：允许在筛选区域插入表格
const insertTableCommand = patchInsertTableCommand();

// 深拷贝默认配置，避免直接修改全局默认配置对象
const designerConfig = JSON.parse(JSON.stringify(Designer.DefaultConfig));

// 将修改后的 insertTable 命令注册到 commandMap
designerConfig.commandMap = designerConfig.commandMap || {};
if (insertTableCommand) {
  designerConfig.commandMap.insertTable = insertTableCommand;
}

const designer = new Designer.Designer("gc-designer-container", designerConfig);
const spread = designer.getWorkbook();
```

这样其他功能仍走设计器默认配置，只替换了目标命令。

#### 3.1.2 修改 enableContext，让按钮在筛选区域可用

`enableContext` 是设计器用来判断命令按钮是否可用的“能力表达式”，只有当整条表达式求值为真时按钮才可点击。默认表达式里含有 `filterSelected`（当前选区被筛选），此时 `!filterSelected` 为 false，按钮被禁用。补丁删除了这一条件：

```javascript
// 修改 enableContext，移除对 filterSelected 的检查（保留 AllowInsertTable）
insertTableCommand.enableContext =
  "AllowInsertTable && !IsActualProtected && !ChartSelected && !ShapeSelected && " +
  "!FloatingObjectSelected && !pictureSelected && !SlicerSelected && !SelectedOrEditComments";
```

`AllowInsertTable` 等其余能力条件均被保留，因此只是对“筛选选区”这一限制放行。

#### 3.1.3 重写 execute，在确认插入时自动移除筛选器

放开按钮后，插入表格仍会与筛选器冲突，因此补丁重写了 `execute`。先判断当前工作表是否有 `rowFilter`；如果有，则用 `MutationObserver` 监听 `document.body` 下动态新增的节点。设计器弹出“创建表”对话框属于动态 DOM 变化，会在此处被捕获，回调中定位对话框及主按钮并绑定一次性点击监听：

```javascript
const observer = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    mutation.addedNodes.forEach(function (node) {
      if (node.nodeType === 1) {
        // 在新增节点中查找设计器对话框
        const dialog = node.classList?.contains("gc-designer-dialog")
          ? node
          : node.querySelector?.(".gc-designer-dialog");
        if (dialog) {
          const okButton = dialog.querySelector(
            ".gc-designer-dialog-button.gc-designer-dialog-button-primary"
          );
          if (okButton && !okButton.dataset.filterHandled) {
            okButton.dataset.filterHandled = "true";
            // 用户点击“确定”按钮时，先移除 filter，避免与新建表格冲突
            okButton.addEventListener(
              "click",
              function () {
                if (sheet.rowFilter()) {
                  sheet.rowFilter(null);
                }
              },
              { once: true }
            );
            observer.disconnect();
          }
        }
      }
    });
  });
});

// 观察 body 下的节点变化（对话框由设计器动态创建）
observer.observe(document.body, { childList: true, subtree: true });

// 超时自动断开，防止观察器长期挂载造成内存泄漏
setTimeout(function () {
  observer.disconnect();
}, 10000);
```

随后补丁调用保存下来的 `originalExecute.call(this, context, propertyName, args)` 打开原生“创建表”对话框。若当前工作表没有筛选器，则不建立观察器，直接走原始执行流程。

`okButton.dataset.filterHandled` 作为防重标记，配合 `{ once: true }` 保证“确定”按钮只被处理一次。

#### 3.1.4 准备带筛选器的示例数据

为了便于直接体验，`app.js` 在活动工作表写入了产品销量明细，添加表头样式，并为数据区域绑定了一个 `HideRowFilter`：

```javascript
const headers = ["产品", "地区", "数量", "金额"];
headers.forEach(function (header, col) {
  sheet.setValue(0, col, header);
});
sheet.setArray(1, 0, rows);

// 为数据区域添加筛选器，验证在筛选区域上插入表格的功能
const filter = new GC.Spread.Sheets.Filter.HideRowFilter(
  new GC.Spread.Sheets.Range(1, 0, rows.length + 1, headers.length)
);
sheet.rowFilter(filter);
```

此外还在 F 列写入了操作提示文案（“请选择 A1:D7，并点击工具栏的‘插入’-‘表格’”），引导使用者完成验证。

### 3.2 UI 交互流程

打开示例页 → 工作表中已填充示例数据并带有筛选状态 → 框选 `A1:D7` → 点击工具栏「插入」→「表格」→ 在弹出的“创建表”对话框中确认区域 → 点击「确定」→ 补丁自动清除区域筛选器 → 数据区域被转换为表格，表头出现表格筛选按钮。

### 3.3 技术栈

| 库 | 作用 |
| --- | --- |
| SpreadJS 19.0.3（spread-sheets 等） | 电子表格核心，提供表格、筛选等能力 |
| spread-sheets-designer / designer-resources-cn | 设计器主体及中文界面资源 |
| spread-sheets-tablesheet / spread-excelio / charts 等 | 配套扩展模块（表格、导入导出、图表等） |
| SystemJS 0.19 | 浏览器端模块加载器 |
| TypeScript（仅作 transpiler） | 由 SystemJS 调用，将 ES 模块源码转译为可运行脚本 |

## 四、使用说明

### 4.1 运行方式

示例只需一个静态文件服务器即可运行（`index.html` 经 SystemJS 加载 `src/app.js`，SpreadJS 相关库通过 GrapeCity CDN 引入）：

```bash
npm install        # 安装本地依赖 systemjs、typescript
npx http-server .  # 或使用任意静态文件服务器
```

浏览器访问 `http://localhost:xxxx` 即可。由于依赖 GrapeCity CDN，运行环境需能访问外网；代码中内置的 LicenseKey 为官方演示授权，实际项目中应替换为自有授权码。

### 4.2 操作步骤

1. 打开页面，等待设计器加载完成。Sheet1 中应能看到带样式的表头、示例数据、数据区域上的筛选状态以及 F 列的操作提示。
2. 框选 `A1:D7`，切换至「插入」功能区，点击「表格」。
3. 在弹出的“创建表”对话框中核对数据区域，点击「确定」。
4. 观察结果：区域筛选器被自动清除，数据被成功转换为表格。
5. 对照验证：若在不加载该补丁的默认设计器中重复步骤 2，可看到「表格」按钮处于禁用状态——这正是本补丁要解决的问题。

## 五、功能特点

### 5.1 优点

- 不改动 SpreadJS 产品文件，仅通过设计器命令扩展机制实现，集成成本低、易于维护。
- 复用设计器原生的“创建表”对话框与交互，用户无需学习新的操作入口。
- 在用户确认插入时自动清理冲突的筛选器，避免“忘记清除筛选导致插入失败”的体验问题。
- 细节考虑较周全：`dataset` 防重标记、`{ once: true }` 一次性监听、10 秒超时自动断开 `MutationObserver`，有效避免内存泄漏。

### 5.2 局限性与扩展建议

- **与版本耦合较紧**：`enableContext` 中的上下文属性名以及设计器对话框的 DOM 结构/类名（如 `.gc-designer-dialog`）都依赖具体版本，SpreadJS 升级后需要回归测试。
- **会丢失筛选状态**：补丁以直接移除 `rowFilter` 换取插入成功；若业务需要插入表格后仍保留原筛选条件，需自行实现“保存筛选 → 插入 → 恢复筛选”。
- **作用于共享命令实例**：补丁直接改写 `getCommand()` 返回的命令对象并注册回 `commandMap`，会影响该命令的共享实例；多设计器并存、动态切换配置等复杂场景需评估影响范围。

扩展方向：可将“移除筛选器”改为“保存并恢复”，建表后重新应用原筛选条件；也可把此“命令补丁”模式推广到其他受 `enableContext` 约束的设计器命令上。

## 六、关键代码片段

`insert-table-patch.js` 是整个示例的核心，它将上述技术点集中在一个补丁函数中，完整逻辑如下：

```javascript
import * as GC from "@grapecity-software/spread-sheets";

/**
 * 修改设计器的 insertTable 命令，让筛选区域也可以插入表格：
 * 1. 移除 enableContext 中对 filterSelected 的检查（保留 AllowInsertTable）；
 * 2. 重写 execute：打开“插入表格”对话框时用 MutationObserver 监听
 *    对话框出现，并在用户点击“确定”时移除区域上的筛选器。
 */
export function patchInsertTableCommand() {
  const insertTableCommand = GC.Spread.Sheets.Designer.getCommand("insertTable");
  if (!insertTableCommand) {
    return null;
  }

  const originalExecute = insertTableCommand.execute;

  // 重写 execute：有筛选器时监听对话框，确定时先移除筛选器
  insertTableCommand.execute = async function (context, propertyName, args) {
    const sheet = context.Spread.getActiveSheet();
    const hasFilter = !!sheet.rowFilter();

    if (hasFilter) {
      const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          mutation.addedNodes.forEach(function (node) {
            if (node.nodeType === 1) {
              const dialog = node.classList?.contains("gc-designer-dialog")
                ? node
                : node.querySelector?.(".gc-designer-dialog");
              if (dialog) {
                const okButton = dialog.querySelector(
                  ".gc-designer-dialog-button.gc-designer-dialog-button-primary"
                );
                if (okButton && !okButton.dataset.filterHandled) {
                  okButton.dataset.filterHandled = "true";
                  okButton.addEventListener(
                    "click",
                    function () {
                      // 用户点击确定按钮时，移除 filter
                      if (sheet.rowFilter()) {
                        sheet.rowFilter(null);
                      }
                    },
                    { once: true }
                  );
                  observer.disconnect();
                }
              }
            }
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // 设置超时自动断开（防止内存泄漏）
      setTimeout(function () {
        observer.disconnect();
      }, 10000);
    }

    // 执行原始的创建 table 逻辑（打开对话框）
    return originalExecute.call(this, context, propertyName, args);
  };

  // 修改 enableContext，移除对 filterSelected 的检查（保留 AllowInsertTable）
  insertTableCommand.enableContext =
    "AllowInsertTable && !IsActualProtected && !ChartSelected && !ShapeSelected && " +
    "!FloatingObjectSelected && !pictureSelected && !SlicerSelected && !SelectedOrEditComments";

  return insertTableCommand;
}
```

## 七、总结

本示例演示了“扩展 SpreadJS 设计器内置命令”的完整套路，开发者可以从中学习到：

- 通过 `commandMap` 覆盖设计器内置命令，在不影响整体配置的前提下实现定制。
- 理解 `enableContext` 能力表达式如何控制命令按钮的可用性，以及如何精确“放开”某一项限制。
- 使用 `MutationObserver` 感知设计器动态创建的对话框 DOM，在原生交互流程中安全地插入自定义逻辑。
- 认识表格（Table）与行筛选器（`HideRowFilter`）之间的关系，以及二者共存时的冲突处理策略。

该方案适合需要深度定制设计器行为的场景，示例中“命令补丁 + DOM 观察”的模式具有良好的可复用性，可举一反三地应用到其他默认受限命令的扩展上。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
