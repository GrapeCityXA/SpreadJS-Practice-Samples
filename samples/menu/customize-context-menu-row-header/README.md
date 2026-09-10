## 一、Demo 概述

本示例展示了如何在 SpreadJS Designer 中自定义右键菜单项，并根据用户选择的行位置动态控制菜单项的显示与隐藏。通过结合 `visibleContext` 条件表达式和 `SelectionChanged` 事件，实现了仅在特定行（第 3 行）右键点击行头时才显示"自定义添加行"菜单项的功能。

该示例适用于需要根据业务规则限制用户操作权限的场景，例如在特定区域允许插入行，而在其他区域禁止该操作。

## 二、解决的问题

* **条件化菜单显示**：在不同的行位置右键点击时，显示不同的菜单选项，避免用户在不允许的区域执行操作
* **业务规则约束**：通过代码逻辑控制特定行的操作权限，例如只允许在第 3 行插入新行
* **用户体验优化**：通过隐藏不可用的菜单项，减少用户误操作，提供更清晰的交互提示

## 三、实现思路

### 3.1 自定义右键菜单项

通过修改 Designer 的配置对象，添加自定义命令到右键菜单中。核心步骤包括：

1. 克隆默认配置对象
2. 定义自定义命令对象（包含文本、命令名、可见条件、执行逻辑）
3. 将命令添加到 `contextMenu` 数组和 `commandMap` 映射中

```javascript
let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))

let customeAddRow = {
    "text":"自定义添加行",
    commandName:"customeAddRow",
    // ClickRowHeader && !AllowInsertCopiedCutCells为行头选中条件，insertRowActive为自定义条件
    visibleContext : `ClickRowHeader && !AllowInsertCopiedCutCells && ${insertRowActive}`,
    execute:(context) => {
        let sheet = context.getWorkbook().getActiveSheet()
        if(sheet.getActiveRowIndex()==2){
            sheet.addRows(3,1)
        }else{
            alert("该区域不支持添加行")
        }
    }
}

// 追加自定义命令
config.contextMenu.unshift("customeAddRow")
config.commandMap = {
    customeAddRow
}

designer.setConfig(config)
```

### 3.2 动态控制菜单可见性

通过 `visibleContext` 属性设置菜单项的显示条件。该属性支持表达式字符串，可以组合内置条件（如 `ClickRowHeader`）和自定义变量（如 `insertRowActive`）。

关键技术点：

* 使用 `designer.setData(key, value)` 设置自定义条件变量
* 在 `SelectionChanged` 事件中根据当前选中行动态更新变量值
* 调用 `designer.refresh()` 刷新菜单状态

```javascript
let insertRowActive = "insertRowActive"

spread.bind(GC.Spread.Sheets.Events.SelectionChanged,function(e,info){
    if(info.sheet.getActiveRowIndex()==2){
       designer.setData(insertRowActive,true)
    }else{
       designer.setData(insertRowActive,false)
    }
    designer.refresh()
})
```

### 3.3 技术栈

* **SpreadJS 核心库**：v16.0.1（`@grapecity/spread-sheets`）
* **SpreadJS Designer**：v16.0.1（`@grapecity/spread-sheets-designer`）
* **模块加载器**：SystemJS v0.19.22
* **开发语言**：JavaScript（ES6 模块语法）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，在第 3 行（索引为 2）的行头位置点击鼠标右键
2. 在弹出的右键菜单中可以看到"自定义添加行"选项
3. 点击该菜单项，会在第 4 行位置插入一行新行
4. 在其他行（如第 4 行）的行头位置点击鼠标右键
5. 此时右键菜单中不会显示"自定义添加行"选项
6. 如果在非第 3 行位置尝试执行添加行操作（通过修改代码测试），会弹出提示"该区域不支持添加行"

## 五、功能特点

### 5.1 优点

* **灵活的条件控制**：通过表达式字符串组合多个条件，支持复杂的业务逻辑判断
* **实时响应**：利用 `SelectionChanged` 事件实时更新菜单状态，用户体验流畅
* **代码简洁**：通过 Designer 的配置机制，无需手动管理菜单 DOM 结构
* **易于扩展**：可以添加更多自定义条件变量，实现更复杂的权限控制逻辑

### 5.2 局限性与扩展建议

* **当前实现仅针对单行判断**：如果需要支持多行区域的复杂规则（如连续多行、不连续行），需要扩展条件判断逻辑
* **扩展建议**：可以将行索引判断逻辑抽象为配置对象，支持通过配置文件定义允许操作的行范围，提高代码的可维护性

## 六、关键代码片段

### 自定义命令的 execute 方法

```javascript
execute:(context) => {
    let sheet = context.getWorkbook().getActiveSheet()
    if(sheet.getActiveRowIndex()==2){
        sheet.addRows(3,1)  // 在第4行位置插入1行
    }else{
        alert("该区域不支持添加行")
    }
}
```

该方法在用户点击菜单项时执行，通过 `getActiveRowIndex()` 再次验证当前行索引，确保操作的安全性。

## 七、总结

本示例展示了 SpreadJS Designer 中自定义右键菜单的高级用法，核心价值在于：

* 掌握 `visibleContext` 表达式的使用方法，实现菜单项的条件显示
* 学习如何通过 `designer.setData()` 和 `designer.refresh()` 动态控制菜单状态
* 理解 `SelectionChanged` 事件与菜单系统的联动机制
* 掌握自定义命令的定义和注册流程

该方案适用于需要根据单元格位置、数据状态或用户权限动态调整菜单选项的场景，具有良好的扩展性。开发者可以在此基础上扩展更多自定义条件变量，实现更复杂的业务规则控制。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
