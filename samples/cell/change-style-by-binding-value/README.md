## 一、Demo 概述

本示例展示了如何在 SpreadJS 中通过自定义单元格类型，根据数据绑定路径的同级字段值动态修改单元格样式。具体实现了当数据源中某个对象的 `hasColor` 字段为 `true` 时，自动将绑定到该对象其他字段的单元格背景色设置为红色。这种技术可以实现基于业务逻辑的条件格式化，无需手动设置样式。 

## 二、解决的问题

在实际业务场景中，经常需要根据数据的某些属性来动态调整单元格的显示样式。例如：

* 根据库存状态标记商品信息（库存不足时高亮显示）
* 根据审批状态改变单元格颜色（已审批、待审批、已拒绝）
* 根据数据有效性标记异常数据

传统方式需要在数据变化时手动遍历单元格并设置样式，而本示例通过自定义单元格类型，在渲染阶段自动读取绑定路径的同级字段，实现了样式的自动化管理。

## 三、实现思路

### 3.1 自定义单元格类型

通过继承 `GC.Spread.Sheets.CellTypes.Text` 创建自定义单元格类型，重写 `paint` 方法来控制渲染逻辑：

```javascript
function customText() { }
customText.prototype = new GC.Spread.Sheets.CellTypes.Text()
customText.prototype.paint = function (ctx, value, x, y, w, h, style, context) {
    let { row, col, sheet } = context
    // 获取绑定路径
    let bindingPath = sheet.getBindingPath(row, col)
    // 获取数据源
    let dataSource
    if (sheet.getDataSource()) {
        dataSource = sheet.getDataSource().getSource()
    }
    
    // 根据绑定路径和数据源动态修改样式
    if (bindingPath && dataSource) {
        // 解析绑定路径，获取同级对象
        let keys = bindingPath.split(".")  // ["table", "0", "text"]
        keys.pop() // ["table", "0"]
        
        let tempObj = JSON.parse(JSON.stringify(dataSource))
        keys.forEach(key => {
            tempObj = tempObj[key]
        })
        
        // 根据同级字段 hasColor 设置背景色
        if (tempObj.hasColor) {
            style.backColor = "red"
        }
    }
    
    // 调用原始渲染方法
    GC.Spread.Sheets.CellTypes.Text.prototype.paint.apply(this, arguments)
}
```

### 3.2 绑定路径解析

核心逻辑是通过绑定路径（如 `table.0.text`）回溯到其父级对象（`table.0`），从而访问同级的 `hasColor` 字段：

```javascript
let keys = bindingPath.split(".")  // 分割路径
keys.pop() // 移除最后一级，得到父级路径

let tempObj = JSON.parse(JSON.stringify(dataSource))
keys.forEach(key => {
    tempObj = tempObj[key]  // 逐层访问对象
})
// 此时 tempObj 为 { text: "aaaa", hasColor: true }
```

### 3.3 数据绑定与应用

设置单元格类型、绑定路径和数据源：

```javascript
let sheet = spread.getActiveSheet()
sheet.setCellType(0, 0, new customText())
sheet.setCellType(1, 0, new customText())
sheet.setBindingPath(0, 0, "table.0.text")
sheet.setBindingPath(1, 0, "table.1.text")
sheet.setDataSource(new GC.Spread.Sheets.Bindings.CellBindingSource({
    table: [{
        text: "aaaa",
        hasColor: true   // A1 单元格将显示红色背景
    }, {
        text: "bbbb",
        hasColor: false  // A2 单元格保持默认样式
    }]
}))
```

### 3.4 技术栈

* SpreadJS 16.0.1
* SystemJS 0.19.22（模块加载）
* TypeScript 4.1.2

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，可以看到 A1 单元格显示 "aaaa" 并带有红色背景
2. A2 单元格显示 "bbbb" 并保持默认白色背景
3. 这是因为数据源中第一个对象的 `hasColor` 为 `true`，第二个为 `false`

## 五、功能特点

### 5.1 优点

* **自动化样式管理**：无需手动遍历单元格设置样式，渲染时自动根据数据属性应用样式
* **数据驱动**：样式完全由数据源控制，修改数据即可改变显示效果
* **可扩展性强**：可以根据多个字段、复杂条件来设置不同的样式属性（字体颜色、边框等）
* **性能优化**：仅在渲染时计算样式，避免了额外的样式设置操作

### 5.2 局限性与扩展建议

* **深拷贝开销**：当前使用 `JSON.parse(JSON.stringify(dataSource))` 进行深拷贝，对于大数据量可能影响性能，可以优化为直接引用访问
* **样式属性单一**：示例仅演示了背景色修改，可以扩展为根据不同条件设置字体颜色、字号、边框等多种样式
* **条件逻辑固定**：当前只判断 `hasColor` 字段，可以扩展为支持多种条件判断（数值范围、字符串匹配等）

## 六、关键代码片段

### 绑定路径回溯逻辑

```javascript
// 从 "table.0.text" 回溯到 "table.0"
let keys = bindingPath.split(".")  // ["table", "0", "text"]
keys.pop() // ["table", "0"]

// 逐层访问数据源对象
let tempObj = JSON.parse(JSON.stringify(dataSource))
keys.forEach(key => {
    tempObj = tempObj[key]
})
// 得到 { text: "aaaa", hasColor: true }
```

### 条件样式应用

```javascript
if (tempObj.hasColor) {
    style.backColor = "red"  // 修改传入的 style 对象
}
// 调用原始渲染方法，应用修改后的样式
GC.Spread.Sheets.CellTypes.Text.prototype.paint.apply(this, arguments)
```

## 七、总结

本示例展示了 SpreadJS 自定义单元格类型的高级用法，通过重写 `paint` 方法实现了基于数据绑定路径的条件样式渲染。开发者可以从中学到：

1. 如何创建自定义单元格类型并重写渲染方法
2. 如何解析和利用单元格的绑定路径
3. 如何在渲染阶段动态访问数据源并修改样式
4. 数据驱动的样式管理思路

该方案适用于需要根据业务数据动态调整单元格样式的场景，具有良好的可扩展性，可以根据实际需求扩展为更复杂的条件判断和样式设置逻辑。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
