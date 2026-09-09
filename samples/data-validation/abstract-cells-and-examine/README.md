## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现多行数据的选择和提取功能。用户可以通过按住 Ctrl 键选择表格中的多行数据，点击"提取审查"按钮后，系统会将选中的数据提取到另一个工作表中进行审查和汇总。该功能适用于需要从大量数据中筛选特定行进行二次分析的场景，例如酒店家具报价清单的审查、物料清单的部分提取等。

## 二、解决的问题

- **数据筛选与提取**：从包含大量数据的表格中快速提取指定行，避免手动复制粘贴的繁琐操作
- **数据审查与汇总**：将提取的数据在独立工作表中展示，并自动计算汇总信息（如总价）
- **多选操作支持**：支持 Ctrl 键多选，允许用户灵活选择不连续的多行数据

## 三、实现思路

### 3.1 核心技术点

#### 使用 Table 绑定数据源

示例使用 SpreadJS 的 Table 功能结合数据绑定实现动态数据展示。通过 `CellBindingSource` 将数据源绑定到工作表，Table 自动生成列并展示数据。

```javascript
// 创建数据绑定源
let data = { dataSource: dataSource };
let dataSource1 = new spreadNS.Bindings.CellBindingSource(data);
spread.getSheet(0).setDataSource(dataSource1);

// 配置 Table 列
let table = spread.getSheet(0).tables.all()[0];
table.autoGenerateColumns(false);
var tableColumn1 = new spreadNS.Tables.TableColumn();
tableColumn1.dataField("name");
tableColumn1.name("名称");
// ... 其他列配置
table.bindColumns([tableColumn1, tableColumn2, tableColumn3, tableColumn4, tableColumn5, tableColumn6]);
table.bindingPath('dataSource');
```

#### 使用 Tag 标记行索引

为了在选择行时能够快速定位到原始数据源中的对应数据，示例使用 `setTag` 方法为每一行设置标记，存储该行在数据源数组中的索引。

```javascript
let rows = sheet.getRowCount();
for (let i = 0; i + 2 < rows; i++) {
    sheet.setTag(i + 2, -1, `${i}`);
}
```

这里 `i + 2` 是因为表格从第 2 行开始（第 0 行是标题，第 1 行是表头），`-1` 表示整行标记。

#### 获取多选行并提取数据

通过 `getSelections()` 获取用户选择的区域，判断是否为整行选择（`col === -1`），然后从 Tag 中读取行索引，从原始数据源中提取对应数据。

```javascript
document.getElementById("changeDataSource").addEventListener('click', function () {
    selects = [];
    let sheet = spread.getSheet(0);
    var selections = sheet.getSelections();
    
    for (let i = 0; i < selections.length; i++) {
        let row = selections[i].row;
        let col = selections[i].col;
        if (col === -1 && row !== -1) {
            selects.push(parseInt(sheet.getTag(row, col)));
        }
    }
    
    let templateConfigData = [];
    for (let i = 0; i < selects.length; i++) {
        templateConfigData.push(dataSource[selects[i]]);
    }
    // ... 将提取的数据绑定到 Sheet2
});
```

#### 动态绑定提取数据到第二个工作表

将提取的数据绑定到 Sheet2，并配置新的 Table 展示部分字段（数量和单价），同时使用 `SUBTOTAL` 函数自动计算汇总。

```javascript
let data1 = { dataSource1: templateConfigData };
let sheet1 = spread.getSheetFromName("Sheet2");
let table1 = sheet1.tables.all()[0];
table1.autoGenerateColumns(false);
table1.setColumnFormula(0, `SUBTOTAL(109,[数量])`);

var tableColumnNew1 = new spreadNS.Tables.TableColumn();
tableColumnNew1.dataField("quantity");
tableColumnNew1.name("数量");
// ... 配置其他列
table1.bindColumns([tableColumnNew1, tableColumnNew2]);
table1.bindingPath('dataSource1');

let dataSource2 = new spreadNS.Bindings.CellBindingSource(data1);
spread.getSheet(1).setDataSource(dataSource2);
spread.setActiveSheet("Sheet2");
```

### 3.2 技术栈

- **SpreadJS**: 15.0.0
- **SystemJS**: 0.19.22（模块加载器）
- **TypeScript**: 4.1.2

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开示例页面，Sheet1 中展示了酒店家具报价清单
2. 按住 Ctrl 键，点击行号选择多行数据（可以选择不连续的行）
3. 点击右侧的"提取审查"按钮
4. 系统自动切换到 Sheet2，展示提取的数据（仅显示数量和单价列）
5. Sheet2 的表格底部自动显示汇总行，计算单价总和

## 五、功能特点

### 5.1 优点

- **操作简便**：通过 Ctrl + 点击的方式快速选择多行，符合用户习惯
- **数据隔离**：提取的数据在独立工作表中展示，不影响原始数据
- **自动汇总**：使用 SUBTOTAL 函数自动计算选中数据的汇总值
- **灵活配置**：可以自定义提取后展示的列，满足不同审查需求

### 5.2 局限性与扩展建议

- **当前实现仅支持整行选择**，如果需要支持单元格级别的选择，需要调整选择判断逻辑
- **提取后的数据不会实时同步原始数据的变化**，如需同步可以考虑使用公式引用或监听数据变化事件
- **可以扩展为支持多次提取**，将每次提取的结果追加到审查表中，而不是覆盖

## 六、总结

本示例展示了 SpreadJS 中数据绑定、Table 配置、行标记和多选操作的综合应用。开发者可以学习到：

- 如何使用 `CellBindingSource` 实现数据绑定
- 如何配置 Table 的列和绑定路径
- 如何使用 `setTag` 和 `getTag` 标记和读取行信息
- 如何处理多选区域并提取对应数据
- 如何使用 `SUBTOTAL` 函数实现表格汇总

该方案适用于需要从大数据集中提取部分数据进行二次分析的场景，具有良好的扩展性，可以根据实际需求调整提取逻辑和展示字段。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/n_EDUgNOgEmZD7O-LO6cNw/)）
