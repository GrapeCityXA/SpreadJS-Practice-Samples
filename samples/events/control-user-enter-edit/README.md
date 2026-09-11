## 一、Demo 概述

本示例演示了如何在 SpreadJS 中控制单元格的输入行为。通过监听 `EditStarting` 事件，可以阻止用户在特定条件下直接编辑单元格，强制用户通过下拉选择或单元格按钮来改变值。这种方式适用于需要限制用户输入格式、确保数据规范性的业务场景。

## 二、解决的问题

* **数据规范性控制**：防止用户随意输入不符合规范的数据
* **强制使用预设选项**：确保数据来自预定义的可选值，而非自由输入
* **提升用户体验**：通过下拉选择而非键盘输入，减少输入错误

## 三、实现思路

### 3.1 核心技术点

#### 监听编辑开始事件

使用 `EditStarting` 事件在单元格进入编辑状态之前进行拦截。通过设置 `args.cancel = true` 可以取消编辑操作。

```javascript
spread.bind(GC.Spread.Sheets.Events.EditStarting, function (sender, args) {
    let r = args.row;
    let c = args.col;
    // 获取行号和列号
    let cellButtons = args.sheet.getCell(r, c).cellButtons()
    if (cellButtons) {
        args.cancel = true;
    }
    // 获取数据验证器
    let dataValidator = args.sheet.getDataValidator(r, c)
    if(dataValidator.type() == GC.Spread.Sheets.DataValidation.CriteriaType.list) {
        args.cancel = true
    }
});
```

#### 检测单元格按钮

通过 `getCell(row, col).cellButtons()` 方法判断单元格是否配置了单元格按钮。如果存在按钮，则取消直接编辑，强制用户点击按钮进行选择。

```javascript
let cellButtons = args.sheet.getCell(r, c).cellButtons()
if (cellButtons) {
    args.cancel = true;
}
```

#### 检测数据验证下拉列表

通过 `getDataValidator(row, col)` 获取单元格的数据验证器，判断其类型是否为下拉列表（`list`）。如果是，则取消直接编辑。

```javascript
let dataValidator = args.sheet.getDataValidator(r, c)
if(dataValidator.type() == GC.Spread.Sheets.DataValidation.CriteriaType.list) {
    args.cancel = true
}
```

### 3.2 UI 交互流程

1. 用户双击 B1 单元格 → 系统检测到存在数据验证（下拉列表） → 取消编辑 → 展示下拉选项供选择
2. 用户双击 B2 单元格 → 系统检测到存在单元格按钮 → 取消编辑 → 点击单元格右侧按钮展开选择菜单

### 3.3 技术栈

* SpreadJS 17.0.8：核心表格控件
* SystemJS 0.19.22：模块加载器
* ES6 模块语法

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 使用任意 HTTP 服务器启动，例如：
npx serve .
# 或
python -m http.server 8080
```

然后在浏览器中访问对应的 URL。

### 4.2 操作步骤

1. 打开页面后，可以看到 B1 和 B2 单元格
2. B1 单元格配置了数据验证下拉列表（可选值：1-5）
3. B2 单元格配置了单元格按钮（带分组下拉菜单）
4. 尝试直接在单元格中输入内容，会发现无法进入编辑状态
5. 点击 B1 单元格右侧下拉箭头或点击 B2 单元格按钮，可展开选择界面

## 五、功能特点

### 5.1 优点

* 实现简单，代码量少
* 可灵活扩展，支持更多条件判断
* 适用于多种业务场景（表单录入、数据筛选等）
* 不影响其他单元格的正常编辑

### 5.2 局限性与扩展建议

* 当前实现仅针对 `list` 类型的数据验证，如需支持其他类型可扩展判断逻辑
* 如需针对特定行或列做限制，可添加 `row`、`col` 范围判断

## 

## 六、总结

本示例展示了通过 `EditStarting` 事件控制单元格输入行为的实现方式。开发者可以从中学习到：

1. 如何监听 SpreadJS 的编辑相关事件
2. 如何通过 `cellButtons()` 和 `getDataValidator()` 判断单元格配置
3. 如何利用 `args.cancel` 取消默认编辑行为
4. 适用于需要强制用户选择而非自由输入的场景

该方案轻量且易于扩展，可根据实际业务需求添加更多条件判断，实现更复杂的输入控制逻辑。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
