## 一、Demo 概述

本示例演示了如何在 SpreadJS Designer 中实现"选中单元格十字高亮"（Cross Highlight）效果：当用户选中某个单元格或区域时，该区域所在的行与列会以半透明色块高亮显示，帮助用户在数据量较大的表格中快速定位当前焦点所在的行列。

该功能常见于财务报表、对账表、数据核对等需要横向纵向比对数据的场景。由于 SpreadJS 表格基于 Canvas 渲染，无法直接通过 CSS 选中单元格 DOM 节点来加样式，因此本示例采用"在 Canvas 之上叠加定位图层"的方案实现，并将功能封装为 Designer 功能区中的自定义命令按钮，支持一键开启/关闭。

## 二、解决的问题

* **大数据量表格中定位困难**：当工作表行列数量很多时，仅有选中框难以快速判断当前单元格属于哪一行、哪一列，十字高亮通过整行整列着色提供视觉引导。
* **Canvas 渲染无法用 CSS 直接高亮**：SpreadJS 内容绘制在 Canvas 上，不能像普通 HTML 表格那样通过给 `tr`、`td` 添加 class 来高亮行列，需要另辟蹊径。
* **滚动、缩放、行列尺寸变化时的同步问题**：用户滚动、缩放视图或调整行高列宽后，高亮区域必须跟着重算，否则会出现错位。
* **选中区域滚出可视范围时的处理**：选中单元格被滚动到视口之外时，需要一个合理的降级表现，而不是显示在错误的位置。

## 三、实现思路

整体思路是：用四个绝对定位的 `div`（左、右、上、下）拼出一个"口"字形遮罩，中间留空正好露出选中区域，从而形成十字高亮效果。这四个 `div` 通过监听 SpreadJS 的选区、滚动、缩放等事件实时重算位置。

### 3.1 核心技术点

#### 3.1.1 四图层拼合实现十字高亮

不使用一整块半透明蒙层挖洞（`clip-path` 或 `box-shadow`），而是直接创建四个矩形 `div`，分别覆盖选中区域左侧、右侧、上方、下方的空白区域。四个矩形合围后，中间未被覆盖的部分即为选中区域，视觉上等价于"十字高亮"。

```javascript
function setElsCommonStyle(els) {
    els.forEach(el => {
        el.style.backgroundColor = HIGHLIGHT_COLOR   // "#a0cfff"
        el.style.pointerEvents = "none"               // 不拦截鼠标事件，避免遮挡表格操作
        el.style.position = "absolute"
        el.style.zIndex = HIGHLIGHT_Z_INDEX           // 100
        el.style.opacity = HIGHLIGHT_OPACITY          // 0.4
        document.body.append(el)
    })
}
```

`pointerEvents = "none"` 是关键：高亮层覆盖在画布之上，若不关闭指针事件，用户将无法点击、拖拽表格。

四个 `div` 的尺寸计算逻辑（`setElPosition` 中 `direction` 为空时的分支）：

```javascript
const BORDER_OFFSET = 2   // 让出选中框的边框宽度，避免盖住 SpreadJS 自身绘制的选区边框

leftEl.style.left   = canvasRect.x + 'px'
leftEl.style.top    = (canvasRect.y + selRect.y) + 'px'
leftEl.style.width  = (selRect.x - BORDER_OFFSET) + 'px'
leftEl.style.height = selRect.height + 'px'

rightEl.style.left  = (canvasRect.x + selRect.x + selRect.width + BORDER_OFFSET) + 'px'
rightEl.style.width = (canvasRect.width - selRect.x - selRect.width - BORDER_OFFSET) + 'px'

topEl.style.height    = (selRect.y - BORDER_OFFSET) + 'px'
bottomEl.style.top    = (canvasRect.y + selRect.y + selRect.height + BORDER_OFFSET) + 'px'
bottomEl.style.height = (canvasRect.height - selRect.y - selRect.height - BORDER_OFFSET) + 'px'
```

注意所有坐标都加了 `canvasRect` 的偏移量：`getCellRect` 返回的是相对于画布内部的坐标，而 `div` 是相对 `document.body` 定位的，两者必须做一次换算。

#### 3.1.2 选中区域的坐标计算

通过 `sheet.getCellRect()` 拿到选中区域左上角和右下角单元格的位置，再用 `getColumnWidth` / `getRowHeight` 修正宽高（`getCellRect` 返回的宽高不一定等于实际列宽行高），最终拼出完整的选区矩形。

```javascript
let canvas = spread.getHost().querySelector("canvas[gcuielement='gcWorksheetCanvas']")
let canvasRect = canvas.getBoundingClientRect()

let selLT_Rect = sheet.getCellRect(selection.row, selection.col)
let selRB_Rect = sheet.getCellRect(selection.row + selection.rowCount - 1,
                                   selection.col + selection.colCount - 1)
selLT_Rect.width  = sheet.getColumnWidth(selection.col)
selLT_Rect.height = sheet.getRowHeight(selection.row)
selRB_Rect.width  = sheet.getColumnWidth(selection.col + selection.colCount - 1)
selRB_Rect.height = sheet.getRowHeight(selection.row + selection.rowCount - 1)

let selRect = {
    x: selLT_Rect.x,
    y: selLT_Rect.y,
    width:  selRB_Rect.x + selRB_Rect.width  - selLT_Rect.x,
    height: selRB_Rect.y + selRB_Rect.height - selLT_Rect.y
}
```

支持多单元格区域选择（`rowCount` / `colCount` 大于 1 时，高亮的是覆盖整个区域的十字带）。

#### 3.1.3 选中单元格滚出视口时的降级处理

当选中区域被滚动到可视范围之外时，无法计算出有效的矩形（宽或高为 0）。此时通过视口 API 判断选中区域相对当前可视区域的方位，只在对应方向上绘制一条高亮带：

```javascript
let topRow = sheet.getViewportTopRow(1)
let bottomRow = sheet.getViewportBottomRow(1)
let leftCol = sheet.getViewportLeftColumn(1)
let rightCol = sheet.getViewportRightColumn(1)

// 选择单元格在可视区域【上方】——只保留 bottom 元素并横向铺满
if (selection.row < topRow && selection.col >= leftCol && ...) {
    selRect.x = sheet.getCellRect(topRow, selection.col).x
    setElPosition(canvasRect, selRect, els, "bottom")
}
// 下方 → top / 左方 → right / 右方 → left，均不在可视区则全部隐藏
else { /* ... */ }
```

`setElPosition` 在传入 `direction` 时会把四个元素先全部 `display: none`，再按方位映射只显示其中一个，并让该元素在垂直于滚动方向的一侧铺满整个画布。

#### 3.1.4 事件绑定驱动高亮重算

高亮的重算由三类回调驱动，覆盖了所有会改变单元格屏幕位置的操作：

```javascript
// cb1：选区变化 → 重建所有高亮元素
function cb1(e, info) { recordSelections(info.sheet, info.newSelections) }

// cb2：视口/尺寸变化 → 复用已有元素，仅重算位置
function cb2(e, info) {
    if (elArr[info.sheet.name()]) {
        elArr[info.sheet.name()].forEach(val => eventCallback(info.sheet, val.pos, val.els))
    }
}

// cb3：切换工作表 → 按新表的选区重建
function cb3(e, info) { recordSelections(info.newSheet, info.newSheet.getSelections()) }

function bootCrossHighlight(_spread, start = true) {
    if (!start) {   // 关闭：逐一解绑并移除所有 DOM 元素
        _spread.unbind(GC.Spread.Sheets.Events.SelectionChanging, cb1)
        _spread.unbind(GC.Spread.Sheets.Events.TopRowChanged, cb2)
        // ... 其余同理
        removeAllElements()
        return
    }
    _spread.bind(GC.Spread.Sheets.Events.SelectionChanging, cb1)
    _spread.bind(GC.Spread.Sheets.Events.TopRowChanged, cb2)
    _spread.bind(GC.Spread.Sheets.Events.LeftColumnChanged, cb2)
    _spread.bind(GC.Spread.Sheets.Events.ViewZoomed, cb2)
    _spread.bind(GC.Spread.Sheets.Events.RowHeightChanged, cb2)
    _spread.bind(GC.Spread.Sheets.Events.ColumnWidthChanged, cb2)
    _spread.bind(GC.Spread.Sheets.Events.ActiveSheetChanged, cb3)

    recordSelections(_spread.getActiveSheet(), _spread.getActiveSheet().getSelections())
}
```

元素状态保存在模块级的 `elArr` 对象中，按工作表名分组，使切换工作表时能各自维护一套高亮元素。关闭功能时先解绑再移除 DOM，避免残留元素继续响应事件造成内存泄漏。

#### 3.1.5 注册为 Designer 功能区命令

功能以自定义命令的形式挂载到 Designer 的"视图"选项卡下，通过 `designer.setData` / `getData` 保存开关状态，`getState` 让按钮呈现按下（高亮）的视觉效果：

```javascript
const customCommands = {
    highLightRowsAndColumns: {
        iconClass: "highlight-icon",          // 对应 index.html 中 .highlight-icon 的背景图
        text: "高亮行列",
        commandName: "highLightRowsAndColumns",
        bigButton: true,
        execute: function (designer) {
            let active = designer.getData("HightLightActive")
            if (!active) {
                designer.setData("HightLightActive", true)
                bootCrossHighlight(designer.getWorkbook())
            } else {
                designer.setData("HightLightActive", false)
                bootCrossHighlight(designer.getWorkbook(), false)
            }
        },
        getState: function (designer) {
            return designer.getData("HightLightActive") ? true : false
        }
    }
}

config.commandMap = config.commandMap || {}
Object.assign(config.commandMap, customCommands)

config.ribbon.forEach(rib => {
    if (rib.id == "view") {
        rib.buttonGroups.push({
            label: "交叉高亮",
            thumbnailClass: "ribbon-thumbnail-tools",
            commandGroup: {
                children: [{ direction: "vertical", commands: ["highLightRowsAndColumns"] }]
            }
        })
    }
})
```

配置基于 `GC.Spread.Sheets.Designer.DefaultConfig` 的深拷贝修改，因此不会污染默认配置对象。

### 3.2 UI 交互流程

打开页面 → 点击功能区"视图"选项卡 → 在"交叉高亮"分组中点击"高亮行列"按钮 → 按钮变为选中态，当前选中单元格的行列被高亮 → 点击其他单元格或拖选区域，高亮跟随变化 → 滚动、缩放、调整行高列宽，高亮同步重算 → 再次点击按钮，按钮弹起，高亮全部移除

### 3.3 技术栈

| 依赖 | 版本 | 说明 |
| --- | --- | --- |
| `@grapecity-software/spread-sheets` | 19.0.3 | SpreadJS 核心表格库 |
| `@grapecity-software/spread-sheets-designer` | 19.0.3 | Designer 设计器组件 |
| `@grapecity-software/spread-sheets-designer-resources-cn` | 19.0.3 | Designer 中文资源包 |
| `systemjs` | ^0.19.22 | 浏览器端模块加载器 |
| `typescript` / `plugin-typescript` | ^4.1.2 / ^8.0.0 | SystemJS 的 TS 转译插件（配置中预留） |

SpreadJS 相关模块通过 `systemjs.config.js` 中的 `map` 统一映射到 CDN 地址，源码中以 `import` 方式按需引入。

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖（systemjs / typescript / plugin-typescript）
npm install

# 由于使用 SystemJS 加载本地 node_modules，需通过 HTTP 服务访问
npx http-server -p 8080
```

浏览器打开 `http://localhost:8080/index.html` 即可看到 Designer 界面。示例要求联网，因为 SpreadJS 主包与样式文件均从 CDN 加载。

### 4.2 操作步骤

1. 在任意单元格中输入数据，构造一个行列较多的表格便于观察效果。
2. 切换到功能区"视图"选项卡，找到"交叉高亮"分组。
3. 点击"高亮行列"按钮，按钮呈选中（按下）状态，当前选中单元格所在行列出现半透明高亮。
4. 点击其他单元格，或按住鼠标拖选一个区域，观察高亮区域随选区变化。
5. 滚动表格、使用 Ctrl + 滚轮缩放、拖动行高列宽，验证高亮是否始终与选区对齐。
6. 选中一个单元格后滚动使其离开可视区域，观察对应方向上出现的边缘高亮提示。
7. 新增一个工作表并切换，验证高亮在不同工作表之间独立生效。
8. 再次点击"高亮行列"按钮，确认按钮弹起且高亮元素被完全清除。

## 五、功能特点

### 5.1 优点

* **不侵入表格渲染**：高亮层完全由独立的 HTML 元素承担，不修改单元格样式、条件格式或任何工作簿数据，因此不会影响导出结果、撤销栈或工作簿 JSON。
* **事件驱动的完整覆盖**：绑定了选区变更、上下左右滚动、缩放、行高列宽变更、工作表切换共七类事件，覆盖了所有会引起单元格屏幕位置变化的操作。
* **可开关、可复用**：功能以命令形式注册，开关状态由 Designer 自行管理，`bootCrossHighlight(spread, start)` 也可在非 Designer 场景下直接复用于普通 SpreadJS 实例。
* **视口外降级处理**：选中区域滚出可视范围时不会产生错位色块，而是以边缘方向提示的方式呈现。

### 5.2 局限性与扩展建议

* **判断条件依赖真值**：`if (!selRect.x || !selRect.y || !selRect.width || !selRect.height)` 使用真值判断，当选中单元格恰好位于 `x = 0` 或 `y = 0`（即贴着画布左边缘或上边缘）时会被误判为不可见，从而进入视口外分支。建议改为显式的 `<= 0` 或对宽高单独判断。
* **每个选中区域创建四个 DOM 元素**：多选区（Ctrl 多选）场景下元素数量成倍增长，且元素挂在 `document.body` 上。若工作簿存在多实例或频繁切换，建议限定在容器元素内挂载并复用元素池。
* **颜色与透明度为硬编码常量**：`HIGHLIGHT_COLOR`、`HIGHLIGHT_OPACITY` 等写在模块顶部，可扩展为通过命令参数或配置对象传入，以适配深色主题。
* **未处理鼠标拖拽过程中滚动（自动滚动）**：可在 `SelectionChanging` 之外补充对拖拽滚动的监听。

## 六、关键代码片段

核心的选区分组与元素创建逻辑：

```javascript
function recordSelections(sheet, selections) {
    removeAllElements()                 // 先清空上一轮的元素，避免重复叠加
    let sheetName = sheet.name()
    elArr = {}
    selections.forEach(sel => {
        // 每个选中区域独立创建四个方向的覆盖元素
        let els = {
            leftEl: document.createElement("div"),
            rightEl: document.createElement("div"),
            topEl: document.createElement("div"),
            bottomEl: document.createElement("div")
        }
        elArr[sheetName] = elArr[sheetName] || []
        elArr[sheetName].push({ els: els, pos: sel })
    })
    elArr[sheetName].forEach(val => setElsCommonStyle(Object.values(val.els)))
    elArr[sheetName].forEach(val => eventCallback(sheet, val.pos, val.els))
}
```

`pos` 中保存的是 SpreadJS 的 `Selection` 对象（含 `row`、`col`、`rowCount`、`colCount`），后续所有位置重算都基于它，因此滚动和缩放时无需重新读取选区。

关闭时的清理逻辑：

```javascript
function removeAllElements() {
    Object.keys(elArr).forEach(sheetname => {
        elArr[sheetname].forEach(val => {
            document.body.removeChild(val.els.leftEl)
            document.body.removeChild(val.els.rightEl)
            document.body.removeChild(val.els.topEl)
            document.body.removeChild(val.els.bottomEl)
        })
    })
    elArr = {}
}
```

## 七、总结

本示例展示了在 Canvas 渲染的表格控件上实现视觉增强效果的一条通用路径：将"内容绘制"与"视觉辅助层"解耦，用 HTML 覆盖层承担辅助展示，再通过事件监听保持两者同步。这一思路同样适用于行头高亮、打印分页预览线、水印、单元格圈注等场景。

开发者可以从中学习到以下知识点：

1. **Canvas 覆盖层方案**：当无法用 CSS 直接控制目标元素时，通过绝对定位图层实现视觉效果，并用 `pointerEvents: none` 保证不影响交互。
2. **坐标体系换算**：`getCellRect` 返回的是画布内坐标，`getBoundingClientRect` 返回的是视口坐标，两者必须叠加使用才能正确定位。
3. **视口 API 的实用价值**：`getViewportTopRow` / `getViewportBottomRow` / `getViewportLeftColumn` / `getViewportRightColumn` 可用于判断内容是否在可视范围内，是实现虚拟化、视口外降级表现的基础。
4. **事件绑定与解绑的对称性**：开启时绑定多少个事件，关闭时就要解绑多少个，同时清理关联 DOM，这是避免内存泄漏和状态残留的通用做法。
5. **Designer 命令扩展机制**：通过修改 `DefaultConfig` 的 `commandMap` 与 `ribbon`，可以在不修改 Designer 源码的前提下添加自定义功能按钮，并用 `getState` 实现按钮的选中态回显。

该方案的适用范围较广，既可用于 Designer 环境，也可直接用于独立部署的 SpreadJS 实例；在需要与主题、权限或用户偏好联动时，只需将高亮颜色、透明度等常量提升为可配置项即可。
最终效果：
![](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/GIF%202026-3-18%2014-57-01-20260318.dce579.gif?width=400)

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
