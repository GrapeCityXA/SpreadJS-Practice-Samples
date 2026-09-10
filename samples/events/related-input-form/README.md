## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现关联表单数据的查询和修改功能。通过点击表格中的姓名单元格，弹出与该姓名关联的详细信息（日期、余额），用户可以在弹出的表单中修改这些信息并保存到内存数据源中。这是一个典型的主从表数据联动场景，适用于需要在表格中快速查看和编辑关联数据的业务需求。

## 二、解决的问题

* **关联数据查询**：在表格中点击主数据（如姓名），快速查看与之关联的详细信息，无需跳转页面或打开新窗口
* **数据修改与同步**：通过弹出表单修改关联数据，并将修改结果同步到内存数据源，实现数据的实时更新
* **用户体验优化**：使用浮动表单代替传统的弹窗或跳转，提供更流畅的交互体验

## 三、实现思路

### 3.1 数据结构设计

示例使用一个 JavaScript 数组存储关联数据，每个对象包含 `name`、`date`、`count` 三个字段：

```javascript
let info = [{
    name: 'lilac',
    date: '2021-08-09',
    count: 50,
}, {
    name: 'memo',
    date: '2021-09-07',
    count: 10000,
}]
```

表格中只显示姓名和性别两列基础信息，关联数据存储在独立的数组中，通过 `name` 字段进行匹配。

### 3.2 单元格点击事件监听

使用 SpreadJS 的 `CellClick` 事件监听第一列（A 列）的点击操作，根据单元格内容查找关联数据：

```javascript
sheet.bind(GC.Spread.Sheets.Events.CellClick, (s, args) => {
    if (args.col == 0) {
        let value = sheet.getText(args.row, args.col)
        for (let i = 0; i < info.length; i++) {
            if (info[i].name == value) {
                document.getElementById('info').style.display = 'block'
                document.getElementById('date').value = info[i].date
                document.getElementById('count').value = info[i].count
                return
            }
        }
        alert('没有关联信息')
    }
})
```

当点击第一列时，获取单元格文本内容，遍历 `info` 数组查找匹配的记录，找到后显示浮动表单并填充数据。

### 3.3 浮动表单实现

使用 HTML + CSS 实现浮动表单，通过 `display` 属性控制显示/隐藏：

```html
<div id="info">
    日期：<input id='date'><br>
    余额：<input id='count'>
    <button id='update'>修改</button>
    <button id='close'>关闭</button>
</div>
```

```css
#info {
    padding: 20px 18px;
    display: none;
    position: fixed;
    top: 20%;
    left: 20%;
    z-index: 10;
    border: 1px solid #ddd;
    background-color: rgba(120,120,120,.75);
}
```

表单默认隐藏（`display: none`），使用 `position: fixed` 实现固定定位，半透明背景提升视觉层次感。

### 3.4 数据修改与验证

点击"修改"按钮时，验证输入内容并更新内存数据：

```javascript
document.getElementById('update').onclick = () => {
    if (sheet.getActiveColumnIndex() == 0) {
        let name = sheet.getValue(sheet.getActiveRowIndex(), sheet.getActiveColumnIndex())
        let date = document.getElementById('date').value
        let count = document.getElementById('count').value
        if (!(date && count)) {
            alert("输入项不能为空")
            return
        }
        for (let i = 0; i < info.length; i++) {
            if (info[i].name == name) {
                info[i].date = date
                info[i].count = count
            }
        }
        alert('修改成功')
    } else {
        alert('必须在第一列点击')
    }
    document.getElementById('info').style.display = 'none'
}
```

通过 `getActiveRowIndex()` 和 `getActiveColumnIndex()` 获取当前活动单元格位置，确保操作在第一列进行，验证输入非空后更新数组数据。

### 3.5 技术栈

* SpreadJS 15.0.0：核心表格组件
* SystemJS：模块加载器
* TypeScript 4.1.2：开发语言（编译为 JavaScript）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，表格中显示两行数据（lilac 和 memo）
2. 点击第一列（A 列）的任意姓名单元格
3. 页面左上方弹出浮动表单，显示该姓名的关联信息（日期、余额）
4. 修改表单中的日期或余额字段
5. 点击"修改"按钮保存更改（数据更新到内存数组）
6. 点击"关闭"按钮隐藏表单
7. 再次点击同一姓名，可以看到修改后的数据

## 五、功能特点

### 5.1 优点

* **实现简单**：使用原生 DOM 操作和 SpreadJS 事件机制，代码量少，易于理解和维护
* **交互流畅**：浮动表单设计避免了页面跳转，用户可以快速查看和修改数据
* **扩展性强**：数据结构清晰，可以轻松扩展更多关联字段或支持更复杂的查询条件

### 5.2 局限性与扩展建议

* **数据持久化**：当前修改仅保存在内存中，刷新页面后数据丢失。建议集成后端 API 或使用 LocalStorage 实现数据持久化
* **表单验证**：仅验证了非空，可以增加日期格式、数值范围等更严格的验证规则
* **批量操作**：当前仅支持单条数据修改，可以扩展为支持多选和批量编辑功能

## 六、总结

本示例展示了 SpreadJS 中实现主从表数据联动的基本方法，通过 `CellClick` 事件监听和 DOM 操作实现了关联数据的查询与修改功能。开发者可以从中学到：

* SpreadJS 单元格事件的绑定和处理方式
* 如何通过 `getText()`、`getValue()` 等 API 获取单元格数据
* 如何使用 `getActiveRowIndex()` 和 `getActiveColumnIndex()` 获取当前活动单元格位置
* 如何结合原生 HTML/CSS 实现自定义 UI 组件与 SpreadJS 的交互

该方案适用于需要在表格中快速查看和编辑关联数据的场景，如订单详情查询、客户信息管理等，具有良好的扩展性和实用价值。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
