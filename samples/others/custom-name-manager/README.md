## 一、Demo 概述

本示例实现了一个自定义的名称管理器界面，用于管理 SpreadJS 工作簿中的自定义名称（Custom Names）。通过可视化的弹窗界面，用户可以方便地查看、新建、编辑和删除工作簿级别或工作表级别的自定义名称，同时支持查看表格（Table）名称。该管理器提供了类似 Excel 名称管理器的功能体验，包括拖拽移动、范围选择等交互特性。

## 二、解决的问题

* 提供可视化的名称管理界面，替代通过代码手动调用 API 的方式
* 支持工作簿级别和工作表级别的自定义名称管理
* 集成 FormulaTextBox 组件实现直观的单元格范围选择
* 统一展示自定义名称和表格名称，方便用户查看所有命名对象
* 支持对名称的批注信息进行编辑和查看

## 三、实现思路

### 3.1 自定义弹窗界面构建

通过动态创建 DOM 元素构建名称管理器的弹窗界面，包括主列表窗口和编辑窗口。主窗口使用嵌入式 SpreadJS 实例展示名称列表，支持列绑定和条件格式化。

```javascript
function initCustomBox(spread, id) {
    document.getElementById(id).innerHTML = `
    <div id="name-mgr-modal" class="name-mgr-modal"></div>
    <div class="normal-box name-mgr-list" id="name-mgr-list" style="left: 100px; top: 100px;">
        <div class="title" ondragstart="dragStartCb(event)" draggable="true" ondragend="dragEndCb(event)">名称管理器</div>
        <div class="content-box">
            <div class="btn-list">
                <span class="btn" id="create-name">新建</span>
                <span class="btn" id="edit-name">编辑</span>
                <span class="btn" id="delete-name">删除</span>
            </div>
            <div class="list-box" id="list-container"></div>
            <div class="footer">
                <div class="btn" id="close-btn">关闭</div>
            </div>
        </div>
    </div>
    `
    let _spread = new GC.Spread.Sheets.Workbook("list-container")
    _spread.options.tabStripVisible = false
    _spread.options.showVerticalScrollbar = false
    _spread.options.showHorizontalScrollbar = false
    let _sheet = _spread.getActiveSheet()
    _sheet.options.rowHeaderVisible = false
    _sheet.options.gridline.showHorizontalGridline = false
    _sheet.options.gridline.showVerticalGridline = false
    
    let colInfos = [
        { name: "name", displayName: "名称" },
        { name: "range", displayName: "引用位置" },
        { name: "effectRange", displayName: "范围" },
        { name: "comment", displayName: "批注" },
    ];
    _sheet.bindColumns(colInfos)
    _sheet.setColumnCount(4)
    return _spread
}
```

### 3.2 名称数据收集与展示

通过遍历工作簿和工作表的自定义名称集合，以及表格集合，统一收集所有命名对象的信息，并转换为列表数据源格式。

```javascript
function getNames(spread) {
    let names = []
    // 收集工作簿级别的自定义名称
    spread.getCustomNames().forEach(v => {
        let exp = v.getExpression()
        let sheetName = exp.source.getName()
        let rangeStr = GC.Spread.Sheets.CalcEngine.rangeToFormula(
            new GC.Spread.Sheets.Range(exp.row, exp.column, exp.endRow - exp.row + 1, exp.endColumn - exp.column + 1)
        )
        names.push({
            name: v.getName(),
            range: `=${sheetName}!${rangeStr}`,
            effectRange: "工作簿",
            comment: v.getComment()
        })
    })
    // 收集工作表级别的自定义名称和表格
    spread.sheets.forEach(s => {
        s.getCustomNames().forEach(v => {
            let exp = v.getExpression()
            let sheetName = exp.source.getName()
            let rangeStr = GC.Spread.Sheets.CalcEngine.rangeToFormula(
                new GC.Spread.Sheets.Range(exp.row, exp.column, exp.endRow - exp.row + 1, exp.endColumn - exp.column + 1)
            )
            names.push({
                name: v.getName(),
                range: `=${sheetName}!${rangeStr}`,
                effectRange: sheetName,
                comment: v.getComment()
            })
        })
        // 收集表格名称
        s.tables.all().forEach(t => {
            let tr = t.range()
            let rangeStr = GC.Spread.Sheets.CalcEngine.rangeToFormula(tr)
            names.push({
                name: t.name(),
                range: `=${s.name()}!${rangeStr}`,
                effectRange: s.name(),
                comment: ""
            })
        })
    })
    return names
}
```

### 3.3 FormulaTextBox 集成实现范围选择

在编辑窗口中集成 FormulaTextBox 组件，支持用户通过点击单元格选择引用范围，并通过状态控制实现弹窗的显示隐藏。

```javascript
function initEditBox(spread, title, fbx) {
    document.getElementById("edit-box").style.display = "block"
    document.getElementById("edit-title").innerText = title
    
    // 初始化 FormulaTextBox
    fbx && fbx.destroy()
    fbx = new GC.Spread.Sheets.FormulaTextBox.FormulaTextBox(
        document.getElementById('c-range'), 
        { rangeSelectMode: true }
    );
    fbx.workbook(spread);
    
    // 监听范围选择按钮，控制弹窗显示状态
    let fbxStatus = "ready"
    document.getElementById("c-range").children[0].children[0].children[0].children[1]
        .addEventListener("click", function () {
            if (fbxStatus == "ready") {
                fbxStatus = "selecting"
                document.getElementById("name-mgr-modal").style.display = "none"
                document.getElementById("name-mgr-list").style.display = "none"
            } else {
                fbxStatus = "ready"
                document.getElementById("name-mgr-modal").style.display = "block"
                document.getElementById("name-mgr-list").style.display = "block"
            }
        })
    return fbx
}
```

### 3.4 名称的增删改操作

实现新建、编辑和删除名称的核心逻辑，根据作用范围（工作簿或工作表）调用不同的 API 方法，并对表格名称进行特殊处理（不允许删除）。

```javascript
// 新建/编辑名称确认逻辑
document.getElementById("close-confirm").addEventListener("click", function () {
    let name = document.getElementById("c-name").value
    let effectRange = document.getElementById("c-erange").value
    let comment = document.getElementById("c-comment").value
    let range = fbx.text()
    
    // 表单验证
    if (!name || !effectRange || !range) {
        alert("请填写完整信息")
        return
    }
    
    try {
        // 编辑模式：先删除旧名称
        if (title.indexOf("编辑") == 0) {
            if (effectRange == "工作簿") {
                spread.removeCustomName(editData.name)
            } else {
                spread.getSheetFromName(effectRange).removeCustomName(editData.name)
            }
        }
        // 添加新名称
        if (effectRange == "工作簿") {
            spread.addCustomName(name, range, 0, 0, comment)
        } else {
            spread.getSheetFromName(effectRange).addCustomName(name, range, 0, 0, comment)
        }
    } catch (e) {
        alert(e.message)
        return
    }
    
    document.getElementById("edit-box").style.display = "none"
    openCustomBox(spread, _spread, id)
})

// 删除名称逻辑
document.getElementById("delete-name").addEventListener("click", function () {
    let aRow = _sheet.getSelections()[0]
    if (!aRow) {
        alert("请选择要删除的名称")
        return
    }
    if (confirm("确认删除该名称吗？")) {
        let data = _sheet.getDataSource()[aRow.row]
        if (data.effectRange == "工作簿") {
            spread.removeCustomName(data.name)
        } else {
            let curSheet = spread.getSheetFromName(data.effectRange)
            let range = GC.Spread.Sheets.CalcEngine.formulaToRange(curSheet, data.range)
            // 检查是否为表格，表格不允许删除
            if (curSheet.tables.find(range.row, range.col)) {
                alert("无法删除表格")
                return
            }
            curSheet.removeCustomName(data.name)
        }
        _sheet.getDataSource().splice(aRow.row, 1)
        _spread.refresh()
    }
})
```

### 3.5 弹窗拖拽功能

通过 HTML5 Drag API 实现弹窗的拖拽移动功能，记录拖拽起始位置并计算偏移量更新弹窗位置。

```javascript
let script = document.createElement("script")
script.innerHTML = `
let startPosition
function dragStartCb(e) {
    startPosition = {
        x: e.x,
        y: e.y
    }
}
function dragEndCb(e) {
    let pnode = e.srcElement.parentNode
    pnode.style.left = Number(pnode.style.left.split("px")[0]) + e.x - startPosition.x + "px"
    pnode.style.top = Number(pnode.style.top.split("px")[0]) + e.y - startPosition.y + "px"
}
`
document.head.appendChild(script)
```

### 3.6 技术栈

* SpreadJS 16.0.1：核心表格控件
* SystemJS 0.19.22：模块加载器
* TypeScript 4.1.2：类型支持
* HTML5 Drag API：拖拽功能实现

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 使用 HTTP 服务器打开 index.html（如 Live Server）
```

### 4.2 操作步骤

1. 打开页面后，点击"名称管理器"按钮打开管理界面
2. 在列表中查看所有自定义名称和表格名称
3. 点击"新建"按钮创建新名称：
    * 填写名称
    * 选择作用范围（工作簿或指定工作表）
    * 点击引用位置输入框右侧按钮，在表格中选择单元格范围
    * 可选填写批注信息
    * 点击"确定"保存
4. 选中列表中的某一行，点击"编辑"修改名称信息（名称和范围不可修改）
5. 选中列表中的某一行，点击"删除"移除名称（表格名称不可删除）
6. 拖拽弹窗标题栏可移动窗口位置

## 五、功能特点

### 5.1 优点

* 提供类似 Excel 的可视化名称管理体验，降低使用门槛
* 统一管理工作簿级别和工作表级别的名称，层次清晰
* 集成 FormulaTextBox 组件，支持直观的范围选择交互
* 使用嵌入式 SpreadJS 实例展示列表，支持列绑定和条件格式化
* 支持弹窗拖拽，提升用户体验

### 5.2 局限性与扩展建议

* 当前不支持对表格名称的编辑和删除，可扩展表格管理功能
* 编辑模式下不允许修改名称和作用范围，可考虑支持更灵活的编辑方式
* 可增加名称搜索和筛选功能，方便在大量名称中快速定位
* 可支持批量导入导出名称定义

## 六、关键代码片段

### 列绑定与条件格式化

```javascript
let colInfos = [
    { name: "name", displayName: "名称" },
    { name: "range", displayName: "引用位置" },
    { name: "effectRange", displayName: "范围" },
    { name: "comment", displayName: "批注" },
];
_sheet.bindColumns(colInfos)

// 设置选中行的条件格式
let cStyle = new GC.Spread.Sheets.Style()
cStyle.backColor = "#d0d0d0"
let stateRule = new GC.Spread.Sheets.ConditionalFormatting.StateRule(
    GC.Spread.Sheets.ConditionalFormatting.RuleType.rowStateRule,
    GC.Spread.Sheets.RowColumnStates.selected,
    cStyle,
    [new GC.Spread.Sheets.Range(-1, -1, -1, -1)]
)
_sheet.conditionalFormats.addRule(stateRule)
```

### 范围公式转换

```javascript
// 将 Range 对象转换为公式字符串
let rangeStr = GC.Spread.Sheets.CalcEngine.rangeToFormula(
    new GC.Spread.Sheets.Range(exp.row, exp.column, exp.endRow - exp.row + 1, exp.endColumn - exp.column + 1)
)

// 将公式字符串转换为 Range 对象
let range = GC.Spread.Sheets.CalcEngine.formulaToRange(curSheet, data.range)
```

## 七、总结

本示例展示了如何基于 SpreadJS 构建自定义的名称管理器界面，通过嵌入式 SpreadJS 实例、FormulaTextBox 组件和 HTML5 Drag API 的组合使用，实现了功能完善的可视化管理工具。开发者可以从中学习到：

* 如何使用 SpreadJS 的自定义名称 API（addCustomName、removeCustomName、getCustomNames）
* 如何集成 FormulaTextBox 组件实现范围选择功能
* 如何使用列绑定（bindColumns）快速构建数据列表
* 如何使用条件格式化实现行选中效果
* 如何通过 CalcEngine 进行范围和公式的相互转换

该方案适用于需要为用户提供可视化名称管理功能的场景，具有良好的扩展性，可根据实际需求增加搜索、筛选、批量操作等功能。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
