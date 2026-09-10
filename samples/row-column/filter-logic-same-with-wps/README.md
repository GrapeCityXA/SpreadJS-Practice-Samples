## 一、Demo 概述

本示例展示了如何在 SpreadJS Designer 中自定义筛选逻辑，使其行为与 WPS 表格保持一致。默认情况下，SpreadJS 的筛选功能仅对选中的单元格区域进行筛选，而本示例通过重写筛选命令，实现了从选中单元格开始到工作表末尾的全行筛选，这与 WPS 和 Excel 的筛选行为更加接近。

该示例适用于需要与 WPS 或 Excel 保持一致用户体验的场景，特别是在数据分析和报表系统中，用户习惯于点击列标题后自动筛选该列下方的所有数据。

## 二、解决的问题

* **筛选范围不符合预期**：SpreadJS 默认筛选仅作用于选中区域，而用户期望筛选整列数据
* **与 WPS/Excel 行为不一致**：在 WPS 或 Excel 中，筛选会自动扩展到数据区域的末尾，本示例实现了这一行为
* **提升用户体验**：避免用户手动选择大范围区域才能进行筛选，简化操作流程

## 三、实现思路

### 3.1 核心技术点

#### 重写工具栏筛选命令

通过获取 SpreadJS Designer 的默认筛选命令并重写其 `execute` 方法，在执行筛选前自动扩展选区范围：

```javascript
let newFilterDataCommand = GC.Spread.Sheets.Designer.getCommand(
    GC.Spread.Sheets.Designer.CommandNames.SetFilterData
);
if (newFilterDataCommand) {
    let oldExecute = newFilterDataCommand.execute;
    newFilterDataCommand.execute = function (context, propertyName, args) {
        // 通过修改selection扩展筛选区域为选中单元格以下所有row
        let activeSheet = context.getWorkbook().getActiveSheet();
        let selection = activeSheet.getSelections()[0];
        activeSheet.setSelection(
            selection.row, 
            selection.col, 
            activeSheet.getRowCount() - selection.row, 
            1
        );
        oldExecute.call(this, context, propertyName, args);
        activeSheet.setSelection(
            selection.row, 
            selection.col, 
            selection.rowCount, 
            selection.colCount
        );
    }
}
```

关键逻辑：

1. 保存原始选区信息
2. 临时扩展选区至工作表末尾（`getRowCount() - selection.row`）
3. 执行原始筛选命令
4. 恢复原始选区

#### 注册自定义筛选命令

为右键菜单创建自定义筛选命令，支持撤销/重做功能：

```javascript
let customFilter = {
    canUndo: true,
    execute: function (spread, options, isUndo) {
        let Commands = GC.Spread.Sheets.Commands;
        if (isUndo) {
            Commands.undoTransaction(spread, options);
            return true;
        } else {
            Commands.startTransaction(spread, options);
            let activeSheet = spread.getActiveSheet();
            let selection = activeSheet.getSelections()[0];
            // 选中单元格以下所有row为筛选区域
            let range = new GC.Spread.Sheets.Range(
                selection.row, 
                selection.col, 
                activeSheet.getRowCount() - selection.row, 
                1
            );
            let rowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(range);
            activeSheet.rowFilter(rowFilter);
            Commands.endTransaction(spread, options);
            return true;
        }
    }
}
commandManager.register("customFilter", customFilter);
```

#### 更新 Designer 配置

将自定义命令注册到 Designer 的命令映射中：

```javascript
let designerConfig = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig));
designerConfig.commandMap = {};
designerConfig.commandMap[GC.Spread.Sheets.Designer.CommandNames.SetFilterData] = newFilterDataCommand;
designerConfig.commandMap[GC.Spread.Sheets.Designer.CommandNames.Filter] = newFilterCommand;

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", designerConfig);
```

### 3.2 技术栈

* SpreadJS v17.0.8（核心表格引擎）
* SpreadJS Designer v17.0.8（设计器组件）
* SystemJS 0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，会看到 B 列中有数据（B2=1, B3=2, B5=3, B6=4, B8=5, B9=6）
2. 选中 B2:B3 单元格区域
3. 点击工具栏中的"数据" → "筛选"
4. 点击 B1 单元格出现的筛选按钮
5. 观察筛选列表中显示的数据项

**对比测试**：

* 在未修改的 SpreadJS 中，筛选列表只会显示 B2:B3 的值（1 和 2）
* 在本示例中，筛选列表会显示 B 列所有数据（1, 2, 3, 4, 5, 6）

## 五、功能特点

### 5.1 优点

* **行为一致性**：与 WPS 和 Excel 的筛选逻辑保持一致，降低用户学习成本
* **操作便捷**：无需手动选择大范围区域，点击任意单元格即可筛选整列
* **支持撤销**：自定义命令实现了完整的撤销/重做机制
* **无侵入性**：通过命令重写实现，不影响 SpreadJS 的其他功能

### 5.2 局限性与扩展建议

* **固定列宽**：当前实现固定筛选宽度为 1 列，如需支持多列筛选，需调整 `Range` 的 `colCount` 参数
* **性能考虑**：对于超大数据集（数万行），扩展到工作表末尾可能影响性能，建议根据实际数据范围动态计算筛选区域
* **扩展方向**：可以结合 `getUsedRange()` 方法获取实际数据范围，避免筛选空白行

## 六、关键代码片段

### 命令重写模式

```javascript
// 获取原始命令
let originalCommand = GC.Spread.Sheets.Designer.getCommand(commandName);

// 保存原始执行方法
let oldExecute = originalCommand.execute;

// 重写执行方法
originalCommand.execute = function (context, propertyName, args) {
    // 前置处理
    // ...
    
    // 调用原始方法
    oldExecute.call(this, context, propertyName, args);
    
    // 后置处理
    // ...
}
```

### 筛选范围计算

```javascript
// 从选中行开始到工作表末尾
let range = new GC.Spread.Sheets.Range(
    selection.row,                              // 起始行
    selection.col,                              // 起始列
    activeSheet.getRowCount() - selection.row,  // 行数（到末尾）
    1                                           // 列数
);
```

## 七、总结

本示例展示了如何通过命令重写机制自定义 SpreadJS Designer 的筛选行为，使其与 WPS 表格保持一致。开发者可以从中学到：

* SpreadJS Designer 命令系统的扩展方法
* 如何重写内置命令并保持原有功能
* 自定义命令的注册与撤销机制实现
* 筛选范围的动态计算技巧

该方案适用于需要定制 SpreadJS 行为以匹配特定产品需求的场景，具有良好的可扩展性和维护性。通过类似的命令重写模式，开发者可以定制更多 Designer 功能，满足不同业务场景的需求。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
