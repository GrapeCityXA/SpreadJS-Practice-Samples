## 一、Demo 概述

本示例展示了如何将树形结构数据扁平化并在 SpreadJS 表格中以层级关系展示。通过递归遍历树形数据，将每个节点转换为单元格行，并使用文本缩进（textIndent）和列分组（outlineColumn）功能实现可折叠的层级视图。这种方式常用于在电子表格中展示组织架构、文件目录、分类数据等具有父子关系的信息。

## 二、解决的问题

* **树形数据扁平化**：将嵌套的树形结构数据转换为适合表格展示的一维数组
* **层级可视化**：通过文本缩进直观展示数据的层级关系
* **交互式折叠**：利用 SpreadJS 的列分组功能实现节点的展开/折叠操作

## 三、实现思路

### 3.1 树形数据扁平化

核心是通过递归函数 `flattenTree` 遍历树形结构，将每个节点及其层级信息提取到扁平数组中：

```javascript
function flattenTree(tree, level = 0) {
    const result = [];

    tree.forEach((node) => {
        result.push({ name: node.name, level: level.toString() });
        if (node.children) {
            result.push(...flattenTree(node.children, level + 1));
        }
    });

    return result;
}
```

该函数接收树形数组和当前层级（默认为 0），递归处理每个节点的 `children` 属性，并将层级深度记录在 `level` 字段中。

### 3.2 单元格文本缩进

使用 `textIndent()` 方法根据层级深度设置单元格的文本缩进，实现视觉上的层级效果：

```javascript
for (const item of flattenedTree) {
    sheet.setValue(i, 0, item.name);
    sheet.getCell(i, 0).textIndent(item.level);
    i++;
}
```

`textIndent(item.level)` 将层级数字转换为缩进量，层级越深，文本缩进越多。

### 3.3 列分组配置

配置 `outlineColumn` 实现可折叠的层级结构：

```javascript
sheet.outlineColumn.options({
    columnIndex: 0,
    maxLevel: 10,
});
sheet.showRowOutline(false);
sheet.outlineColumn.refresh();
```

* `columnIndex: 0`：指定第 0 列作为分组列
* `maxLevel: 10`：设置最大层级深度为 10
* `showRowOutline(false)`：隐藏行分组线（仅显示列分组）
* `refresh()`：刷新分组视图

### 3.4 技术栈

* SpreadJS 17.0.8：核心电子表格组件
* SystemJS 0.19.22：模块加载器
* systemjs-plugin-babel 0.0.25：ES6 语法转译

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 使用本地服务器打开 index.html（如 Live Server）
```

### 4.2 操作步骤

1. 打开页面后，表格自动加载树形数据
2. 观察第一列的文本缩进效果，不同层级的节点有不同的缩进量
3. 点击单元格左侧的折叠/展开图标，可以控制子节点的显示/隐藏

## 五、功能特点

### 5.1 优点

* **数据转换简洁**：递归算法清晰易懂，易于扩展到更复杂的树形结构
* **原生 SpreadJS 功能**：利用内置的 textIndent 和 outlineColumn API，无需自定义渲染逻辑
* **交互友好**：支持折叠/展开操作，适合展示大量层级数据

### 5.2 局限性与扩展建议

* **层级深度限制**：当前 `maxLevel` 设置为 10，超过此深度的节点可能无法正确分组
* **单列展示**：示例仅在第 0 列展示数据，实际应用中可扩展为多列（如添加节点属性、统计数据等）
* **扩展建议**：
    * 可以在扁平化时添加更多节点属性（如 ID、类型、数值等）
    * 结合 `setRowVisible()` 实现自定义的展开/折叠逻辑
    * 添加搜索功能，自动展开匹配节点的父级路径

## 六、关键代码片段

### 树形数据结构示例

```javascript
const originalTree = [
    {
        name: "a1",
        children: [
            {
                name: "a1-1",
                children: [
                    {
                        name: "a1-1-1",
                    },
                ],
            },
            {
                name: "a1-2",
                children: [
                    {
                        name: "a1-2-1",
                    },
                ],
            },
        ],
    },
];
```

该结构定义了一个三层的树形数据，每个节点包含 `name` 和可选的 `children` 数组。

## 七、总结

本示例展示了如何将树形数据在 SpreadJS 中以层级关系展示的完整方案。开发者可以学到：

* 树形数据的递归扁平化算法
* SpreadJS 的 `textIndent()` 方法实现文本缩进
* `outlineColumn` API 的配置和使用
* 如何结合数据结构和 UI 功能实现层级可视化

该方案适用于需要在电子表格中展示组织架构、分类目录、BOM 清单等具有层级关系的数据场景，具有良好的扩展性和交互体验。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
