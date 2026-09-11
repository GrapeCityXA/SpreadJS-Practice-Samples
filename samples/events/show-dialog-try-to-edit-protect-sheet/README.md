## 一、Demo 概述

本示例演示了如何在 SpreadJS 中实现表单保护功能，并在用户尝试编辑受保护的锁定单元格时弹出友好的提示信息。当工作表处于保护状态时，用户双击锁定单元格或按下键盘按键尝试编辑时，系统会自动弹出提示框，告知用户该单元格受保护，需要取消工作表保护才能进行修改。

该示例适用于需要保护特定单元格数据不被误修改的场景，如表单模板、数据报表等业务应用。

## 二、解决的问题

* 防止用户误操作修改受保护的单元格数据
* 提供清晰的用户反馈，说明单元格为何无法编辑
* 增强表单保护功能的用户体验，避免用户困惑

## 三、实现思路

### 3.1 启用工作表保护

通过设置 `sheet.options.isProtected` 属性为 `true` 来启用工作表保护功能：

```javascript
let sheet = spread.getActiveSheet()
// 开启表单保护
sheet.options.isProtected = true
```

### 3.2 监听双击单元格事件

使用 `CellDoubleClick` 事件监听用户双击单元格的操作，当双击锁定单元格时弹出提示：

```javascript
sheet.bind(GC.Spread.Sheets.Events.CellDoubleClick, function(e, args) {
    var { row, col } = args;
    if (sheet.options.isProtected === true && sheet.getCell(row, col).locked() === true) {
        alert('您试图更改的单元格或图表位于受保护的工作表中，若要进行更改，请取消工作表保护。');
    }
});
```

### 3.3 监听键盘按键事件

通过 `document.onkeydown` 监听键盘事件，当用户在锁定单元格上按下按键时弹出提示：

```javascript
document.onkeydown = function(event) {
    var e = event || window.event;
    if (e && e.keyCode) {
        var gcuielement = document.activeElement.attributes.gcuielement;
        if (gcuielement && gcuielement.localName === 'gcuielement') {
            var selection = sheet.getSelections()[0];
            var { row, col } = selection;
            if (sheet.options.isProtected === true && sheet.getCell(row, col).locked() === true) {
                alert('您试图更改的单元格或图表位于受保护的工作表中，若要进行更改，请取消工作表保护。');
            }
        }
    }
}
```

该实现通过检查 `gcuielement` 属性确保焦点在 SpreadJS 控件内，然后获取当前选中单元格的行列信息，判断单元格是否被锁定。

### 3.4 技术栈

* SpreadJS 15.0.0：核心电子表格组件库
* SystemJS 0.19.22：模块加载器
* TypeScript 4.1.2：类型支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 在浏览器中打开 `index.html` 文件
2. 尝试双击任意单元格，会弹出提示框
3. 尝试选中单元格后按下键盘上的任意按键，同样会弹出提示框
4. 提示信息说明该单元格受保护，需要取消工作表保护才能编辑

## 五、功能特点

### 5.1 优点

* 实现简单，代码量少，易于理解和维护
* 提供双重保护机制（双击和键盘输入），覆盖主要编辑场景
* 用户体验友好，提示信息清晰明确
* 兼容性好，使用标准的 DOM 事件和 SpreadJS API

### 5.2 局限性与扩展建议

* 当前所有单元格默认都是锁定状态，实际应用中可能需要设置部分单元格为可编辑
* 提示信息使用 `alert` 弹窗，可以考虑使用更美观的自定义提示组件
* 可以扩展为支持密码保护，只有输入正确密码才能取消保护

## 六、关键代码片段

核心逻辑在于判断工作表是否受保护以及单元格是否被锁定：

```javascript
// 判断条件
if (sheet.options.isProtected === true && sheet.getCell(row, col).locked() === true) {
    alert('您试图更改的单元格或图表位于受保护的工作表中，若要进行更改，请取消工作表保护。');
}
```

该判断逻辑在两个事件处理函数中复用，确保无论用户通过何种方式尝试编辑，都能得到一致的提示。

## 七、总结

本示例展示了如何在 SpreadJS 中实现表单保护提示功能，通过监听用户的双击和键盘输入事件，在用户尝试编辑受保护单元格时提供及时的反馈。开发者可以从中学到：

* SpreadJS 工作表保护功能的基本使用
* 单元格锁定状态的判断方法
* 事件监听机制的应用（CellDoubleClick 事件和键盘事件）
* 如何结合 DOM 事件和 SpreadJS API 实现业务逻辑

该方案适用于需要保护数据完整性的表单应用场景，可以根据实际需求扩展为更复杂的权限控制系统。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
