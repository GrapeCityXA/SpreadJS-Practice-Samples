## 一、Demo 概述

本示例演示了如何在 SpreadJS 中实现智能粘贴功能：当用户复制数据并粘贴到包含筛选和隐藏行的区域时，系统能够区分"被筛选的行"和"被手动隐藏的行"，仅跳过被筛选的行，而对手动隐藏的行进行数据粘贴。这种精细化的粘贴控制能够满足用户在复杂数据操作场景下的实际需求。

该示例通过监听 `ClipboardPasting` 事件，在粘贴前动态判断目标区域中每一行的可见性状态及其原因，临时显示被手动隐藏的行以完成粘贴，然后恢复隐藏状态，从而实现了对筛选行和隐藏行的差异化处理。

## 二、解决的问题

在实际的电子表格应用中，用户经常会同时使用筛选和隐藏功能来管理数据视图。传统的粘贴行为通常采用"一刀切"的策略，要么跳过所有不可见行，要么覆盖所有行。这会导致以下问题：

* 当启用 `pasteSkipInvisibleRange` 选项时，所有不可见行（包括筛选和隐藏）都会被跳过，但用户可能希望对手动隐藏的行进行数据更新
* 如果不启用该选项，粘贴会覆盖被筛选的行，破坏筛选结果的完整性
* 用户无法根据"不可见的原因"来精确控制粘贴行为

本示例通过编程方式实现了更智能的粘贴逻辑：识别行不可见的具体原因（筛选 vs 隐藏），仅对被筛选的行执行跳过操作，而对手动隐藏的行正常粘贴数据。

## 三、实现思路

### 3.1 启用基础的跳过不可见行功能

首先通过 SpreadJS 的内置选项启用跳过不可见行的基础功能：

```javascript
spread.options.pasteSkipInvisibleRange = true
```

这个选项会让粘贴操作自动跳过所有不可见的行和列，但它无法区分"筛选"和"隐藏"两种不同的不可见状态。

### 3.2 监听粘贴事件并区分行状态

核心逻辑在 `ClipboardPasting` 事件处理函数中实现。该事件在粘贴操作执行前触发，允许开发者介入粘贴流程：

```javascript
spread.bind(GC.Spread.Sheets.Events.ClipboardPasting, function (e, info) {
    info.sheet.suspendPaint()
    let range = info.cellRange
    let hiddenRows = []
    
    for (let row = range.row; row < range.row + range.rowCount; row++) {
        let visible = info.sheet.getRowVisible(row)
        if (visible) {
            continue
        }
        
        // 判断是否被筛选
        let filters = []
        if (info.sheet.rowFilter()) {
            filters.push(info.sheet.rowFilter())
        }
        
        let rowFilterdOut = false
        for (let i = 0; i < filters.length; i++) {
            let filter = filters[i]
            let out = filter.isRowFilteredOut(row)
            if (out) {
                rowFilterdOut = true
            }
        }
        
        // 如果不是被筛选掉的，就是被手动隐藏的
        if (!rowFilterdOut) {
            hiddenRows.push(row)
        }
    }
    
    // 临时显示被隐藏的行
    hiddenRows.forEach(row => {
        info.sheet.setRowVisible(row, true)
    })
    
    setTimeout(() => {
        // 粘贴完成后重新隐藏
        hiddenRows.forEach(row => {
            info.sheet.setRowVisible(row, false)
        })
        info.sheet.resumePaint()
    }, 0);
})
```

### 3.3 临时显示与恢复机制

为了让被手动隐藏的行能够接收粘贴数据，代码采用了"临时显示-粘贴-恢复隐藏"的策略：

1. 在粘贴前调用 `suspendPaint()` 暂停界面渲染，避免闪烁
2. 将识别出的手动隐藏行临时设置为可见状态
3. 使用 `setTimeout(..., 0)` 将恢复操作推迟到粘贴完成后执行
4. 恢复隐藏状态并调用 `resumePaint()` 恢复渲染

这种异步处理确保了粘贴操作能够在行可见的状态下完成，同时用户界面上不会看到行的显示/隐藏切换过程。

### 3.4 技术栈

* SpreadJS 17.0.8（核心电子表格引擎）
* SpreadJS Designer 17.0.8（设计器组件）
* SystemJS 0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开示例页面，可以看到工作表中已经预设了数据：
    * 第 3 行被筛选（通过行筛选器隐藏）
    * 第 5 行被手动隐藏
    * D10:D15 区域有带背景色的数据（1-6）
2. 选中 D10:D15 区域并复制（Ctrl+C）
3. 在 B1 单元格（标记为"在这里粘贴"）点击并粘贴（Ctrl+V）
4. 清除筛选和取消隐藏行，观察粘贴结果：
    * 第 2 行（对应源数据第 1 行）：粘贴成功
    * 第 3 行（被筛选）：未粘贴数据，保持原状
    * 第 4 行（对应源数据第 3 行）：粘贴成功
    * 第 5 行（被手动隐藏）：粘贴成功
    * 第 6-7 行：粘贴成功

## 五、功能特点

### 5.1 优点

* 精确区分筛选和隐藏两种不可见状态，提供更符合用户预期的粘贴行为
* 通过暂停渲染机制避免界面闪烁，用户体验流畅
* 代码逻辑清晰，易于理解和维护
* 支持扩展到表格（Table）的行筛选器（代码中已预留接口）

### 5.2 局限性与扩展建议

* 当前实现仅处理行的筛选和隐藏，未处理列的情况（可扩展 `getColVisible` 和列筛选器）
* 表格（Table）的行筛选器支持已注释（第 44-47 行），需要根据实际情况启用
* 如果粘贴区域非常大且包含大量隐藏行，临时显示/隐藏操作可能影响性能，可考虑优化为批量操作

扩展建议：

* 添加对列筛选和列隐藏的支持
* 支持表格（Table）的筛选器判断
* 提供配置选项让用户自定义跳过策略（如完全跳过、完全粘贴、智能跳过）

## 六、关键代码片段

### 判断行是否被筛选

```javascript
let filters = []
if (info.sheet.rowFilter()) {
    filters.push(info.sheet.rowFilter())
}

let rowFilterdOut = false
for (let i = 0; i < filters.length; i++) {
    let filter = filters[i]
    let out = filter.isRowFilteredOut(row)  // 核心 API：判断行是否被筛选
    if (out) {
        rowFilterdOut = true
    }
}
```

`isRowFilteredOut()` 方法是实现该功能的关键 API，它能够准确判断某一行是否因筛选条件而被隐藏。

### 临时显示与异步恢复

```javascript
info.sheet.suspendPaint()  // 暂停渲染

// 临时显示被隐藏的行
hiddenRows.forEach(row => {
    info.sheet.setRowVisible(row, true)
})

setTimeout(() => {
    // 粘贴完成后恢复隐藏
    hiddenRows.forEach(row => {
        info.sheet.setRowVisible(row, false)
    })
    info.sheet.resumePaint()  // 恢复渲染
}, 0);
```

使用 `setTimeout(..., 0)` 确保恢复操作在粘贴完成后执行，这是 JavaScript 事件循环机制的经典应用。

## 七、总结

本示例展示了如何通过监听 SpreadJS 的粘贴事件，实现对筛选行和隐藏行的差异化处理。开发者可以从中学到：

* 如何使用 `ClipboardPasting` 事件介入粘贴流程
* 如何使用 `isRowFilteredOut()` API 判断行的筛选状态
* 如何通过 `suspendPaint/resumePaint` 优化界面渲染性能
* 如何使用异步机制实现临时状态变更

该方案适用于需要精细控制粘贴行为的场景，特别是在数据分析、报表编辑等需要同时使用筛选和隐藏功能的应用中。代码结构清晰，易于根据实际需求进行扩展和定制。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
