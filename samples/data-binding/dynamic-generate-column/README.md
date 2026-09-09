## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现基于数据结构动态生成表格列的功能。当数据源包含不确定数量的子项（如多个公司的评分数据）时，系统能够自动分析数据结构，动态插入相应数量的列，并完成数据绑定和样式复制。这种方案特别适用于需要根据业务数据灵活调整表格结构的场景，例如多维度评价表、动态报表等。

## 二、解决的问题

* **动态列数需求**：业务数据中包含数量不固定的子项（如多个公司的评分），需要根据实际数据动态生成对应的列
* **模板列复制**：新增的列需要保持与模板列相同的样式、格式和结构
* **数据扁平化处理**：将嵌套的数组数据（`gongsi` 数组）转换为扁平化的键值对，以适配 SpreadJS 的数据绑定机制
* **表格区域自动扩展**：动态插入列后，需要同步调整表格（Table）的范围和列配置

## 三、实现思路

### 3.1 核心技术点

#### 标记动态列模板

通过 `tag` 属性标记需要动态复制的列，便于后续识别和处理：

```javascript
// 在模板 JSON 中标记动态列
"columnDataArray": [
  null, null, null,
  { "style": "__builtInStyle11" },
  { "style": "__builtInStyle11" },
  { "style": "__builtInStyle2", "tag": "dynamicColumn" },  // 标记为动态列
  { "style": "__builtInStyle2", "tag": "dynamicColumn" },
  { "style": "__builtInStyle2" }
]
```

#### 分析数据并插入列

根据数据源中的子项数量，计算需要插入的列数，并使用 `addColumns` 方法动态添加：

```javascript
// 获取标记为 dynamicColumn 的列索引
let cols = [];
let startColIndex = 0;
for (let i = 0; i < sheet.getColumnCount(); i++) {
    if (sheet.getTag(-1, i) == "dynamicColumn") {
        if (startColIndex === 0) {
            startColIndex = i;
        }
        cols.push(i);
    }
}

// 根据数据中的公司数量插入列
let gongsi = data.table[0].gongsi;
let addColCount = 0;
for (let i = 0; i < gongsi.length - 1; i++) {
    sheet.addColumns(range.col + range.colCount, cols.length);
    addColCount += cols.length;
}
```

#### 复制模板列样式

使用 `clipboardPaste` 命令将模板列的样式和格式批量复制到新插入的列：

```javascript
spread.commandManager().execute({
    cmd: "clipboardPaste",
    sheetName: sheet.name(),
    fromSheet: sheet,
    fromRanges: [new GC.Spread.Sheets.Range(1, 5, 2, 2)],  // 模板列区域
    pastedRanges: [new GC.Spread.Sheets.Range(1, 5 + 2, 2, addColCount)],  // 目标区域
    isCutting: false,
    pasteOption: GC.Spread.Sheets.ClipboardPasteOptions.all
});
```

#### 数据扁平化处理

将嵌套的数组数据转换为扁平化的键值对结构，以适配 SpreadJS 的 `CellBindingSource`：

```javascript
// 将嵌套的 gongsi 数组转换为扁平化字段
data.table.forEach(function (item) {
    for (let i = 0; i < item.gongsi.length; i++) {
        item["gongsi_" + item.gongsi[i].name + "_pingjia"] = item.gongsi[i].pingjia;
        item["gongsi_" + item.gongsi[i].name + "_quanzhong"] = item.gongsi[i].quanzhong;
    }
});
```

#### 配置表格列绑定

为新增的列设置 `dataField`，建立与数据源的映射关系：

```javascript
for (let i = range.col, j = 0; i < range.col + range.colCount; i++) {
    if (table.getColumnDataField(i).length == 0) {
        j = j == 0 ? i : j;
        table.setColumnDataField(i, columns[i - j - range.col]);
    }
}
```

#### 性能优化

使用挂起/恢复机制避免频繁重绘和计算：

```javascript
spread.suspendPaint();           // 挂起绘制
spread.suspendCalcService(false); // 挂起公式计算
sheet.suspendDirty();            // 挂起脏数据标记

// ... 执行批量操作 ...

sheet.resumeDirty();
spread.resumePaint();
spread.resumeCalcService(true);
```

### 3.2 技术栈

* **SpreadJS**: 15.0.0 — 核心表格组件
* **jQuery**: 3.1.1 — 事件处理
* **SystemJS**: 0.19.22 — 模块加载
* **TypeScript**: 4.1.2 — 类型支持

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 使用本地服务器打开 index.html（如 Live Server）
```

### 4.2 操作步骤

1. 打开页面后，会看到一个预定义的表格模板，包含基础列（序号、类型、部门、因子系数、权重）和两列动态列模板
2. 点击"绑定"按钮
3. 系统自动分析数据源中的公司数量（本例为 3 个公司）
4. 动态插入 4 列（2 列模板 × 2 次复制）
5. 复制模板列的样式和格式到新列
6. 填充表头（公司名称）
7. 执行数据绑定，将评分数据填充到对应单元格
8. 自动合并"类型"和"部门"列中的重复值

## 五、功能特点

### 5.1 优点

* **灵活性高**：无需预先知道列数，完全根据数据动态生成
* **样式一致性**：通过 `clipboardPaste` 确保新列与模板列样式完全一致
* **性能优化**：使用挂起/恢复机制，批量操作时避免频繁重绘
* **可扩展性强**：通过 `tag` 标记机制，可以灵活定义哪些列需要动态复制

### 5.2 局限性与扩展建议

* **模板列位置固定**：当前实现中模板列的位置（第 5-6 列）是硬编码的，建议改为通过 `tag` 动态识别
* **单一数据源**：假设所有行的子项数量相同（都基于第一行的 `gongsi` 数组），如果不同行的子项数量不一致，需要额外处理
* **扩展方向**：
    * 支持多级嵌套数据的动态列生成
    * 提供配置化的列模板定义方式
    * 增加列删除和重新绑定的功能

## 六、关键代码片段

### 动态列标记与识别

```javascript
// 遍历列，识别标记为 dynamicColumn 的列
let cols = [];
let startColIndex = 0;
for (let i = 0; i < sheet.getColumnCount(); i++) {
    if (sheet.getTag(-1, i) == "dynamicColumn") {
        if (startColIndex === 0) {
            startColIndex = i;
        }
        cols.push(i);
    }
}
```

### 表格区域扩展

```javascript
// 扩展表格区域以包含新增的列
range.colCount += addColCount;
sheet.tables.resize(table, range);
```

### 数据扁平化与列绑定

```javascript
// 将嵌套数组转换为扁平化字段
data.table.forEach(function (item) {
    for (let i = 0; i < item.gongsi.length; i++) {
        item["gongsi_" + item.gongsi[i].name + "_pingjia"] = item.gongsi[i].pingjia;
        item["gongsi_" + item.gongsi[i].name + "_quanzhong"] = item.gongsi[i].quanzhong;
    }
});

// 为新增列设置 dataField
for (let i = range.col, j = 0; i < range.col + range.colCount; i++) {
    if (table.getColumnDataField(i).length == 0) {
        j = j == 0 ? i : j;
        table.setColumnDataField(i, columns[i - j - range.col]);
    }
}
```

## 七、总结

本示例展示了 SpreadJS 在处理动态表格结构时的强大能力。通过标记机制、列插入、样式复制和数据扁平化等技术，实现了根据数据自动生成列的功能。开发者可以从中学习到：

* 使用 `tag` 属性标记和识别特定列
* 通过 `addColumns` 和 `tables.resize` 动态调整表格结构
* 使用 `clipboardPaste` 命令批量复制样式
* 数据扁平化处理以适配 SpreadJS 的绑定机制
* 性能优化技巧（挂起/恢复机制）

该方案适用于需要根据业务数据动态调整表格结构的场景，如多维度评价表、动态报表、可配置的数据展示等。通过合理的扩展，可以支持更复杂的动态列生成需求。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/bbCtQ1yQkkKzygOAXlTPeg/)）



<br>
