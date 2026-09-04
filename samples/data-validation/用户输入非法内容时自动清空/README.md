## 一、Demo 概述

本示例演示了如何在 SpreadJS 中实现自定义输入校验功能，当用户输入的内容不符合业务规则时，自动清空输入信息并阻止其应用到单元格中。该示例通过监听单元格编辑结束事件，在用户输入特定非法内容（如"哈哈哈"）时，取消编辑操作并清空输入框，从而实现更灵活的数据校验机制。

## 二、解决的问题

- **自定义输入校验**：除了 SpreadJS 内置的数据验证功能外，提供了一种更灵活的方式来实现自定义业务规则校验
- **即时反馈**：在用户输入不合法内容时立即清空，避免错误数据进入单元格
- **增强用户体验**：通过编程方式控制输入行为，可以配合提示信息实现更友好的交互

## 三、实现思路

### 3.1 核心技术点

#### 监听 EditEnding 事件

通过绑定 `EditEnding` 事件来拦截单元格编辑结束的时机，在数据应用到单元格之前进行校验：

```javascript
sheet.bind(GC.Spread.Sheets.Events.EditEnding, (sender, args) => {
    if (args.editingText == '哈哈哈') {
        args.cancel = true
        // 后续处理...
    }
})
```

`EditEnding` 事件在用户完成编辑（按 Enter、点击其他单元格等）时触发，通过 `args.editingText` 可以获取用户输入的内容，通过设置 `args.cancel = true` 可以阻止编辑内容应用到单元格。

#### 异步终止编辑状态

为了彻底清空输入框并退出编辑模式，需要使用 `setTimeout` 异步执行 `endEdit` 方法：

```javascript
setTimeout(() => {
    sheet.suspendEvent()
    sheet.endEdit(true)
    sheet.resumeEvent()
})
```

- `suspendEvent()`：暂停事件触发，避免 `endEdit` 再次触发 `EditEnding` 事件导致死循环
- `endEdit(true)`：参数 `true` 表示取消编辑，不将编辑内容应用到单元格
- `resumeEvent()`：恢复事件触发

### 3.2 技术栈

- **@grapecity/spread-sheets**: 15.0.0 - SpreadJS 核心库
- **SystemJS**: 0.19.22 - 模块加载器
- **TypeScript**: 4.1.2 - 类型支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，会看到一个 SpreadJS 表格控件
2. 点击任意单元格进入编辑状态
3. 尝试输入"哈哈哈"并按 Enter 或点击其他单元格
4. 观察到输入内容被清空，单元格保持空白状态
5. 输入其他内容则可以正常保存到单元格

## 五、功能特点

### 5.1 优点

- **灵活的校验逻辑**：可以实现任意复杂的自定义校验规则，不受内置数据验证功能的限制
- **即时清空**：不合法的输入会被立即清空，避免用户看到错误提示后还需要手动删除
- **事件驱动**：基于事件机制实现，代码结构清晰，易于维护和扩展

### 5.2 局限性与扩展建议

- **用户提示不足**：当前实现只是简单清空输入，建议配合 `alert` 或自定义提示组件告知用户输入不合法的原因
- **校验规则硬编码**：示例中直接判断是否等于"哈哈哈"，实际应用中可以改为正则表达式或调用校验函数，支持更复杂的规则
- **扩展方向**：
  - 结合正则表达式实现格式校验（如邮箱、手机号）
  - 调用后端 API 进行异步校验（如检查用户名是否重复）
  - 配合 `EditStarting` 事件实现输入过程中的实时校验

## 六、关键代码片段

完整的校验逻辑实现：

```javascript
import * as GC from "@grapecity/spread-sheets";

let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let sheet = spread.getActiveSheet()

// 绑定单元格离开编辑状态事件
sheet.bind(GC.Spread.Sheets.Events.EditEnding, (sender, args) => {
    if (args.editingText == '哈哈哈') {
        args.cancel = true
        // 异步执行终止单元格编辑状态，不将编辑文本应用到单元格中
        setTimeout(() => {
            sheet.suspendEvent()
            sheet.endEdit(true)
            sheet.resumeEvent()
        })
    }
})
```

## 七、总结

本示例展示了如何通过 SpreadJS 的事件机制实现自定义输入校验功能，这是一个非常实用的技术方案。开发者可以从中学到：

1. 如何使用 `EditEnding` 事件拦截单元格编辑操作
2. 如何通过 `args.cancel` 阻止编辑内容应用到单元格
3. 如何使用 `suspendEvent` 和 `resumeEvent` 避免事件循环
4. 如何使用 `endEdit` 方法编程控制编辑状态

该方案适用于需要实现复杂业务规则校验的场景，特别是当 SpreadJS 内置的数据验证功能无法满足需求时。通过扩展该方案，可以实现更丰富的输入控制功能，如实时格式校验、异步数据校验等。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/jueHyAgmh0eO9-2pD_3nrA/)）
