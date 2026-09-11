## 一、Demo 概述

本示例展示了如何在 SpreadJS 中自定义 CheckBoxList 单元格类型的渲染行为。当工作表处于保护状态时，CheckBoxList 会自动切换为 Text 单元格类型进行渲染，将选中的选项以文本形式显示，从而实现只读展示效果。这种方式既保持了数据的可读性，又避免了在保护模式下用户误操作修改数据。 

## 二、解决的问题

在实际业务场景中，当工作表被保护后，CheckBoxList 单元格仍然可能显示为可交互的复选框列表，这会给用户造成困扰。本示例通过重写 CheckBoxList 的渲染方法，解决了以下问题：

* 工作表保护状态下，CheckBoxList 应以只读文本形式展示已选中的选项
* 需要将选中的值（value）转换为对应的显示文本（text）
* 保持非保护状态下 CheckBoxList 的正常交互功能

## 三、实现思路

### 3.1 创建 CheckBoxList 单元格类型

首先创建一个 CheckBoxList 实例，并配置选项列表：

```javascript
let checkboxlist = new GC.Spread.Sheets.CellTypes.CheckBoxList()
checkboxlist.items([
    { text: "中文", value: "cn" },
    { text: "英文", value: "en" },
    { text: "韩文", value: "kr" },
])

sheet.setCellType(0, 0, checkboxlist)
sheet.setColumnWidth(0, 200)
```

每个选项包含 `text`（显示文本）和 `value`（实际值）两个属性，单元格的值存储为 value 数组。

### 3.2 重写 paintValue 方法实现条件渲染

核心技术点在于重写 CheckBoxList 的 `paintValue` 方法，根据工作表的保护状态动态切换渲染方式：

```javascript
let checkBoxListPaint = GC.Spread.Sheets.CellTypes.CheckBoxList.prototype.paintValue
GC.Spread.Sheets.CellTypes.CheckBoxList.prototype.paintValue = function (ctx, value, x, y, w, h, style, context) {
    let _sheet = context.sheet
    if (style.locked && _sheet.options.isProtected) {
        // 保护状态下，使用 Text 单元格渲染
        let items = style.cellType._items
        let _value = []
        if (value && Array.isArray(value)) {
            _value = value
        }
        let str = items.filter(v => {
            return _value.indexOf(v.value) > -1
        }).map(v => {
            return v.text
        }).join(",")
        GC.Spread.Sheets.CellTypes.Text.prototype.paintValue.apply(this, [ctx, str, x, y, w, h, style, context]);
    }
    else {
        // 非保护状态下，使用原始 CheckBoxList 渲染
        checkBoxListPaint.apply(this, arguments)
    }
}
```

实现逻辑：

1. 保存原始的 `paintValue` 方法引用
2. 判断单元格是否被锁定（`style.locked`）且工作表是否被保护（`_sheet.options.isProtected`）
3. 如果满足条件，将选中的 value 数组转换为对应的 text 文本，用逗号连接后调用 Text 单元格的渲染方法
4. 否则调用原始的 CheckBoxList 渲染方法

### 3.3 技术栈

* SpreadJS 17.0.8：核心电子表格引擎
* SpreadJS Designer 17.0.8：提供设计器界面
* SystemJS：模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开示例页面，可以看到 A1 单元格显示为 CheckBoxList
2. 选择一个或多个选项（如"中文"和"英文"）
3. 在 SpreadJS Designer 工具栏中点击"保护工作表"按钮
4. 观察 A1 单元格的渲染效果：CheckBoxList 变为文本显示"中文,英文"
5. 取消工作表保护，单元格恢复为可交互的 CheckBoxList

## 五、功能特点

### 5.1 优点

* 自动适配保护状态：无需手动切换单元格类型，根据工作表保护状态自动调整渲染方式
* 数据映射准确：正确将 value 值转换为对应的 text 显示文本
* 非侵入式实现：通过原型链重写实现，不影响其他单元格类型的功能
* 用户体验友好：保护状态下以文本形式展示，避免用户误以为可以操作

## 六、关键代码片段

### 6.1 值到文本的转换逻辑

```javascript
let str = items.filter(v => {
    return _value.indexOf(v.value) > -1
}).map(v => {
    return v.text
}).join(",")
```

这段代码通过 `filter` 筛选出选中的选项，再通过 `map` 提取 text 属性，最后用逗号连接成字符串。

### 6.2 调用 Text 单元格渲染方法

```javascript
GC.Spread.Sheets.CellTypes.Text.prototype.paintValue.apply(this, [ctx, str, x, y, w, h, style, context]);
```

使用 `apply` 方法调用 Text 单元格的 `paintValue` 方法，传入转换后的文本字符串和原始的渲染参数。

## 七、总结

本示例展示了 SpreadJS 单元格类型自定义渲染的高级用法，开发者可以从中学到：

* 如何重写单元格类型的 `paintValue` 方法实现自定义渲染
* 如何根据工作表状态（保护/非保护）动态切换渲染逻辑
* 如何在不同单元格类型之间复用渲染方法
* 如何处理 CheckBoxList 的数据结构（value 数组与 text 的映射关系）

该方案适用于需要在保护模式下以只读文本形式展示复杂单元格类型的场景，具有良好的扩展性，可以应用于其他需要条件渲染的单元格类型。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
