## 一、Demo 概述

本示例演示了在 SpreadJS 表格中重新绑定数据源时，如何保留用户已设置的筛选和排序状态。在实际应用中，当需要刷新或更新表格数据时，通常希望保持用户之前的筛选和排序设置，避免用户体验中断。该示例通过备份和恢复筛选排序状态的方式，实现了数据源更新后状态的无缝保留。

## 二、解决的问题

在使用 SpreadJS 的数据绑定功能时，直接调用 `setDataSource()` 方法会重置表格的筛选和排序状态，导致用户之前的操作丢失。本示例解决了以下核心问题：

- 数据源更新时筛选条件被清空，用户需要重新设置筛选
- 排序状态在数据刷新后丢失，影响数据查看体验
- 需要手动保存和恢复用户的表格操作状态

## 三、实现思路

### 3.1 备份筛选和排序状态

在重新设置数据源之前，遍历表格的所有列，获取并保存每列的筛选项和排序状态：

```javascript
let table = sheet.tables.all()[0]
let range = table.range()
let rowFilter = table.rowFilter()
let rowFilterBac = {}
let sortStateBac = {}

for (let col = range.col; col < range.col + range.colCount; col++) {
    // 备份筛选项
    let filterItems = rowFilter.getFilterItems(col)
    if (filterItems.length) {
        rowFilterBac[col] = filterItems
    }

    // 备份排序状态
    let sortState = rowFilter.getSortState(col)
    if (sortState) {
        sortStateBac[col] = sortState
    }
}
```

通过 `getFilterItems()` 和 `getSortState()` 方法分别获取每列的筛选条件和排序状态，存储在对象中以列索引为键。

### 3.2 重新绑定数据源

使用 `CellBindingSource` 将新数据绑定到工作表：

```javascript
let data = [
    { name: "Tom", age: 12 }, 
    { name: "Mike", age: 13 }, 
    { name: "Nile", age: 14 }, 
    { name: "Williams", age: 15 }, 
    { name: "Gustavo", age: 16 }, 
    { name: "Billi", age: 17 }, 
    { name: "Tom", age: 18 }
]
sheet.setDataSource(new GC.Spread.Sheets.Bindings.CellBindingSource({ table: data }))
```

### 3.3 恢复筛选和排序状态

数据源更新后，将之前备份的筛选和排序状态重新应用到表格：

```javascript
for (let col = range.col; col < range.col + range.colCount; col++) {
    // 恢复筛选项
    Object.keys(rowFilterBac).forEach(col => {
        rowFilter.addFilterItem(Number(col), rowFilterBac[col])
        rowFilter.filter(Number(col))
    })
    
    // 恢复排序状态
    Object.keys(sortStateBac).forEach(col => {
        rowFilter.sortColumn(Number(col), sortStateBac[col] === 1)
    })
}
```

通过 `addFilterItem()` 和 `sortColumn()` 方法将保存的状态重新应用到对应的列。

### 3.4 技术栈

- @grapecity/spread-sheets: 17.0.8
- SystemJS: 0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，表格会加载初始数据（包含 name 和 age 两列）
2. 对表格进行筛选操作（例如只显示特定姓名）
3. 对表格进行排序操作（例如按年龄降序排列）
4. 点击页面上的"setDataSource"按钮
5. 观察表格数据更新后，之前设置的筛选和排序状态是否被保留

## 五、功能特点

### 5.1 优点

- 提升用户体验：数据刷新时保持用户的操作状态，避免重复设置
- 实现简单：通过备份和恢复机制，无需修改 SpreadJS 核心逻辑
- 适用性广：可应用于任何需要动态更新数据源的场景

### 5.2 局限性与扩展建议

当前实现存在以下局限性：

- 代码中存在循环嵌套问题（外层循环变量 `col` 未被使用，内层使用 `forEach` 遍历备份对象）
- 如果表格结构（列数、列顺序）发生变化，状态恢复可能失效
- 未处理复杂筛选条件（如自定义筛选器）的备份

扩展建议：

- 优化代码结构，移除不必要的外层循环
- 增加列结构验证，确保恢复状态时列索引仍然有效
- 支持更多筛选类型的备份和恢复

## 六、总结

本示例展示了如何在 SpreadJS 中实现数据源更新时保留筛选和排序状态的功能。开发者可以从中学到：

- 如何使用 `getFilterItems()` 和 `getSortState()` 获取表格状态
- 如何使用 `addFilterItem()` 和 `sortColumn()` 恢复表格状态
- 数据绑定与状态管理的协同处理方式

该方案适用于需要频繁刷新数据但希望保持用户操作状态的场景，如实时数据监控、定时数据更新等应用。通过简单的状态备份和恢复机制，可以显著提升用户体验。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/Cnm9844fvUycdUE3DVEHeg/)）
