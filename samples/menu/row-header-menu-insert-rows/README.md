## 一、Demo 概述

本示例展示了如何在 SpreadJS Designer 中自定义右键菜单，实现在行头右键菜单中添加一个可输入行数的插入行功能。用户可以在行头右键点击后，通过自定义菜单项输入要插入的行数，按回车键即可在指定位置插入相应数量的行。

该示例适用于需要批量插入行的场景，相比默认的单行插入功能，提供了更灵活的操作方式。

## 二、解决的问题

* **批量插入行需求**：默认右键菜单只能插入单行，当需要插入多行时需要重复操作，效率低下
* **自定义菜单项扩展**：展示如何在 SpreadJS Designer 的右键菜单中添加自定义功能
* **交互式参数输入**：演示如何在右键菜单中嵌入输入框，实现动态参数配置

## 三、实现思路

### 3.1 配置自定义右键菜单项

通过修改 Designer 的配置对象，在右键菜单中注册新的菜单项：

```javascript
var designerConfig = JSON.parse(
    JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig)
);
designerConfig.contextMenu.unshift("insertMutiRows");

designerConfig.commandMap = {
    "insertMutiRows": {
        text: "插入行",
        commandName: "insertMutiRows",
        visibleContext: "ClickRowHeader",
    }
}
```

* 使用 `contextMenu.unshift()` 将自定义菜单项添加到菜单顶部
* `visibleContext: "ClickRowHeader"` 确保该菜单项仅在点击行头时显示

### 3.2 注册自定义命令

创建并注册一个支持撤销/重做的自定义命令：

```javascript
let commandManager = spread.commandManager();
var insertRowsByCounts = {
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

* 使用 `startTransaction` 和 `endTransaction` 包裹操作，支持撤销功能
* `suspendPaint()` 和 `resumePaint()` 优化批量操作的渲染性能

### 3.3 自定义菜单项 UI

重写 `createMenuItemElement` 方法，在菜单项中添加输入框和文本标签：

```javascript
var oldCreateMenuItemElement = spread.contextMenu.menuView.createMenuItemElement;
spread.contextMenu.menuView.createMenuItemElement = function (menuItemData) {
    var self = this;
    var menuItemView = oldCreateMenuItemElement.call(self, menuItemData);
    if (menuItemData.name === "insertMutiRows") {
        var supMenuItemContainer = menuItemView[0];
        
        var inputBlock = createInput();
        var btnupBlock = createBtn();
        
        supMenuItemContainer.appendChild(inputBlock);
        supMenuItemContainer.appendChild(btnupBlock);
    }
    return menuItemView;
}
```

输入框创建逻辑：

```javascript
function createInput() {
    var inputBlock = document.createElement('input');
    inputBlock.type = 'text';
    inputBlock.value = '1';
    inputBlock.className = 'inputBlock';
    inputBlock.style = 'width: 20px';
    inputBlock.setAttribute('gcUIElement', 'gcContextMenu');
    inputBlock.onclick = function (ev) {
        if (ev.target) {
            ev.stopPropagation()
        }
    }
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

* `gcUIElement` 属性标记为菜单元素，防止被自动清理
* `stopPropagation()` 阻止点击输入框时触发菜单项点击事件
* 监听回车键执行插入命令并关闭菜单

### 3.4 技术栈

* SpreadJS 15.0.0
* SpreadJS Designer 15.0.0
* TypeScript 4.1.2
* SystemJS 0.19.22

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件。

### 4.2 操作步骤

1. 在 SpreadJS Designer 界面中，点击任意行的行头（左侧行号区域）
2. 在弹出的右键菜单顶部找到"插入行"菜单项
3. 在输入框中输入要插入的行数（默认为 1）
4. 按下回车键，系统将在当前行位置插入指定数量的行
5. 可使用 Ctrl+Z 撤销操作

## 五、功能特点

### 5.1 优点

* **灵活性高**：支持一次性插入任意数量的行，提升批量操作效率
* **用户体验好**：直接在右键菜单中输入参数，无需额外弹窗
* **支持撤销重做**：通过事务机制实现完整的撤销/重做功能
* **性能优化**：使用 `suspendPaint/resumePaint` 避免批量插入时的多次渲染

### 5.2 局限性与扩展建议

* **输入验证缺失**：当前未对输入值进行校验，建议添加数字验证和范围限制
* **UI 样式简单**：输入框样式较为基础，可根据实际需求美化
* **扩展方向**：可参考此方法实现插入列、删除行列等其他批量操作功能

## 六、总结

本示例展示了 SpreadJS Designer 右键菜单的深度定制能力，开发者可以学到：

* 如何配置和注册自定义右键菜单项
* 如何创建支持撤销/重做的自定义命令
* 如何在菜单项中嵌入自定义 UI 元素（输入框、按钮等）
* 如何处理菜单交互事件和命令执行流程

该方案适用于需要在 SpreadJS 中扩展右键菜单功能的场景，具有良好的可扩展性，可以作为实现其他自定义菜单功能的参考模板。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
