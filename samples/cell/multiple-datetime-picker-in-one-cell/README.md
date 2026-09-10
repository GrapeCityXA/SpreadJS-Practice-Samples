## 一、Demo 概述

本示例展示了如何在 SpreadJS 的单个单元格中放置两个独立的日期选择器按钮，通过集成 jQuery UI Datepicker 组件实现日期选择功能。用户可以点击单元格内的不同按钮，分别选择两个日期值，并将它们以空格分隔的形式存储在同一个单元格中。 

该方案适用于需要在一个单元格内同时记录多个日期的场景，例如起止日期、对比日期等业务需求。

## 二、解决的问题

* **单元格内多日期输入**：传统的单元格编辑器只能输入单一值，本示例通过 cellButtons 实现在一个单元格内管理两个独立的日期值
* **第三方 UI 组件集成**：演示如何将 jQuery UI Datepicker 与 SpreadJS 结合，利用成熟的日期选择器组件提升用户体验
* **动态定位与交互**：解决日期选择器在表格中的精确定位问题，确保弹出的日期面板位置正确

## 三、实现思路

### 3.1 核心技术点

#### 单元格按钮配置

通过 SpreadJS 的 `cellButtons` 样式属性在单元格内添加两个按钮，每个按钮对应一个日期选择器：

```javascript
let style = new GC.Spread.Sheets.Style()

style.cellButtons = [
    {
        caption: "按钮1",
        command: function (sheet, row, col) {
            let cellRect = sheet.getCellRect(row, col)
            currentCell = { row, col, index: 0 }
            showDatepicker(cellRect)
        }
    }, {
        caption: "按钮2",
        command: function (sheet, row, col) {
            let cellRect = sheet.getCellRect(row, col)
            currentCell = { row, col, index: 1 }
            showDatepicker(cellRect)
        }
    }
]
spread.getActiveSheet().setStyle(0, 0, style)
```

每个按钮的 `command` 回调函数记录当前单元格位置和日期索引（0 或 1），用于后续更新对应的日期值。

#### jQuery UI Datepicker 集成

使用 jQuery UI 的 Datepicker 组件作为日期选择器，通过全局配置 `onSelect` 回调处理日期选择逻辑：

```javascript
jQuery.datepicker.setDefaults({
    onSelect: date => {
        let { row, col } = currentCell
        let value = spread.getActiveSheet().getValue(row, col)
        if (!value) {
            spread.getActiveSheet().setValue(row, col, " ")
        }
        value = spread.getActiveSheet().getValue(row, col)
        let arr = value.split(" ")
        arr[currentCell.index] = date
        spread.getActiveSheet().setValue(row, col, arr.join(" "))
        $(dateInput).datepicker("hide")
        $(dateInput).datepicker("destroy")
        document.querySelector("body").removeChild(dateInput)
    }
})
```

选择日期后，将单元格值按空格分割成数组，根据 `currentCell.index` 更新对应位置的日期，然后重新拼接并写回单元格。

#### 动态创建与定位日期选择器

`showDatepicker` 函数负责动态创建 input 元素并初始化 Datepicker：

```javascript
function showDatepicker(cellRect) {
    document.querySelectorAll(".date-input").forEach(ele => {
        ele.remove()
    })
    dateInput = document.createElement("input")
    dateInput.classList = ["date-input"]
    dateInput.style.top = (cellRect.y + vpRect.top) + "px"
    dateInput.style.left = (cellRect.x + vpRect.left) + "px"
    document.querySelector("body").appendChild(dateInput)
    $(dateInput).datepicker()
    $(dateInput).datepicker("show")
}
```

通过 `getCellRect` 获取单元格的屏幕坐标，结合容器的 `getBoundingClientRect` 计算绝对定位，确保日期选择器显示在正确位置。

### 3.2 技术栈

* SpreadJS 16.0.1：电子表格核心库
* jQuery 3.6.3：DOM 操作和事件处理
* jQuery UI 1.13.2：提供 Datepicker 日期选择器组件
* TypeScript 4.1.2：类型支持（项目配置）
* SystemJS：模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行（需要本地 Web 服务器或支持 ES 模块的浏览器）。

### 4.2 操作步骤

1. 打开页面后，在第一行第一列（A1 单元格）可以看到两个按钮："按钮1" 和 "按钮2"
2. 点击 "按钮1"，弹出日期选择器，选择第一个日期
3. 点击 "按钮2"，弹出日期选择器，选择第二个日期
4. 单元格中会显示两个日期，以空格分隔（例如：`01/15/2024 02/20/2024`）
5. 可以重复点击按钮修改对应的日期值

## 五、功能特点

### 5.1 优点

* **灵活的多值输入**：突破单元格单一值限制，支持在一个单元格内管理多个日期
* **成熟的 UI 组件**：利用 jQuery UI Datepicker 提供友好的日期选择体验，无需自行开发日期选择器
* **精确的定位控制**：通过计算单元格位置实现日期选择器的准确定位

### 5.2 局限性与扩展建议

* **数据格式固定**：当前使用空格分隔日期，如果需要其他格式（如 JSON、逗号分隔）需要修改解析逻辑
* **按钮数量限制**：示例中硬编码了两个按钮，如需支持更多日期可以通过配置数组动态生成按钮
* **样式定制**：可以通过 CSS 自定义按钮和日期选择器的外观，提升视觉一致性

扩展建议：

* 将日期格式和分隔符作为配置项，支持自定义数据存储格式
* 添加日期验证逻辑，确保第二个日期不早于第一个日期（适用于日期范围场景）
* 封装为可复用的自定义单元格类型，方便在多个单元格中应用

## 六、总结

本示例展示了 SpreadJS 与第三方 UI 组件集成的典型方案，通过 cellButtons 和动态 DOM 操作实现了单元格内的复杂交互。开发者可以从中学到：

* SpreadJS cellButtons 的配置和使用方法
* 如何集成 jQuery UI 等第三方组件
* 单元格坐标计算和绝对定位技巧
* 单元格内多值数据的存储和解析方案

该方案适用于需要在表格中快速输入多个相关日期的场景，具有良好的扩展性，可以根据实际需求调整按钮数量、日期格式和验证规则。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
