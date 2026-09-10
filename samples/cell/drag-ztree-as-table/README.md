## 一、Demo 概述

本示例展示了如何将 zTree 树形控件与 SpreadJS 表格组件集成，实现从树形结构拖拽节点到表格中自动生成数据表的功能。用户可以从左侧的 zTree 树形菜单中拖拽带有子节点的数据项到右侧的 SpreadJS 表格区域，系统会自动根据树节点的结构在指定位置创建表格（Table），并绑定相应的数据字段。 

该示例适用于需要从层级数据源快速构建表格结构的场景，例如数据库表结构可视化、报表模板设计、数据字段映射配置等。

## 二、解决的问题

* **快速表格构建**：通过拖拽操作快速将树形数据结构转换为表格，避免手动创建表格和配置列的繁琐过程
* **数据绑定自动化**：拖拽树节点时自动建立数据绑定关系，将树节点的 dataField 属性映射到表格列
* **可视化交互反馈**：拖拽过程中实时显示目标单元格的高亮提示，提升用户体验
* **灵活的数据映射**：支持单个字段绑定和整表结构生成两种模式，适应不同的数据组织需求

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 zTree 拖拽配置与事件监听

通过配置 zTree 的 edit 和 callback 选项，启用拖拽功能并监听拖拽生命周期事件：

```javascript
var setting = {
    edit: {
        enable: true,
        showRemoveBtn: false,
        showRenameBtn: false
    },
    data: {
        simpleData: {
            enable: true
        }
    },
    callback: {
        onDrag: (event, treeId, treeNodes) => this._onDrag(event, treeId, treeNodes),
        onDragMove: (event, treeId, treeNodes) => this._onDragMove(event, treeId, treeNodes),
        onDrop: (event, treeId, treeNodes, targetNode, moveType) => this._onDrop(event, treeId, treeNodes, targetNode, moveType)
    }
};
```

通过 `onDrag`、`onDragMove` 和 `onDrop` 三个回调函数分别处理拖拽开始、拖拽移动和拖拽释放事件。

#### 3.1.2 拖拽过程中的单元格定位与高亮

使用 SpreadJS 的 `hitTest` API 实时获取鼠标位置对应的单元格信息，并通过自定义 DOM 元素实现高亮效果：

```javascript
ZTree.prototype._onDocumentMouseMove = function(evt){
    evt.preventDefault();
    let hitInfo = this._getHitTestInfo(evt);
    if (!hitInfo || hitInfo.row === undefined || hitInfo.col === undefined) {
        return;
    }
    if(hitInfo.rowViewportIndex !== 1 || hitInfo.colViewportIndex !== 1){
        return;
    }
    let activeSheet = this.spread.getActiveSheet();
    let rect = activeSheet.getCellRect(hitInfo.row, hitInfo.col);
    this._highlightBlock(rect);
}
```

`_highlightBlock` 方法创建一个绝对定位的 div 元素，设置蓝色边框和阴影效果，覆盖在目标单元格上方：

```javascript
ZTree.prototype._highlightBlock = function(rect){
    if(!this.decoration){
        this.decoration = document.createElement("div");
        this.decoration.style.position = "absolute"
        this.decoration.style.border = "1px solid blue"
        this.decoration.style.boxShadow = "0px 0px 4px 0px #007eff"
        this.decoration.style.zIndex = "1000"
        this.spread.getHost().appendChild(this.decoration);
    }
    this.decoration.style.width = (rect.width - 1) + "px";
    this.decoration.style.height = (rect.height - 1) + "px";
    this.decoration.style.left = rect.x + "px";
    this.decoration.style.top = rect.y + "px";
}
```

#### 3.1.3 根据树节点结构动态生成表格

在 `_onDrop` 方法中判断拖拽的树节点是否包含子节点，如果有子节点则创建 Table 对象并绑定列：

```javascript
ZTree.prototype._onDocumentMouseUp = function(evt, items){
    // ... 省略位置检测代码 ...
    let activeSheet = this.spread.getActiveSheet();
    if(items && items.length){
        let item = items[0]
        if(item.children && item.children.length){
            // 创建表格，行数为2（表头+1行数据），列数为子节点数量
            var table = activeSheet.tables.add("Table" + item.id, hitInfo.row, hitInfo.col, 2, item.children.length);
            table.autoGenerateColumns(false);
            let cloumns = []
            for(var j = 0; j < item.children.length; j++){
                let child = item.children[j];
                var tableColumn = new GC.Spread.Sheets.Tables.TableColumn();
                tableColumn.name(child.name);
                tableColumn.dataField(child.dataField);
                cloumns.push(tableColumn)
            }
            table.bindColumns(cloumns);
            table.bindingPath(item.id);
        }
        else{
            // 如果没有子节点，直接设置单元格的绑定路径
            activeSheet.setBindingPath(hitInfo.row, hitInfo.col, items[0].id)
        }
        activeSheet.repaint();
    }
}
```

关键点：

* 使用 `tables.add()` 创建表格，参数包括表格名称、起始行列、行数和列数
* 设置 `autoGenerateColumns(false)` 禁用自动列生成
* 通过 `TableColumn` 对象配置每列的名称和数据字段
* 使用 `bindColumns()` 和 `bindingPath()` 建立数据绑定关系

#### 3.1.4 坐标转换与命中测试

由于鼠标事件的坐标是相对于页面的，需要转换为相对于 canvas 元素的坐标才能正确进行命中测试：

```javascript
ZTree.prototype._getHitTestInfo = function(event) {
    if(!this.spread){
        return;
    }
    let activeSheet = this.spread.getActiveSheet();
    if (!activeSheet) {
        return;
    }
    let canvas = this.spread.getHost().querySelector("canvas[gcuielement]");
    let t = this._getOffset(canvas);
    return activeSheet.hitTest(event.pageX - t.left, event.pageY - t.top);
}

ZTree.prototype._getOffset = function(element) {
    let left = 0;
    let top = 0;
    while (element) {
        left += element.offsetLeft;
        top += element.offsetTop;
        element = element.offsetParent;
    }
    return {
        left: left,
        top: top
    };
}
```

### 3.2 UI 交互流程

用户操作流程：

1. 在左侧 zTree 树形菜单中选择一个节点
2. 按住鼠标左键开始拖拽 → 触发 `onDrag` 事件
3. 移动鼠标到右侧 SpreadJS 表格区域 → 触发 `onDragMove` 事件，目标单元格显示蓝色高亮边框
4. 释放鼠标 → 触发 `onDrop` 事件，根据节点类型执行相应操作：
    * 如果节点有子节点：在目标位置创建表格，列数等于子节点数量
    * 如果节点无子节点：在目标单元格设置数据绑定路径
5. 高亮边框消失，表格生成完成

### 3.3 技术栈

* **SpreadJS**: 15.2.2 - 核心表格组件
* **SpreadJS Designer**: 15.2.2 - 提供设计器界面
* **zTree**: 3.5.48 - 树形控件库
* **jQuery**: 1.4.4 - zTree 依赖
* **SystemJS**: 0.19.22 - 模块加载器
* **TypeScript**: 4.1.2 - 开发语言

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
# 或使用本地服务器运行（推荐）
npx http-server -p 8080
```

### 4.2 操作步骤

1. 打开页面后，左侧显示 zTree 树形菜单，右侧显示 SpreadJS 设计器
2. 在左侧树形菜单中找到"表格 1-2"节点（该节点包含三个字段子节点）
3. 用鼠标拖拽"表格 1-2"节点到右侧表格的任意单元格位置
4. 拖拽过程中观察目标单元格的蓝色高亮提示
5. 释放鼠标后，系统自动在该位置生成一个包含三列的表格
6. 表格的列名分别为"字段 1-2-1"、"字段 1-2-2"、"字段 1-2-3"
7. 也可以尝试拖拽叶子节点（如"数据项 1-1"）到单元格，将设置该单元格的数据绑定

## 五、功能特点

### 5.1 优点

* **直观的拖拽交互**：通过拖拽操作快速构建表格，符合用户的操作习惯
* **实时视觉反馈**：拖拽过程中的高亮提示让用户清楚知道目标位置
* **自动化数据绑定**：无需手动配置数据绑定关系，系统根据树节点结构自动建立映射
* **灵活的应用场景**：既支持整表生成，也支持单字段绑定，适应不同的业务需求

### 5.2 局限性与扩展建议

* **表格样式固定**：当前生成的表格使用默认样式，可扩展支持自定义表格主题和样式
* **数据源未连接**：示例中只建立了绑定路径，实际应用中需要连接真实数据源
* **拖拽限制较少**：可以增加拖拽规则验证，例如禁止拖拽到已有表格区域、限制拖拽节点类型等
* **扩展建议**：
    * 支持拖拽后弹出配置对话框，让用户自定义表格行数、样式等参数
    * 增加撤销/重做功能
    * 支持从表格拖拽回树形菜单进行结构调整

## 六、关键代码片段

### 6.1 树形数据结构定义

```javascript
var zNodes = [
    { id: 1, pId: 0, name: "数据项 1", open: true },
    { id: 11, pId: 1, name: "数据项 1-1" },
    { id: 12, pId: 1, name: "表格 1-2", open: true },
    { id: 121, pId: 12, name: "字段 1-2-1", dataField: "字段1" },
    { id: 122, pId: 12, name: "字段 1-2-2", dataField: "字段2" },
    { id: 123, pId: 12, name: "字段 1-2-3", dataField: "字段3" },
    // ... 更多节点
];
```

每个节点包含 `id`、`pId`（父节点ID）、`name`（显示名称）和可选的 `dataField`（数据字段名）属性。

### 6.2 初始化 SpreadJS Designer 和 zTree

```javascript
function initDesigner() {
    let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.ToolBarModeConfig))
    config.commandMap = {};
    let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", config)
    designer.setData("DefaultFieldList", true)
    
    let spread = designer.getWorkbook()
    let sheet = spread.getActiveSheet()
    
    spread.getHost().style.position = "relative"
    let zTree = new ZTree("treeDemo", zNodes, spread)
}
```

关键点：设置 `spread.getHost().style.position = "relative"` 以支持绝对定位的高亮元素。

## 七、总结

本示例展示了如何将第三方树形控件与 SpreadJS 深度集成，实现拖拽生成表格的高级交互功能。开发者可以从中学到：

* SpreadJS Table API 的使用方法，包括动态创建表格、配置列和数据绑定
* 如何使用 `hitTest` API 进行精确的单元格定位
* 拖拽事件的处理流程和坐标转换技巧
* 自定义 DOM 元素实现可视化交互反馈的方法
* 第三方组件与 SpreadJS 的集成模式

该方案适用于需要从层级数据源快速构建表格的场景，例如数据建模工具、报表设计器、数据映射配置界面等。通过扩展树节点的属性和拖拽逻辑，可以实现更复杂的业务需求，如支持多表关联、字段类型配置、数据验证规则设置等。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
