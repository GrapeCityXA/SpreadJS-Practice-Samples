## 一、Demo 概述

本示例演示了如何在 SpreadJS 中重写 Ctrl+Enter 快捷键的默认行为，实现类似 Excel 的自动填充功能。当用户选中一个区域（如 A1:A10）并按下 Ctrl+Enter 时，活动单元格的值会自动填充到选中区域的所有单元格中。该功能通过重写 CellTypes 的键盘事件处理和注册自定义命令来实现，支持撤销/重做操作。

## 二、解决的问题

在 SpreadJS 中，Ctrl+Enter 默认行为可能不符合某些业务场景的需求。本示例解决了以下问题：

* 提供类似 Excel 的批量填充体验，提高数据录入效率
* 允许用户快速将单个值复制到多个单元格，无需手动拖拽或复制粘贴
* 支持撤销/重做操作，确保用户可以安全地进行批量填充操作

## 三、实现思路

### 3.1 重写键盘事件处理

通过重写 `GC.Spread.Sheets.CellTypes.Text.prototype.isReservedKey` 方法，拦截 Ctrl+Enter 组合键，使其不再触发默认行为，而是交由自定义命令处理。

```javascript
var oldFn = GC.Spread.Sheets.CellTypes.Text.prototype.isReservedKey;
GC.Spread.Sheets.CellTypes.Text.prototype.isReservedKey = function (event, context) {
    var src = event.srcElement || event.target, 
        keyCode = event.keyCode, 
        ctrlKey = event.ctrlKey, 
        altKey = event.altKey, 
        metaKey = event.metaKey;
    
    // 拦截 Ctrl+Enter（keyCode 13 为 Enter 键）
    if (keyCode === 13 && ctrlKey && (!event.shiftKey || altKey)) {
        return false; // 返回 false 表示不使用默认行为
    } else {
        return oldFn.apply(this, arguments); // 其他按键保持原有行为
    }
};
```

### 3.2 注册自定义填充命令

使用 `commandManager().register()` 注册名为 `extendValueCmd` 的自定义命令，该命令在 Ctrl+Enter 触发时执行，将活动单元格的值填充到所有选中区域。

```javascript
spread.commandManager().register('extendValueCmd', {
    canUndo: true, // 支持撤销
    execute: function (spread, options, isUndo) {
        options.cmd = 'extendValueCmd';
        var Commands = GC.Spread.Sheets.Commands;
        
        if (isUndo) {
            Commands.undoTransaction(spread, options);
            return true;
        } else {
            Commands.startTransaction(spread, options); // 开始事务
            var sheet = spread.getSheetFromName(options.sheetName);
            
            // 如果正在编辑，先结束编辑
            if (sheet.isEditing()) {
                sheet.endEdit(false);
            }
            
            spread.suspendPaint(); // 暂停绘制
            spread.suspendCalcService(); // 暂停计算
            
            // 获取活动单元格的值
            var value = sheet.getValue(sheet.getActiveRowIndex(), sheet.getActiveColumnIndex());
            
            // 遍历所有选中区域，填充值
            var sels = sheet.getSelections();
            sels.forEach(function (range) {
                sheet.getRange(range.row, range.col, range.rowCount, range.colCount).value(value);
            });
            
            spread.resumeCalcService(); // 恢复计算
            spread.resumePaint(); // 恢复绘制
            Commands.endTransaction(spread, options); // 结束事务
            return true;
        }
    }
}, 13, true, false, false, false); // 绑定到 keyCode 13（Enter），需要 Ctrl 键
```

### 3.3 技术栈

* SpreadJS 15.0.0：核心表格控件
* SystemJS 0.19.22：模块加载器
* TypeScript 4.1.2：开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，在 A1 单元格中输入一个值（默认已填充值 1）
2. 选中 A1:A10 区域（或任意多单元格区域）
3. 确保 A1 为活动单元格（光标在 A1）
4. 按下 Ctrl+Enter 组合键
5. 观察选中区域的所有单元格都被填充为 A1 的值
6. 可以使用 Ctrl+Z 撤销操作

## 五、功能特点

### 5.1 优点

* 提高数据录入效率，一键完成批量填充
* 支持撤销/重做，操作安全可靠
* 通过事务机制确保操作的原子性
* 暂停绘制和计算服务，提升大范围填充的性能

### 5.2 局限性与扩展建议

* 当前实现仅支持单个活动单元格的值填充，不支持多单元格模式的智能填充
* 可以扩展为支持序列填充（如 1, 2, 3...）或公式填充
* 可以添加对不同数据类型的特殊处理逻辑

## 六、关键代码片段

### 命令注册参数说明

```javascript
spread.commandManager().register(
    'extendValueCmd',  // 命令名称
    { /* 命令对象 */ },
    13,                // keyCode（Enter 键）
    true,              // 需要 Ctrl 键
    false,             // 不需要 Shift 键
    false,             // 不需要 Alt 键
    false              // 不需要 Meta 键
);
```

### 性能优化技巧

```javascript
spread.suspendPaint();        // 暂停界面重绘
spread.suspendCalcService();  // 暂停公式计算

// 执行批量操作...

spread.resumeCalcService();   // 恢复计算
spread.resumePaint();         // 恢复绘制并一次性刷新
```

## 七、总结

本示例展示了 SpreadJS 中自定义快捷键和命令的核心技术，开发者可以从中学到：

* 如何重写 CellTypes 的键盘事件处理方法
* 如何使用 commandManager 注册自定义命令并绑定快捷键
* 如何使用事务机制实现可撤销的批量操作
* 如何通过暂停绘制和计算服务优化批量操作性能

该方案适用于需要自定义快捷键行为的场景，具有良好的扩展性，可以根据业务需求实现更复杂的自动填充逻辑。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
