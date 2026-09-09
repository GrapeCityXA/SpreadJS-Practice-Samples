## 一、Demo 概述

本示例演示了如何在 SpreadJS 中实现粘贴操作时跳过公式的功能。当用户复制包含公式的单元格区域并粘贴到目标位置时，系统会自动保留源区域的公式，避免公式被覆盖或丢失。这个功能在需要保护特定单元格公式不被意外修改的场景中非常实用。

## 二、解决的问题

在日常的电子表格操作中，用户经常需要复制粘贴数据。但在某些场景下，目标区域可能包含重要的公式，直接粘贴会导致这些公式被覆盖。本示例解决了以下问题：

- 防止粘贴操作覆盖目标区域的公式
- 保护工作表中的计算逻辑不被意外破坏
- 在数据导入或批量编辑时保持公式完整性

## 三、实现思路

### 3.1 核心技术点

#### 粘贴前捕获公式信息

通过监听 `ClipboardPasting` 事件，在粘贴操作执行前遍历目标区域，提取所有包含公式的单元格信息并保存：

```javascript
let formulaArray;
spread.bind(GC.Spread.Sheets.Events.ClipboardPasting, (sender, args) => {
    let { cellRange } = args;
    formulaArray = traverseCellRangeIfFormula(
        args.sheet,
        cellRange.row,
        cellRange.col,
        cellRange.rowCount,
        cellRange.colCount
    );
});
```

#### 粘贴后恢复公式

通过监听 `ClipboardPasted` 事件，在粘贴操作完成后，将之前保存的公式重新设置回对应的单元格：

```javascript
spread.bind(GC.Spread.Sheets.Events.ClipboardPasted, (sender, args) => {
    for (const key in formulaArray) {
        args.sheet.setFormula(
            formulaArray[key].row,
            formulaArray[key].col,
            formulaArray[key].formula
        );
    }
});
```

#### 公式遍历与提取

`traverseCellRangeIfFormula` 函数负责遍历指定区域的所有单元格，识别包含公式的单元格并提取其位置和公式内容：

```javascript
function traverseCellRangeIfFormula(sheet, row, col, rowCount, colCount) {
    let result = {};
    for (let i = row; i < row + rowCount; i++) {
        for (let j = col; j < col + colCount; j++) {
            let cell = sheet.getCell(i, j);
            if (cell.formula()) {
                let key = `${i},${j}`;
                result[key] = {
                    row: i,
                    col: j,
                    formula: cell.formula(),
                };
            }
        }
    }
    return result;
}
```

### 3.2 UI 交互流程

用户复制 A1:A3 区域 → 在 C1 处执行粘贴 → 系统触发 ClipboardPasting 事件 → 提取 C1:C3 区域的公式 → 执行粘贴操作 → 触发 ClipboardPasted 事件 → 恢复 C1:C3 区域的公式

### 3.3 技术栈

- SpreadJS v17.0.8（核心表格组件）
- SpreadJS Designer v17.0.8（设计器组件）
- SystemJS v0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 打开 index.html 文件
# 可以使用本地服务器（如 Live Server）或直接在浏览器中打开
```

### 4.2 操作步骤

1. 打开示例页面，可以看到 A1:A3 单元格分别包含数值 1、2、3
2. C2 单元格包含公式 `=55+66`，显示计算结果 121
3. 选中 A1:A3 区域并复制（Ctrl+C）
4. 点击 C1 单元格并粘贴（Ctrl+V）
5. 观察结果：C1 和 C3 显示粘贴的数值，C2 仍然保持公式 `=55+66` 不变

## 五、功能特点

### 5.1 优点

- 自动保护公式不被覆盖，无需手动干预
- 实现简洁，仅通过两个事件监听即可完成
- 适用于任意大小的单元格区域
- 不影响正常的数值和文本粘贴操作

### 5.2 局限性与扩展建议

当前实现仅保护目标区域的公式，如果需要更复杂的粘贴控制（如跳过格式、跳过样式等），可以扩展 `ClipboardPasting` 事件的处理逻辑，通过修改 `args.pasteOption` 来实现更精细的粘贴控制。

## 六、总结

本示例展示了如何利用 SpreadJS 的剪贴板事件机制实现粘贴跳过公式的功能。开发者可以从中学到：

- ClipboardPasting 和 ClipboardPasted 事件的使用时机
- 如何在粘贴前后进行数据拦截和处理
- 单元格公式的提取和恢复方法
- 事件驱动的数据保护策略

该方案适用于需要保护工作表计算逻辑的场景，可以有效防止用户误操作导致的公式丢失问题，具有良好的实用性和扩展性。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/beTJ2Gq0skOk9LvuS7OXkg/)）
