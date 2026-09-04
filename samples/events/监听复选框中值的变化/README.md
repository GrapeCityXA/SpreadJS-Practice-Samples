## 一、Demo 概述

本示例演示如何在 SpreadJS 中监听单元格中复选框（CheckBox）和单选列表（RadioButtonList）的值变化事件。通过绑定 ValueChanged 事件，可以识别不同类型的单元格控件，并在值发生变化时执行相应的业务逻辑。该示例适用于需要对表单控件进行实时监控和响应的场景，如数据验证、联动更新等。

## 二、解决的问题

在实际业务中，经常需要在用户操作复选框或单选框时触发特定逻辑，例如：

- 表单数据的实时验证和提交
- 根据用户选择动态显示或隐藏其他内容
- 记录用户的操作行为用于审计
- 实现多个控件之间的联动效果

本示例提供了一种简洁的方式来区分不同类型的单元格控件，并针对性地处理它们的值变化事件。

## 三、实现思路

### 3.1 核心技术点

#### 监听 ValueChanged 事件

通过 `sheet.bind()` 方法绑定 `ValueChanged` 事件，可以捕获工作表中任何单元格值的变化。事件回调函数会接收到包含行列信息的参数对象。

```javascript
sheet.bind(GC.Spread.Sheets.Events.ValueChanged, function(e, info) {
    let {row, col} = info
    // 处理值变化逻辑
})
```

#### 识别单元格类型

使用 `getCellType()` 方法获取单元格的类型对象，然后通过 `instanceof` 运算符判断具体的控件类型。这样可以针对不同类型的控件执行不同的处理逻辑。

```javascript
let cellType = sheet.getCellType(row, col)
if(cellType instanceof GC.Spread.Sheets.CellTypes.RadioButtonList){
    alert('单选列表的值变化了')
} else if(cellType instanceof GC.Spread.Sheets.CellTypes.CheckBox){
    alert("复选框的值变化了")
} else {
    alert(sheet.getValue(row, col))
}
```

#### 加载预设的工作簿数据

示例使用 `fromJSON()` 方法加载预先配置好的工作簿数据，其中包含了已设置好的复选框和单选列表控件。这些控件的配置信息存储在 `cellfile.js` 中。

```javascript
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
spread.fromJSON(cellfile)
```

### 3.2 技术栈

- SpreadJS 15.0.0：核心表格控件库
- SystemJS 0.19.22：模块加载器
- TypeScript 4.1.2：类型支持（配置环境）

## 四、使用说明

### 4.1 运行方式

1. 安装依赖：
```bash
npm install
```

2. 在浏览器中打开 `index.html` 文件

### 4.2 操作步骤

1. 打开页面后，会看到一个包含复选框和单选列表的工作表
2. 点击复选框，会弹出提示"复选框的值变化了"
3. 选择单选列表中的选项，会弹出提示"单选列表的值变化了"
4. 修改其他普通单元格的值，会弹出显示该单元格的新值

## 五、功能特点

### 5.1 优点

- 统一的事件处理机制，通过一个事件监听器处理所有单元格的值变化
- 类型识别清晰，可以精确区分不同的单元格控件类型
- 代码简洁，核心逻辑仅需十几行代码即可实现
- 易于扩展，可以方便地添加对其他单元格类型的处理

### 5.2 扩展建议

- 可以将 alert 替换为更友好的 UI 提示方式
- 可以在事件处理中添加数据验证逻辑
- 可以实现多个控件之间的联动效果
- 可以记录操作日志到后端服务器

## 六、总结

本示例展示了 SpreadJS 中监听和处理单元格控件值变化的基本方法。开发者可以从中学到：

- 如何使用 ValueChanged 事件监听单元格值的变化
- 如何通过 getCellType 和 instanceof 识别不同类型的单元格控件
- 如何加载和使用预设的工作簿配置数据

该方案适用于需要对表单控件进行实时监控的场景，代码简洁易懂，具有良好的可扩展性。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/Qp64Jb8sOkWiUsLlg_TxSQ/)）
