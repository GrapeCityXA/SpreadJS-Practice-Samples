## 一、Demo 概述

本示例展示了如何在 SpreadJS 中自定义右键菜单，实现在行标题区域右键点击时弹出自定义菜单项，允许用户输入指定的行数并批量插入行。该功能通过扩展 SpreadJS 的 contextMenu API 和 commandManager 实现，提供了更灵活的用户交互体验。

## 二、解决的问题

* 默认右键菜单只能一次插入一行，当需要批量插入多行时操作繁琐
* 提供自定义输入框，让用户可以指定插入的行数，提高操作效率
* 演示如何扩展 SpreadJS 的右键菜单系统，添加自定义 UI 元素和命令

## 三、实现思路

### 3.1 扩展右键菜单项

通过重写 `spread.contextMenu.onOpenMenu` 方法，在原有菜单项基础上添加自定义菜单项：

```javascript
let oldOpenMenu = spread.contextMenu.onOpenMenu
spread.contextMenu.onOpenMenu = function (menuData, itemsDataForShown, hitInfo, spread) {
    itemsDataForShown.push({
        text: "插入行",
        name: "insertMutiRows",
        visibleContext: "ClickRowHeader",  // 仅在点击行标题时显示
        command: "insertMutiRows"
    })
    oldOpenMenu.apply(this, arguments)
}
```

关键点：

* `visibleContext: "ClickRowHeader"` 确保菜单项仅在点击行标题时显示
* 保留原有的 `oldOpenMenu` 调用，确保不破坏默认菜单功能

### 3.2 注册自定义命令

使用 `commandManager.register` 注册批量插入行的命令，支持撤销/重做功能：

```javascript
let commandManager = spread.commandManager();
let insertRowsByCounts = {
    canUndo: true,
    execute: function (_spread, options, isUndo) {
        var Commands = GC.Spread.Sheets.Commands;
        if (isUndo) {
            Commands.undoTransaction(_spread, options);
            return true;
        } else {
            Commands.startTransaction(_spread, options);
            if (options.rowCount) {
                var _sheet = _spread.getSheetFromName(options.sheetName);
                _sheet.suspendPaint();
                _sheet.addRows(options.startRow, parseInt(options.rowCount));
                _sheet.resumePaint();
            }
            Commands.endTransaction(_spread, options);
            return true;
        }
    }
};
commandManager.register("insertMutiRows", insertRowsByCounts, null, false, false, false, false);
```

技术要点：

* 使用 `startTransaction` 和 `endTransaction` 包裹操作，支持撤销功能
* `suspendPaint` 和 `resumePaint` 优化批量插入时的渲染性能
* `addRows` 方法接收起始行索引和插入行数

### 3.3 自定义菜单项 UI

重写 `createMenuItemElement` 方法，为自定义菜单项添加输入框和文本标签：

```javascript
let oldCreateMenuItemElement = spread.contextMenu.menuView.createMenuItemElement;
spread.contextMenu.menuView.createMenuItemElement = function (menuItemData) {
    let menuItemView = oldCreateMenuItemElement.call(this, menuItemData);
    if (menuItemData.name === "insertMutiRows") {
        let supMenuItemContainer = menuItemView[0];
        
        let inputBlock = createInput();
        let btnupBlock = createBtn();
        
        supMenuItemContainer.appendChild(inputBlock);
        supMenuItemContainer.appendChild(btnupBlock);
    }
    return menuItemView;
}
```

输入框创建逻辑：

```javascript
function createInput() {
    let inputBlock = document.createElement('input');
    inputBlock.type = 'text';
    inputBlock.value = '1';
    inputBlock.className = 'inputBlock';
    inputBlock.style = 'width: 20px';
    inputBlock.setAttribute('gcUIElement', 'gcContextMenu');
    
    // 阻止点击事件冒泡，防止菜单关闭
    inputBlock.onclick = function (ev) {
        if (ev.target) {
            ev.stopPropagation()
        }
    }
    
    // 按下回车键执行命令
    inputBlock.onkeydown = function (e) {
        if (e.key == "Enter") {
            spread.commandManager().execute({
                cmd: "insertMutiRows",
                sheetName: spread.getActiveSheet().name(),
                rowCount: inputBlock.value,
                startRow: spread.getActiveSheet().getActiveRowIndex()
            })
            // 关闭右键菜单
            let dom = document.querySelector("div.gc-ui-contextmenu-container")
            while(true) {
                if(dom.id == "gc-dialog1") {
                    break
                }
                dom = dom.parentNode
            }
            dom.style.display = "none"
        }
    }
    return inputBlock;
}
```

关键实现：

* `gcUIElement` 属性标识该元素属于 SpreadJS 的 UI 系统
* `stopPropagation` 防止点击输入框时关闭菜单
* 回车键触发命令执行并手动关闭菜单

### 3.4 获取命令参数

重写 `getCommandOptions` 方法，从输入框获取用户输入的行数：

```javascript
let oldgetCommandOptions = spread.contextMenu.menuView.getCommandOptions;
spread.contextMenu.menuView.getCommandOptions = function (menuItemData, host, event) {
    if (menuItemData && menuItemData.name === "insertMutiRows") {
        let ele = document.getElementsByClassName("inputBlock")[0]
        return ele.value;
    }
    else {
        return oldgetCommandOptions.apply(this, arguments)
    }
};
```

### 3.5 技术栈

* SpreadJS v16.0.1：核心表格控件
* SystemJS v0.19.22：模块加载器
* TypeScript v4.1.2：开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，在表格的行标题区域（左侧行号）点击鼠标右键
2. 在弹出的右键菜单中找到"插入行"选项
3. 在输入框中输入要插入的行数（默认为 1）
4. 按下回车键或点击菜单项执行插入操作
5. 可以使用 Ctrl+Z 撤销插入操作

## 五、功能特点

### 5.1 优点

* 支持批量插入多行，提高操作效率
* 自定义 UI 元素集成到原生右键菜单，用户体验流畅
* 支持撤销/重做功能，操作可逆
* 使用 `suspendPaint` 和 `resumePaint` 优化性能

### 5.2 局限性与扩展建议

* 当前实现仅支持插入行，可扩展为同时支持插入列
* 输入框未做数字校验，可添加输入限制（只允许正整数）
* 可以添加快捷键支持，进一步提升操作效率
* 可以将输入框改为下拉选择框，提供常用行数选项

## 六、关键代码片段

### 命令执行核心逻辑

```javascript
spread.commandManager().execute({
    cmd: "insertMutiRows",
    sheetName: spread.getActiveSheet().name(),
    rowCount: inputBlock.value,
    startRow: spread.getActiveSheet().getActiveRowIndex()
})
```

该代码片段展示了如何通过 `commandManager` 执行自定义命令，传递必要的参数（工作表名称、插入行数、起始行索引）。

## 七、总结

本示例展示了 SpreadJS 右键菜单系统的高度可扩展性，开发者可以学到：

* 如何扩展 SpreadJS 的右键菜单，添加自定义菜单项
* 如何注册自定义命令并实现撤销/重做功能
* 如何在菜单项中嵌入自定义 UI 元素（输入框、按钮等）
* 如何处理菜单事件和命令参数传递
* 如何优化批量操作的渲染性能

该方案适用于需要自定义表格操作菜单的场景，可以根据业务需求灵活扩展，实现更复杂的交互功能。通过类似的方式，开发者可以添加更多自定义菜单项，如批量删除、批量格式化等功能。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
