## 一、Demo 概述

本示例演示了如何在 SpreadJS 表格应用中处理焦点（focus）冲突问题。当用户点击特定单元格触发弹窗时，需要确保外部输入框能够正确获取焦点，而不会被 SpreadJS 的单元格编辑器抢夺。该示例通过调用 `spread.focus(false)` 方法并配合延迟执行，实现了焦点的平滑切换，确保用户可以直接在弹窗表单中输入数据。

## 二、解决的问题

在 SpreadJS 与外部 UI 组件（如模态弹窗、表单输入框）交互时，常见的焦点冲突问题包括：

- **焦点抢夺**：点击单元格后打开弹窗，输入框无法自动获取焦点，用户需要手动点击才能输入
- **编辑器干扰**：SpreadJS 的单元格编辑器保持激活状态，导致键盘事件被表格拦截而非传递给弹窗
- **用户体验下降**：需要额外的点击操作才能开始输入，交互流程不够流畅

该示例通过主动释放 SpreadJS 的焦点控制权，解决了这些问题，使得外部表单能够正常接管用户输入。

## 三、实现思路

### 3.1 核心技术点

#### 释放 SpreadJS 焦点控制

通过调用 `spread.focus(false)` 方法，主动让 SpreadJS 失去焦点，从而允许外部元素获取焦点：

```javascript
spread.bind(GC.Spread.Sheets.Events.CellClick, function (e, info) {
    if (info.row == 1 && info.col == 1) {
        spread.focus(false);  // 关键：释放 SpreadJS 焦点
        setTimeout(() => openModal(), 500);
    }
});
```

这里使用 `setTimeout` 延迟 500ms 打开弹窗，确保焦点释放操作完成后再执行后续逻辑，避免时序冲突。

#### 弹窗打开时自动聚焦输入框

在弹窗显示后，立即调用输入框的 `focus()` 方法，确保用户可以直接输入：

```javascript
function openModal() {
    modalMask.classList.add('active');
    modalContainer.classList.add('active');
    nameIpt.focus();  // 自动聚焦到姓名输入框
}
```

#### 表单数据回填到单元格

用户提交表单后，将输入的数据格式化并写入当前激活的单元格：

```javascript
document.getElementById('infoForm').addEventListener('submit', (e) => {
    e.preventDefault();
    let str = `我是${nameIpt.value}，性别为${genderIpt.value}, 今年${ageIpt.value}岁`;
    let row = sheet.getActiveRowIndex();
    let col = sheet.getActiveColumnIndex();
    sheet.setValue(row, col, str);
    closeModal();
});
```

### 3.2 UI 交互流程

用户点击单元格 (1,1) → SpreadJS 释放焦点 → 延迟 500ms → 弹窗显示 → 姓名输入框自动获取焦点 → 用户填写表单 → 提交后数据写入单元格 → 弹窗关闭

### 3.3 技术栈

- **@grapecity/spread-sheets**: 17.0.8（核心表格组件）
- **SystemJS**: 0.19.22（模块加载器）
- **原生 JavaScript**：DOM 操作和事件处理

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，可以看到一个 SpreadJS 表格，单元格 (1,1) 显示"点击这里"
2. 点击该单元格，等待约 500ms 后弹出"填写个人信息"表单
3. 此时姓名输入框已自动获取焦点，可以直接输入
4. 依次填写姓名、年龄、性别
5. 点击"确认"按钮，表单数据将以文本形式写入单元格 (1,1)
6. 点击"取消"或遮罩层可关闭弹窗

## 五、功能特点

### 5.1 优点

- **焦点管理精准**：通过 `spread.focus(false)` 主动释放焦点，避免与外部组件冲突
- **用户体验流畅**：弹窗打开后输入框自动聚焦，无需额外点击操作
- **代码简洁**：核心逻辑仅需一行 `spread.focus(false)` 即可解决焦点问题
- **通用性强**：该方案适用于所有需要在 SpreadJS 中集成外部表单或输入组件的场景

### 5.2 局限性与扩展建议

- **延迟时间固定**：当前使用 500ms 延迟，在低性能设备上可能需要调整
- **扩展建议**：可以根据实际需求动态调整延迟时间，或使用 `requestAnimationFrame` 优化时序控制

## 六、关键代码片段

### 焦点释放与弹窗触发

```javascript
spread.bind(GC.Spread.Sheets.Events.CellClick, function (e, info) {
    if (info.row == 1 && info.col == 1) {
        spread.focus(false);  // 释放 SpreadJS 焦点
        setTimeout(() => openModal(), 500);  // 延迟打开弹窗
    }
});
```

### 弹窗自动聚焦

```javascript
function openModal() {
    modalMask.classList.add('active');
    modalContainer.classList.add('active');
    nameIpt.focus();  // 自动聚焦到第一个输入框
}
```

## 七、总结

本示例展示了如何在 SpreadJS 应用中正确处理焦点管理问题，核心价值在于：

- 掌握 `spread.focus(false)` 方法的使用场景和时机
- 理解 SpreadJS 与外部 DOM 元素的焦点交互机制
- 学习如何通过延迟执行优化焦点切换的时序控制

该方案适用于所有需要在 SpreadJS 中集成自定义表单、对话框或输入组件的场景，是构建复杂表格应用时必须掌握的技术要点。开发者可以在此基础上扩展更多交互功能，如多步骤表单、动态验证等。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/q6V-VD7Yp0SsNh7V9ZRSDw/)）
