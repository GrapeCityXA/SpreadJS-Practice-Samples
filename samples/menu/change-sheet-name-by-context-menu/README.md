## 一、Demo 概述

本示例演示了如何在 SpreadJS 中自定义右键菜单，实现通过右键点击工作表标签（Sheet Tab）来修改工作表名称的功能。该示例通过扩展 SpreadJS 的上下文菜单（Context Menu），添加自定义菜单项，并结合自定义对话框实现工作表重命名操作。

## 二、解决的问题

* 提供更便捷的工作表重命名方式，用户无需通过双击或其他复杂操作即可修改工作表名称
* 演示如何扩展 SpreadJS 的右键菜单系统，为特定工作区域添加自定义菜单项
* 展示如何将自定义 UI 组件与 SpreadJS API 结合，实现业务功能

## 三、实现思路

### 3.1 扩展右键菜单

通过 `spread.contextMenu.menuData` 数组添加自定义菜单项，指定菜单项的显示文本、命令函数和工作区域：

```javascript
let openDialog = {
    text: '修改sheet名称',
    name: 'changeSheetName',
    command: changeSheetName,
    workArea: 'sheetTab'
};
spread.contextMenu.menuData.push(openDialog);
```

关键配置说明：

* `text`：菜单项显示的文本
* `name`：菜单项的唯一标识符
* `command`：点击菜单项时执行的函数
* `workArea`：指定菜单项显示的区域，`'sheetTab'` 表示仅在工作表标签区域右键时显示

### 3.2 自定义对话框实现

使用原生 HTML 和 CSS 创建一个简单的对话框，包含输入框和操作按钮：

```javascript
function changeSheetName() {
    document.getElementById('dialog').style.display = 'block'
}
```

对话框默认隐藏（`display: none`），点击菜单项后通过修改 CSS 样式显示。

### 3.3 工作表重命名逻辑

获取输入框的值并调用 SpreadJS API 修改当前活动工作表的名称：

```javascript
document.getElementById('save').onclick = function () {
    let name = document.getElementById('sheet_name').value
    let sheet = spread.getActiveSheet()
    if (name) {
        sheet.name(name)
        spread.refresh()
        document.getElementById('dialog').style.display = 'none'
    } else {
        alert('表单名称不能为空')
    }
}
```

核心 API：

* `spread.getActiveSheet()`：获取当前活动的工作表对象
* `sheet.name(name)`：设置工作表名称
* `spread.refresh()`：刷新 SpreadJS 实例以更新显示

### 3.4 技术栈

* SpreadJS v15.0.0：核心电子表格组件
* SystemJS：模块加载器
* TypeScript v4.1.2：开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 在页面中右键点击工作表标签（Sheet Tab）
2. 在弹出的右键菜单中选择"修改sheet名称"选项
3. 在弹出的对话框中输入新的工作表名称
4. 点击"保存"按钮完成修改，或点击"取消"按钮关闭对话框

## 五、功能特点

### 5.1 优点

* 实现简单，代码量少，易于理解和维护
* 用户体验友好，通过右键菜单快速访问重命名功能
* 演示了 SpreadJS 上下文菜单的扩展机制，可作为其他自定义菜单功能的参考

### 5.2 局限性与扩展建议

* 对话框样式较为简单，可以使用成熟的 UI 组件库（如 Element UI、Ant Design）优化用户体验
* 缺少输入验证，可以添加工作表名称的合法性检查（如禁止特殊字符、重名检测等）
* 可以扩展为支持批量重命名、工作表复制等更多操作

## 六、关键代码片段

### 菜单项配置对象

```javascript
let openDialog = {
    text: '修改sheet名称',      // 菜单显示文本
    name: 'changeSheetName',    // 菜单项唯一标识
    command: changeSheetName,   // 点击时执行的函数
    workArea: 'sheetTab'        // 仅在工作表标签区域显示
};
```

### 工作表重命名核心逻辑

```javascript
let name = document.getElementById('sheet_name').value
let sheet = spread.getActiveSheet()
if (name) {
    sheet.name(name)           // 设置工作表名称
    spread.refresh()           // 刷新显示
    document.getElementById('dialog').style.display = 'none'
} else {
    alert('表单名称不能为空')
}
```

## 七、总结

本示例展示了 SpreadJS 上下文菜单的扩展能力，开发者可以学习到：

* 如何通过 `contextMenu.menuData` 添加自定义菜单项
* 如何指定菜单项的显示区域（`workArea` 属性）
* 如何使用 `sheet.name()` API 修改工作表名称
* 如何将自定义 UI 与 SpreadJS API 结合实现业务功能

该方案适用于需要自定义右键菜单功能的场景，可以扩展为更复杂的菜单系统，如多级菜单、条件显示菜单项等。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
