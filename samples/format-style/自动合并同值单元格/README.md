## 一、Demo 概述

本示例展示了如何在 SpreadJS 表格中实现数据绑定时自动合并相同值的单元格功能。当表格绑定数据源后，对于某些列中连续出现的相同值，系统会自动将这些单元格合并显示，形成清晰的分组效果。这种功能常用于巡视表、报告表等需要按类别分组展示数据的场景。

## 二、解决的问题

在实际业务中，表格数据经常需要按照某些字段进行分组展示。例如巡视报告中，多个检查项可能属于同一个大类（如"路径"、"杆塔拉线"），如果每行都重复显示分类名称，会显得冗余且不够直观。自动合并同值单元格可以：

- 减少视觉冗余，让表格更简洁易读
- 清晰展示数据的层级和分组关系
- 提升用户体验，快速识别数据归属

## 三、实现思路

### 3.1 核心技术点

#### 数据绑定与表格初始化

示例使用 SpreadJS 的数据绑定机制，通过 `CellBindingSource` 将 JSON 数据绑定到工作表。首先加载预定义的表格模板（包含表格结构和列定义），然后绑定数据源：

```javascript
// 加载表格模板
spread.fromJSON(reports)

// 创建数据绑定源
let source = new GC.Spread.Sheets.Bindings.CellBindingSource(data)
let sheet = spread.getActiveSheet()
sheet.setDataSource(source)
```

#### 自动合并单元格

核心功能通过 `autoMerge()` 方法实现。该方法接收一个范围对象和合并方向参数，自动检测范围内相同值的单元格并进行合并：

```javascript
// 获取表格的数据区域
let table = sheet.tables.findByName('details')
let tableRange = table.dataRange()

// 定义需要合并的范围（前两列）
let range = new GC.Spread.Sheets.Range(
    tableRange.row, 
    tableRange.col, 
    tableRange.rowCount, 
    2  // 只对前两列进行合并
)

// 执行自动合并（行列方向）
sheet.autoMerge(range, GC.Spread.Sheets.AutoMerge.AutoMergeDirection.rowColumn)
```

### 3.2 技术栈

- SpreadJS 15.0.0 — 核心表格组件
- SystemJS 0.19.22 — 模块加载器
- TypeScript 4.1.2 — 类型支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，表格会自动加载并显示巡视表数据
2. 观察"序号"和"项目"列，相同值的单元格已自动合并
3. 可以修改被合并单元格的值，测试合并效果的动态变化

## 五、功能特点

### 5.1 优点

- 实现简单，只需一行 `autoMerge()` 调用即可完成
- 支持灵活的范围控制，可指定需要合并的列
- 自动检测相同值，无需手动判断和处理
- 支持数据变化后的动态更新

### 5.2 局限性与扩展建议

当前实现仅对前两列进行合并。如果需要对更多列或不连续的列进行合并，可以：

- 调整 `Range` 参数中的列数和起始列
- 多次调用 `autoMerge()` 方法处理不同的列范围
- 根据业务需求选择合并方向（仅行方向或仅列方向）

## 六、总结

本示例展示了 SpreadJS 中自动合并同值单元格的实现方法，适用于需要分组展示数据的报表场景。开发者可以学到：

- 如何使用 `CellBindingSource` 进行数据绑定
- 如何通过 `autoMerge()` 方法实现单元格自动合并
- 如何控制合并范围和方向

该方案特别适合巡视表、检查表、分类统计表等需要清晰展示数据层级关系的应用场景，可以显著提升表格的可读性和专业性。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/6w0z0W6txUaLvKbaDRihgQ/)）
