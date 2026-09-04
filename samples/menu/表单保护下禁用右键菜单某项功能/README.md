## 一、Demo 概述

本示例演示了如何在 SpreadJS 中实现表单保护状态下的右键菜单项动态控制功能。通过自定义右键菜单和命令系统,实现了在表单保护和非保护状态下,自定义菜单项的启用/禁用切换,同时保留了自定义命令的完整功能。

该示例展示了 SpreadJS 上下文菜单扩展机制与表单保护功能的结合使用,适用于需要在不同权限状态下提供差异化操作选项的业务场景。

## 二、解决的问题

- **权限控制需求**：在表单保护状态下,需要禁用某些敏感的自定义菜单操作,防止用户误操作修改受保护的数据
- **菜单动态响应**：右键菜单需要根据当前表单的保护状态实时调整可用性,而不是静态配置
- **自定义功能扩展**：在 SpreadJS 原生右键菜单基础上,添加自定义的格式化功能,并与保护机制无缝集成

## 三、实现思路

### 3.1 自定义上下文菜单类

通过继承 `GC.Spread.Sheets.ContextMenu.ContextMenu` 创建自定义菜单类,重写 `onOpenMenu` 方法实现菜单项的动态控制:

```javascript
function ContextMenu() { }
ContextMenu.prototype = new GC.Spread.Sheets.ContextMenu.ContextMenu(spread);
ContextMenu.prototype.onOpenMenu = function (menuData, itemsDataForShown, hitInfo, spread) {
    if (sheet.options.isProtected === true) {
        for (let i = 0; i < itemsDataForShown.length; i++) {
            let item = itemsDataForShown[i];
            if (item.name === "markWithRedBg") {
                item.disable = true;  // 保护状态下禁用自定义菜单项
            }
        }
    }
};
spread.contextMenu = new ContextMenu();
```

`onOpenMenu` 方法在每次打开右键菜单时触发,通过检查 `sheet.options.isProtected` 状态,动态设置目标菜单项的 `disable` 属性。

### 3.2 添加自定义菜单项

定义菜单项配置对象并添加到菜单数据中:

```javascript
let markWithRedBg = {
    text: "Format Cells",           // 菜单显示文本
    name: "markWithRedBg",           // 菜单项唯一标识
    command: "markWithRedBg",        // 关联的命令名称
    iconClass: "gc-spread-copy",     // 图标样式类
    workArea: "viewport"             // 作用区域
};
spread.contextMenu.menuData.push(markWithRedBg);
```

### 3.3 注册自定义命令

通过命令管理器注册自定义命令,实现选中区域的背景色设置功能:

```javascript
let commandManager = spread.commandManager();
let markWithRedBgCommand = {
    canUndo: false,
    execute: function () {
        let style = new GC.Spread.Sheets.Style();
        style.backColor = 'red';
        let sheet = spread.getActiveSheet();
        sheet.suspendPaint();
        let selections = sheet.getSelections();
        // 遍历所有选中区域
        for (let selectionIndex = 0; selectionIndex < selections.length; selectionIndex++) {
            let selection = selections[selectionIndex];
            for (let i = selection.row; i < (selection.row + selection.rowCount); i++) {
                for (let j = selection.col; j < (selection.col + selection.colCount); j++) {
                    sheet.setStyle(i, j, style, GC.Spread.Sheets.SheetArea.viewport);
                }
            }
        }
        sheet.resumePaint();
    }
};
commandManager.register("markWithRedBg", markWithRedBgCommand, null, false, false, false, false);
```

### 3.4 保护状态切换交互

通过按钮事件监听实现表单保护状态的切换,并更新 UI 提示:

```javascript
document.getElementById("protect").addEventListener("click", function (e) {
    sheet.options.isProtected = !sheet.options.isProtected;
    let stateText = sheet.options.isProtected ? "表单已锁定,看下右键菜单最后一项目" : "表单已解锁,看下右键菜单最后一项目";
    document.getElementById("state").innerHTML = stateText;
});
```

### 3.5 技术栈

- SpreadJS v15.0.0 - 核心表格控件
- SystemJS v0.19.22 - 模块加载器
- TypeScript v4.1.2 - 类型支持

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 直接在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后,默认表单处于非保护状态
2. 在表格中选中任意单元格区域,右键打开菜单
3. 点击菜单最后一项 "Format Cells",选中区域背景色变为红色
4. 点击页面顶部的 "点我切换表单保护" 按钮,切换到保护状态
5. 再次右键打开菜单,观察 "Format Cells" 菜单项变为灰色不可用状态
6. 再次点击按钮解除保护,菜单项恢复可用

## 五、功能特点

### 5.1 优点

- **动态权限控制**：菜单项可用性随表单保护状态实时变化,无需手动刷新
- **扩展性强**：通过继承机制可轻松扩展更多自定义菜单项和控制逻辑
- **用户体验友好**：禁用状态下菜单项仍然可见但不可点击,用户能清楚了解功能存在但当前不可用

### 5.2 局限性与扩展建议

- **当前实现仅控制单个菜单项**：如需批量控制多个菜单项,建议将菜单项名称配置为数组,通过循环判断实现
- **命令不可撤销**：当前命令设置了 `canUndo: false`,如需支持撤销功能,需实现对应的 `undo` 方法
- **扩展建议**：可结合单元格级别的保护设置 (`setLocked`),实现更细粒度的权限控制

## 六、关键代码片段

### 菜单项禁用逻辑

```javascript
ContextMenu.prototype.onOpenMenu = function (menuData, itemsDataForShown, hitInfo, spread) {
    if (sheet.options.isProtected === true) {
        for (let i = 0; i < itemsDataForShown.length; i++) {
            let item = itemsDataForShown[i];
            if (item.name === "markWithRedBg") {
                item.disable = true;
            }
        }
    }
};
```

该方法是实现动态控制的核心,通过遍历 `itemsDataForShown` 数组找到目标菜单项,根据保护状态设置其 `disable` 属性。

## 七、总结

本示例展示了 SpreadJS 中上下文菜单扩展与表单保护功能的结合使用方法,开发者可以从中学到:

- 如何通过继承机制自定义上下文菜单类
- 如何使用 `onOpenMenu` 钩子实现菜单项的动态控制
- 如何注册自定义命令并与菜单项关联
- 如何结合表单保护状态实现权限控制

该方案适用于需要在不同权限状态下提供差异化操作的业务场景,如多用户协作编辑、数据审核流程等。通过扩展 `onOpenMenu` 方法中的判断逻辑,可以实现更复杂的菜单控制策略,如基于用户角色、单元格位置、数据状态等条件的动态菜单配置。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/07xteHY1okKMaKDroZ91Mw/)）
