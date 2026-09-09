## 一、Demo 概述

本示例展示了如何在 SpreadJS 表格中实现数据绑定场景下的动态列管理功能。通过用户交互，可以在运行时动态选择并添加新的数据列到已绑定的表格中，实现灵活的数据展示需求。该功能特别适用于需要根据用户权限、业务场景或个性化需求动态调整表格列显示的应用场景。

## 二、解决的问题

- **动态列配置需求**：在实际业务中，不同用户或场景可能需要查看不同的数据字段，硬编码所有列会导致界面冗余，动态添加列可以按需展示数据
- **数据绑定与列管理的协同**：在使用数据绑定时，如何在不破坏现有绑定关系的前提下动态插入新列并正确绑定数据源
- **表格交互增强**：通过单元格内嵌的下拉选择和按钮控件，提供直观的列管理交互方式

## 三、实现思路

### 3.1 核心技术点

#### 表格数据绑定初始化

使用 SpreadJS 的 Table 和 CellBindingSource 实现数据与表格的双向绑定：

```javascript
let table = sheet.tables.add("tableRecordds", 1, 1, 2, 3, GC.Spread.Sheets.Tables.TableThemes.light6);
table.autoGenerateColumns(false);  // 禁用自动生成列
table.allowAutoExpand(false);      // 禁用自动扩展
table.bindingPath("records");      // 绑定数据路径
table.expandBoundRows(true);       // 自动扩展行

// 手动定义初始列
let tableColumn1 = new GC.Spread.Sheets.Tables.TableColumn();
tableColumn1.name("Line");
tableColumn1.dataField("line");
columnsInfo = [tableColumn1, tableColumn2, tableColumn3];
table.bindColumns(columnsInfo);

// 绑定数据源
let dataSource = new GC.Spread.Sheets.Bindings.CellBindingSource(data);
sheet.setDataSource(dataSource);
```

关键点：设置 `autoGenerateColumns(false)` 后需要手动通过 `bindColumns()` 定义列结构，这为后续动态添加列提供了基础。

#### 动态添加列的实现

通过按钮点击事件监听，实现列的动态插入和数据绑定更新：

```javascript
spread.bind(GC.Spread.Sheets.Events.ButtonClicked, function (s, e) {
    let sheet = e.sheet, row = e.row, col = e.col;
    let cell = sheet.getCell(row, col);
    if (cell.value() === "addColumn") {
        let newColumnValue = sheet.getValue(row, col - 1);  // 获取下拉框选择的字段名
        if (newColumnValue) {
            table.insertColumns(columnsInfo.length - 1, 1, true);  // 在表格末尾插入新列
            let tableColumn = new GC.Spread.Sheets.Tables.TableColumn();
            tableColumn.name(newColumnValue.toUpperCase());
            tableColumn.dataField(newColumnValue);
            columnsInfo.push(tableColumn);  // 更新列配置数组
            table.bindColumns(columnsInfo);  // 重新绑定列
            let dataSource = new GC.Spread.Sheets.Bindings.CellBindingSource(data);
            sheet.setDataSource(dataSource);  // 刷新数据源
        }
    }
});
```

核心流程：插入物理列 → 创建 TableColumn 对象 → 更新列配置数组 → 重新绑定列和数据源。

#### 单元格类型控件的使用

使用 ComboBox 和 Button 单元格类型实现交互界面：

```javascript
// 创建下拉选择框
let combo = new GC.Spread.Sheets.CellTypes.ComboBox();
combo.items(['id', 'line', 'color', 'name', 'price', 'cost', 'weight', 'discontinued', 'rating']);
combo.editable(true);
sheet.setCellType(1, 4, combo);

// 创建按钮
let button = new GC.Spread.Sheets.CellTypes.Button();
button.text("Add");
sheet.getCell(1, 5).cellType(button).value("addColumn");
```

通过 `setCellType()` 将单元格转换为特定控件，实现原生表格无法提供的交互能力。

#### 表格事件监听与数据联动

监听 `ValueChanged` 事件实现列间数据联动：

```javascript
spread.bind(GC.Spread.Sheets.Events.ValueChanged, function (s, e) {
    let sheet = e.sheet, row = e.row, col = e.col;
    let cell = sheet.getCell(row, col), value = cell.value();
    let table = sheet.tables.find(row, col);
    if (table) {
        let range = table.range();
        // 当第一列值为特定值时，自动填充后续列
        if (col === range.col) {
            if (lineList.indexOf(value) >= 0) {
                sheet.setValue(row, col + 1, value + "B");
                sheet.setValue(row, col + 2, value + "C");
            }
        }
    }
});
```

通过 `tables.find()` 判断单元格是否属于表格，实现精准的事件处理。

### 3.2 技术栈

- **@grapecity/spread-sheets**: 15.0.0（核心表格引擎）
- **SystemJS**: 0.19.22（模块加载器）
- **TypeScript**: 4.1.2（开发语言支持）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，表格默认显示 Line、COLOR、Name 三列数据
2. 点击 E2 单元格的下拉框，选择要添加的字段（如 price、cost、rating 等）
3. 点击 F2 单元格的 "Add" 按钮，新列将自动添加到表格末尾并绑定对应数据
4. 点击"获取数据"按钮可在控制台查看当前数据源
5. 点击"获取列信息"按钮可在控制台查看当前列配置

## 五、功能特点

### 5.1 优点

- **灵活的列管理**：支持运行时动态添加列，无需重新加载页面或重新初始化表格
- **数据绑定保持**：新增列后数据绑定关系不会断裂，自动从数据源获取对应字段数据
- **用户友好的交互**：通过下拉框和按钮提供直观的操作界面，降低使用门槛
- **扩展性强**：可以轻松扩展为支持删除列、调整列顺序等更复杂的列管理功能

### 5.2 局限性与扩展建议

- **列重复添加**：当前实现未检查列是否已存在，可能导致重复添加相同字段
- **列删除功能缺失**：只支持添加列，不支持动态删除已添加的列
- **扩展建议**：
  - 添加列存在性校验，防止重复添加
  - 实现列删除功能，提供完整的列管理能力
  - 支持列顺序调整（拖拽排序）
  - 将列配置持久化到本地存储或后端，实现用户个性化配置

## 六、关键代码片段

### 表格初始化与列绑定

```javascript
// 创建表格并禁用自动列生成
let table = sheet.tables.add("tableRecordds", 1, 1, 2, 3, GC.Spread.Sheets.Tables.TableThemes.light6);
table.autoGenerateColumns(false);
table.bindingPath("records");

// 手动定义列结构
let tableColumn1 = new GC.Spread.Sheets.Tables.TableColumn();
tableColumn1.name("Line");
tableColumn1.dataField("line");
columnsInfo = [tableColumn1, tableColumn2, tableColumn3];
table.bindColumns(columnsInfo);
```

### 动态添加列核心逻辑

```javascript
// 插入新列并更新绑定
table.insertColumns(columnsInfo.length - 1, 1, true);
let tableColumn = new GC.Spread.Sheets.Tables.TableColumn();
tableColumn.name(newColumnValue.toUpperCase());
tableColumn.dataField(newColumnValue);
columnsInfo.push(tableColumn);
table.bindColumns(columnsInfo);
sheet.setDataSource(new GC.Spread.Sheets.Bindings.CellBindingSource(data));
```

## 七、总结

本示例展示了 SpreadJS 在数据绑定场景下实现动态列管理的完整方案，开发者可以从中学到：

- 如何在禁用自动列生成的情况下手动管理表格列结构
- 数据绑定与列配置的协同更新机制
- 单元格类型控件（ComboBox、Button）的实际应用
- 表格事件监听与业务逻辑的结合方式
- 动态修改表格结构而不破坏数据绑定的技巧

该方案适用于需要灵活列配置的报表系统、数据分析工具、权限相关的数据展示等场景，具有良好的扩展性和实用价值。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/N5o6IwTvwkCNYi_TrQN7Dw/)）
