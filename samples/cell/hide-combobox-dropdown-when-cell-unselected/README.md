## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现动态组合框（ComboBox）的显示与隐藏功能。当用户点击包含数据的单元格时，该单元格会动态转换为组合框类型并显示下拉选项；当用户点击其他单元格时，之前的组合框会自动恢复为普通单元格类型，从而隐藏下拉箭头。这种交互方式可以让表格界面更加简洁，只在需要时才显示组合框控件。 

## 二、解决的问题

在实际业务场景中，表格中可能有大量单元格需要提供下拉选择功能，但如果所有单元格都始终显示组合框的下拉箭头，会导致界面显得杂乱。本示例解决了以下问题：

* 如何按需显示组合框，避免界面元素过多
* 如何在单元格中存储下拉选项数据，并在需要时动态创建组合框
* 如何实现单元格类型的动态切换（普通单元格 ↔ 组合框）
* 如何确保同一时间只有一个组合框处于激活状态

## 三、实现思路

### 3.1 使用 tag 属性存储下拉选项数据

通过单元格的 `tag()` 方法存储组合框的选项数据，这样可以在不显示组合框的情况下保留数据信息：

```javascript
sheet.getCell(1, 2, GC.Spread.Sheets.SheetArea.viewport).tag(
    JSON.stringify([
        { text: "Oranges", value: "11k" },
        { text: "Apples", value: "15k" },
        { text: "Grape", value: "100k" },
    ])
);
```

这种方式将下拉选项以 JSON 字符串的形式存储在单元格的 tag 属性中，既不影响单元格的显示，也便于后续读取和解析。

### 3.2 监听单元格点击事件实现动态切换

通过监听 `CellClick` 事件，根据点击的单元格状态动态创建或移除组合框：

```javascript
spread.bind(GC.Spread.Sheets.Events.CellClick, function (e, info) {
    let row = info.sheet.getActiveRowIndex()
    let col = info.sheet.getActiveColumnIndex()

    // 如果之前有激活的组合框，先将其恢复为普通单元格
    if (lastComboCellRow && lastComboCellCol) {
        info.sheet.getCell(lastComboCellRow, lastComboCellCol, GC.Spread.Sheets.SheetArea.viewport).cellType(text);
        lastComboCellRow = undefined;
        lastComboCellCol = undefined;
        return;
    }

    // 检查当前单元格是否有 tag 数据
    if (info.sheet.getCell(row, col).tag()) {
        // 如果已经是组合框类型，不重复创建
        if (info.sheet.getCell(row, col).cellType() instanceof GC.Spread.Sheets.CellTypes.ComboBox) {
            return;
        }

        // 记录当前组合框位置
        lastComboCellRow = row;
        lastComboCellCol = col;

        // 创建并设置组合框
        info.sheet.suspendPaint()
        let newCombo = new GC.Spread.Sheets.CellTypes.ComboBox();
        newCombo.items(JSON.parse(sheet.getCell(row, col).tag()))
        newCombo.editorValueType(GC.Spread.Sheets.CellTypes.EditorValueType.text);
        info.sheet.getCell(lastComboCellRow, lastComboCellCol, GC.Spread.Sheets.SheetArea.viewport).cellType(newCombo);
        info.sheet.resumePaint()
    }
});
```

### 3.3 使用状态变量跟踪当前激活的组合框

通过全局变量 `lastComboCellRow` 和 `lastComboCellCol` 记录当前激活的组合框位置，确保在创建新组合框前先移除旧的组合框：

```javascript
let lastComboCellRow;
let lastComboCellCol;
```

这种状态管理机制保证了同一时间只有一个组合框处于激活状态。

### 3.4 技术栈

* @grapecity/spread-sheets: 17.0.8（SpreadJS 核心库）
* SystemJS: 0.19.22（模块加载器）
* systemjs-plugin-babel: 0.0.25（ES6 转译支持）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，可以看到 C2 单元格（第2行第3列）有黄色背景标识
2. 点击 C2 单元格，该单元格会立即显示组合框下拉箭头
3. 点击下拉箭头可以看到三个选项：Oranges (11k)、Apples (15k)、Grape (100k)
4. 点击其他任意单元格，C2 单元格的组合框下拉箭头会自动隐藏
5. 再次点击 C2 单元格，组合框会重新显示

## 五、功能特点

### 5.1 优点

* 界面简洁：未选中时不显示下拉箭头，减少视觉干扰
* 按需加载：只在用户点击时才创建组合框实例，节省资源
* 数据分离：使用 tag 属性存储数据，与单元格类型解耦
* 交互流畅：使用 `suspendPaint()` 和 `resumePaint()` 优化渲染性能

### 5.2 扩展建议

* 可以扩展为支持多个单元格同时具有此功能，只需为更多单元格设置 tag 数据
* 可以添加双击或其他触发方式来激活组合框
* 可以在组合框选择后自动隐藏下拉箭头，进一步优化交互体验
* 可以结合条件格式，为不同状态的单元格设置不同的视觉提示

## 六、关键代码片段

### 动态创建组合框的核心逻辑

```javascript
// 暂停绘制以提升性能
info.sheet.suspendPaint()

// 创建新的组合框实例
let newCombo = new GC.Spread.Sheets.CellTypes.ComboBox();

// 从 tag 中解析并设置下拉选项
newCombo.items(JSON.parse(sheet.getCell(row, col).tag()))

// 设置编辑器值类型为文本
newCombo.editorValueType(GC.Spread.Sheets.CellTypes.EditorValueType.text);

// 将组合框应用到目标单元格
info.sheet.getCell(lastComboCellRow, lastComboCellCol, GC.Spread.Sheets.SheetArea.viewport).cellType(newCombo);

// 恢复绘制
info.sheet.resumePaint()
```

### 移除组合框的逻辑

```javascript
// 将单元格类型重置为普通数据对象类型
info.sheet.getCell(lastComboCellRow, lastComboCellCol, GC.Spread.Sheets.SheetArea.viewport).cellType(text);

// 清空状态变量
lastComboCellRow = undefined;
lastComboCellCol = undefined;
```

## 七、总结

本示例展示了 SpreadJS 中单元格类型动态切换的实现方法，通过事件监听和状态管理实现了按需显示组合框的功能。开发者可以从中学到：

* 如何使用单元格的 tag 属性存储自定义数据
* 如何动态创建和移除单元格类型（CellType）
* 如何使用 `suspendPaint()` 和 `resumePaint()` 优化渲染性能
* 如何通过状态变量管理单元格的交互状态
* 如何监听和处理 SpreadJS 的单元格点击事件

该方案适用于需要大量下拉选择功能但希望保持界面简洁的场景，具有良好的扩展性，可以根据实际需求调整触发条件和交互方式。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
