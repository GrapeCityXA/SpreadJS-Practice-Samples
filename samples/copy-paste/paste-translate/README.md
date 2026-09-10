## 一、Demo 概述

本示例展示了如何在 SpreadJS Designer 中实现自定义的"粘贴转置"功能。通过扩展右键菜单，用户可以在复制单元格区域后，将数据以转置的方式粘贴到目标位置（即行列互换）。该功能集成了 SpreadJS 的命令系统、撤销/重做机制，并根据剪贴板状态动态控制菜单项的可用性。

## 二、解决的问题

在实际的电子表格应用中，用户经常需要将行数据转换为列数据（或反之）。虽然 SpreadJS 提供了基础的复制粘贴功能，但默认不支持转置粘贴。本示例解决了以下问题：

* 提供直观的右键菜单操作，无需手动调整数据布局
* 自动处理行列转换逻辑，避免手动重新排列数据的繁琐操作
* 支持撤销/重做功能，确保操作可逆
* 根据剪贴板状态智能启用/禁用菜单项，提升用户体验

## 三、实现思路

### 3.1 扩展 Designer 右键菜单

通过修改 `designerConfig.contextMenu` 和 `designerConfig.commandMap`，在右键菜单中添加自定义的"粘贴转置"选项：

```javascript
var designerConfig = JSON.parse(
    JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig)
);
designerConfig.contextMenu.push("transposePaste");

designerConfig.commandMap = {
    "transposePaste": {
        text: "粘贴转置",
        commandName: "transposePaste",
        iconClass: "gc-spread-transposePaste",
        group: "contextMenuPaste",
        enableContext: "AllowTransposePaste",
        execute: function(context){
            let spread = context.getWorkbook(), sheet = spread.getActiveSheet();
            spread.commandManager().execute({
                cmd: "transposePasteCommand",
                sheetName: sheet.name(),
                activeRow: sheet.getActiveRowIndex(),
                activeCol: sheet.getActiveColumnIndex(),
                copiedRanges: clipboardHelper.copiedRanges,
                copiedSheet: clipboardHelper.copiedSheet 
            })
        }
    }
}
```

菜单项通过 `enableContext: "AllowTransposePaste"` 绑定到一个状态标识，该标识由剪贴板事件动态更新。

### 3.2 监听剪贴板事件

通过监听 `ClipboardChanging` 事件，捕获用户的复制操作，并将复制的数据信息存储到 `clipboardHelper` 对象中：

```javascript
let clipboardHelper = {}
spread.bind(GC.Spread.Sheets.Events.ClipboardChanging, function (s, e) {
    clipboardHelper = {}
    if(e.action === GC.Spread.Sheets.ClipboardActionType.reset){
        updateClipboardState(designer, clipboardHelper);
        return;
    }
    clipboardHelper.action = e.action;
    clipboardHelper.copyData = e.copyData;
    clipboardHelper.copiedSheet = e.sheet;
    clipboardHelper.copiedRanges = e.ranges;
    clipboardHelper.copiedObjects = e.objects;
    updateClipboardState(designer, clipboardHelper);
});
```

当剪贴板被重置（如按 ESC 键）或复制新内容时，`updateClipboardState` 函数会更新 `AllowTransposePaste` 状态，控制菜单项的启用/禁用。

### 3.3 实现转置粘贴命令

核心逻辑在 `transposePasteCommand` 中实现，通过双重循环将源区域的行列索引互换：

```javascript
var transposePasteCommand = {
    canUndo: true,
    execute: function (spread, options, isUndo) {
        var Commands = GC.Spread.Sheets.Commands;
        if (isUndo) {
            Commands.undoTransaction(spread, options);
            return true;
        } else {
            let sheet = spread.getSheetFromName(options.sheetName);
            if(!checkCanTransposePaste(sheet, options)){
                return false;
            }
                        
            Commands.startTransaction(spread, options);
            spread.suspendPaint();
            spread.suspendCalcService();
            let row = options.activeRow, col = options.activeCol;
            let copiedSheet = options.copiedSheet, copiedRange= options.copiedRanges[0];
            for(let i = 0; i < copiedRange.rowCount; i++){
                for(let j = 0; j < copiedRange.colCount; j++){
                    sheet.setValue(row + j, col + i, copiedSheet.getValue(copiedRange.row + i, copiedRange.col + j));
                }
            }

            spread.resumeCalcService();
            spread.resumePaint();
            Commands.endTransaction(spread, options);
            return true;
        }
    }
};
commandManager.register("transposePasteCommand", transposePasteCommand, null, false, false, false, false);
```

关键点：

* 使用 `startTransaction` 和 `endTransaction` 包裹操作，支持撤销/重做
* 通过 `suspendPaint` 和 `suspendCalcService` 暂停渲染和计算，提升性能
* 转置逻辑：`sheet.setValue(row + j, col + i, ...)` 将源位置 `(i, j)` 的数据写入目标位置 `(j, i)`

### 3.4 集成撤销/重做系统

将自定义命令注册到 Designer 的撤销/重做列表中，确保操作可以被撤销：

```javascript
let undoList = GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.UndoList)
let redoList = GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.RedoList)
undoList.commandMap["transposePaste"] = "粘贴转置"
redoList.commandMap["transposePaste"] = "粘贴转置"
designerConfig.commandMap[GC.Spread.Sheets.Designer.CommandNames.UndoList] = undoList;
designerConfig.commandMap[GC.Spread.Sheets.Designer.CommandNames.RedoList] = redoList;
```

### 3.5 技术栈

* SpreadJS 16.0.1（核心表格引擎）
* SpreadJS Designer 16.0.1（设计器组件）
* TypeScript 4.1.2（开发语言）
* SystemJS（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 使用本地服务器打开 index.html（如 Live Server）
```

### 4.2 操作步骤

1. 在表格中选中一个单元格区域（如 A1:D2）
2. 按 Ctrl+C 复制选中区域
3. 在目标位置右键点击，选择"粘贴转置"
4. 观察数据以行列互换的方式粘贴到目标位置
5. 可使用 Ctrl+Z 撤销操作

## 五、功能特点

### 5.1 优点

* 无缝集成到 Designer 右键菜单，操作直观
* 支持完整的撤销/重做机制，操作安全可逆
* 根据剪贴板状态动态控制菜单项可用性，避免无效操作
* 使用事务机制和渲染优化，确保性能

### 5.2 局限性与扩展建议

当前实现的局限性：

* 仅处理单个复制区域（`copiedRanges[0]`），不支持多选区域转置
* 未检查目标区域是否有足够空间容纳转置后的数据
* 未处理单元格样式、公式等属性的转置

扩展建议：

* 在 `checkCanTransposePaste` 中添加目标区域大小检查
* 扩展转置逻辑，支持样式、公式、合并单元格等属性的转置
* 添加对受保护单元格的检查，避免覆盖受保护区域

## 六、关键代码片段

### 动态控制菜单项状态

```javascript
function updateClipboardState(designer, clipboardHelper){
    if(clipboardHelper.action === GC.Spread.Sheets.ClipboardActionType.reset){
        designer.setData("AllowTransposePaste", false);
    }
    if(!clipboardHelper.copiedSheet || !clipboardHelper.copiedRanges){
        designer.setData("AllowTransposePaste", false);
    }
    else{
        designer.setData("AllowTransposePaste", true);
    }
}
```

通过 `designer.setData` 设置状态标识，Designer 会自动根据 `enableContext` 配置启用/禁用菜单项。

### 自定义菜单图标样式

```css
.gc-ui-contextmenu-icon.gc-spread-transposePaste {
    background-image: url(./src/Transpose.png);
    background-size: 24px 24px;
}
.gc-ui-contextmenu-disable .gc-ui-contextmenu-icon.gc-spread-transposePaste {
    background-image: url(./src/Transpose_disable.png);
    background-size: 24px 24px;
}
```

通过 CSS 类名为菜单项添加自定义图标，并为禁用状态提供不同的图标样式。

## 七、总结

本示例展示了如何通过 SpreadJS Designer 的扩展机制实现自定义的粘贴转置功能。开发者可以从中学到：

* 如何扩展 Designer 的右键菜单和命令系统
* 如何监听剪贴板事件并根据状态动态控制 UI
* 如何实现支持撤销/重做的自定义命令
* 如何使用事务机制和渲染优化提升性能

该方案适用于需要在 SpreadJS 中添加自定义数据操作功能的场景，具有良好的扩展性。开发者可以参考此模式实现更多自定义的粘贴选项（如粘贴值、粘贴格式等）。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
