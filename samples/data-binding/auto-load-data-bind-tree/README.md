## 一、Demo 概述

本示例展示了如何在 SpreadJS 设计器初始化时自动加载预定义的数据绑定树结构。在实际业务场景中，数据绑定树通常由服务端根据数据库表结构动态生成，并通过 JSON Schema 格式返回给前端。该示例演示了如何将这些预定义的绑定树结构加载到设计器右侧的数据绑定面板中，使用户可以直接拖拽字段进行数据绑定操作，无需手动构建绑定树。 

## 二、解决的问题

在企业级应用中，表单模板通常需要与后端数据库表结构保持一致。传统方式下，用户需要在设计器中手动添加数据绑定字段，这不仅效率低下，还容易出错。本示例解决了以下核心问题：

* 自动加载服务端返回的数据绑定树结构，避免手动配置
* 支持从完整的工作簿 JSON 或独立的 Schema JSON 中提取绑定树
* 确保设计器打开时数据绑定面板默认展开并可用
* 提供绑定树数据的持久化保存方案

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 定义 JSON Schema 数据结构

使用标准的 JSON Schema Draft-04 格式定义数据绑定树，每个字段包含 `dataFieldType` 和 `type` 属性：

```javascript
let bindSchema = {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "properties": {
        "检测单位": {
            "dataFieldType": "text",
            "type": "string"
        },
        "委托单名称": {
            "dataFieldType": "text",
            "type": "string"
        },
        "委托编号": {
            "dataFieldType": "text",
            "type": "string"
        }
        // ... 更多字段
    },
    "type": "object"
}
```

#### 3.1.2 配置设计器默认打开数据面板

通过修改设计器的 Ribbon 配置，使数据绑定 Tab 在初始化时自动显示：

```javascript
const FirstLoad = "firstLoad"
let config = GC.Spread.Sheets.Designer.DefaultConfig
// 设置第5个 Tab（数据面板）在首次加载时可见
config.ribbon[4].visibleWhen = FirstLoad
designer.setConfig(config)
designer.setData(FirstLoad, true)
designer.refresh()
```

#### 3.1.3 加载绑定树到设计器

设计器初始化完成后，通过 `setData` 方法将 JSON Schema 加载到三个关键数据节点：

```javascript
designer.setData("treeNodeFromJson", JSON.stringify(bindSchema))
designer.setData("oldTreeNodeFromJson", JSON.stringify(bindSchema))
designer.setData("updatedTreeNode", JSON.stringify(bindSchema))
```

这三个数据节点分别用于：

* `treeNodeFromJson`：当前绑定树结构
* `oldTreeNodeFromJson`：原始绑定树结构（用于对比变更）
* `updatedTreeNode`：更新后的绑定树结构

#### 3.1.4 自动进入设计模式

确保设计器处于设计模式，使数据绑定功能可用：

```javascript
if(!GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.DesignMode).getState(designer)){
    GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.DesignMode).execute(designer)
}
```

### 3.2 技术栈

* SpreadJS 16.0.1：核心电子表格引擎
* SpreadJS Designer 16.0.1：可视化设计器组件
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

1. 打开 index.html 文件，设计器会自动加载并显示数据绑定面板
2. 在右侧数据绑定树中可以看到预定义的字段列表（检测单位、委托单名称等）
3. 将字段拖拽到工作表单元格中，即可建立数据绑定关系
4. 保存模板时，可通过 `designer.getData('treeNodeFromJson')` 获取绑定树结构并一同保存

## 五、功能特点

### 5.1 优点

* 自动化加载：无需手动构建数据绑定树，提升设计效率
* 灵活的数据源：支持从独立 Schema 或完整工作簿 JSON 中加载
* 持久化支持：提供绑定树数据的保存和恢复机制
* 用户体验优化：设计器启动时自动打开数据面板，减少操作步骤

### 5.2 扩展建议

* 可以添加绑定树的动态更新功能，支持运行时修改字段结构
* 支持嵌套对象和数组类型的复杂数据结构
* 添加字段验证规则（如必填、格式校验等）

## 六、关键代码片段

### 从完整工作簿 JSON 加载绑定树

如果绑定树结构保存在完整的工作簿 JSON 中，可以使用以下方式提取：

```javascript
// workbookJson 代表整个文件的 JSON
designer.setData("treeNodeFromJson", JSON.stringify(workbookJson.designerBindingPathSchema))
designer.setData("oldTreeNodeFromJson", JSON.stringify(workbookJson.designerBindingPathSchema))
designer.setData("updatedTreeNode", JSON.stringify(workbookJson.designerBindingPathSchema))
```

### 保存时获取绑定树数据

在提交数据时，`spread.toJSON()` 不包含绑定树结构，需要单独获取：

```javascript
// 获取当前绑定树结构
let bindingTree = designer.getData('treeNodeFromJson') || 
                  designer.getData('updatedTreeNode') || 
                  designer.getData('oldTreeNodeFromJson')
```

## 七、总结

本示例展示了 SpreadJS 设计器中数据绑定树的自动加载方案，特别适用于需要与后端数据库表结构同步的企业级应用场景。开发者可以从中学到：

* JSON Schema 在 SpreadJS 中的应用方式
* 设计器配置和初始化流程
* 数据绑定树的加载和持久化机制
* 设计模式的编程控制方法

该方案可以显著提升模板设计效率，减少人工配置错误，适合在报表系统、表单设计器等场景中推广使用。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
