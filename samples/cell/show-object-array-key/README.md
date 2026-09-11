## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现单元格存储对象数组数据，并通过自定义单元格类型（CellType）控制其显示格式。该功能允许开发者在单元格中存储复杂的对象数组结构，同时在界面上以简洁的文本形式展示指定字段的值。 

这种方案适用于需要在单元格中存储完整数据对象，但只需要显示其中某个字段的场景，例如存储用户信息列表但只显示姓名，或存储商品数据但只显示商品名称等。

## 二、解决的问题

* **数据存储与显示分离**：单元格需要存储完整的对象数组数据（包含多个字段），但界面上只需要显示其中某个特定字段的值
* **数据完整性保持**：通过 `getValue()` 方法可以获取完整的原始对象数组数据，而不是显示的文本内容
* **灵活的字段选择**：可以根据业务需求指定显示对象数组中的任意字段

## 三、实现思路

### 3.1 自定义单元格类型

核心技术是通过继承 `GC.Spread.Sheets.CellTypes.Text` 创建自定义单元格类型 `ArrayCellType`，并重写其 `paint` 方法来控制渲染逻辑：

```javascript
function ArrayCellType(key) {
    this.key = key
}
ArrayCellType.prototype = new GC.Spread.Sheets.CellTypes.Text()
let oldPaint = GC.Spread.Sheets.CellTypes.Text.prototype.paint
ArrayCellType.prototype.paint = function () {
    let arg = arguments
    if (arg[1] && Array.isArray(arg[1])) {
        arg[1] = arg[1].map(v => {
            return v[this.key]
        }).join(",")
    }
    oldPaint.apply(this, arg)
}
```

该实现通过构造函数接收 `key` 参数（指定要显示的字段名），在 `paint` 方法中判断单元格值是否为数组，如果是则提取指定字段并用逗号连接后再调用原始的 `paint` 方法进行渲染。

### 3.2 应用自定义单元格类型

将自定义的 `ArrayCellType` 应用到指定单元格，并设置对象数组数据：

```javascript
sheet.setCellType(0, 0, new ArrayCellType("name"))
sheet.setValue(0, 0, [{ name: "xxx", id: 3 }, { name: "yyy", id: 4 }])
```

此时 A1 单元格会显示 "xxx,yyy"，但实际存储的值仍然是完整的对象数组。

### 3.3 获取原始数据

通过 `getValue()` 方法可以获取单元格存储的原始对象数组数据：

```javascript
document.getElementById("btn").addEventListener("click", function () {
    let value = sheet.getValue(0, 0)
    document.getElementById("value").innerText = JSON.stringify(value)
})
```

点击按钮后会显示完整的对象数组 JSON 字符串：`[{"name":"xxx","id":3},{"name":"yyy","id":4}]`

### 3.4 技术栈

* SpreadJS 17.0.8（核心表格组件）
* SpreadJS Designer 17.0.8（设计器组件）
* SystemJS 0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

安装完成后，使用浏览器打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，A1 单元格会自动显示 "xxx,yyy"
2. 点击页面顶部的"获取单元格的值"按钮
3. 按钮右侧会显示 A1 单元格存储的完整对象数组数据

## 五、功能特点

### 5.1 优点

* **数据完整性**：单元格存储完整的对象数组，不会丢失任何字段信息
* **显示灵活性**：可以根据需要指定显示任意字段，不影响数据存储
* **易于扩展**：可以轻松修改 `paint` 方法实现更复杂的显示逻辑（如自定义分隔符、格式化等）
* **兼容性好**：继承自标准的 Text 单元格类型，保留了文本单元格的所有特性

### 5.2 局限性与扩展建议

* **显示格式固定**：当前实现使用逗号连接，如需其他格式需要修改代码
* **单字段显示**：只能显示一个字段，如需显示多个字段可以修改 `map` 逻辑
* **扩展建议**：
    * 可以在构造函数中增加 `separator` 参数自定义分隔符
    * 可以支持传入格式化函数对字段值进行处理
    * 可以支持显示多个字段，例如 `name (id)` 的格式

## 六、关键代码片段

### 自定义单元格类型完整实现

```javascript
// 传入要显示的对象数组的key
function ArrayCellType(key) {
    this.key = key
}
ArrayCellType.prototype = new GC.Spread.Sheets.CellTypes.Text()
let oldPaint = GC.Spread.Sheets.CellTypes.Text.prototype.paint
ArrayCellType.prototype.paint = function () {
    let arg = arguments
    // 判断单元格值是否为数组
    if (arg[1] && Array.isArray(arg[1])) {
        // 提取指定字段并用逗号连接
        arg[1] = arg[1].map(v => {
            return v[this.key]
        }).join(",")
    }
    // 调用原始的 paint 方法进行渲染
    oldPaint.apply(this, arg)
}
```

### 应用与数据设置

```javascript
// 应用自定义单元格类型，指定显示 name 字段
sheet.setCellType(0, 0, new ArrayCellType("name"))
// 设置对象数组数据
sheet.setValue(0, 0, [{ name: "xxx", id: 3 }, { name: "yyy", id: 4 }])
```

## 七、总结

本示例展示了 SpreadJS 自定义单元格类型的强大能力，通过继承和重写 `paint` 方法实现了数据存储与显示的分离。开发者可以从中学到：

* 如何创建自定义单元格类型
* 如何重写 `paint` 方法控制单元格渲染逻辑
* 如何在单元格中存储复杂数据结构
* 原型继承在 SpreadJS 扩展中的应用

该方案适用于需要在表格中存储结构化数据但只需要显示部分信息的场景，具有良好的扩展性和实用价值。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
