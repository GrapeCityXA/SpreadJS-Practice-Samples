## 一、Demo 概述

本示例演示了如何在 SpreadJS 中动态计算并填充工作表的空白区域。当工作表的行列数量较少，无法填满整个可视区域时，通过点击"填充"按钮，系统会自动计算需要新增的行数和列数，从而让单元格网格铺满整个视口区域，避免出现空白区域。

这个功能在需要保持表格视觉完整性的场景中非常实用，例如在展示报表、数据看板或需要固定布局的应用中。

## 二、解决的问题

该示例主要解决以下问题：

1. 当工作表行列数较少时，视口底部和右侧会出现空白区域，影响视觉效果
2. 需要根据当前视口大小动态调整工作表的行列数量
3. 自动计算填充空白区域所需的精确行列数，避免手动调整的繁琐

## 三、实现思路

### 3.1 核心技术点

#### 获取视口尺寸

通过 SpreadJS 的 API 获取当前工作表的可视区域尺寸：

```javascript
// 获取viewport行高
let viewportHeight = sheet.getViewportHeight(1);
// 获取viewport列宽
let viewportWidth = sheet.getViewportWidth(1);
```

`getViewportHeight()` 和 `getViewportWidth()` 方法接收一个参数表示视口索引（通常为 1），返回该视口的像素尺寸。

#### 计算当前工作表总尺寸

遍历所有行和列，累加它们的高度和宽度：

```javascript
// 获取当前sheet总行高
let heightSum = 0;
for (let i = 0; i < sheet.getRowCount(); i++) {
    heightSum += sheet.getRowHeight(i);
}

// 获取当前sheet总列宽
let widthSum = 0;
for (let j = 0; j < sheet.getColumnCount(); j++) {
    widthSum += sheet.getColumnWidth(j);
}
```

这里使用 `getRowHeight()` 和 `getColumnWidth()` 方法获取每一行和每一列的尺寸，然后累加得到总尺寸。

#### 计算需要新增的行列数

根据视口尺寸与当前工作表尺寸的差值，计算需要新增的行列数：

```javascript
// 计算填满空白区域所需新增行数
let addedRowCount = Math.ceil((viewportHeight - heightSum) / sheet.getRowHeight(0));
// 计算填满空白区域所需新增列数
let addedColCount = Math.ceil((viewportWidth - widthSum) / sheet.getColumnWidth(0));
```

使用 `Math.ceil()` 向上取整，确保完全填满空白区域。这里假设新增的行列使用第一行/列的尺寸作为标准。

#### 扩展工作表行列数

调用 `setRowCount()` 和 `setColumnCount()` 方法扩展工作表：

```javascript
// 扩展行数
sheet.setRowCount(sheet.getRowCount() + addedRowCount);
// 扩展列数
sheet.setColumnCount(sheet.getColumnCount() + addedColCount);
```

### 3.2 UI 交互流程

用户点击"填充"按钮 → 系统计算视口尺寸和当前工作表尺寸 → 计算需要新增的行列数 → 扩展工作表行列数 → 空白区域被单元格填满

### 3.3 技术栈

- @grapecity/spread-sheets: 17.0.8（SpreadJS 核心库）
- SystemJS: 0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 在浏览器中打开 `index.html` 文件
2. 初始状态下，工作表只有 5 行 5 列，视口底部和右侧会有空白区域
3. 点击页面顶部的"填充"按钮
4. 观察工作表自动扩展，单元格网格填满整个可视区域

## 五、功能特点

### 5.1 优点

1. 自动化计算：无需手动计算需要新增的行列数，系统自动完成
2. 精确填充：使用 `Math.ceil()` 确保完全填满空白区域，不会出现遗漏
3. 代码简洁：核心逻辑不到 30 行代码，易于理解和维护
4. 视觉完整：填充后的工作表视觉效果更加完整，适合展示场景

### 5.2 局限性与扩展建议

当前实现假设所有行高和列宽一致（使用第一行/列的尺寸作为标准），如果工作表中存在不同高度的行或不同宽度的列，计算结果可能不够精确。

扩展建议：
- 可以计算平均行高和列宽，提高计算精度
- 可以监听窗口大小变化事件，自动触发填充逻辑
- 可以添加"取消填充"功能，恢复到原始行列数

## 六、关键代码片段

完整的填充逻辑实现：

```javascript
document.getElementById("fill").addEventListener("click", function () {
    let sheet = spread.getActiveSheet();
    
    // 获取视口尺寸
    let viewportHeight = sheet.getViewportHeight(1);
    let viewportWidth = sheet.getViewportWidth(1);
    
    // 计算当前工作表总尺寸
    let heightSum = 0;
    for (let i = 0; i < sheet.getRowCount(); i++) {
        heightSum += sheet.getRowHeight(i);
    }
    let widthSum = 0;
    for (let j = 0; j < sheet.getColumnCount(); j++) {
        widthSum += sheet.getColumnWidth(j);
    }
    
    // 计算需要新增的行列数
    let addedRowCount = Math.ceil((viewportHeight - heightSum) / sheet.getRowHeight(0));
    let addedColCount = Math.ceil((viewportWidth - widthSum) / sheet.getColumnWidth(0));
    
    // 扩展工作表
    sheet.setRowCount(sheet.getRowCount() + addedRowCount);
    sheet.setColumnCount(sheet.getColumnCount() + addedColCount);
});
```

## 七、总结

本示例展示了如何利用 SpreadJS 的视口和尺寸相关 API 实现动态填充空白区域的功能。开发者可以从中学到：

1. 如何获取工作表的视口尺寸（`getViewportHeight`、`getViewportWidth`）
2. 如何遍历并计算工作表的总行高和总列宽
3. 如何动态调整工作表的行列数量（`setRowCount`、`setColumnCount`）
4. 如何使用数学计算实现精确的布局控制

该方案适用于需要保持表格视觉完整性的场景，例如数据看板、报表展示、固定布局的应用等。代码简洁易懂，可以作为学习 SpreadJS 布局控制的入门示例。


### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/SypM_VR0g0ii6-XV3EyqzA/)）
