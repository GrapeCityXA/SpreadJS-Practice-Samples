## 一、Demo 概述

本示例演示了如何在 SpreadJS 中自定义行头右键菜单，实现动态插入多行的功能。用户可以在行头区域右键点击，通过自定义菜单项输入要插入的行数，从而快速批量插入指定数量的行。该功能通过扩展 SpreadJS 的上下文菜单系统和命令管理器实现，提供了灵活的用户交互体验。

## 二、解决的问题

在实际的表格编辑场景中，用户经常需要批量插入多行数据。默认的右键菜单只能一次插入一行，当需要插入大量行时操作效率低下。本示例通过自定义右键菜单，允许用户：

- 在行头右键菜单中直接输入要插入的行数
- 一次性插入指定数量的行，提高操作效率
- 通过输入框交互，提供更灵活的用户体验

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 自定义菜单项

通过向 `spread.contextMenu.menuData` 数组添加自定义菜单项对象，实现菜单扩展：

```javascript
let insertRows = {
    text: "插入多行",
    name: "insertRows",
    command: "rowsCount",
    workArea: "rowHeader"
};
spread.contextMenu.menuData.push(insertRows);
```

- `text`: 菜单项显示文本
- `name`: 菜单项唯一标识符
- `command`: 关联的命令名称
- `workArea`: 指定菜单显示区域为行头（rowHeader）

#### 3.1.2 注册自定义命令

使用命令管理器注册插入多行的执行逻辑：

```javascript
let insertRowsByCounts = {
    canUndo: false,
    execute: function (spread, options) {
        if (options.commandOptions) {
            var sheet = spread.getSheetFromName(options.sheetName)
            sheet.suspendPaint()
            sheet.addRows(options.activeRow, parseInt(options.commandOptions))
            sheet.resumePaint()
        }
    }
};
commandManager.register("rowsCount", insertRowsByCounts, null, false, false, false, false);
```

- `suspendPaint()` 和 `resumePaint()` 用于暂停和恢复绘制，提高性能
- `addRows()` 方法在指定位置插入指定数量的行
- `commandOptions` 参数传递用户输入的行数

#### 3.1.3 自定义菜单视图

通过继承 `MenuView` 类并重写关键方法，实现带输入框的菜单项：

```javascript
function CustomMenuView() {}
CustomMenuView.prototype = new GC.Spread.Sheets.ContextMenu.MenuView();

CustomMenuView.prototype.createMenuItemElement = function (menuItemData) {
    let self = this;
    if (menuItemData.name === "insertRows") {
        let containers = GC.Spread.Sheets.ContextMenu.MenuView.prototype.createMenuItemElement.call(self, menuItemData);
        let supMenuItemContainer = containers[0];
        let inputBlock = createInput();
        supMenuItemContainer.appendChild(inputBlock);
        return supMenuItemContainer;
    } else {
        let menuItemView = GC.Spread.Sheets.ContextMenu.MenuView.prototype.createMenuItemElement.call(self, menuItemData);
        return menuItemView;
    }
}
```

重写 `getCommandOptions` 方法获取输入框的值：

```javascript
CustomMenuView.prototype.getCommandOptions = function (menuItemData, host, event) {
    if (menuItemData && menuItemData.name === "insertRows") {
        let ele = document.getElementsByClassName("inputBlock")[0]
        return ele.value;
    }
};
```

#### 3.1.4 输入框交互处理

创建带有事件处理的输入框组件：

```javascript
function createInput() {
    var inputBlock = document.createElement('input');
    inputBlock.className = 'inputBlock';
    inputBlock.style = 'width: 40px';
    inputBlock.type = 'number';
    inputBlock.defaultValue = 3;
    inputBlock.min = 1;
    inputBlock.onclick = function (ev) {
        if (ev.target) {
            ev.stopPropagation()
        }
    }
    inputBlock.onkeydown = function (ev) {
        if (ev.key === "Enter") {
            this.parentNode.click();
            ev.stopPropagation()
        }
    }
    return inputBlock;
}
```

- 使用 `stopPropagation()` 阻止事件冒泡，避免点击输入框时触发菜单项
- 监听 Enter 键，按下后自动触发父节点的点击事件执行命令

### 3.2 技术栈

- SpreadJS 15.0.0：核心表格组件库
- SystemJS：模块加载器
- TypeScript 4.1.2：开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开示例页面，可以看到一个包含 10 行的表格
2. 在第 6 行（提示文本所在行）的行头区域点击鼠标右键
3. 在弹出的右键菜单中找到"插入多行"选项
4. 在输入框中输入要插入的行数（默认为 3）
5. 点击菜单项或按 Enter 键确认，系统将在当前行之后插入指定数量的行

## 五、功能特点

### 5.1 优点

- 提高批量插入行的操作效率，避免重复点击
- 提供直观的输入框交互，用户体验友好
- 通过 `suspendPaint()` 和 `resumePaint()` 优化性能，避免频繁重绘
- 代码结构清晰，易于扩展和维护

### 5.2 局限性与扩展建议

- 当前实现不支持撤销操作（`canUndo: false`），可以通过实现 `undo` 方法支持撤销
- 可以扩展为支持插入列的功能，复用相同的实现思路
- 可以添加输入验证，限制插入行数的最大值，避免性能问题

## 六、关键代码片段

### 6.1 命令执行逻辑

```javascript
execute: function (spread, options) {
    if (options.commandOptions) {
        var sheet = spread.getSheetFromName(options.sheetName)
        sheet.suspendPaint()  // 暂停绘制
        sheet.addRows(options.activeRow, parseInt(options.commandOptions))  // 插入行
        sheet.resumePaint()   // 恢复绘制
    }
}
```

该代码片段展示了插入多行的核心逻辑，通过暂停和恢复绘制提高性能。

### 6.2 输入框事件处理

```javascript
inputBlock.onkeydown = function (ev) {
    if (ev.key === "Enter") {
        this.parentNode.click();  // 触发菜单项点击
        ev.stopPropagation()      // 阻止事件冒泡
    }
}
```

该代码实现了按 Enter 键快速确认的功能，提升用户体验。

## 七、总结

本示例展示了 SpreadJS 上下文菜单系统的强大扩展能力，开发者可以从中学到：

1. 如何自定义右键菜单项并指定显示区域
2. 如何使用命令管理器注册自定义命令
3. 如何继承和扩展 MenuView 类实现复杂的菜单交互
4. 如何在菜单项中嵌入自定义 UI 组件（如输入框）
5. 如何优化批量操作的性能（suspendPaint/resumePaint）

该方案适用于需要自定义表格操作菜单的场景，具有良好的扩展性，可以根据实际需求添加更多自定义菜单项和交互逻辑。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/2PoQ7mQpXkq3zOT1amarCg/)）
