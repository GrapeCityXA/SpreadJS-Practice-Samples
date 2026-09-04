## 一、Demo 概述

本示例展示了如何在 SpreadJS 表格中实现一个实用的视觉反馈功能：当用户修改某一行的单元格内容时，该行的行头会自动显示一个编辑图标，用于标识该行已被编辑过。这种视觉提示可以帮助用户快速识别哪些数据行发生了变更，在数据录入、审核等场景中非常实用。

## 二、解决的问题

在实际的数据管理应用中，用户经常需要知道哪些数据行被修改过。传统的表格组件缺乏直观的视觉标识，导致用户难以追踪数据变更。本示例通过在行头显示自定义图标的方式，解决了以下问题：

- 提供直观的视觉反馈，让用户一眼就能看出哪些行被编辑过
- 在数据审核场景中，帮助审核人员快速定位需要检查的数据行
- 在批量数据录入时，避免遗漏或重复编辑

## 三、实现思路

### 3.1 自定义行头文本显示

SpreadJS 默认会在行头显示行号，本示例首先需要禁用这个默认行为，以便显示自定义内容：

```javascript
sheet.options.rowHeaderAutoText = GC.Spread.Sheets.HeaderAutoText.blank
```

通过将 `rowHeaderAutoText` 设置为 `blank`，行头不再自动显示行号，为后续显示自定义图标腾出空间。

### 3.2 监听单元格值变更事件

核心功能通过监听 `ValueChanged` 事件实现。当用户修改任意单元格的值时，系统会在对应行的行头显示编辑图标：

```javascript
sheet.bind(GC.Spread.Sheets.Events.ValueChanged, function (e, info) {
    // 监听单元格修改事件
    let { row } = info
    sheet.setValue(row, 0, String.fromCharCode("0xe735"), GC.Spread.Sheets.SheetArea.rowHeader)
    sheet.getCell(row, 0, GC.Spread.Sheets.SheetArea.rowHeader).font('12px iconfont')
})
```

关键技术点：
- 从 `info` 对象中获取被修改单元格所在的行号
- 使用 `String.fromCharCode("0xe735")` 将 Unicode 编码转换为图标字符
- 通过 `SheetArea.rowHeader` 指定操作区域为行头
- 设置字体为 `iconfont`，确保图标正确显示

### 3.3 处理新增行场景

除了修改现有单元格，用户还可能新增行。为了保持一致的用户体验，示例还监听了 `RowChanged` 事件：

```javascript
sheet.bind(GC.Spread.Sheets.Events.RowChanged, function (e, info) {
    // 监听新增行事件
    if (info.propertyName == 'addRows') {
        sheet.setValue(info.row, 0, String.fromCharCode("0xe735"), GC.Spread.Sheets.SheetArea.rowHeader)
        sheet.getCell(info.row, 0, GC.Spread.Sheets.SheetArea.rowHeader).font('12px iconfont')
    }
})
```

通过判断 `propertyName` 是否为 `addRows`，可以精确捕获新增行操作，并在新行的行头显示图标。

### 3.4 集成 iconfont 图标库

示例使用了 iconfont 字体图标库来显示编辑图标。在 HTML 中引入了相关资源：

```html
<link rel="stylesheet" type="text/css" href="iconfont.css">
<span class="icon iconfont" style="visibility:hidden;height:0">&#xe735;</span>
```

CSS 文件定义了字体：

```css
@font-face {
  font-family: "iconfont";
  src: url('./iconfont.ttf?t=1677470565442') format('truetype');
}

.icon-bianji3:before {
  content: "\e735";
}
```

图标编码 `\e735` 对应一个编辑笔的图标，通过字体文件渲染。

### 3.5 技术栈

- SpreadJS 16.0.1：核心表格组件
- SystemJS：模块加载器
- TypeScript 4.1.2：开发语言
- iconfont：字体图标库

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，会看到一个空白的 SpreadJS 表格
2. 在 A1 单元格会显示提示文字："请在任意输入一个值，查看效果"
3. 在任意单元格中输入内容并按回车
4. 观察该行的行头，会立即显示一个编辑图标
5. 继续修改其他行的单元格，对应行头也会显示图标
6. 新增行并输入内容，新行的行头同样会显示图标

## 五、功能特点

### 5.1 优点

- 实时响应：图标会在用户修改单元格后立即显示，无延迟
- 视觉直观：使用图标而非文字，更加简洁美观
- 实现简单：核心代码不到 20 行，易于理解和维护
- 扩展性强：可以轻松替换为其他图标或添加更多状态标识

### 5.2 局限性与扩展建议

当前实现存在以下局限性：

- 图标一旦显示就不会消失，无法区分"已保存"和"未保存"的编辑状态
- 没有持久化机制，刷新页面后图标会消失
- 无法撤销图标显示

扩展建议：
- 结合数据保存逻辑，在保存后将图标改为"已保存"状态
- 添加清除图标的功能，允许用户手动或自动清除标记
- 将编辑状态存储到数据模型中，实现跨会话的状态保持

## 六、关键代码片段

完整的核心逻辑代码：

```javascript
import * as GC from "@grapecity/spread-sheets";

let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let sheet = spread.getActiveSheet()

// 禁用默认行号显示
sheet.options.rowHeaderAutoText = GC.Spread.Sheets.HeaderAutoText.blank

// 监听单元格修改事件
sheet.bind(GC.Spread.Sheets.Events.ValueChanged, function (e, info) {
    let { row } = info
    sheet.setValue(row, 0, String.fromCharCode("0xe735"), GC.Spread.Sheets.SheetArea.rowHeader)
    sheet.getCell(row, 0, GC.Spread.Sheets.SheetArea.rowHeader).font('12px iconfont')
})

// 监听新增行事件
sheet.bind(GC.Spread.Sheets.Events.RowChanged, function (e, info) {
    if (info.propertyName == 'addRows') {
        sheet.setValue(info.row, 0, String.fromCharCode("0xe735"), GC.Spread.Sheets.SheetArea.rowHeader)
        sheet.getCell(info.row, 0, GC.Spread.Sheets.SheetArea.rowHeader).font('12px iconfont')
    }
})
```

## 七、总结

本示例展示了如何通过 SpreadJS 的事件监听机制和行头自定义功能，实现一个实用的数据编辑状态标识功能。开发者可以从中学到：

- 如何自定义 SpreadJS 行头的显示内容
- 如何监听和响应单元格值变更事件
- 如何在 SpreadJS 中集成和使用字体图标
- 如何通过 `SheetArea` 参数操作不同的表格区域

该方案适用于需要追踪数据变更的各类应用场景，如数据录入系统、审核工具、协同编辑平台等。通过简单的扩展，还可以实现更复杂的状态管理功能，如多状态标识、状态持久化等。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/kgbhS7ceVUmxW4tEP5OOpw/)）
