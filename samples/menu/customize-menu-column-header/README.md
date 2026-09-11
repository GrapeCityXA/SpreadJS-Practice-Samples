## 一、Demo 概述

本示例展示了如何在 SpreadJS 中自定义列头右键菜单的删除操作。通过扩展默认的上下文菜单和命令系统，开发者可以在用户删除列之前执行自定义逻辑（如数据验证、权限检查、操作提醒等），从而实现更灵活的业务控制。

该示例适用于需要对表格列删除操作进行拦截和增强的场景，例如：防止误删关键列、记录删除日志、触发相关业务逻辑等。

## 二、解决的问题

* **操作拦截需求**：在用户删除列之前需要执行验证或提醒，防止误操作
* **业务逻辑集成**：删除列时需要触发额外的业务逻辑（如数据同步、日志记录）
* **用户体验优化**：通过自定义菜单文本和操作流程，提供更友好的交互体验

## 三、实现思路

### 3.1 自定义删除列命令

通过 SpreadJS 的命令系统注册自定义命令，替换默认的删除列操作：

```javascript
let deleteColumnsNew = {
    canUndo: true,
    name: 'deleteColumnsNew',
    execute: function (context, options, isUndo) {
        let Commands = GC.Spread.Sheets.Commands;
        if (isUndo) {
            Commands.undoTransaction(context, options)
            return true
        } else {
            Commands.startTransaction(context, options)
            let sheet = context.getSheetFromName(options.sheetName)
            sheet.suspendPaint()
            //可以在此实现一些删除前的逻辑            
            alert("删除前可以做一些自定义的操作")
            if (options.selections && options.selections.length) {
                let col = options.selections[0].col
                let colCount = options.selections[0].colCount
                sheet.deleteColumns(col, colCount)
            }
            sheet.resumePaint()
            Commands.endTransaction(context, options)
            return true
        }
    }
}

//注册命令
spread.commandManager().register('deleteColumnsNew', deleteColumnsNew)
```

核心要点：

* `canUndo: true` 支持撤销操作
* `startTransaction/endTransaction` 确保操作的原子性
* `suspendPaint/resumePaint` 优化渲染性能
* 在 `sheet.deleteColumns()` 之前插入自定义逻辑

### 3.2 扩展上下文菜单

通过继承 `ContextMenu` 类并重写 `onOpenMenu` 方法，替换默认菜单项：

```javascript
function MyContextMenu() { }
MyContextMenu.prototype = new GC.Spread.Sheets.ContextMenu.ContextMenu(spread)
MyContextMenu.prototype.onOpenMenu = (menuData, itemsDataForShown, hitInfo, spread) => {
    itemsDataForShown.forEach((item, index) => {
        //如果是整列删除，替换为自定义删除操作
        if (item && item.name === 'gc.spread.deleteColumns') {
            item.text = "删除（自定义）"
            item.command = "deleteColumnsNew"
        }
    })
}

let contextMenu = new MyContextMenu()
spread.contextMenu = contextMenu
```

实现原理：

* 遍历菜单项数组 `itemsDataForShown`
* 通过 `name` 属性识别默认的删除列菜单项
* 修改 `text` 属性自定义显示文本
* 修改 `command` 属性指向自定义命令

### 3.3 技术栈

* @grapecity/spread-sheets: 15.0.0（核心表格组件）
* @grapecity/spread-sheets-tablesheet: 15.0.0（表单功能扩展）
* @grapecity/spread-sheets-resources-zh: 15.0.0（中文资源包）
* TypeScript: ^4.1.2（类型支持）
* SystemJS: ^0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，表格会显示初始数据
2. 在列头（如 B 列）点击鼠标右键
3. 在弹出的上下文菜单中选择"删除（自定义）"
4. 会弹出提示框："删除前可以做一些自定义的操作"
5. 点击确定后，选中的列将被删除
6. 可以使用 Ctrl+Z 撤销删除操作

## 五、功能特点

### 5.1 优点

* **灵活的业务集成**：可以在删除操作前后插入任意业务逻辑
* **支持撤销重做**：通过事务机制保证操作的可逆性
* **用户体验友好**：通过自定义菜单文本提供清晰的操作提示
* **性能优化**：使用 `suspendPaint/resumePaint` 避免不必要的重绘

### 5.2 扩展建议

* 可以将 `alert` 替换为更复杂的确认对话框（如 Modal 组件）
* 可以添加权限验证逻辑，根据用户角色决定是否允许删除
* 可以记录删除操作日志到后端系统
* 可以在删除前检查列中是否包含关键数据，防止误删

## 六、总结

本示例展示了 SpreadJS 命令系统和上下文菜单的扩展能力。开发者可以学到：

* 如何注册和实现自定义命令
* 如何扩展和修改默认的上下文菜单
* 如何使用事务机制保证操作的原子性和可撤销性
* 如何在标准操作中插入自定义业务逻辑

该方案适用于需要对表格操作进行精细控制的企业级应用，具有良好的扩展性和可维护性。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
