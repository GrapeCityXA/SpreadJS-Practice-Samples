## 一、Demo 概述

本示例演示了如何在 SpreadJS 中通过条件验证（Data Validation）来限制用户对特定单元格的粘贴和编辑操作。示例中 A 列设置了列表验证（List Validation），当用户尝试向这些单元格粘贴内容或直接编辑时，操作会被自动拦截和取消，从而保护数据的完整性和规范性。

## 二、解决的问题

在实际业务场景中，某些列可能需要严格的数据验证规则（如下拉列表选择），为了防止用户通过粘贴操作绕过验证规则，需要实现以下功能：

- 禁止向带有条件验证的单元格粘贴数据
- 禁止直接编辑带有条件验证的单元格
- 确保数据输入必须通过验证规则（如下拉列表选择）

## 三、实现思路

### 3.1 核心技术点

#### 监听粘贴事件并拦截

通过监听 `ClipboardPasting` 事件，在粘贴操作发生前检查目标区域是否包含条件验证，如果包含则取消粘贴操作。

```javascript
sheet.bind(GC.Spread.Sheets.Events.ClipboardPasting, function (sender, args) {
    let range = args.cellRange
    let { row, col, rowCount, colCount } = range
    for (let i = row; i < rowCount + row; i++) {
        for (let j = col; j < colCount + col; j++) {
            if (sheet.getDataValidator(i, j) && sheet.getDataValidator(i, j).type() == 3) {
                args.cancel = true
                return
            }
        }
    }
})
```

代码逻辑：
- 获取粘贴的目标单元格区域
- 遍历区域内的每个单元格
- 检查单元格是否存在数据验证器且类型为 3（列表验证）
- 如果存在则设置 `args.cancel = true` 取消粘贴操作

#### 监听编辑事件并拦截

通过监听 `EditStarting` 事件，在用户开始编辑单元格时检查是否存在条件验证，如果存在则取消编辑操作。

```javascript
sheet.bind(GC.Spread.Sheets.Events.EditStarting, function (sender, args) {
    let { row, col } = args
    
    if (sheet.getDataValidator(row, col) && sheet.getDataValidator(row, col).type() == 3) {
        args.cancel = true
    }
})
```

代码逻辑：
- 获取即将编辑的单元格位置
- 检查该单元格是否存在数据验证器且类型为 3
- 如果存在则取消编辑操作

#### 设置列表验证规则

在工作表的 JSON 配置中，A 列已预设了列表验证规则，数据源为 G5:G7 单元格区域（包含"苹果"、"香蕉"、"梨"）。

```javascript
"validations": [{
    "type": 3,  // 列表验证类型
    "condition": {
        "conType": 12,
        "ignoreBlank": true,
        "formula": "Sheet2!$G$5:$G$7"
    },
    "ranges": "A:A"  // 应用于整个 A 列
}]
```

### 3.2 技术栈

- @grapecity/spread-sheets: 15.0.0
- SystemJS: 0.19.22（模块加载器）
- TypeScript: 4.1.2

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行示例。

### 4.2 操作步骤

1. 打开示例页面，可以看到 A 列已设置了条件验证
2. 尝试在任意单元格复制内容，然后粘贴到 A 列的任意单元格 → 粘贴操作会被拦截
3. 尝试双击 A 列的单元格进行编辑 → 编辑操作会被拦截
4. 对比：在其他列（如 B 列）可以正常粘贴和编辑

## 五、功能特点

### 5.1 优点

- 数据保护：有效防止用户通过粘贴绕过验证规则
- 用户体验：通过事件拦截实现无感知的操作限制
- 灵活性：可以根据验证类型（type）进行精确控制

### 5.2 局限性与扩展建议

当前实现存在一个小 bug：在 `ClipboardPasting` 事件处理函数中，第 16 行代码 `angs.cancel = true` 应为 `args.cancel = true`（变量名拼写错误）。

扩展建议：
- 可以添加用户提示信息，告知用户为何操作被拦截
- 可以扩展到其他验证类型（如数字范围验证、日期验证等）
- 可以根据业务需求，允许特定权限的用户进行粘贴操作

## 六、关键代码片段

### 获取数据验证器并判断类型

```javascript
// 获取指定单元格的数据验证器
let validator = sheet.getDataValidator(row, col)

// 判断验证器是否存在且类型为列表验证（type = 3）
if (validator && validator.type() == 3) {
    // 执行拦截逻辑
}
```

### 取消事件的默认行为

```javascript
// 在事件处理函数中设置 cancel 属性为 true
args.cancel = true
```

## 七、总结

本示例展示了如何通过 SpreadJS 的事件机制和数据验证功能，实现对特定单元格的粘贴和编辑限制。开发者可以从中学到：

- 如何使用 `ClipboardPasting` 事件拦截粘贴操作
- 如何使用 `EditStarting` 事件拦截编辑操作
- 如何通过 `getDataValidator()` 方法获取单元格的验证规则
- 如何根据验证类型实现精确的操作控制

该方案适用于需要严格数据输入规范的业务场景，如表单填写、数据导入等，可以有效防止用户通过粘贴操作破坏数据验证规则。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/958mhUX0rE2EVmgr7q0bYQ/)）
