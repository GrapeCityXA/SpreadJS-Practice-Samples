## 一、Demo 概述

本示例展示了如何在 SpreadJS Designer（设计器）中自定义 Ribbon 菜单，通过添加自定义按钮组和命令来扩展设计器的功能。该示例实现了一个名为 "Welcome" 的自定义按钮，点击后可以将选中单元格的背景色改为绿色，并且该操作支持撤销/重做功能。

该示例适用于需要在 SpreadJS 设计器中集成自定义业务功能的场景，例如快速格式化、批量操作或特定业务逻辑的快捷入口。

## 二、解决的问题

- **扩展设计器功能**：SpreadJS Designer 提供了丰富的内置功能，但在实际业务中往往需要添加自定义的快捷操作，本示例展示了如何通过配置 Ribbon 菜单来实现功能扩展
- **自定义命令注册**：演示了如何注册自定义命令并集成到设计器的命令管理系统中，使其能够被 Ribbon 按钮调用
- **撤销/重做支持**：展示了如何让自定义命令支持撤销和重做操作，保证用户体验的一致性

## 三、实现思路

### 3.1 配置自定义命令

通过修改 `DefaultConfig.commandMap` 来定义自定义命令。每个命令包含标题、图标、执行逻辑等配置：

```javascript
var config = GC.Spread.Sheets.Designer.DefaultConfig;
config.commandMap = {
    Welcome: {
        title: "Welcome",
        text: "Welcome China",
        iconClass: "ribbon-button-welcome",
        bigButton: "true",
        commandName: "Welcome",
        execute: function (context, propertyName, fontItalicChecked) {
            var spread = context.getWorkbook(), sheet = spread.getActiveSheet();
            var selections = sheet.getSelections();
            var commandManager = spread.commandManager();
            commandManager.execute({
                cmd: 'changeBackColor',
                sheetName: sheet.name(),
                selections: selections,
                backColor: 'rgb(130, 188, 0)'
            });
        }
    }
}
```

该命令的 `execute` 方法通过 `commandManager.execute()` 调用了一个名为 `changeBackColor` 的底层命令，实现了背景色的修改。

### 3.2 注册底层命令并支持撤销/重做

为了让自定义操作支持撤销和重做，需要注册一个可撤销的命令：

```javascript
var command = {
    canUndo: true,
    execute: function(spread, options, isUndo) {
        var Commands = GC.Spread.Sheets.Commands;
        if (isUndo) {
            Commands.undoTransaction(spread, options);
            return true;
        } else {
            Commands.startTransaction(spread, options);
            spread.suspendPaint();
            var selections = options.selections;
            var value = options.backColor;
            selections.forEach(function(sel) {
                sheet.getRange(sel.row, sel.col, sel.rowCount, sel.colCount).backColor(value);
            });
            spread.resumePaint();
            Commands.endTransaction(spread, options);
            return true;
        }
    }
};
var commandManager = spread.commandManager();
commandManager.register('changeBackColor', command);
```

关键点：
- `canUndo: true` 表示该命令支持撤销
- 使用 `startTransaction` 和 `endTransaction` 包裹操作，确保操作可以被记录到历史栈中
- `suspendPaint()` 和 `resumePaint()` 用于优化性能，避免多次重绘

### 3.3 配置撤销/重做列表显示

为了让自定义命令在撤销/重做列表中显示友好的中文名称，需要更新 `UndoList` 和 `RedoList` 的 `commandMap`：

```javascript
let undoList = GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.UndoList)
let redoList = GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.RedoList)
undoList.commandMap["changeBackColor"] = "改变颜色"
redoList.commandMap["changeBackColor"] = "改变颜色"
config.commandMap[GC.Spread.Sheets.Designer.CommandNames.UndoList] = undoList;
config.commandMap[GC.Spread.Sheets.Designer.CommandNames.RedoList] = redoList;
```

### 3.4 添加自定义按钮组到 Ribbon

通过 `config.ribbon[0].buttonGroups.unshift()` 在 Ribbon 的第一个选项卡中添加自定义按钮组：

```javascript
config.ribbon[0].buttonGroups.unshift({
    "label": "NewDesigner",
    "thumbnailClass": "welcome",
    "commandGroup": {
        "children": [
            {
                "direction": "vertical",
                "commands": [
                    "Welcome"
                ]
            }
        ]
    }
});
```

这段代码将 "Welcome" 命令添加到了一个名为 "NewDesigner" 的按钮组中，并将该按钮组插入到 Ribbon 的最前面。

### 3.5 技术栈

- SpreadJS 15.0.0：核心表格控件
- SpreadJS Designer 15.0.0：设计器组件
- SystemJS：模块加载器
- TypeScript 4.1.2：开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开 `index.html` 文件，设计器会自动加载
2. 在 Ribbon 菜单的最左侧可以看到 "NewDesigner" 按钮组
3. 选中表格中的任意单元格或单元格区域
4. 点击 "Welcome China" 按钮
5. 选中的单元格背景色会变为绿色（rgb(130, 188, 0)）
6. 可以通过撤销按钮（Ctrl+Z）撤销该操作，撤销列表中会显示"改变颜色"
7. 可以通过重做按钮（Ctrl+Y）重做该操作

## 五、功能特点

### 5.1 优点

- **易于扩展**：通过配置对象即可添加自定义命令，无需修改设计器源码
- **完整的命令系统集成**：自定义命令与内置命令享有相同的生命周期管理，支持撤销/重做
- **灵活的 UI 配置**：可以自定义按钮的位置、图标、文本等外观属性
- **中文本地化支持**：撤销/重做列表可以显示中文描述，提升用户体验

### 5.2 局限性与扩展建议

- **图标样式**：示例中的图标样式较为简单（纯蓝色背景），实际应用中建议使用 SVG 图标或图标字体
- **命令参数化**：当前示例中背景色是硬编码的，可以扩展为支持用户选择颜色的对话框
- **按钮组位置**：使用 `unshift()` 会将按钮组插入到最前面，如果需要插入到特定位置，可以使用 `splice()` 方法

## 六、关键代码片段

### 自定义按钮图标样式

在 `index.html` 中定义了按钮的 CSS 样式：

```css
.ribbon-button-welcome{
    width: 35px;
    height: 35px;
    background: #00f 35px;
}
```

### 初始化设计器

```javascript
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", config)
let spread = designer.getWorkbook()
```

通过传入自定义的 `config` 对象来初始化设计器，确保自定义配置生效。

## 七、总结

本示例展示了 SpreadJS Designer 的高度可扩展性，开发者可以通过以下知识点来定制设计器功能：

1. 通过 `DefaultConfig.commandMap` 定义自定义命令
2. 使用 `commandManager.register()` 注册可撤销的底层命令
3. 通过 `config.ribbon` 配置自定义 Ribbon 按钮组
4. 使用事务机制（`startTransaction`/`endTransaction`）实现撤销/重做支持
5. 配置 `UndoList` 和 `RedoList` 实现中文本地化

该方案适用于需要在设计器中集成企业特定业务逻辑的场景，例如快速套用模板、批量数据处理、自定义格式化等功能。通过这种方式，可以在不修改设计器源码的前提下，灵活地扩展设计器的能力，满足各种定制化需求。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/llK6TBEz90S4uiN-YbuqDg/)）
