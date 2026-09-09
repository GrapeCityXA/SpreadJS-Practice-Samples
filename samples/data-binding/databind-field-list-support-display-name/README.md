## 一、Demo 概述

本示例展示了如何在 SpreadJS Designer 中实现自定义的字段列表绑定功能，支持在字段列表中显示的名称（描述）与实际绑定的数据路径（绑定值）不同。通过自定义侧边栏和拖拽交互，用户可以灵活配置数据源的层级结构，并将字段拖拽到工作表单元格或表格中进行数据绑定。

该示例适用于需要对数据绑定进行精细控制的场景，特别是当数据源的字段名称不够友好或需要多语言支持时，可以通过自定义描述来提升用户体验。

## 二、解决的问题

- **字段显示名称与绑定路径分离**：允许在字段列表中显示用户友好的中文描述，而实际绑定使用英文或特定格式的路径（如 `personal_info.name.cn_name`）
- **自定义数据源结构管理**：提供可视化界面来添加、编辑数据源的层级结构，支持字符串类型和表格类型的字段
- **拖拽绑定交互**：通过拖拽字段到单元格或区域，自动完成数据绑定或表格创建，简化操作流程
- **替换原生字段列表**：隐藏 SpreadJS Designer 原生的字段列表侧边栏，使用完全自定义的 UI 和交互逻辑

## 三、实现思路

### 3.1 自定义 Ribbon 命令

通过扩展 SpreadJS Designer 的 Ribbon 配置，添加自定义的"工作表绑定"按钮，替换原生的模板设计模式：

```javascript
let designerConfig = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))
designerConfig.commandMap = {
    customWorksheetBind: {
        title: "工作表绑定",
        text: "工作表绑定",
        iconClass: "ribbon-button-template",
        bigButton: "true",
        commandName: "customWorksheetBind",
        execute: function (context, propertyName, fontItalicChecked) {
            isBinding = !isBinding
            let designModeCommand = GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.DesignMode);
            designModeCommand.execute(context)
            if (!isBinding) {
                close()
            } else {
                open()
            }
        }
    }
}

// 移除原本的工作表绑定按钮
let c = designerConfig.ribbon[4].buttonGroups[0].commandGroup.children
designerConfig.ribbon[4].buttonGroups[0].commandGroup.children = c.filter(v => {
    return v.command != "templateDesignMode"
})
designerConfig.ribbon[4].buttonGroups[0].commandGroup.children.push({
    commands: ["customWorksheetBind"]
});
```

### 3.2 自定义侧边栏 UI

使用原生 DOM 操作动态创建字段列表侧边栏和配置对话框：

```javascript
function addBasicDom() {
    let treeBox = document.createElement("div")
    treeBox.className = "treebox-content"
    treeBox.id = "treebox-content"
    treeBox.innerHTML = `
        <div class="item-content flex">
            <div class="header-label">源</div>
            <div id="source-add" class="icons icon-add"></div>
        </div>
        <div id="tree-root"></div>
    `

    let settingBox = document.createElement("div")
    settingBox.className = "setting-box"
    settingBox.id = "setting-box"
    settingBox.innerHTML = `
        <div class="key-value">
            <div class="key">描述</div>
            <input class="value" type="text" placeholder="在字段列表显示的名称" id="desc" />
        </div>
        <div class="key-value">
            <div class="key">绑定值</div>
            <input class="value" type="text" placeholder="实际绑定值" id="path" />
        </div>
        <div class="key-value">
            <div class="key">类型</div>
            <select class="value" id="type">
                <option value="string">字符串</option>
                <option value="table">表格</option>
            </select>
        </div>
        <div class="footer">
            <button id="sure">确定</button>
            <button id="cancel">取消</button>
        </div>
    `
    document.body.appendChild(treeBox)
    document.body.appendChild(settingBox)
}
```

### 3.3 数据结构与 DOM 生成

数据源采用树形结构，每个节点包含 `desc`（显示名称）、`path`（绑定路径）、`type`（类型）和可选的 `child`（子节点）：

```javascript
let _data = [{
    desc: "个人信息",
    path: "personal_info",
    type: "string",
    child: [{
        desc: "姓名",
        path: "name",
        type: "string",
        child: [{
            desc: "英文名",
            path: "en_name",
            type: "string"
        }, {
            desc: "中文名",
            path: "cn_name",
            type: "string"
        }]
    }]
}]
```

通过递归函数 `genDomFromData` 将数据结构转换为可拖拽的 DOM 树：

```javascript
function genDomFromData(data, dom, path = "") {
    data.forEach(d => {
        let itemContent = document.createElement("div")
        itemContent.className = "item-content child"
        
        let nameLabel = document.createElement("div")
        nameLabel.className = "name-label"
        nameLabel.innerText = d.desc  // 显示描述
        nameLabel.setAttribute("bindingPath", `${path ? path + "." : ""}${d.path}`)  // 存储完整路径
        nameLabel.setAttribute("type", d.type)
        nameLabel.setAttribute("draggable", true)
        
        // ... 添加图标和事件监听
        
        if (d.child) {
            genDomFromData(d.child, itemContent, `${path ? path + "." : ""}${d.path}`)
        }
    })
}
```

### 3.4 拖拽绑定实现

实现 HTML5 拖拽 API，支持将字段拖拽到工作表单元格：

```javascript
// 拖拽开始
function dragStart(e) {
    draggedElement = e.target;
    e.target.style.opacity = 0.5;
}

// 拖拽悬停时高亮单元格
host.addEventListener("dragover", function (event) {
    event.preventDefault();
    let x = event.pageX - offsetL;
    let y = event.pageY - offsetT;
    highlihgtCell(x, y)  // 显示蓝色边框高亮
}, false);

// 放置时执行绑定
host.addEventListener("drop", function (event) {
    event.preventDefault();
    let target = spread.hitTest(x, y);
    let sheet = spread.getActiveSheet();
    let path = draggedElement.getAttribute("bindingpath")
    
    if (draggedElement.getAttribute("type") == "string") {
        // 字符串类型：直接绑定到单元格
        sheet.setBindingPath(target.row, target.col, path)
    } else if (draggedElement.getAttribute("type") == "table") {
        // 表格类型：创建表格并绑定列
        let data = getTargetData(path)
        let table = sheet.tables.add(path + suffix, row, col, 2, column_count)
        table.bindingPath(path)
        data.child.forEach((v, i) => {
            table.setColumnDataField(i, v.path)
        })
    }
})
```

### 3.5 表格绑定的 Schema 生成

对于表格类型的字段，需要动态生成 JSON Schema 并通过 Designer API 注入：

```javascript
let c_p = {}
data.child.forEach(v => {
    c_p[v.path] = { type: "string" }
})
let treeNodeJson = { 
    "$schema": "http://json-schema.org/draft-04/schema#", 
    properties: {} 
}
treeNodeJson.properties[path] = {
    dataFieldType: "table",
    type: "array",
    items: {
        type: "object",
        properties: c_p
    }
}
designer.setData("treeNodeFromJson", JSON.stringify(treeNodeJson))
```

### 3.6 事件管理与内存优化

由于 DOM 会频繁重新生成，需要手动管理事件监听器以避免内存泄漏：

```javascript
let events = []

function initDynamicEvents() {
    clearEvents()  // 先清除旧事件
    document.querySelectorAll(".name-label").forEach(el => {
        el.addEventListener("mouseenter", showIcons)
        events.push({
            el: el,
            event: "mouseenter",
            function: showIcons
        })
    })
}

function clearEvents() {
    events.forEach(e => {
        e.el.removeEventListener(e.event, e.function)
    })
    events = []
}
```

### 3.7 技术栈

- SpreadJS 17.0.8（核心表格引擎）
- SpreadJS Designer 17.0.8（设计器组件）
- SystemJS 0.19.22（模块加载器）
- 原生 JavaScript（DOM 操作和事件处理）
- HTML5 Drag and Drop API（拖拽交互）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 使用本地服务器打开 index.html（如 Live Server）
```

### 4.2 操作步骤

1. 打开页面后，点击 Ribbon 中的"工作表绑定"按钮，右侧会显示自定义字段列表侧边栏
2. 点击"源"旁边的加号图标，可以添加根级别的数据源字段
3. 在弹出的配置对话框中输入：
   - 描述：在字段列表中显示的名称（如"姓名"）
   - 绑定值：实际的数据路径（如"name"）
   - 类型：选择"字符串"或"表格"
4. 对于已有字段，鼠标悬停会显示加号和设置图标，可以添加子字段或编辑当前字段
5. 将字段拖拽到工作表单元格：
   - 字符串类型：绑定到单个单元格
   - 表格类型：自动创建表格并绑定列（需先配置子字段作为列定义）
6. 拖拽过程中会显示蓝色边框高亮目标单元格

## 五、功能特点

### 5.1 优点

- **用户体验优化**：字段列表显示友好的中文描述，而不是技术性的路径名称
- **灵活的数据结构管理**：支持无限层级的嵌套字段，适应复杂的数据模型
- **直观的拖拽交互**：通过拖拽完成绑定，降低操作门槛，提供实时视觉反馈
- **完全自定义 UI**：不受 SpreadJS 原生字段列表的限制，可以根据业务需求定制样式和交互

### 5.2 局限性与扩展建议

- **数据持久化**：当前数据源配置仅存储在内存中，刷新页面后会丢失。建议添加导入/导出功能或与后端集成
- **表格列编辑**：表格创建后无法通过 UI 修改列配置，需要删除重建。可以扩展支持表格的动态列管理
- **字段验证**：缺少对绑定路径格式的验证，可能导致运行时错误。建议添加路径合法性检查和重复性检测
- **撤销/重做**：字段配置操作不支持撤销。可以集成命令模式来实现操作历史管理

## 六、关键代码片段

### 路径解析与数据查找

```javascript
function getTargetData(curPath) {
    let curPathArr = curPath.split(".")
    let targetData = _data
    while (true) {
        let p = curPathArr.shift()
        let canBreak = false
        targetData.forEach((v, i) => {
            if (v.path == p) {
                if (curPathArr.length) {
                    targetData = v.child
                } else {
                    targetData = v
                    canBreak = true
                }
            }
        })
        if (canBreak) {
            break
        }
    }
    return targetData
}
```

该函数通过点分隔的路径字符串（如 `personal_info.name.cn_name`）递归查找数据树中的目标节点。

### 单元格高亮装饰

```javascript
function highlihgtCell(x, y) {
    let target = curSheet.hitTest(x, y);
    if (target.row === undefined || target.col === undefined) {
        return
    }
    let cellRect = spread.getActiveSheet().getCellRect(target.row, target.col)
    
    decoration.style.display = "block"
    decoration.style.position = "absolute"
    decoration.style.border = "1px solid blue"
    decoration.style.boxShadow = "0px 0px 4px 0px #007eff"
    decoration.style.width = (cellRect.width - 1) + "px"
    decoration.style.height = (cellRect.height - 1) + "px"
    decoration.style.left = cellRect.x + "px"
    decoration.style.top = cellRect.y + "px"
}
```

在拖拽过程中，通过绝对定位的 div 元素覆盖在目标单元格上，提供视觉反馈。

## 七、总结

本示例展示了如何深度定制 SpreadJS Designer 的数据绑定功能，通过自定义 Ribbon 命令、侧边栏 UI 和拖拽交互，实现了字段显示名称与绑定路径分离的需求。开发者可以从中学到：

- SpreadJS Designer 的 Ribbon 配置和命令扩展机制
- 使用 `setBindingPath` 和 `table.bindingPath` 进行数据绑定
- HTML5 拖拽 API 与 SpreadJS 的 `hitTest` 和 `getCellRect` 结合使用
- 动态 DOM 生成与事件管理的最佳实践
- 通过 `designer.setData("treeNodeFromJson")` 注入自定义 Schema

该方案适用于需要对数据绑定进行精细控制的企业应用，特别是在多语言环境或数据源字段名称不友好的场景下。通过扩展数据持久化和字段验证功能，可以进一步提升系统的健壮性和可维护性。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/QjclsUmMQ06YQZAiUoLTig/)）
