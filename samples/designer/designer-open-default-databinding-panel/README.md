## 一、Demo 概述

本示例演示了如何在 SpreadJS Designer 中默认开启数据绑定侧边栏，并预加载自定义的字段列表（Field List）。通过编程方式设置 JSON Schema 格式的数据绑定模板，并自动切换到设计模式，使用户可以直接使用预定义的字段进行数据绑定操作，无需手动配置字段结构。

该功能适用于需要为用户提供标准化数据绑定模板的场景，例如报表设计工具、数据填报系统等，可以简化用户操作流程，提高开发效率。

## 二、解决的问题

* **简化数据绑定配置**：通过预设字段列表，用户无需手动定义数据结构，可以直接拖拽字段到单元格进行绑定
* **标准化数据模板**：为不同业务场景提供统一的数据绑定模板，确保数据结构的一致性
* **提升用户体验**：自动打开设计模式和字段列表侧边栏，减少用户的操作步骤

## 三、实现思路

### 3.1 定义 JSON Schema 数据结构

使用 JSON Schema 格式定义数据绑定的字段结构，支持基本类型（text）和复杂类型（table/array）：

```javascript
var bindingSchema = {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "properties": {
    "姓名": {
      "dataFieldType": "text",
      "type": "string"
    },
    "履历": {
      "dataFieldType": "table",
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "时间": {"type": "string"},
          "公司": {"type": "string"}
        }
      }
    }
  },
  "type": "object"
}
```

该 Schema 定义了两个字段：

* `姓名`：文本类型字段
* `履历`：表格类型字段，包含嵌套的 `时间` 和 `公司` 子字段

### 3.2 设置字段列表到 Designer

通过 `setData` 方法将 JSON Schema 注入到 Designer 的字段列表中：

```javascript
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container");

// 设置字段列表
designer.setData("treeNodeFromJson", JSON.stringify(bindingSchema));
```

`treeNodeFromJson` 是 Designer 内部用于存储字段列表的数据键，设置后字段会自动显示在侧边栏中。

### 3.3 自动切换到设计模式

通过执行 `DesignMode` 命令，自动打开设计模式和数据绑定侧边栏：

```javascript
let designModeCommand = GC.Spread.Sheets.Designer.getCommand(
  GC.Spread.Sheets.Designer.CommandNames.DesignMode
);
designModeCommand.execute(designer);
```

### 3.4 获取字段列表数据

可以通过 `getData` 方法读取当前的字段列表配置：

```javascript
console.log(
  JSON.parse(
    designer.getData("treeNodeFromJson") || 
    designer.getData("oldTreeNodeFromJson") || 
    designer.getData("updatedTreeNode")
  )
);
```

支持三种数据键：

* `treeNodeFromJson`：初始设置的字段列表
* `oldTreeNodeFromJson`：旧版本的字段列表
* `updatedTreeNode`：用户修改后的字段列表

### 3.5 技术栈

* SpreadJS 15.0.0：核心表格组件
* SpreadJS Designer 15.0.0：设计器组件
* SystemJS：模块加载器
* TypeScript 4.1.2：开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，Designer 会自动进入设计模式
2. 右侧侧边栏会显示预定义的字段列表（姓名、履历）
3. 将字段拖拽到单元格中即可完成数据绑定
4. 对于表格类型字段（履历），可以展开查看子字段（时间、公司）
5. 切换到预览模式可以查看绑定效果

## 五、功能特点

### 5.1 优点

* **开箱即用**：页面加载后自动配置好字段列表和设计模式，无需手动操作
* **灵活的数据结构**：支持 JSON Schema 标准，可以定义复杂的嵌套数据结构
* **可扩展性强**：可以通过修改 `bindingSchema.js` 文件轻松调整字段配置

### 5.2 扩展建议

* 可以从后端 API 动态加载字段列表，而不是硬编码在 JS 文件中
* 可以添加字段验证规则（如必填、格式校验等）
* 可以支持多套字段模板，让用户根据场景选择

## 六、总结

本示例展示了如何通过编程方式预配置 SpreadJS Designer 的数据绑定字段列表，并自动打开设计模式。开发者可以从中学到：

1. 如何使用 JSON Schema 定义数据绑定结构
2. 如何通过 `setData` 和 `getData` 方法操作 Designer 的内部数据
3. 如何通过命令模式（Command Pattern）控制 Designer 的行为
4. 如何实现自动化的用户界面配置

该方案适用于需要为用户提供标准化数据绑定模板的场景，可以显著提升用户体验和开发效率。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
