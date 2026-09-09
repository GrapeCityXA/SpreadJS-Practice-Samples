## 一、Demo 概述

本示例演示了如何在 SpreadJS 中自定义快捷键行为，使其与 Excel 的表现一致。具体实现了重写 `Ctrl+Shift+↓` 组合键的功能，使选区能够智能地向下扩展到下一个非空单元格或工作表底部。这是一个典型的快捷键自定义场景，展示了 SpreadJS 命令管理器的灵活性。

## 二、解决的问题

在默认情况下，SpreadJS 的某些快捷键行为可能与 Excel 存在差异。本示例解决了以下问题：

- 实现与 Excel 一致的 `Ctrl+Shift+↓` 快捷键行为
- 支持多选区同时向下扩展
- 智能识别数据边界，自动停止在下一个有数据的单元格

## 三、实现思路

### 3.1 自定义命令注册

通过 SpreadJS 的命令管理器（CommandManager）注册自定义命令，替换默认的快捷键行为：

```javascript
let commandManager = spread.commandManager();
let selectionBottomCmd = {
    canUndo: true,
    execute: function (spread, options, isUndo) {
        // 命令执行逻辑
    }
};
commandManager.register('selectionBottom', selectionBottomCmd, 40, true, true);
```

### 3.2 搜索条件配置

使用 `SearchCondition` 对象定义搜索范围和规则，查找选区下方的第一个非空单元格：

```javascript
let searchCondition = new GC.Spread.Sheets.Search.SearchCondition();
searchCondition.searchString = "?";  // 通配符匹配任意内容
searchCondition.columnStart = selection.col;
searchCondition.columnEnd = selection.col + selection.colCount - 1;
searchCondition.rowStart = selection.row + selection.rowCount;
searchCondition.rowEnd = sheet.getRowCount() - 1;
searchCondition.searchFlags = GC.Spread.Sheets.Search.SearchFlags.ignoreCase | 
                               GC.Spread.Sheets.Search.SearchFlags.useWildCards | 
                               GC.Spread.Sheets.Search.SearchFlags.blockRange;
```

### 3.3 多选区处理

遍历所有选区，分别计算每个选区的扩展范围，然后重新设置选区：

```javascript
selections.forEach((selection) => {
    let searchresult = sheet.search(searchCondition);
    let newendrowindx = searchresult.foundRowIndex != -1 ? 
                        searchresult.foundRowIndex : 
                        sheet.getRowCount() - 1;
    newselection.push(new GC.Spread.Sheets.Range(
        selection.row, 
        selection.col, 
        newendrowindx - selection.row + 1, 
        selection.colCount
    ));
});

sheet.clearSelection();
newselection.forEach((selection) => {
    sheet.addSelection(selection.row, selection.col, selection.rowCount, selection.colCount);
});
```

### 3.4 技术栈

- SpreadJS 16.0.1
- SystemJS 0.19.22（模块加载器）
- TypeScript 4.1.2

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开示例页面，工作表中已预填充了一些测试数据（B2-B10 列有间隔的数值）
2. 选中 B2 单元格
3. 按下 `Ctrl+Shift+↓` 组合键
4. 观察选区自动扩展到下一个空单元格之前（B3）
5. 继续按 `Ctrl+Shift+↓`，选区会继续向下扩展到下一个数据块

## 五、功能特点

### 5.1 优点

- 与 Excel 行为完全一致，降低用户学习成本
- 支持多选区同时操作
- 支持撤销/重做功能（`canUndo: true`）
- 使用搜索 API 实现，性能高效

### 5.2 局限性与扩展建议

当前实现仅针对向下扩展选区，如需完整的 Excel 快捷键体验，可以扩展实现：

- `Ctrl+Shift+↑`（向上扩展）
- `Ctrl+Shift+←`（向左扩展）
- `Ctrl+Shift+→`（向右扩展）

实现方式类似，只需调整 `searchCondition` 的搜索范围参数即可。

## 六、关键代码片段

### 命令执行核心逻辑

```javascript
execute: function (spread, options, isUndo) {
    let Commands = GC.Spread.Sheets.Commands;
    if (isUndo) {
        Commands.undoTransaction(spread, options);
        return true;
    } else {
        Commands.startTransaction(spread, options);  // 开启事务
        spread.suspendPaint();  // 暂停绘制，提升性能
        
        // 处理选区扩展逻辑
        let sheet = spread.getActiveSheet();
        let selections = sheet.getSelections();
        // ... 搜索和计算新选区
        
        spread.resumePaint();  // 恢复绘制
        Commands.endTransaction(spread, options);  // 结束事务
        return true;
    }
}
```

## 七、总结

本示例展示了 SpreadJS 命令系统的强大扩展能力，开发者可以学到：

- 如何使用 `commandManager.register()` 注册自定义命令
- 如何使用 `SearchCondition` 进行单元格内容搜索
- 如何处理多选区场景
- 如何使用事务机制（`startTransaction`/`endTransaction`）保证操作的原子性和可撤销性

该方案适用于需要自定义快捷键行为的场景，特别是从 Excel 迁移到 SpreadJS 的项目，可以通过类似方式实现完全一致的用户体验。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/QeyJlQ9FAUaHSzH_aBql5g/)）
