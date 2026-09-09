## 一、Demo 概述

本示例展示了如何在 SpreadJS Designer 中为不同的 Sheet 页设置独立的数据绑定配置。通过监听工作表切换事件，实现了在切换 Sheet 时自动保存和恢复各自的数据绑定设置，使每个 Sheet 页可以拥有独立的数据绑定列表，互不干扰。

该功能适用于需要在同一工作簿中管理多个不同数据源或数据结构的场景，例如多业务模块报表、多维度数据分析等。

## 二、解决的问题

在使用 SpreadJS Designer 的数据绑定功能时，默认情况下所有 Sheet 页共享同一个数据绑定配置。这会导致以下问题：

- 当在 Sheet1 设置数据绑定后，切换到 Sheet2 时，Designer 的数据绑定面板仍显示 Sheet1 的配置
- 无法为不同的 Sheet 页设置不同的数据源结构
- 多个 Sheet 页的数据绑定配置会相互覆盖

本示例通过监听 Sheet 切换事件，将每个 Sheet 的数据绑定配置存储在 Sheet 的 tag 属性中，实现了不同 Sheet 页独立管理数据绑定列表的功能。

## 三、实现思路

### 3.1 核心技术点

#### 监听 Sheet 切换事件

通过监听 `ActiveSheetChanged` 事件，在用户切换 Sheet 时触发保存和恢复逻辑：

```javascript
spread.bind(GC.Spread.Sheets.Events.ActiveSheetChanged, function (sender, args) {
    let { oldSheet, newSheet } = args
    // 保存旧 Sheet 的数据绑定配置
    // 恢复新 Sheet 的数据绑定配置
})
```

#### 保存数据绑定配置到 Sheet Tag

从 Designer 的内部数据中获取当前的数据绑定配置，并保存到 Sheet 的 tag 属性中：

```javascript
let oldBinding = designer.getData("updatedTreeNode") || 
                 designer.getData("treeNodeFromJson") || 
                 designer.getData("oldTreeNodeFromJson")
try {
    oldSheet && oldSheet.tag(oldBinding)
} catch(e){}
```

这里使用了三个可能的数据源（`updatedTreeNode`、`treeNodeFromJson`、`oldTreeNodeFromJson`），确保能够获取到最新的数据绑定配置。

#### 恢复数据绑定配置

切换到新 Sheet 时，从 Sheet 的 tag 属性中读取之前保存的数据绑定配置，并设置到 Designer 的内部数据中：

```javascript
if (newSheet) {
    let newBinding = newSheet.tag() || 
        '{"$schema":"http://json-schema.org/draft-04/schema#","properties":{},"type":"object"}'
    designer.setData("treeNodeFromJson", newBinding);
    designer.setData("oldTreeNodeFromJson", newBinding);
    designer.setData("updatedTreeNode", newBinding);
}
```

如果 Sheet 没有保存过数据绑定配置，则使用默认的空 JSON Schema 结构。

### 3.2 技术栈

- SpreadJS v16.0.1：核心表格组件
- SpreadJS Designer v16.0.1：设计器组件
- SystemJS：模块加载器
- TypeScript v4.1.2：开发语言支持

## 四、使用说明

### 4.1 运行方式

1. 安装依赖：
```bash
npm install
```

2. 使用本地服务器打开 `index.html` 文件（由于使用了 SystemJS 模块加载，需要通过 HTTP 服务器访问）

### 4.2 操作步骤

1. 打开示例后，会看到 SpreadJS Designer 界面，工作簿包含 5 个 Sheet 页
2. 在 Sheet1 中，使用 Designer 的数据绑定功能设置数据源和绑定字段
3. 切换到 Sheet2，会发现数据绑定面板显示为空（或默认配置）
4. 在 Sheet2 中设置不同的数据绑定配置
5. 再次切换回 Sheet1，会发现之前设置的数据绑定配置被正确恢复
6. 重复以上步骤，验证每个 Sheet 页都能独立保存和恢复数据绑定配置

## 五、功能特点

### 5.1 优点

- 实现了不同 Sheet 页的数据绑定配置隔离，互不干扰
- 利用 Sheet 的 tag 属性存储配置，无需额外的数据结构
- 代码简洁，通过事件监听机制自动处理保存和恢复逻辑
- 支持多个 Sheet 页同时管理不同的数据源结构

### 5.2 局限性与扩展建议

当前实现的局限性：

- 数据绑定配置仅保存在内存中（Sheet tag），刷新页面后会丢失
- 没有对数据绑定配置进行持久化存储

扩展建议：

- 可以结合 SpreadJS 的序列化功能，将整个工作簿（包括 Sheet tag）保存为 JSON 或 Excel 文件
- 可以添加自动保存功能，定期将配置保存到后端服务器
- 可以添加配置导入导出功能，方便在不同工作簿之间复用数据绑定配置

## 六、关键代码片段

完整的事件监听和配置管理逻辑：

```javascript
spread.bind(GC.Spread.Sheets.Events.ActiveSheetChanged, function (sender, args) {
    let { oldSheet, newSheet } = args
    
    // 获取当前 Designer 中的数据绑定配置
    let oldBinding = designer.getData("updatedTreeNode") || 
                     designer.getData("treeNodeFromJson") || 
                     designer.getData("oldTreeNodeFromJson")
    
    // 保存到旧 Sheet 的 tag 属性中
    try {
        oldSheet && oldSheet.tag(oldBinding)
    } catch(e){}
    
    // 从新 Sheet 的 tag 属性中恢复配置
    if (newSheet) {
        let newBinding = newSheet.tag() || 
            '{"$schema":"http://json-schema.org/draft-04/schema#","properties":{},"type":"object"}'
        
        // 将配置设置到 Designer 的内部数据中
        designer.setData("treeNodeFromJson", newBinding);
        designer.setData("oldTreeNodeFromJson", newBinding);
        designer.setData("updatedTreeNode", newBinding);
    }
})
```

## 七、总结

本示例展示了如何通过监听 Sheet 切换事件和利用 Sheet 的 tag 属性，实现多个 Sheet 页独立管理数据绑定配置的功能。开发者可以从中学到：

- SpreadJS 事件监听机制的使用方法
- Sheet tag 属性的存储和读取技巧
- SpreadJS Designer 内部数据的访问和设置方式
- 如何解决多 Sheet 页配置隔离的问题

该方案适用于需要在同一工作簿中管理多个不同数据源的场景，具有良好的扩展性。开发者可以在此基础上添加持久化存储、配置导入导出等功能，进一步增强实用性。

### 在线Demo（[全屏打开](https://jscodemine.grapecity.com/share/MEe4fV0kRUqUYUpeH6F5yg/?)）
