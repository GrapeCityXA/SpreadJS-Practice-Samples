## 一、Demo 概述

本示例展示了如何在 SpreadJS 的表格数据绑定场景中，处理包含公式的列。当表格通过 `setDataSource` 绑定数据源后，某些列（如汇总列）需要根据其他列的数据进行计算，这些公式列不属于数据源的一部分，需要在数据动态增加时自动扩展公式。该示例通过监听表格行变化事件，实现了公式列的自动复制和扩展。

## 二、解决的问题

在实际业务中，表格绑定数据源时常遇到以下场景：数据源只包含原始数据字段，而某些列需要通过公式计算得出（如总工时 = 各季度工时之和）。当用户动态添加新行时，这些公式列无法自动填充，需要手动处理。本示例解决了表格数据绑定中公式列的动态扩展问题，确保新增行自动继承公式逻辑。

## 三、实现思路

### 3.1 核心技术点

#### 表格数据绑定

使用 `CellBindingSource` 将 JavaScript 对象数组绑定到表格，通过 `bindingPath` 属性指定数据源路径。表格列通过 `dataField` 属性与数据源字段建立映射关系。

```javascript
let source = new GC.Spread.Sheets.Bindings.CellBindingSource(datas)
sheet.setDataSource(source)
```

数据源结构包含 `details` 数组，每个对象包含 `subject`、`title`、`num`、`site`、`price` 等字段，以及 `item01` 到 `item08` 共 8 个季度工时数据。

#### 公式列动态扩展

第 6 列（索引为 5）是"总工时"列，使用 `SUM(G6:N6)` 公式计算各季度工时总和。该列不在数据源中，需要通过 `copyTo` 方法复制公式到新增行。

```javascript
function copyTableFormula(sheet, table) {
    let range = table.dataRange()
    for (let i = 0; i < range.rowCount - 1; i++) {
        sheet.copyTo(range.row + i, 5, range.row + i + 1, 5, 1, 1, GC.Spread.Sheets.CopyToOptions.formula) 
    }
}
```

`copyTo` 方法的参数说明：
- 前两个参数：源单元格的行列索引
- 第三、四个参数：目标单元格的行列索引
- 第五、六个参数：复制的行数和列数
- 最后一个参数：复制选项（仅复制公式）

#### 监听表格行变化事件

通过 `TableRowsChanged` 事件监听表格数据的增删操作，当检测到行数变化时，自动调用 `copyTableFormula` 函数扩展公式。

```javascript
sheet.bind(GC.Spread.Sheets.Events.TableRowsChanged, function(e, data){
    copyTableFormula(data.sheet, data.table)
})
```

### 3.2 技术栈

- SpreadJS 15.0.0 — 核心电子表格组件
- SystemJS 0.19.22 — 模块加载器
- TypeScript 4.1.2 — 类型支持（项目配置支持，但实际代码使用 JavaScript）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，表格会自动加载预设的 3 行数据
2. 观察第 6 列"总工时"显示的公式计算结果
3. 在表格中添加新行（通过表格操作或数据源变化）
4. 新行的"总工时"列会自动继承公式
5. 点击"打印绑定数据"按钮，在控制台查看当前数据源内容

## 五、功能特点

### 5.1 优点

- 自动化公式扩展：无需手动为每行设置公式，减少重复操作
- 数据源与计算列分离：保持数据源纯净，计算逻辑由表格层处理
- 事件驱动机制：通过监听表格变化实现响应式更新

### 5.2 局限性与扩展建议

当前实现仅处理单个公式列，如果需要多个公式列，需要在 `copyTableFormula` 函数中添加循环处理。建议通过给公式列添加 tag 标记，实现批量识别和复制。

## 六、总结

本示例展示了 SpreadJS 表格绑定中处理公式列的标准方案，适用于需要在数据绑定场景中动态计算汇总值的业务需求。开发者可以学习到：

- `CellBindingSource` 的数据绑定机制
- `copyTo` 方法的公式复制技巧
- `TableRowsChanged` 事件的监听和处理
- 数据源与计算列的分离设计模式

该方案可扩展至更复杂的场景，如多公式列处理、条件公式、跨表引用等。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/6MW2G8oCCku1o6Pznxb-kg/)）
