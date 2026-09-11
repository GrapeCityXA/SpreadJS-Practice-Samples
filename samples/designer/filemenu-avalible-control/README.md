## 一、Demo 概述

本示例展示了如何在 SpreadJS Designer 中根据用户权限动态控制文件按钮的可用状态。通过重写命令执行逻辑和配置管理，实现了对 Designer 工具栏按钮的权限控制功能。该方案适用于需要根据不同用户角色限制特定功能访问的场景，例如只读用户无法使用文件导入导出功能。

## 二、解决的问题

在实际应用中，不同用户可能拥有不同的操作权限。例如普通用户可能只能查看和编辑表格，而无权使用文件导入导出功能。本示例解决了如何在 SpreadJS Designer 中实现按钮级别的权限控制，防止未授权用户访问敏感功能。

## 三、实现思路

### 3.1 获取并重写命令对象

通过 `GC.Spread.Sheets.Designer.getCommand()` 获取文件按钮命令对象，然后重写其 `execute` 方法来控制执行逻辑：

```javascript
let fileCommand = GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.FileMenuButton)

// 重写文件按钮点击调用命令
let oldFileCommandExecute = fileCommand.execute
fileCommand.execute = function(context, propertyName){
    if(isDisable){
        oldFileCommandExecute.call(this, context, propertyName)
    }else{
        alert('您没有权限使用该按钮')
    }
}
```

这种方式保留了原始命令的引用，在权限允许时调用原始逻辑，否则显示权限提示。

### 3.2 动态修改按钮文本

根据权限状态动态修改按钮显示文本，提供视觉反馈：

```javascript
function changeText(){
    if(!isDisable){
        fileCommand.text="不可用"
    }else{
        fileCommand.text="文件"
    }
}
```

### 3.3 配置命令映射

将修改后的命令对象注册到 Designer 配置中：

```javascript
let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))
config.commandMap = {
    fileMenuButton: fileCommand
}
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", config)
```

### 3.4 动态切换权限状态

通过按钮点击事件切换权限状态，并刷新 Designer 配置：

```javascript
document.getElementById("changeStatus").onclick = function(){
    isDisable = !isDisable
    changeText()
    config.commandMap = {
        fileMenuButton: fileCommand
    }
    designer.setConfig(config)
    designer.refresh()
}
```

### 3.5 技术栈

* @grapecity/spread-sheets: 16.0.1（核心表格组件）
* @grapecity/spread-sheets-designer: 16.0.1（设计器组件）
* SystemJS: 0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，默认文件按钮显示为"不可用"状态
2. 点击文件按钮，会弹出"您没有权限使用该按钮"提示
3. 点击页面顶部的"切换文件状态"按钮
4. 文件按钮文本变为"文件"，此时可以正常使用文件功能
5. 再次点击"切换文件状态"按钮，恢复到不可用状态

## 五、功能特点

### 5.1 优点

* 实现了细粒度的按钮级权限控制
* 通过重写命令执行方法，不破坏原有功能逻辑
* 动态切换权限状态，无需重新初始化 Designer
* 提供清晰的视觉反馈（按钮文本变化）

### 5.2 扩展建议

* 可以扩展到控制更多按钮的权限（如打印、导出等）
* 可以集成实际的用户权限系统，根据登录用户角色自动设置权限
* 可以添加更友好的权限提示 UI，替代简单的 alert 弹窗
* 可以记录用户的未授权操作尝试，用于安全审计

## 六、总结

本示例展示了 SpreadJS Designer 命令系统的灵活性，通过获取、修改和重新注册命令对象，可以实现对 Designer 功能的精细化控制。开发者可以学习到：

* 如何获取和重写 Designer 命令对象
* 如何通过 `commandMap` 注册自定义命令
* 如何使用 `setConfig()` 和 `refresh()` 动态更新 Designer 配置
* 如何实现基于权限的功能访问控制

该方案适用于需要根据用户角色限制功能访问的企业级应用，可以有效提升系统的安全性和可控性。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
