## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现文本内容超出单元格宽度时自动换行到下一行显示的功能。当单元格中的文本长度超过列宽时,系统会自动将超出部分移至下一行单元格,实现类似文本编辑器的自动换行效果。这种功能特别适用于固定列宽的表格中需要完整显示长文本的场景。

## 二、解决的问题

- **固定列宽约束**:在某些业务场景中,列宽需要保持固定,但文本内容长度不可控,本示例提供了一种通过垂直扩展来显示完整内容的方案
- **文本溢出处理**:避免了传统的文本截断或溢出隐藏的问题,确保所有文本内容都能被完整展示

## 三、实现思路

### 3.1 核心技术点

#### 逐字符宽度检测

通过遍历文本的每个字符,使用 `CellTypes.Text().getAutoFitWidth()` API 动态计算累积文本的渲染宽度,并与列宽进行实时比较:

```javascript
for (let i = 0; i < characters.length; i++) {
    let str = characters[i];
    let currentStr = strArr + str;
    
    // 设置单元格的值
    sheet.setValue(row, col, currentStr);
    
    // 创建文本单元格类型实例
    var instance = new GC.Spread.Sheets.CellTypes.Text();
    
    // 获取当前字符串的自动适应宽度
    var returnValue = instance.getAutoFitWidth(
        sheet.getValue(row, col),
        sheet.getText(row, col),
        sheet.getActualStyle(row, col),
        sheet.zoom(),
        {
            "sheet": sheet,
            "row": row,
            "col": col,
            "sheetArea": GC.Spread.Sheets.SheetArea.viewport
        }
    );
}
```

`getAutoFitWidth()` 方法能够精确计算文本在当前样式（字体、字号等）和缩放比例下的实际渲染宽度,这是实现精准换行的关键。

#### 动态行切换逻辑

当检测到文本宽度超出列宽时,将上一个符合宽度的文本保存到当前行,然后重置累积字符串并移动到下一行继续处理:

```javascript
if (returnValue > currentColWidth) {
    console.log(`在字符 "${str}" 后超出列宽，当前宽度: ${returnValue}，列宽: ${currentColWidth}`);
    sheet.setValue(row, col, strArr);  // 保存上一个符合宽度的文本
    strArr = "";  // 重置累积字符串
    row++;  // 移动到下一行
    i--;  // 回退循环索引,重新处理当前字符
} else {
    strArr += str;  // 继续累积字符
}
```

这里使用了 `i--` 的技巧,确保触发换行的字符能在下一行重新处理,避免字符丢失。

#### 暂停和恢复绘制优化

使用 `suspendPaint()` 和 `resumePaint()` 包裹处理逻辑,避免逐字符设置单元格时产生的频繁重绘,提升性能:

```javascript
function processCell(row, col) {
    spread.suspendPaint();  // 暂停绘制
    // ... 处理逻辑 ...
    spread.resumePaint();  // 恢复绘制
}
```

### 3.2 技术栈

- `@grapecity/spread-sheets`: 17.0.8 - SpreadJS 核心库

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 使用支持 ES6 模块的本地服务器打开 index.html
```

### 4.2 操作步骤

1. 打开页面后,表格中会在 B2 单元格显示一段长文本（李白《将进酒》诗句）
2. B 列列宽被固定为 100 像素
3. 点击"处理"按钮,触发自动换行逻辑
4. 观察文本如何按列宽自动分割到多行显示

## 五、功能特点

### 5.1 优点

- **精准宽度计算**:基于实际渲染宽度而非字符数量,能够正确处理中英文混排和不同字体大小的场景
- **保留完整内容**:通过垂直扩展确保所有文本都能完整显示,不会发生截断或丢失
- **性能优化**:使用暂停绘制机制减少不必要的重绘操作

### 5.2 局限性与扩展建议

- **覆盖现有数据**:当前实现会直接覆盖下方单元格的内容,实际应用中需要检查目标行是否为空
- **单列处理**:仅处理固定列,可扩展为支持指定列范围的批量处理
- **扩展建议**:
  - 添加空行检查逻辑,避免覆盖已有数据
  - 支持自定义换行策略（如按单词边界换行）
  - 提供撤销功能

## 六、关键代码片段

### 获取列宽

```javascript
let currentColWidth = sheet.getColumnWidth(col);
```

### 字符串拆分

```javascript
let characters = originalStr.split("");  // 拆分为字符数组
```

### 宽度计算配置参数

```javascript
{
    "sheet": sheet,
    "row": row,
    "col": col,
    "sheetArea": GC.Spread.Sheets.SheetArea.viewport
}
```

这些参数为 `getAutoFitWidth()` 提供必要的上下文信息,确保宽度计算的准确性。

## 七、总结

本示例提供了一种实用的长文本处理方案,特别适合以下场景:

- **固定格式报表**:列宽需要符合打印规范,但内容长度不可控
- **数据展示**:需要在有限空间内完整展示描述性文本
- **表单设计**:多行文本输入在单元格中的格式化显示

开发者可以从中学习到:
1. `CellTypes.Text().getAutoFitWidth()` API 的实际应用
2. 逐字符处理文本的循环控制技巧
3. `suspendPaint/resumePaint` 的性能优化方法
4. 动态行列操作的实现方式

该方案具有良好的扩展性,可根据具体业务需求添加边界检查、样式保持、用户交互等功能。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/IUV7kfqR_0eW9EthYXbOOA/)）
