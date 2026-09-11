## 一、Demo 概述

本示例展示了如何在 SpreadJS 中通过自定义单元格类型（CellType）集成第三方树形控件 zTree，实现一个具有树形结构的下拉选择器。用户点击单元格时，会弹出一个树形菜单，支持多层级的数据选择（如省-市-区的层级结构），选中节点后单元格会显示对应的节点名称。 

该示例适用于需要在表格中选择具有层级关系数据的场景，如行政区划选择、组织架构选择、分类目录选择等。

## 二、解决的问题

* **层级数据选择**：传统的下拉列表只能展示扁平化数据，无法直观展示父子层级关系。通过集成 zTree，可以以树形结构展示和选择多层级数据
* **复杂数据结构展示**：当选项数据具有明确的层级关系时（如地区、部门、分类），树形选择器比普通下拉列表更符合用户的认知习惯
* **第三方组件集成**：演示了如何将成熟的第三方 UI 组件（zTree）集成到 SpreadJS 的自定义单元格中，为开发者提供扩展思路

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 自定义单元格类型

通过继承 `GC.Spread.Sheets.CellTypes.ComboBox` 创建自定义的 `ComboTreeCellType`，重写关键方法以实现树形选择器功能：

```javascript
var ComboTreeCellType = function () { ComboTreeCellType.treeID = 0; };
ComboTreeCellType.prototype = new GC.Spread.Sheets.CellTypes.ComboBox();
```

这种继承方式保留了 ComboBox 的基础功能（如下拉按钮、编辑状态管理），同时允许自定义编辑器的内容和行为。

#### 3.1.2 创建 zTree 编辑器

重写 `createEditorElement` 方法，创建包含 zTree 的编辑器容器：

```javascript
ComboTreeCellType.prototype.createEditorElement = function (context) {
    var self = this, sheet = context.sheet;
    var zTree = $('<ul class="ztree"></ul>');
    self.treeID = "tree" + ComboTreeCellType.treeID++;
    var setting = {
        treeId: self.treeID,
        callback: {
            onClick: function (data, treeId, treeNode) {
                self.selectedNode = treeNode;
                sheet.endEdit();  // 选中节点后自动结束编辑
            }
        }
    };
    $.fn.zTree.init(zTree, setting, this.items());
    var editor = $('<div gcUIElement="ComboTree" style="background-color:white;max-height:400px;border-style:solid;border-width:thin;border-color:black;overflow:scroll"></div>');
    editor.append(zTree);
    editor[0].comboBox = zTree[0];
    return editor[0];
}
```

关键点：

* 为每个实例生成唯一的 `treeID`，避免多个单元格使用同一个树实例时冲突
* 在 `onClick` 回调中保存选中节点并调用 `sheet.endEdit()` 结束编辑
* 设置编辑器容器的样式（最大高度、边框、滚动条）

#### 3.1.3 获取和设置编辑器值

重写 `getEditorValue` 和 `setEditorValue` 方法，处理节点对象与单元格值的转换：

```javascript
ComboTreeCellType.prototype.getEditorValue = function (editorContext, context) {
    if (this.selectedNode) {
        return this.selectedNode;  // 返回完整的节点对象
    }
    return "";
}

ComboTreeCellType.prototype.setEditorValue = function (editorContext, value, context) {
    var treeObj = $.fn.zTree.getZTreeObj(self.treeID);
    var nodes = treeObj.getNodes();
    if (value) {
        var node = this.findNode(nodes, value);
        if (node) {
            treeObj.selectNode(node);
            this.selectedNode = node;
        } else {
            treeObj.selectNode(null);
        }
    } else {
        treeObj.selectNode(null);
    }
}
```

`getEditorValue` 返回完整的节点对象（包含 id、name、children 等属性），而不仅仅是节点名称，这样可以保留更多的节点信息。

#### 3.1.4 自定义绘制逻辑

重写 `paint` 方法，在单元格中显示节点名称：

```javascript
var oldpaint = ComboTreeCellType.prototype.paint;
ComboTreeCellType.prototype.paint = function (ctx, value, x, y, w, h, style, options) {
    if(value){
        oldpaint.call(this, ctx, value.name , x, y, w, h, style, options);
    }else{
        oldpaint.call(this, ctx, value, x, y, w, h, style, options);
    }
};
```

由于单元格值存储的是节点对象，绘制时需要提取 `value.name` 属性显示在单元格中。

#### 3.1.5 递归查找节点

实现 `findNode` 方法，支持在多层级树结构中查找指定节点：

```javascript
ComboTreeCellType.prototype.findNode = function (nodes, name) {
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].name === name) {
            return nodes[i];
        }
        if (nodes[i].children && nodes[i].children.length > 0) {
            var node = this.findNode(nodes[i].children, name);
            if (node) {
                return node;
            }
        }
    }
    return null;
}
```

该方法使用递归算法遍历树的所有层级，直到找到匹配的节点。

### 3.2 技术栈

* SpreadJS 15.0.0 — 核心表格控件
* zTree 3.5.42 — 第三方树形控件
* jQuery 3.6.1 — zTree 的依赖库
* SystemJS 0.19.22 — 模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

注意：需要确保网络连接正常，因为 zTree 和 jQuery 通过 CDN 加载。

### 4.2 操作步骤

1. 打开页面后，可以看到一个 SpreadJS 表格，其中 A1 和 C1 单元格已设置为树形选择器类型
2. 点击 A1 或 C1 单元格，会弹出一个树形下拉菜单
3. 树形菜单展示了中国部分省市区的层级结构（如"陕西省 > 西安市 > 雁塔区"）
4. 点击任意节点（包括父节点和子节点），单元格会显示该节点的名称
5. 再次点击单元格可以重新选择

## 五、功能特点

### 5.1 优点

* **直观的层级展示**：树形结构清晰展示数据的父子关系，用户可以快速定位目标选项
* **灵活的数据结构**：支持任意层级的树形数据，节点可以包含自定义属性（id、name、children 等）
* **良好的扩展性**：基于成熟的 zTree 组件，可以轻松扩展功能（如搜索、复选框、异步加载等）
* **完整的节点信息**：单元格值存储完整的节点对象，可以在后续处理中获取节点的 id、父节点等信息

### 5.2 局限性与扩展建议

* **依赖外部库**：需要引入 jQuery 和 zTree，增加了项目的依赖体积
* **样式定制**：当前使用 zTree 默认样式，如需定制需要修改 CSS
* **性能优化**：对于超大数据量的树（如数千个节点），建议使用 zTree 的异步加载功能
* **扩展建议**：
    * 可以添加搜索功能，方便在大量节点中快速定位
    * 可以支持多选模式（使用 zTree 的复选框功能）
    * 可以添加节点图标，增强视觉效果

## 六、关键代码片段

### 6.1 数据结构定义

```javascript
var items = [
    {
        id:1,
        name: "北京", open: true,
        children: [
            { id:11, name: "海淀区" },
            { id:12, name: "朝阳区" }
        ]
    },
    {
        id:5,
        name: "陕西省", open: true,
        children: [
            {
                id:51,
                name: "西安市",
                children: [
                    { id:511, name: "雁塔区" },
                    { id:512, name: "莲湖区" }
                ]
            },
            { id:52, name: "宝鸡市" }
        ]
    }
];
```

数据结构说明：

* `id`：节点唯一标识
* `name`：节点显示名称
* `open`：是否默认展开
* `children`：子节点数组，支持多层嵌套

### 6.2 应用自定义单元格类型

```javascript
var cellType = new ComboTreeCellType();
cellType.items(items);  // 设置树形数据

sheet.setCellType(0, 0, cellType);  // 应用到 A1 单元格
sheet.setCellType(0, 2, cellType);  // 应用到 C1 单元格
```

## 七、总结

本示例展示了 SpreadJS 自定义单元格类型的强大扩展能力，通过集成第三方树形控件 zTree，实现了一个功能完整的树形选择器。开发者可以从中学到：

* 如何继承和扩展 SpreadJS 内置的单元格类型
* 如何集成第三方 UI 组件到 SpreadJS 中
* 如何处理复杂的数据结构（树形数据）
* 如何自定义单元格的编辑器、绘制逻辑和值处理

该方案适用于需要在表格中选择层级数据的场景，具有良好的用户体验和扩展性。开发者可以参考此示例，集成其他第三方组件（如日期选择器、颜色选择器等），进一步丰富 SpreadJS 的功能。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
