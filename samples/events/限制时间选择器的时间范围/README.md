## 一、Demo 概述

本示例演示了如何在 SpreadJS 中为单元格配置时间选择器（DateTimePicker），并通过事件监听机制实现时间范围的限制功能。具体实现了当用户选择的时间早于当前时间时，自动恢复为原值并提示错误信息，确保用户只能选择未来的时间。

该示例适用于需要对用户输入的时间进行业务规则校验的场景，例如预约系统、任务计划、会议安排等需要限制时间选择范围的应用。

## 二、解决的问题

- **时间有效性校验**：防止用户选择过去的时间，确保业务逻辑的合理性
- **用户体验优化**：通过即时反馈和自动恢复机制，避免无效数据提交
- **数据完整性保障**：在前端层面拦截不符合规则的时间输入，减少后端校验压力

## 三、实现思路

### 3.1 配置时间选择器样式

通过 `GC.Spread.Sheets.Style` 对象为单元格添加时间选择器按钮和下拉配置：

```javascript
let style = new GC.Spread.Sheets.Style()
style.cellButtons = [{
    command: "openDateTimePicker",
    imageType: GC.Spread.Sheets.ButtonImageType.dropdown,
    position: GC.Spread.Sheets.ButtonPosition.right
}]
style.dropDowns = [{
    type: GC.Spread.Sheets.DropDownType.dateTimePicker,
    option: {
        startDay: 7,
        showBuiltInDateRange: false,
        showDateRange: false,
        showTime: true,
        calendarPage: 3
    }
}]
sheet.setStyle(1, 1, style)
```

关键配置说明：
- `cellButtons`：在单元格右侧添加下拉按钮，触发时间选择器
- `dropDowns.type`：指定为 `dateTimePicker` 类型
- `option.showTime`：启用时间选择功能
- `option.calendarPage`：设置日历显示 3 个月

### 3.2 监听单元格变化事件

通过 `CellChanged` 事件捕获用户的时间选择操作，并进行校验：

```javascript
spread.bind(GC.Spread.Sheets.Events.CellChanged, function (e, info) {
    if (!info.isUndo) {
        let row = info.row;
        let col = info.col;
        if (
            info.sheet.getStyle(row, col).cellButtons[0].command === "openDateTimePicker"
        ) {
            let newDate = info.newValue;
            if (newDate < Date.now()) {
                let cell = info.sheet.getCell(row, col);

                info.sheet.suspendEvent();
                cell.value(info.oldValue);
                info.sheet.resumeEvent();

                alert("非法修改，日期不得早于当前时间！");
            }
        }
    }
})
```

核心逻辑：
1. 检查是否为撤销操作（`!info.isUndo`），避免重复触发
2. 验证当前单元格是否配置了时间选择器
3. 比较新值（`newDate`）与当前时间（`Date.now()`）
4. 如果时间早于当前时间，则：
   - 暂停事件触发（`suspendEvent`）
   - 恢复为旧值（`cell.value(info.oldValue)`）
   - 恢复事件触发（`resumeEvent`）
   - 弹出警告提示

### 3.3 技术栈

- **SpreadJS 核心库**：v17.0.8
- **SpreadJS Designer**：v17.0.8（提供可视化设计器界面）
- **SystemJS**：v0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，在 B2 单元格点击右侧的下拉按钮
2. 在弹出的时间选择器中选择一个早于当前时间的日期时间
3. 确认选择后，系统会弹出警告："非法修改，日期不得早于当前时间！"
4. 单元格的值会自动恢复为修改前的值
5. 尝试选择未来的时间，可以正常保存

## 五、功能特点

### 5.1 优点

- **实时校验**：在用户操作时立即进行校验，无需等待表单提交
- **自动恢复**：无效输入会自动恢复为原值，避免数据污染
- **用户友好**：通过 `suspendEvent` 和 `resumeEvent` 机制避免事件循环触发
- **灵活扩展**：校验逻辑可轻松修改为其他时间范围限制（如未来 7 天内、工作日等）

### 5.2 局限性与扩展建议

- **提示方式**：当前使用 `alert` 弹窗，可优化为更友好的 Toast 提示或单元格批注
- **校验规则**：可扩展为支持自定义时间范围（如最早时间、最晚时间）
- **多单元格支持**：当前仅针对 B2 单元格，可扩展为批量配置多个单元格

## 六、关键代码片段

### 事件暂停与恢复机制

```javascript
info.sheet.suspendEvent();  // 暂停事件触发
cell.value(info.oldValue);  // 修改单元格值
info.sheet.resumeEvent();   // 恢复事件触发
```

这段代码是实现自动恢复的关键，通过暂停事件可以避免在修改单元格值时再次触发 `CellChanged` 事件，防止无限循环。

## 七、总结

本示例展示了 SpreadJS 中时间选择器的配置方法和事件驱动的数据校验机制。开发者可以从中学到：

- 如何为单元格配置时间选择器（DateTimePicker）
- 如何使用 `CellChanged` 事件监听用户输入
- 如何通过 `suspendEvent` 和 `resumeEvent` 避免事件循环
- 如何实现自定义的数据校验逻辑

该方案适用于需要对用户输入进行实时校验的场景，通过简单的事件监听和条件判断即可实现复杂的业务规则，具有良好的可扩展性和实用性。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/dS3KnlRfFU6e2X8SgC6nXQ/)）
