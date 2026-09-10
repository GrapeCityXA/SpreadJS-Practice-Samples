## 一、Demo 概述

本示例演示了如何在 SpreadJS 中解决行分组与行隐藏功能冲突的问题。当工作表中存在隐藏行，并且这些隐藏行被包含在分组范围内时，展开分组后隐藏行默认不会显示。本示例通过监听分组展开命令，在展开时自动显示分组范围内的所有隐藏行，确保用户能够看到完整的数据。

该功能适用于需要同时使用行分组和行隐藏功能的场景，例如数据报表中既需要按类别分组，又需要临时隐藏某些明细行的情况。

## 二、解决的问题

在 SpreadJS 中，行分组（Row Outline）和行隐藏（Row Visible）是两个独立的功能。当隐藏行被包含在分组范围内并收起分组后，展开分组时隐藏行仍然保持隐藏状态，这可能导致用户无法查看完整数据。本示例解决了以下问题：

* 展开分组时，自动显示分组范围内所有被隐藏的行
* 同时支持行分组和列分组的场景
* 保持分组功能的正常使用体验

## 三、实现思路

### 3.1 核心技术点

#### 监听分组展开命令

通过 SpreadJS 的命令管理器（Command Manager）监听分组展开操作，捕获 `expandRowOutline` 和 `expandColumnOutline` 命令：

```javascript
spread.commandManager().addListener("_", function (info) {
    let type = ""
    if (info.command && info.command.cmd == "expandRowOutline") {
        type = "row"
    }
    if (info.command && info.command.cmd == "expandColumnOutline") {
        type = "col"
    }
    if (!type) {
        return
    }
    // 为true时代表此时是收起分组
    if (info.command.collapsed) {
        return
    }
    // ... 后续处理逻辑
})
```

使用 `"_"` 作为监听器名称可以捕获所有命令事件，然后通过判断 `info.command.cmd` 来识别具体的分组展开操作。

#### 获取分组范围并显示隐藏行

当检测到展开操作时，使用 `outline.find()` 方法获取分组的起始和结束位置，然后遍历该范围内的所有行或列，将其设置为可见：

```javascript
let _sheet = spread.getSheetFromName(info.command.sheetName)
let outline = _sheet.rowOutlines
if (type == "col") {
    outline = _sheet.columnOutlines
}

_sheet.suspendPaint()
// 注意这里第一个参数要减 1
let range = outline.find(info.command.index - 1, info.command.level)
for (let i = range.start; i < range.end; i++) {
    if (type == "row") {
        _sheet.setRowVisible(i, true)
    } else if (type == "col") {
        _sheet.setColumnVisible(i, true)
    }
}
_sheet.resumePaint()
```

关键点：

* `outline.find()` 的第一个参数需要减 1，因为命令中的 index 是从 1 开始的
* 使用 `suspendPaint()` 和 `resumePaint()` 包裹批量操作，提升性能
* 同时支持行和列的处理逻辑

#### 初始化演示数据

示例代码创建了一个典型的测试场景：先隐藏第 6-10 行，然后对第 3-13 行进行分组并收起：

```javascript
spread.suspendPaint()
for (let r = 5; r < 10; r++) {
    sheet.setValue(r, 0, "隐藏")
    sheet.setRowVisible(r, false)
}
let ro = sheet.rowOutlines
ro.group(2, 11)
ro.setCollapsed(2, true)
spread.resumePaint()
```

这样设置后，展开分组时就能观察到隐藏行自动显示的效果。

### 3.2 技术栈

* @grapecity/spread-sheets: 17.0.8（核心表格组件）
* SystemJS: ^0.19.22（模块加载器）
* systemjs-plugin-babel: 0.0.25（ES6 转译支持）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，可以看到第 3-13 行已经被分组并收起
2. 点击行号左侧的展开按钮（+号）
3. 观察分组展开后，原本隐藏的第 6-10 行会自动显示出来
4. 可以再次收起分组，然后重复展开操作验证效果

## 五、功能特点

### 5.1 优点

* 解决了行分组与行隐藏功能的冲突问题
* 同时支持行分组和列分组
* 代码简洁，易于集成到现有项目
* 使用命令监听机制，不影响其他功能

### 5.2 局限性与扩展建议

当前实现会在展开分组时显示所有隐藏行，如果需要保留某些行的隐藏状态，可以考虑以下扩展方案：

* 添加标记机制，区分"需要保持隐藏"和"可以自动显示"的行
* 提供配置选项，让用户选择是否启用自动显示功能
* 记录展开前的隐藏状态，在收起分组时恢复原始状态

## 六、关键代码片段

完整的命令监听逻辑：

```javascript
spread.commandManager().addListener("_", function (info) {
    console.log(info)
    let type = ""
    if (info.command && info.command.cmd == "expandRowOutline") {
        type = "row"
    }
    if (info.command && info.command.cmd == "expandColumnOutline") {
        type = "col"
    }
    if (!type) {
        return
    }
    // 为true时代表此时是收起分组
    if (info.command.collapsed) {
        return
    }

    let _sheet = spread.getSheetFromName(info.command.sheetName)
    let outline = _sheet.rowOutlines
    if (type == "col") {
        outline = _sheet.columnOutlines
    }

    _sheet.suspendPaint()
    // 注意这里第一个参数要减 1
    let range = outline.find(info.command.index - 1, info.command.level)
    for (let i = range.start; i < range.end; i++) {
        if (type == "row") {
            _sheet.setRowVisible(i, true)
        } else if (type == "col") {
            _sheet.setColumnVisible(i, true)
        }
    }
    _sheet.resumePaint()
})
```

## 七、总结

本示例展示了如何通过 SpreadJS 的命令管理器机制解决行分组与行隐藏功能的冲突问题。开发者可以从中学到：

* 使用 `commandManager().addListener()` 监听特定命令
* 通过 `outline.find()` 获取分组范围信息
* 批量操作时使用 `suspendPaint()` 和 `resumePaint()` 优化性能
* 处理行和列分组的通用逻辑

该方案适用于需要同时使用分组和隐藏功能的场景，代码简洁且易于扩展，可以根据实际需求进行定制化改造。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
