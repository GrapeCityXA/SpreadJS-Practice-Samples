## 一、Demo 概述

本示例演示了如何在 SpreadJS 中实现动态表头添加和数据绑定功能。通过两个按钮操作，用户可以在已有的工资表结构中动态插入新的列（非应税收入相关列），并将数据源绑定到表格中，实现表头与数据的灵活管理。该示例适用于需要根据业务需求动态调整表格结构的场景，如人力资源管理系统中的工资单生成。 

## 二、解决的问题

* **动态表结构调整**：在运行时根据业务需求动态添加列，无需重新设计整个表格结构
* **复杂表头管理**：支持多级表头的创建和单元格合并，适应复杂的数据展示需求
* **数据与表头分离绑定**：通过 Table API 和数据绑定机制，实现数据源与表头结构的独立管理

## 三、实现思路

### 3.1 初始表头结构创建

示例首先创建了一个包含合并单元格的二级表头结构，用于展示员工基本信息和工资构成：

```javascript
// 设置表头居中对齐
sheet.getRange(0, -1, 2, -1).hAlign(GC.Spread.Sheets.HorizontalAlign.center);
sheet.getRange(0, -1, 2, -1).vAlign(GC.Spread.Sheets.VerticalAlign.center);

// 绘制初始表头
sheet.setValue(0, 0, "工号");
sheet.setValue(0, 1, "姓名");
sheet.setValue(0, 2, "部门");
sheet.setValue(0, 3, "工资");
sheet.setValue(1, 3, "基本工资");
sheet.setValue(1, 4, "岗位津贴");
sheet.setValue(1, 5, "金额");

// 合并单元格创建多级表头
sheet.addSpan(0, 0, 2, 1); // 工号列跨2行
sheet.addSpan(0, 1, 2, 1); // 姓名列跨2行
sheet.addSpan(0, 2, 2, 1); // 部门列跨2行
sheet.addSpan(0, 3, 1, 3); // "工资"跨3列
```

### 3.2 动态添加列和表头

通过 `addColumns` 方法在指定位置插入新列，并使用 `addSpan` 创建合并单元格：

```javascript
$("#addColumnHeader").click(function () {
    // 在第3列位置插入4列
    sheet.addColumns(3, 4);
    
    // 设置新增列的表头
    sheet.setValue(0, 3, "非应税收入");
    sheet.setValue(1, 3, "报销");
    sheet.setValue(1, 4, "午餐补贴");
    sheet.setValue(1, 5, "差额补贴");
    sheet.setValue(1, 6, "金额");
    
    // 合并"非应税收入"表头单元格
    sheet.addSpan(0, 3, 1, 4);
});
```

### 3.3 数据绑定与 Table 映射

使用 SpreadJS 的 Table API 和 CellBindingSource 实现数据绑定，关键在于通过 `bindColumns` 方法建立数据字段与表格列的映射关系：

```javascript
$("#binddata").click(function () {
    // 定义数据源
    var data = {
        datasource: [{
            id: '1',
            name: 'Pencil',
            department: 'admin',
            basepay: 2000,
            jobpay: 5000,
            subtotal: 7000,
            reimbursement: 200,
            allowance1: 400,
            allowance2: 400,
            total: 1000
        }]
    };
    
    // 创建表格对象（从第2行开始，10列）
    var table = sheet.tables.add('tableRecords', 2, 0, 2, 10);
    table.autoGenerateColumns(false); // 禁用自动生成列
    
    // 定义列映射顺序（关键：顺序需与表头列对应）
    var names = ['id', 'name', 'department', 'reimbursement', 
                 'allowance1', 'allowance2', 'total', 
                 'basepay', 'jobpay', 'subtotal'];
    
    // 创建 TableColumn 对象并绑定数据字段
    var tableColumns = [];
    names.forEach(function (data, index) {
        var tableColumn = new GC.Spread.Sheets.Tables.TableColumn();
        tableColumn.name(names[index]);
        tableColumn.dataField(data);
        tableColumns.push(tableColumn);
    });
    
    table.bindColumns(tableColumns);
    table.bindingPath('datasource');
    
    // 绑定数据源
    var source = new GC.Spread.Sheets.Bindings.CellBindingSource(data);
    sheet.setDataSource(source);
    
    // 隐藏 Table 自带的表头行
    table.showHeader(false);
    sheet.deleteRows(2, 1);
});
```

### 3.4 技术栈

* SpreadJS 15.0.0：核心表格组件
* jQuery 3.6.1：DOM 操作和事件处理
* SystemJS：模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 使用本地服务器打开 index.html（如 Live Server）
```

### 4.2 操作步骤

1. 打开页面后，可以看到初始的工资表结构（工号、姓名、部门、工资及其子项）
2. 点击"添加动态表头"按钮，在"部门"和"工资"列之间插入"非应税收入"相关列
3. 点击"绑定数据"按钮，将示例数据填充到表格中
4. 观察数据如何按照预定义的列映射顺序正确填充到对应列

## 五、功能特点

### 5.1 优点

* **灵活的表结构调整**：支持运行时动态添加列，无需重新初始化表格
* **复杂表头支持**：通过 `addSpan` 方法轻松实现多级表头和单元格合并
* **数据绑定机制**：通过 TableColumn 映射实现数据字段与表格列的解耦，便于维护

### 5.2 局限性与扩展建议

* **列顺序硬编码**：当前 `names` 数组的顺序需要手动维护，建议封装为配置对象
* **单一数据源**：仅支持单条记录绑定，实际应用中可扩展为多行数据的批量绑定
* **表头位置固定**：动态添加列的位置是硬编码的，可改进为根据表头名称动态查找插入位置

## 六、关键代码片段

### 动态列插入的核心逻辑

```javascript
// 在指定位置插入列并设置表头
sheet.addColumns(3, 4); // 在第3列插入4列
sheet.setValue(0, 3, "非应税收入");
sheet.addSpan(0, 3, 1, 4); // 合并表头单元格
```

### 数据绑定的列映射机制

```javascript
// 关键：names 数组的顺序决定了数据填充到哪一列
var names = ['id', 'name', 'department', 'reimbursement', 
             'allowance1', 'allowance2', 'total', 
             'basepay', 'jobpay', 'subtotal'];

names.forEach(function (data, index) {
    var tableColumn = new GC.Spread.Sheets.Tables.TableColumn();
    tableColumn.name(names[index]);
    tableColumn.dataField(data); // 绑定数据源字段
    tableColumns.push(tableColumn);
});
```

## 七、总结

本示例展示了 SpreadJS 在动态表格场景中的核心能力，开发者可以学到：

1. 使用 `addColumns` 和 `addSpan` 实现动态表结构调整
2. 通过 Table API 的 `bindColumns` 方法建立数据字段与列的映射关系
3. 使用 `CellBindingSource` 实现数据源绑定
4. 多级表头的创建和单元格合并技巧

该方案适用于需要根据用户权限、业务规则动态调整表格列的场景，如报表系统、数据导入工具等。通过合理封装，可以扩展为支持配置化的动态表格生成器。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
