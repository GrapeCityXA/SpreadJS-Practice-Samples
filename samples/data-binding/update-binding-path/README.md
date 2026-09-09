## 一、Demo 概述

本示例演示了如何在 SpreadJS 中动态修改表格的数据绑定字段和数据源。通过两个交互按钮，用户可以实时改变表格列的绑定字段名称，并更新绑定的数据内容，展示了 SpreadJS 表格数据绑定的灵活性和动态性。

该示例适用于需要根据业务逻辑动态调整表格结构和数据展示的场景，例如多语言切换、字段映射变更、数据源切换等。

## 二、解决的问题

- **动态字段映射**：在运行时修改表格列与数据源字段的映射关系，无需重新创建整个表格
- **数据源切换**：支持在不同数据结构之间灵活切换，适应业务数据变化
- **列定义更新**：演示如何正确更新表格列的绑定配置（需要重新创建 TableColumn 对象）

## 三、实现思路

### 3.1 表格初始化与列绑定

创建表格并配置三个列的数据绑定字段：

```javascript
let table = sheet.tables.add("tableRecordds", 2, 1, 4, 3, spreadNS.Tables.TableThemes.light6);
table.autoGenerateColumns(false);

let tableColumn1 = new spreadNS.Tables.TableColumn();
tableColumn1.name("DESCRIPTION");
tableColumn1.dataField("description");

let tableColumn2 = new spreadNS.Tables.TableColumn();
tableColumn2.name("QUANTITY");
tableColumn2.dataField("quantity");

let tableColumn3 = new spreadNS.Tables.TableColumn();
tableColumn3.name("AMOUNT");
tableColumn3.dataField("amount");

table.bindColumns([tableColumn1, tableColumn2, tableColumn3]);
table.bindingPath("records");
```

关键点：
- `autoGenerateColumns(false)` 禁用自动生成列，使用手动配置
- `dataField()` 指定列绑定的数据字段名
- `bindingPath("records")` 指定数据源中的数组路径

### 3.2 动态修改绑定字段

修改第一列的绑定字段时，必须重新创建 TableColumn 对象：

```javascript
document.getElementById('changeField').onclick = function(){
    // 修改列的绑定字段，不能直接更新列所在的dataField,必须要重新new column
    let tableColumn1 = new spreadNS.Tables.TableColumn();
    tableColumn1.name("测试");
    tableColumn1.dataField("test");
    table.bindColumns([tableColumn1, tableColumn2, tableColumn3]);
    sheet.repaint()
}
```

注意：直接修改现有 TableColumn 的 dataField 不会生效，必须创建新的 TableColumn 实例并重新调用 `bindColumns()`。

### 3.3 更新数据源

使用 CellBindingSource 绑定新的数据对象：

```javascript
document.getElementById('bindData').onclick = function(){
    let data = {
        records:[
            {
                test: 1,
                quantity:'good',
                amount: 100
            }
        ]
    }
    let source = new GC.Spread.Sheets.Bindings.CellBindingSource(data)
    sheet.setDataSource(source)
}
```

数据结构需要匹配 `bindingPath` 指定的路径（这里是 `records` 数组）。

### 3.4 技术栈

- SpreadJS 15.0.0
- SystemJS 0.19.22（模块加载）
- TypeScript 4.1.2

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 使用本地服务器打开 index.html（如 Live Server）
```

### 4.2 操作步骤

1. 打开页面后，表格显示三列：DESCRIPTION、QUANTITY、AMOUNT（此时无数据）
2. 点击"改变绑定字段"按钮，第一列标题变为"测试"，绑定字段从 `description` 改为 `test`
3. 点击"修改绑定数据"按钮，表格显示一行数据：`1 | good | 100`

## 五、功能特点

### 5.1 优点

- **灵活的字段映射**：支持运行时动态调整列与数据字段的对应关系
- **简洁的 API**：通过 `bindColumns()` 和 `setDataSource()` 即可完成绑定更新
- **数据驱动**：使用 CellBindingSource 实现数据与视图的自动同步

### 5.2 局限性与扩展建议

- 当前示例仅演示单行数据，实际应用中可扩展为多行数据绑定
- 可以结合表单验证、数据校验等功能增强实用性
- 建议添加错误处理机制，处理数据字段不匹配的情况

## 六、关键代码片段

### 列绑定配置

```javascript
let tableColumn1 = new spreadNS.Tables.TableColumn();
tableColumn1.name("DESCRIPTION");  // 列标题
tableColumn1.dataField("description");  // 绑定字段名
table.bindColumns([tableColumn1, tableColumn2, tableColumn3]);
```

### 数据源绑定

```javascript
let data = {
    records: [
        { test: 1, quantity: 'good', amount: 100 }
    ]
}
let source = new GC.Spread.Sheets.Bindings.CellBindingSource(data)
sheet.setDataSource(source)
```

## 七、总结

本示例展示了 SpreadJS 表格数据绑定的核心机制，开发者可以学到：

1. 如何创建和配置表格列的数据绑定
2. 动态修改列绑定字段的正确方法（重新创建 TableColumn）
3. 使用 CellBindingSource 实现数据源绑定
4. 表格重绘机制（`sheet.repaint()`）

该方案适用于需要动态调整表格结构的业务场景，例如报表系统、数据管理平台等。通过理解列绑定和数据源绑定的分离设计，开发者可以灵活实现复杂的数据展示需求。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/DqE-0t-zB0WLKoG47CHazQ/)）
