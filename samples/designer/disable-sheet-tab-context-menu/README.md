## 一、Demo 概述

本示例演示如何在 SpreadJS Designer 中禁用工作表页签的右键菜单功能。通过自定义 Designer 配置，移除默认的工作表页签右键菜单项（如插入工作表、删除工作表、保护工作表等），实现对用户操作权限的精细化控制。

该功能适用于需要限制用户对工作表进行结构性修改的场景，例如在只读模式下展示数据、防止误操作删除工作表、或在特定业务流程中锁定工作表结构。

## 二、解决的问题

在某些业务场景中，开发者需要限制用户对工作表的操作权限，避免用户通过右键菜单对工作表进行不必要的修改。该示例解决了以下问题：

* 防止用户随意插入、删除或移动工作表，保持工作簿结构稳定
* 避免用户修改工作表保护状态或隐藏/显示工作表
* 在特定业务流程中锁定工作表页签的操作权限
* 提供更简洁的用户界面，移除不需要的右键菜单选项

## 三、实现思路

### 3.1 核心技术点

#### 获取默认配置并深拷贝

SpreadJS Designer 提供了 `DefaultConfig` 对象，包含了所有默认的配置项。为了避免直接修改默认配置影响其他实例，需要先进行深拷贝：

```javascript
let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))
```

通过 `JSON.parse(JSON.stringify())` 实现深拷贝，确保修改不会影响原始配置对象。

#### 定义需要移除的右键菜单项

通过 `GC.Spread.Sheets.Designer.CommandNames` 枚举，定义需要从工作表页签右键菜单中移除的命令：

```javascript
let sheetTabContext = [
    GC.Spread.Sheets.Designer.CommandNames.InsertSheet,
    GC.Spread.Sheets.Designer.CommandNames.DeleteSheet,
    GC.Spread.Sheets.Designer.CommandNames.SheetTabMoveOrCopy,
    GC.Spread.Sheets.Designer.CommandNames.ProtectSheet,
    GC.Spread.Sheets.Designer.CommandNames.UnprotectSheet,
    GC.Spread.Sheets.Designer.CommandNames.HideSheet,
    GC.Spread.Sheets.Designer.CommandNames.UnhideSheet,
    GC.Spread.Sheets.Designer.CommandNames.SheetTag,
    GC.Spread.Sheets.Designer.CommandNames.ChangeSheetTabPosition,
    GC.Spread.Sheets.Designer.CommandNames.ShowTabColor
]
```

这些命令涵盖了工作表页签右键菜单中的主要操作项。

#### 从配置中移除指定菜单项

遍历配置对象的 `contextMenu` 数组，移除在 `sheetTabContext` 中定义的命令：

```javascript
for(let i=0; i<config.contextMenu.length; i++){
    if(sheetTabContext.indexOf(config.contextMenu[i]) > -1){
        config.contextMenu.splice(i,1)
        i--  // 删除元素后索引回退，避免跳过下一个元素
    }
}
```

注意在删除数组元素后需要将索引 `i` 减 1，防止因数组长度变化导致遍历跳过元素。

#### 使用自定义配置初始化 Designer

将修改后的配置对象传入 Designer 构造函数：

```javascript
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", config)
```

此时创建的 Designer 实例将不再显示被移除的工作表页签右键菜单项。

### 3.2 技术栈

* SpreadJS 16.0.1：核心电子表格组件
* SpreadJS Designer 16.0.1：提供完整的设计器界面和配置能力
* SystemJS：模块加载器
* TypeScript 4.1.2：类型支持

## 四、使用说明

### 4.1 运行方式

1. 安装依赖：

```bash
npm install
```

2. 使用本地服务器打开 `index.html` 文件（推荐使用 Live Server 或类似工具）

### 4.2 操作步骤

1. 打开示例页面，Designer 组件会自动加载
2. 在页面底部的工作表页签（如 Sheet1）上点击右键
3. 观察右键菜单，会发现原本的插入工作表、删除工作表、保护工作表等选项已被移除
4. 对比标准 Designer 的工作表页签右键菜单，验证功能已被成功禁用

## 五、功能特点

### 5.1 优点

* 实现简单，只需修改配置对象即可完成功能定制
* 不影响 Designer 的其他功能，仅针对工作表页签右键菜单进行限制
* 配置灵活，可根据业务需求选择性移除特定菜单项
* 通过深拷贝配置对象，不会影响其他 Designer 实例

### 5.2 扩展建议

* 可以根据用户角色动态配置可用的菜单项，实现权限分级管理
* 可以结合工作表保护功能，进一步限制用户的操作权限
* 可以自定义右键菜单，添加业务特定的操作选项

## 六、总结

本示例展示了如何通过自定义 SpreadJS Designer 配置来禁用工作表页签的右键菜单功能。开发者可以从中学到：

* 如何获取和修改 SpreadJS Designer 的默认配置
* 如何使用 `CommandNames` 枚举定位特定的菜单命令
* 如何通过配置对象控制 Designer 的 UI 行为
* 如何实现对用户操作权限的精细化控制

该方案适用于需要限制用户对工作表结构进行修改的场景，具有良好的扩展性，可以根据实际业务需求灵活调整禁用的菜单项。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
