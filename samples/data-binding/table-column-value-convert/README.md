## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现数据绑定和表格列值的转换与修改功能。通过自定义 CellType 和 TableColumn 配置,实现了将数据源对象绑定到工作表单元格,并在表格列中使用下拉框组件将数值型数据转换为可读的文本显示。示例模拟了一个发票(Invoice)场景,演示了复杂对象的数据绑定、表格数据源切换以及列值的自定义转换。 

## 二、解决的问题

* **数据绑定路径可视化**:在未绑定实际数据时,单元格显示绑定路径(如 `[company.name]`),便于开发调试
* **复杂对象绑定**:支持嵌套对象属性的绑定(如 `customer.company.address`),简化数据展示逻辑
* **表格列值转换**:将数值型字段(0/1)通过下拉框组件转换为用户友好的文本(否/是),提升数据可读性
* **动态数据源切换**:支持运行时切换不同的数据源对象,实现数据的动态更新

## 三、实现思路

### 3.1 自定义 BindingPathCellType

通过继承 `CellTypes.Text` 创建自定义单元格类型,在单元格值为空时自动显示绑定路径:

```javascript
function BindingPathCellType() {
    spreadNS.CellTypes.Text.call(this);
}
BindingPathCellType.prototype = new spreadNS.CellTypes.Text();
BindingPathCellType.prototype.paint = function (ctx, value, x, y, w, h, style, context) {
    if (value === null || value === undefined) {
        var sheet = context.sheet, row = context.row, col = context.col;
        if (sheet && (row === 0 || !!row) && (col === 0 || !!col)) {
            var bindingPath = sheet.getBindingPath(context.row, context.col);
            if (bindingPath) {
                value = "[" + bindingPath + "]";
            }
        }
    }
    spreadNS.CellTypes.Text.prototype.paint.apply(this, arguments);
};
```

### 3.2 数据源对象构建

定义多层嵌套的数据结构,模拟真实业务场景:

```javascript
function Company(name, logo, slogan, address, city, phone, email) {
    this.name = name;
    this.logo = logo;
    this.slogan = slogan;
    this.address = address;
    this.city = city;
    this.phone = phone;
    this.email = email;
}

function Invoice(company, number, date, customer, receiverCustomer, records) {
    this.company = company;
    this.number = number;
    this.date = date;
    this.customer = customer;
    this.receiverCustomer = receiverCustomer;
    this.records = records;
}

var invoice1 = new Invoice(company1, "00001", new Date(2014, 0, 1), customer1, customer1, records1);
var dataSource1 = new spreadNS.Bindings.CellBindingSource(invoice1);
```

### 3.3 表格列值转换

在 TableColumn 中使用 ComboBox 单元格类型,实现数值到文本的映射:

```javascript
var tableColumn2 = new spreadNS.Tables.TableColumn();
tableColumn2.name("QUANTITY");
var combo = new spreadNS.CellTypes.ComboBox();
combo.items([
    { text: "否", value: 0 }, 
    { text: "是", value: 1 }
]).editorValueType(GC.Spread.Sheets.CellTypes.EditorValueType.value);
tableColumn2.cellType(combo);
tableColumn2.dataField("quantity");
```

### 3.4 数据源动态切换

通过按钮事件监听实现数据源的切换:

```javascript
document.getElementById("changeDataSource").addEventListener('click', function () {
    var sheet = spread.getActiveSheet();
    if (sheet.getDataSource() === dataSource1) {
        sheet.setDataSource(dataSource2);
    } else {
        sheet.setDataSource(dataSource1);
    }
});
```

### 3.5 技术栈

* @grapecity/spread-sheets: 17.0.8
* SystemJS: 0.19.22(模块加载器)

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 使用浏览器打开 index.html
```

### 4.2 操作步骤

1. 打开页面后,工作表显示发票模板,单元格中显示绑定路径(如 `[company.name]`)
2. 点击右侧"绑定数据源"按钮,单元格自动填充 invoice1 的数据
3. 再次点击"绑定数据源"按钮,数据源切换为 invoice2
4. 点击"获取数据源"按钮,在控制台查看当前绑定的数据源对象
5. 在表格的 QUANTITY 列中,数值 0 显示为"否",数值 1 显示为"是"

## 五、功能特点

### 5.1 优点

* **开发友好**:自定义 CellType 在调试阶段显示绑定路径,快速定位数据绑定问题
* **灵活的数据转换**:通过 ComboBox 实现数值到文本的映射,无需手动编写转换逻辑
* **支持复杂对象**:bindingPath 支持多层嵌套属性访问(如 `customer.company.address`)
* **动态数据更新**:数据源切换后,所有绑定单元格自动更新,无需手动刷新

### 5.2 局限性与扩展建议

* **单向绑定**:当前实现为单向数据绑定,修改单元格值不会同步到数据源对象
* **扩展建议**:可通过监听 `CellChanged` 事件实现双向绑定,或使用 `TableColumn.value()` 方法自定义 getter/setter 实现更复杂的转换逻辑

## 六、关键代码片段

### 单元格绑定路径设置

```javascript
sheet.getCell(3, 1)
    .bindingPath("company.name")
    .cellType(bindingPathCellType)
    .foreColor("#58B6C0")
    .font("bold 20px Arial");

sheet.getCell(12, 1)
    .bindingPath("customer.company.name")
    .cellType(bindingPathCellType)
    .textIndent(10);
```

### 表格数据绑定与公式

```javascript
var table = sheet.tables.add("tableRecordds", 20, 1, 4, 4, spreadNS.Tables.TableThemes.light6);
table.autoGenerateColumns(false);
table.bindColumns([tableColumn1, tableColumn2, tableColumn3]);
table.bindingPath("records");
table.setColumnDataFormula(3, "=[@QUANTITY]*[@AMOUNT]");
table.setColumnFormula(3, "=SUBTOTAL(109,[TOTAL])");
```

## 七、总结

本示例展示了 SpreadJS 数据绑定机制的核心用法,开发者可以学习到:

* 如何通过继承 CellType 实现自定义渲染逻辑
* 如何使用 `bindingPath` 绑定复杂对象的嵌套属性
* 如何在表格列中使用 ComboBox 实现数值到文本的转换
* 如何通过 `CellBindingSource` 实现数据源的动态切换

该方案适用于需要展示复杂业务对象的报表场景,特别是发票、订单等包含多层级数据结构的应用。通过自定义 CellType 和 TableColumn 配置,可以灵活扩展数据展示和转换逻辑。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
