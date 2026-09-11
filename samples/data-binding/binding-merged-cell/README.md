## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现包含合并单元格的数据绑定功能。通过创建一个特殊的表格结构，将每两列合并为一列，同时保持数据源的正常绑定，实现了一种独特的表格展示方式。该方案适用于需要在表格中展示宽列数据，同时又需要保持数据绑定能力的场景。

## 二、解决的问题

* **合并单元格与数据绑定的兼容性**：在传统的表格数据绑定中，合并单元格往往会破坏数据绑定的结构，本示例通过特殊的列配置方式解决了这一问题
* **动态表格尺寸调整**：根据数据源的实际数据量动态调整表格大小，确保表格区域与数据完全匹配 
* **自定义表格布局**：通过程序化的方式创建非标准的表格布局，满足特殊的业务展示需求

## 三、实现思路

### 3.1 核心技术点

#### 双倍列数表格创建

核心思路是创建一个列数为实际需要列数两倍的表格，然后通过合并相邻列的方式实现最终效果。例如，需要 4 列数据，则创建 8 列表格：

```javascript
// 生成一个名称为"tableRecords" 一行8列的Table。注意：表头数据只有4列，生成的表格有8列
var table = sheet.tables.add('tableRecords', 0, 0, 1, 8);
table.autoGenerateColumns(false);
```

#### 表头列配置策略

通过循环构建表头列对象，偶数索引列绑定实际数据字段，奇数索引列作为空列用于后续合并：

```javascript
var tableColumns = [], 
    names = ['orderDate', 'item', 'units', 'cost'],
    labels = ['Order Date', 'Item', 'Units', 'Cost'];

for(var i=0; i<colCount; i++){
   if(i%2 == 0){
       // 偶数列：绑定实际数据字段
       var tableColumn = new GC.Spread.Sheets.Tables.TableColumn();
       tableColumn.name(labels[i/2]);
       tableColumn.dataField(names[i/2]);
       tableColumns.push(tableColumn);
   }else{
       // 奇数列：空列，用于合并
       var tableColumn = new GC.Spread.Sheets.Tables.TableColumn();
       tableColumns.push(tableColumn);
   }
}
table.bindColumns(tableColumns);
```

#### 数据源绑定与表格动态调整

使用 CellBindingSource 绑定数据对象，并根据数据源长度动态调整表格尺寸：

```javascript
table.bindingPath('sales');
var source = new GC.Spread.Sheets.Bindings.CellBindingSource(data);
sheet.setDataSource(source);

var datasourcelength = data.sales.length;
// 根据数据源的数据量重新调整表格大小
sheet.tables.resize(table, new GC.Spread.Sheets.Range(row, col, datasourcelength+1, colCount));
```

#### 单元格合并与样式设置

遍历表格所有行，将每两列合并为一列，并设置居中对齐：

```javascript
for(var i=0; i<datasourcelength+1; i++){
    for(var j=0; j<colCount; j++){
        if(j%2==0){
            // 合并相邻的两列
            sheet.addSpan(i, j, 1, 2);
            var cell = sheet.getCell(i, j);
            cell.hAlign(GC.Spread.Sheets.HorizontalAlign.center);
            cell.vAlign(GC.Spread.Sheets.VerticalAlign.center);
        }
    }
}
```

### 3.2 技术栈

* SpreadJS 15.0.0：核心表格控件
* SystemJS 0.19.22：模块加载器
* TypeScript 4.1.2：开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 在浏览器中打开 `index.html` 文件
2. 页面加载后会自动显示一个包含合并单元格的表格
3. 表格展示了销售数据，包括订单日期、商品名称、数量和成本
4. 每列都是由两个物理列合并而成，数据居中显示

## 五、功能特点

### 5.1 优点

* **数据绑定完整性**：在合并单元格的情况下仍然保持完整的数据绑定能力
* **动态适应性**：表格大小根据数据源自动调整，无需手动计算
* **布局灵活性**：通过程序化方式实现特殊的表格布局需求
* **代码清晰**：实现逻辑简单明了，易于理解和维护

### 5.2 局限性与扩展建议

* **列数限制**：当前实现要求列数必须是偶数，如需支持奇数列需要额外处理
* **性能考虑**：大量数据时，逐个单元格合并可能影响性能，可考虑批量操作优化
* **扩展方向**：可以扩展为支持任意合并比例（如 3:1、4:1），或支持行合并

## 六、关键代码片段

### 数据源结构

```javascript
var data = {
    name: 'Jones',  
    region: 'East',
    sales: [
        { orderDate: '1/6/2013', item: 'Pencil', units: 95, cost: 1.99 },
        { orderDate: '4/1/2013', item: 'Binder', units: 60, cost: 4.99 },
        { orderDate: '6/8/2013', item: 'Pen Set', units: 16, cost: 15.99 }
    ]
};
```

数据源采用嵌套结构，通过 `bindingPath('sales')` 将表格绑定到 `sales` 数组。

## 七、总结

本示例展示了 SpreadJS 中一种巧妙的技术方案：通过创建双倍列数的表格并合并相邻列，实现了合并单元格与数据绑定的完美结合。开发者可以从中学到：

* 如何在数据绑定场景下实现合并单元格
* 表格列配置的灵活使用方式
* 动态调整表格尺寸的方法
* CellBindingSource 的使用技巧

该方案适用于需要展示宽列数据、报表类应用或需要特殊表格布局的业务场景，具有良好的扩展性和实用价值。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
