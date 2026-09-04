## 一、Demo 概述

本示例展示了如何在 SpreadJS Designer 中自定义文件菜单面板，通过修改模板配置来控制文件菜单中特定功能的启用和禁用状态。该示例通过添加一个自定义复选框控件，实现了对文件菜单中大部分功能项的动态控制，只保留"导出 Excel"按钮始终可用。

这种自定义能力适用于需要根据用户权限、应用场景或业务规则来限制 Designer 功能访问的场景，例如在只读模式下禁用保存和导入功能，或在特定工作流中限制某些操作。

## 二、解决的问题

- **权限控制需求**：在多用户协作场景中，需要根据用户角色限制对文件操作功能的访问权限
- **功能定制化**：不同的应用场景可能需要隐藏或禁用某些不必要的文件菜单功能，简化用户界面
- **动态功能切换**：需要在运行时根据业务逻辑动态启用或禁用特定功能，而不是完全移除这些功能

## 三、实现思路

### 3.1 获取并修改文件菜单模板

SpreadJS Designer 提供了模板系统，允许开发者获取内置模板并进行自定义修改。核心步骤是通过 `getTemplate` 方法获取文件菜单面板模板，然后修改其结构：

```javascript
let template = GC.Spread.Sheets.Designer.getTemplate(
    GC.Spread.Sheets.Designer.TemplateNames.FileMenuPanelTemplate
)
```

这个模板对象包含了文件菜单的完整 UI 结构，以树形结构组织各个控件元素。

### 3.2 添加自定义控制复选框

在模板的特定位置添加一个复选框控件，用于控制其他功能项的启用状态：

```javascript
template.content[0].children[0].children[1].children[2].children[1].children[1].children[2].children.push({
    type: "CheckBox",
    bindingPath: "WhatEverName",
    text: "WhatEverText",
    visibleWhen: "WhatEverName===1"
})
```

- `type: "CheckBox"`：定义控件类型为复选框
- `bindingPath: "WhatEverName"`：绑定的数据路径，用于存储复选框状态
- `text: "WhatEverText"`：复选框显示的文本标签
- `visibleWhen: "WhatEverName===1"`：可见性条件，当绑定值为 1 时显示

### 3.3 批量设置功能项的启用条件

遍历文件菜单中的所有子控件，为除"导出 Excel"按钮外的所有功能项添加启用条件：

```javascript
template.content[0].children[0].children[1].children[2].children[1].children[1].children[2].children.forEach(v => {
    if(v.bindingPath != "button_export_excel" && v.type != "TextBlock") {
        v.enableWhen = "WhatEverName===1"
    }
})
```

- 通过 `forEach` 遍历所有子控件
- 排除 `button_export_excel`（导出 Excel 按钮）和 `TextBlock`（文本标签）
- 为其他控件添加 `enableWhen` 条件，只有当 `WhatEverName===1` 时才启用

### 3.4 注册修改后的模板

将修改后的模板重新注册到 Designer 中，使自定义配置生效：

```javascript
GC.Spread.Sheets.Designer.registerTemplate(
    GC.Spread.Sheets.Designer.TemplateNames.FileMenuPanelTemplate, 
    template
)
```

### 3.5 技术栈

- **SpreadJS Designer** (v17.0.8)：提供完整的电子表格设计器功能
- **SpreadJS 核心库及扩展**：
  - `@grapecity/spread-sheets`：核心电子表格引擎
  - `@grapecity/spread-sheets-designer`：设计器组件
  - `@grapecity/spread-sheets-designer-resources-cn`：中文资源包
  - 其他扩展模块（ExcelIO、Charts、Print、PDF、Barcode、Shapes、Pivot 等）
- **SystemJS**：模块加载器，用于动态加载依赖

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
# 或使用本地服务器运行（推荐）
npx http-server -p 8080
```

### 4.2 操作步骤

1. 在浏览器中打开示例页面，SpreadJS Designer 将自动加载
2. 点击左上角的"文件"菜单，打开文件菜单面板
3. 观察文件菜单中的功能项状态：
   - 默认情况下，除"导出 Excel"外的其他功能项可能处于禁用状态
   - 勾选自定义添加的复选框（"WhatEverText"），其他功能项将被启用
   - 取消勾选复选框，功能项将再次被禁用
4. "导出 Excel"按钮始终保持可用状态，不受复选框控制

## 五、功能特点

### 5.1 优点

- **灵活的权限控制**：通过简单的条件表达式即可实现复杂的功能启用/禁用逻辑
- **非侵入式定制**：基于模板系统进行修改，不需要修改 Designer 源码
- **细粒度控制**：可以精确控制到每个具体的功能按钮或控件
- **动态切换能力**：支持运行时根据业务逻辑动态改变功能可用性

### 5.2 局限性与扩展建议

**局限性**：
- 模板路径（`content[0].children[0].children[1]...`）依赖于 Designer 的内部结构，版本升级可能导致路径失效
- 示例中使用的 `WhatEverName` 绑定路径需要与实际的数据模型对应，否则条件判断可能不生效

**扩展建议**：
- 可以将复选框替换为更复杂的权限验证逻辑，例如从后端 API 获取用户权限
- 可以为不同的功能组设置不同的启用条件，实现更细致的权限分级
- 建议封装模板修改逻辑为独立函数，便于维护和版本兼容性处理
- 可以结合 Designer 的事件系统，在特定操作时动态修改 `bindingPath` 的值

## 六、关键代码片段

完整的模板自定义逻辑：

```javascript
// 获取文件菜单面板模板
let template = GC.Spread.Sheets.Designer.getTemplate(
    GC.Spread.Sheets.Designer.TemplateNames.FileMenuPanelTemplate
)

// 添加控制复选框
template.content[0].children[0].children[1].children[2]
    .children[1].children[1].children[2].children.push({
    type: "CheckBox",
    bindingPath: "WhatEverName",
    text: "WhatEverText",
    visibleWhen: "WhatEverName===1"
})

// 批量设置功能项的启用条件
template.content[0].children[0].children[1].children[2]
    .children[1].children[1].children[2].children.forEach(v => {
    if(v.bindingPath != "button_export_excel" && v.type != "TextBlock") {
        v.enableWhen = "WhatEverName===1"
    }
})

// 注册修改后的模板
GC.Spread.Sheets.Designer.registerTemplate(
    GC.Spread.Sheets.Designer.TemplateNames.FileMenuPanelTemplate, 
    template
)
```

## 七、总结

本示例展示了 SpreadJS Designer 模板系统的强大定制能力，通过修改内置模板实现了对文件菜单功能的精细化控制。开发者可以从中学到：

- 如何获取和修改 Designer 的内置 UI 模板
- 如何使用 `bindingPath` 和条件表达式（`enableWhen`、`visibleWhen`）实现动态控制
- 如何通过遍历模板结构批量修改控件属性
- 如何注册自定义模板使修改生效

该方案适用于需要根据业务规则动态控制 Designer 功能可用性的场景，具有良好的扩展性。在实际应用中，建议结合权限管理系统和数据绑定机制，实现更加健壮和灵活的功能控制方案。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/n0Ruf23VPkeEZ_oiDBDx2A/)）
