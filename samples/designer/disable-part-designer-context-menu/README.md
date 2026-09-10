## 一、Demo 概述

本示例演示了如何在 SpreadJS Designer 中控制右键菜单项的可用状态。通过修改命令的 `enableContext` 属性并配置 `commandMap`，实现对特定菜单功能（如"插入"功能）的禁用控制。该方案适用于需要根据用户权限或业务规则动态控制设计器功能可用性的场景。

## 二、解决的问题

在实际应用中，不同用户对设计器的操作权限往往不同。例如：

* 普通用户可能只能查看和编辑数据，不允许插入行列
* 高级用户可以使用完整的设计器功能
* 需要根据业务状态动态控制某些功能的可用性（如审核中的表格禁止结构修改）

本示例通过配置 Designer 的命令系统，实现了对右键菜单中"插入"功能的精确控制，避免了用户误操作或越权操作。

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 获取和修改命令的 enableContext

SpreadJS Designer 的每个菜单项都对应一个命令对象，通过 `getCommand()` 方法可以获取命令实例，并修改其 `enableContext` 属性来控制可用状态：

```javascript
const ALLOWINSERT = "allowInsert"

// 获取插入行命令并设置启用条件
GC.Spread.Sheets.Designer.getCommand(
    GC.Spread.Sheets.Designer.CommandNames.InsertRows
).enableContext = ALLOWINSERT

// 获取插入对话框命令并设置启用条件
GC.Spread.Sheets.Designer.getCommand(
    GC.Spread.Sheets.Designer.CommandNames.InsertDialog
).enableContext = ALLOWINSERT
```

`enableContext` 是一个字符串标识符，用于关联 Designer 实例中的数据状态。当 Designer 的数据中该标识符对应的值为 `false` 时，相关菜单项将显示为禁用状态。

#### 3.1.2 配置自定义 commandMap

修改命令后，需要将新的命令对象注册到 Designer 的配置中：

```javascript
// 克隆默认配置
let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))

// 获取修改后的命令对象
let newInsertRow = GC.Spread.Sheets.Designer.getCommand(
    GC.Spread.Sheets.Designer.CommandNames.InsertRows
)
let newInsertDialog = GC.Spread.Sheets.Designer.getCommand(
    GC.Spread.Sheets.Designer.CommandNames.InsertDialog
)

// 覆盖 commandMap 中的命令
config.commandMap = {
    [GC.Spread.Sheets.Designer.CommandNames.InsertRows]: newInsertRow,
    [GC.Spread.Sheets.Designer.CommandNames.InsertDialog]: newInsertDialog
}
```

通过 `commandMap` 将修改后的命令映射到配置对象中，确保 Designer 使用新的命令定义。

#### 3.1.3 设置 Designer 数据状态

创建 Designer 实例后，通过 `setData()` 方法设置 `enableContext` 对应的状态值：

```javascript
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", config)
designer.setData(ALLOWINSERT, false)  // 禁用插入功能
designer.refresh()  // 刷新界面
```

当 `ALLOWINSERT` 设置为 `false` 时，所有 `enableContext` 为 `ALLOWINSERT` 的命令都将被禁用。

### 3.2 技术栈

* SpreadJS 16.0.1：核心表格组件
* SpreadJS Designer 16.0.1：设计器组件
* SystemJS 0.19.22：模块加载器
* TypeScript 4.1.2：开发语言

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，在设计器的单元格区域点击右键
2. 查看右键菜单中的"插入"选项，会发现该选项显示为灰色禁用状态
3. 在行头或列头点击右键，"插入行"或"插入列"选项同样处于禁用状态

如需启用插入功能，可以修改代码中的 `designer.setData(ALLOWINSERT, true)` 并刷新页面。

## 五、功能特点

### 5.1 优点

* **精确控制**：可以针对特定命令进行细粒度的权限控制
* **动态切换**：通过 `setData()` 方法可以在运行时动态改变菜单项的可用状态
* **扩展性强**：同样的方法可以应用于其他 Designer 命令，实现全面的权限管理

### 5.2 扩展建议

* 可以结合用户登录信息，根据角色动态设置多个 `enableContext` 标识符
* 可以监听业务状态变化，实时调用 `setData()` 更新菜单可用性
* 可以扩展到更多命令，如删除、格式化、公式编辑等功能的控制

## 六、总结

本示例展示了 SpreadJS Designer 命令系统的灵活性，通过简单的配置即可实现对设计器功能的精确控制。开发者可以从中学到：

* Designer 命令对象的获取和修改方法
* `enableContext` 机制的工作原理
* `commandMap` 的配置和覆盖方式
* Designer 数据状态的设置和刷新流程

该方案适用于需要实现多级权限管理的企业应用，可以有效防止用户误操作，提升系统的安全性和可控性。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
