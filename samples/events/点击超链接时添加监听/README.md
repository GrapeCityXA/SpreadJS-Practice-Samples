## 一、Demo 概述

本示例演示了如何在 SpreadJS 中为单元格超链接添加自定义点击事件监听器。通过遍历工作表中的所有单元格，检测包含超链接的单元格，并为其设置自定义的 `command` 回调函数，实现在点击超链接时执行自定义逻辑（如在新窗口打开链接、输出调试信息等）。

该示例适用于需要对超链接点击行为进行扩展控制的场景，例如添加访问日志、弹出确认对话框、或在跳转前执行数据验证等。

## 二、解决的问题

- **自定义超链接行为**：默认情况下，SpreadJS 的超链接点击行为是固定的，通过自定义 `command` 可以实现个性化的跳转逻辑
- **事件拦截与扩展**：在超链接跳转前执行额外的业务逻辑，如记录用户行为、数据校验、权限检查等
- **调试与监控**：在开发阶段可以通过控制台输出超链接的上下文信息，便于调试和问题排查

## 三、实现思路

### 3.1 核心技术点

#### 遍历工作表中的所有单元格

通过 `getUsedRange()` 方法获取工作表的已使用区域，然后使用双重循环遍历该区域内的所有单元格，检测是否包含超链接。

```javascript
let usedRange = _sheet.getUsedRange(GC.Spread.Sheets.UsedRangeType.all)
let totalRow = usedRange.rowCount == -1 ? _sheet.getRowCount() : usedRange.row + usedRange.rowCount
let totalCol = usedRange.colCount == -1 ? _sheet.getColumnCount() : usedRange.col + usedRange.colCount

for (let row = usedRange.row; row < totalRow; row++) {
    for (let col = usedRange.col; col < totalCol; col++) {
        let hyperLink = _sheet.getHyperlink(row, col)
        if (hyperLink) {
            // 处理超链接
        }
    }
}
```

#### 自定义超链接点击事件

通过修改超链接对象的 `command` 属性，可以自定义点击超链接时的行为。`command` 是一个回调函数，接收三个参数：`context`（当前工作表对象）、`row`（行索引）、`col`（列索引）。

```javascript
hyperLink.command = function (context, row, col) {
    let link = context.getHyperlink(row, col)
    window.open(link.url, "_blank")  // 在新窗口打开链接
    console.log(context)  // 输出上下文信息到控制台
    // 可以在此添加其他自定义逻辑
}
_sheet.setHyperlink(row, col, hyperLink)  // 将修改后的超链接写回单元格
```

#### 加载模板文件

示例使用 `fetch` API 加载预先准备好的 `.sjs` 模板文件（SpreadJS 的工作簿文件格式），并通过 `spread.open()` 方法打开该模板。

```javascript
fetch("./template.sjs").then(res => {
    return res.blob()
}).then(template => {
    spread.open(template, function () {
        // 模板加载完成后的回调
    })
})
```

### 3.2 技术栈

- **SpreadJS 17.0.8**：核心电子表格组件库
- **SpreadJS IO 17.0.8**：用于导入导出 Excel 文件和 SpreadJS 模板文件
- **SystemJS 0.19.22**：模块加载器，用于动态加载 ES6 模块

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
# 或使用本地服务器（如 Live Server）运行
```

### 4.2 操作步骤

1. 在浏览器中打开 `index.html` 文件
2. 打开浏览器的开发者工具（按 F12）
3. 切换到 Console（控制台）标签页
4. 点击表格中的任意超链接
5. 观察控制台输出的上下文信息
6. 超链接会在新窗口中打开

## 五、功能特点

### 5.1 优点

- **灵活的事件扩展**：可以在超链接点击时执行任意自定义逻辑，不受默认行为限制
- **批量处理**：通过遍历所有单元格，可以一次性为多个超链接添加监听器
- **上下文信息获取**：`command` 回调函数提供了完整的上下文信息（工作表对象、单元格坐标），便于实现复杂的业务逻辑

### 5.2 局限性与扩展建议

- **性能考虑**：当工作表包含大量单元格时，遍历所有单元格可能会影响性能。建议仅在必要时调用 `handleHyperLink()` 函数，或者只遍历特定区域
- **动态添加的超链接**：如果在运行时动态添加了新的超链接，需要重新调用 `handleHyperLink()` 函数才能为其添加监听器
- **扩展建议**：可以结合 SpreadJS 的事件系统（如 `CellClick` 事件），实现更高效的超链接监听机制

## 六、关键代码片段

### 完整的超链接监听函数

```javascript
function handleHyperLink() {
    spread.sheets.forEach(_sheet => {
        let usedRange = _sheet.getUsedRange(GC.Spread.Sheets.UsedRangeType.all)
        // 遍历每个sheet的usedRange
        let totalRow = usedRange.rowCount == -1 ? _sheet.getRowCount() : usedRange.row + usedRange.rowCount
        let totalCol = usedRange.colCount == -1 ? _sheet.getColumnCount() : usedRange.col + usedRange.colCount
        for (let row = usedRange.row; row < totalRow; row++) {
            for (let col = usedRange.col; col < totalCol; col++) {
                let hyperLink = _sheet.getHyperlink(row, col)
                if (hyperLink) {
                    // 获取到hyperlink之后，设置它的command
                    // context是当前的sheet，row和col分别是被点击的单元格的坐标
                    hyperLink.command = function (context, row, col) {
                        let link = context.getHyperlink(row, col)
                        window.open(link.url, "_blank")
                        console.log(context)
                        // do something
                    }
                    // 将hyperlink写回去
                    _sheet.setHyperlink(row, col, hyperLink)
                }
            }
        }
    })
}
```

## 七、总结

本示例展示了如何在 SpreadJS 中为超链接添加自定义点击事件监听器，通过遍历工作表单元格并修改超链接的 `command` 属性，实现了对超链接点击行为的完全控制。

开发者可以从中学到：

1. 如何使用 `getUsedRange()` 方法获取工作表的已使用区域
2. 如何遍历工作表中的所有单元格并检测超链接
3. 如何通过 `command` 属性自定义超链接的点击行为
4. 如何在超链接点击时获取上下文信息（工作表对象、单元格坐标）
5. 如何使用 `fetch` API 加载 SpreadJS 模板文件

该方案适用于需要对超链接行为进行扩展控制的场景，如添加访问日志、权限验证、数据校验等。通过结合 SpreadJS 的其他 API，可以实现更复杂的业务逻辑和交互体验。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/ZJ2svr-P5EGcX3aVXYChvQ/)）
