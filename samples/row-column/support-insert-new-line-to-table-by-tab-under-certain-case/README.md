## 一、Demo 概述

本示例展示了如何在 SpreadJS 表格中实现一个特殊的交互功能：当表格内存在合并单元格，且表格下方存在横跨表格的合并单元格时，通过监听键盘事件和选区变化事件，实现按 Tab 键自动扩展表格行的功能。这解决了 SpreadJS 默认情况下无法在此场景中通过 Tab 键新增表格行的限制。

## 二、解决的问题

在 SpreadJS 的默认行为中，当满足以下条件时，用户无法通过 Tab 键在表格末尾自动新增行：

- 表格内部存在合并单元格
- 表格下方存在横跨表格列范围的合并单元格

这种情况在实际业务中较为常见，例如在表格下方添加说明文字或汇总信息时。本示例通过自定义事件监听机制，实现了在这种特殊场景下的 Tab 键新增行功能，提升了用户体验。

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 表格和合并单元格的初始化

示例首先创建了一个包含合并单元格的表格环境，用于模拟实际业务场景：

```javascript
let table = sheet.tables.add("table1", 1, 1, 3, 4)
sheet.addSpan(2, 2, 1, 2)
sheet.addSpan(3, 2, 1, 2)
sheet.addSpan(4, 2, 1, 2)
sheet.addSpan(5, 2, 1, 2)
sheet.addSpan(6, 2, 1, 2)
sheet.addSpan(7, 2, 1, 2)
sheet.addSpan(8, 0, 1, 15)
sheet.setValue(8,0,"当table中存在合并单元格，且table下方存在横跨表格的合并单元格时，默认无法通过tab新增表格行")
```

这段代码创建了一个从 (1,1) 开始、大小为 3 行 4 列的表格，并在表格内部和下方添加了多个合并单元格，第 8 行的合并单元格横跨 15 列，模拟了问题场景。

#### 3.1.2 双事件监听机制

核心实现采用了 `keydown` 事件和 `SelectionChanged` 事件的组合监听：

```javascript
let selectionChanged = false
let oldSelection, newSelection, curSheet

spread.bind(GC.Spread.Sheets.Events.SelectionChanged, function (e, info) {
    // 验证选区条件
    if (info.oldSelections.length > 1) return
    if (info.oldSelections[0].rowCount > 1 || info.oldSelections[0].colCount > 1) return
    if (info.newSelections[0].rowCount > 1 || info.newSelections[0].colCount > 1) return
    if(info.newSelections[0].row - info.oldSelections[0].row != 1) return

    oldSelection = info.oldSelections[0]
    newSelection = info.newSelections[0]
    curSheet = info.sheet
    selectionChanged = true

    setTimeout(() => {
        selectionChanged = false
    }, 0)
})
```

`SelectionChanged` 事件负责捕获选区变化，并进行严格的条件验证：
- 只处理单个单元格的选择（不支持多选或区域选择）
- 新选区必须在旧选区的下一行（确保是向下移动）
- 使用 `setTimeout` 将标志位重置，确保只在 Tab 键触发的选区变化时生效

#### 3.1.3 Tab 键触发的表格扩展逻辑

```javascript
window.addEventListener('keydown', function (e) {
    if (!selectionChanged || e.key !== 'Tab') return
    
    let table = curSheet.tables.find(oldSelection.row, oldSelection.col)
    if (!table) return
    
    let _table = curSheet.tables.find(newSelection.row, newSelection.col)
    if (_table) return
    
    let range = table.range()
    curSheet.tables.resize(table, new GC.Spread.Sheets.Range(
        range.row, range.col, range.rowCount + 1, range.colCount
    ))
}, true)
```

`keydown` 事件监听器执行以下逻辑：
1. 验证是否为 Tab 键触发且选区已改变
2. 检查旧选区是否在表格内（`tables.find` 方法）
3. 检查新选区是否已离开表格
4. 如果满足条件，使用 `tables.resize` 方法将表格向下扩展一行

### 3.2 UI 交互流程

用户操作 → 在表格最后一行按 Tab 键 → 触发 `SelectionChanged` 事件（记录选区信息并设置标志位）→ 触发 `keydown` 事件（验证条件并扩展表格）→ 表格自动新增一行

### 3.3 技术栈

- @grapecity/spread-sheets: 17.0.8（核心表格组件）
- SystemJS: 0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 使用本地服务器打开 index.html（如 Live Server）
```

### 4.2 操作步骤

1. 打开页面后，可以看到一个包含合并单元格的表格
2. 点击表格内的任意单元格
3. 连续按 Tab 键，当光标移动到表格最后一行的最后一列时
4. 再次按 Tab 键，表格会自动向下扩展一行
5. 观察表格下方的说明文字，验证在存在横跨合并单元格的情况下功能正常工作

## 五、功能特点

### 5.1 优点

- 解决了特定场景下的 Tab 键新增行限制，提升用户体验
- 使用事件组合机制，避免了对 SpreadJS 核心代码的侵入性修改
- 严格的条件验证确保功能只在预期场景下触发，不影响其他操作
- 代码简洁，易于理解和维护

### 5.2 局限性与扩展建议

- 当前实现仅支持向下扩展一行，不支持批量扩展
- 仅处理单个单元格选择的情况，多选或区域选择时不生效
- 可以考虑扩展为支持 Shift+Tab 反向删除行的功能
- 可以添加配置项，允许用户自定义触发条件和扩展行数

## 六、关键代码片段

### 选区变化验证逻辑

```javascript
// 确保只处理单个单元格的向下移动
if (info.oldSelections.length > 1) return
if (info.oldSelections[0].rowCount > 1 || info.oldSelections[0].colCount > 1) return
if (info.newSelections[0].rowCount > 1 || info.newSelections[0].colCount > 1) return
if(info.newSelections[0].row - info.oldSelections[0].row != 1) return
```

这段代码通过四个条件判断，确保只在用户按 Tab 键从单个单元格向下移动到下一行时才触发后续逻辑。

### 表格边界检测与扩展

```javascript
let table = curSheet.tables.find(oldSelection.row, oldSelection.col)
if (!table) return

let _table = curSheet.tables.find(newSelection.row, newSelection.col)
if (_table) return

let range = table.range()
curSheet.tables.resize(table, new GC.Spread.Sheets.Range(
    range.row, range.col, range.rowCount + 1, range.colCount
))
```

通过两次 `tables.find` 调用判断用户是否从表格内移动到表格外，然后使用 `tables.resize` 方法扩展表格。

## 七、总结

本示例展示了如何通过事件监听和条件判断，解决 SpreadJS 在特定场景下的交互限制。开发者可以从中学到：

- 如何组合使用 `SelectionChanged` 和 `keydown` 事件实现复杂交互
- 如何使用 `tables.find` 方法检测单元格是否属于表格
- 如何使用 `tables.resize` 方法动态调整表格大小
- 如何通过标志位和 `setTimeout` 实现事件的精确控制

该方案适用于需要在包含复杂合并单元格布局的表格中实现自定义 Tab 键行为的场景，具有良好的扩展性和可维护性。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/Ihcq2sMtFUagb1MTpn1N_g/)）
