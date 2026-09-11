## 一、Demo 概述

本示例演示了如何在 SpreadJS 中实现智能粘贴功能：当工作表处于保护状态时，允许用户向未锁定的单元格粘贴数据，同时自动跳过被保护的单元格，避免触发保护警告弹窗。这种机制通过拦截粘贴命令和监听剪贴板事件实现，在粘贴过程中临时解除保护，粘贴完成后恢复被锁定单元格的原始值和锁定状态。

该方案适用于需要部分区域可编辑、部分区域受保护的表格场景，例如数据录入模板、财务报表等。

## 二、解决的问题

* **避免保护冲突**：在工作表保护状态下，用户粘贴数据到锁定单元格时会触发错误提示，影响用户体验。本示例通过智能识别单元格锁定状态，自动跳过被保护区域，实现无感知粘贴。
* **灵活的区域保护**：允许开发者设置特定行、列或单元格为可编辑状态（未锁定），其他区域保持保护，满足复杂的权限控制需求。
* **数据完整性保护**：确保被保护单元格的数据不会因粘贴操作而被意外覆盖，同时保持未锁定区域的正常编辑功能。

## 三、实现思路

### 3.1 工作表保护与单元格锁定配置

首先启用工作表保护，并设置特定行和列为未锁定状态：

```javascript
var sheet = spread.getActiveSheet();
sheet.options.isProtected = true;

// 第7、8行未锁定（粉色背景标识）
sheet.getCell(6, -1).locked(false).backColor("pink");
sheet.getCell(7, -1).locked(false).backColor("pink");

// 第5、6列未锁定
sheet.getCell(-1, 4).locked(false).backColor("pink");
sheet.getCell(-1, 5).locked(false).backColor("pink");
```

通过 `getCell(row, -1)` 设置整行属性，`getCell(-1, col)` 设置整列属性。`locked(false)` 标记为未锁定，`backColor("pink")` 提供视觉提示。

### 3.2 拦截粘贴命令并临时解除保护

重写 `paste` 命令的 `execute` 方法，在粘贴前临时解除工作表保护：

```javascript
let pasteCommand = spread.commandManager().getCommand("paste");
let oldExecute = pasteCommand.execute;
pasteCommand.execute = function (context, propertyName, args) {
    let sheet = context.getActiveSheet();
    if (!sheet.isEditing()) {
        sheet.options.isProtected = false;
    }
    oldExecute.call(this, context, propertyName, args);
};
```

这里通过 `commandManager()` 获取粘贴命令对象，保存原始 `execute` 方法后进行包装。在非编辑状态下临时关闭保护，允许粘贴操作执行。

### 3.3 粘贴前记录单元格状态

监听 `ClipboardPasting` 事件，在粘贴前保存目标区域所有单元格的原始状态：

```javascript
let cells;
sheet.bind(GC.Spread.Sheets.Events.ClipboardPasting, function (sender, args) {
    cells = [];
    let { row, col, rowCount, colCount } = args.cellRange;
    for (let r = row; r < row + rowCount; r++) {
        for (let c = col; c < col + colCount; c++) {
            let cell = sheet.getCell(r, c);
            if (cell == null) {
                continue;
            }
            cells.push({
                row: cell.row,
                col: cell.col,
                value: cell.value(),
                locked: cell.locked(),
            });
        }
    }
});
```

遍历粘贴目标区域的所有单元格，记录其行列位置、原始值和锁定状态，为后续恢复操作提供数据基础。

### 3.4 粘贴后恢复被保护单元格

监听 `ClipboardPasted` 事件，粘贴完成后恢复被锁定单元格的原始值和锁定状态：

```javascript
sheet.bind(GC.Spread.Sheets.Events.ClipboardPasted, function (sender, args) {
    let sheet = args.sheet;
    sheet.suspendPaint();
    for (let i = 0; i < cells.length; i++) {
        let lockedCell = cells[i];
        sheet.getCell(lockedCell.row, lockedCell.col).locked(lockedCell.locked);
        if (lockedCell.locked) {
            sheet.setValue(lockedCell.row, lockedCell.col, lockedCell.value);
        }
    }
    sheet.options.isProtected = true;
    sheet.resumePaint();
});
```

使用 `suspendPaint()` 暂停渲染以提升性能，遍历之前记录的单元格状态，恢复被锁定单元格的原始值，最后重新启用工作表保护并恢复渲染。

### 3.5 技术栈

* SpreadJS 15.0.0：核心表格控件
* SystemJS 0.19.22：模块加载器
* TypeScript 4.1.2：开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。注意：某些在线平台可能限制复制粘贴快捷键，建议下载到本地测试。

### 4.2 操作步骤

1. 打开示例页面，可以看到粉色背景的区域（第7、8行和第5、6列）为未锁定区域
2. 在表格中选择任意单元格，复制数据（Ctrl+C）
3. 选择包含锁定和未锁定单元格的区域进行粘贴（Ctrl+V）
4. 观察结果：未锁定区域（粉色）的数据被成功粘贴，锁定区域的数据保持不变
5. 尝试直接编辑锁定区域的单元格，会触发保护提示

## 五、功能特点

### 5.1 优点

* **用户体验友好**：避免粘贴时频繁弹出保护警告，实现无感知的智能粘贴
* **灵活的权限控制**：支持行级、列级和单元格级的锁定配置，满足复杂业务需求
* **数据安全性高**：确保被保护单元格的数据不会被意外覆盖，同时保持未锁定区域的正常编辑功能

### 5.2 局限性与扩展建议

* **Designer 环境限制**：如 HTML 注释所述，在 SpreadJS Designer 中使用此代码时，粘贴至锁定区域不会触发保护弹窗，表现为未粘贴数据，这是因为 Designer 的事件处理机制与普通应用环境存在差异
* **性能优化空间**：对于大范围粘贴操作，可以考虑使用批量操作 API（如 `setArray`）替代逐个单元格设置，以提升性能
* **扩展建议**：可以添加粘贴前的数据验证逻辑，或者根据单元格类型（数字、日期等）进行格式转换

## 六、关键代码片段

### 命令拦截模式

```javascript
let pasteCommand = spread.commandManager().getCommand("paste");
let oldExecute = pasteCommand.execute;
pasteCommand.execute = function (context, propertyName, args) {
    let sheet = context.getActiveSheet();
    if (!sheet.isEditing()) {
        sheet.options.isProtected = false; // 临时解除保护
    }
    oldExecute.call(this, context, propertyName, args); // 执行原始粘贴逻辑
};
```

这种命令拦截模式是 SpreadJS 扩展功能的常用技巧，通过保存原始方法引用并在包装函数中调用，可以在不破坏原有功能的前提下注入自定义逻辑。

### 事件驱动的状态恢复

```javascript
// 粘贴前：记录状态
sheet.bind(GC.Spread.Sheets.Events.ClipboardPasting, function (sender, args) {
    cells = []; // 清空缓存
    // 遍历并保存单元格状态
});

// 粘贴后：恢复状态
sheet.bind(GC.Spread.Sheets.Events.ClipboardPasted, function (sender, args) {
    // 恢复被锁定单元格的原始值
    sheet.options.isProtected = true; // 重新启用保护
});
```

通过 `ClipboardPasting` 和 `ClipboardPasted` 事件的配合，实现了"记录-修改-恢复"的完整流程，确保数据完整性。

## 七、总结

本示例展示了如何在 SpreadJS 中实现智能粘贴功能，通过命令拦截和事件监听机制，在保持工作表保护的前提下，允许用户向未锁定区域粘贴数据。开发者可以从中学到：

1. SpreadJS 命令管理器的使用和命令拦截技巧
2. 工作表保护与单元格锁定的配置方法
3. 剪贴板事件的监听和处理流程
4. 通过 `suspendPaint` 和 `resumePaint` 优化批量操作性能
5. 行级和列级单元格属性设置方法（`getCell(row, -1)` 和 `getCell(-1, col)`）

该方案适用于需要部分区域可编辑、部分区域受保护的场景，如数据录入模板、财务报表、考勤表等。通过合理配置锁定区域和监听粘贴事件，可以在保证数据安全的同时提升用户体验。开发者可以根据实际需求扩展此方案，例如添加数据验证、格式转换或权限检查等功能。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
