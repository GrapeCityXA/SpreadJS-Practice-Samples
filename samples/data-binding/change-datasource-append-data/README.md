## 一、Demo 概述

本示例演示了如何在 SpreadJS 中动态管理表格（Table）的数据源绑定。通过 CellBindingSource 实现数据双向绑定，支持两种核心操作：替换表格的整个数据源和向现有数据源追加新数据。示例中创建了一个带有自动计算公式的表格，用户可以通过按钮交互实时更新表格内容。

该示例适用于需要动态更新表格数据的业务场景，如实时数据监控、数据刷新、增量数据加载等。 

## 二、解决的问题

* **动态数据源切换**：在不重新创建表格的情况下，完整替换表格绑定的数据源
* **增量数据追加**：向已绑定的数据源追加新记录，表格自动扩展行数
* **数据与 UI 同步**：通过数据绑定机制，确保数据变更后表格自动刷新显示
* **公式自动计算**：在数据源变化时，表格中的计算列和汇总公式自动重新计算

## 三、实现思路

### 3.1 使用 CellBindingSource 包装数据源

SpreadJS 的表格绑定需要使用 `CellBindingSource` 对象包装原始数据，以实现数据的双向绑定和自动更新。

```javascript
// 原始数据源对象
var dataSource = {
    bindPath_table2: [{
        c1: 1, c2: 2, c3: 3, c4: 4
    }, {
        c1: Math.floor(Math.random() * 50),
        c2: Math.floor(Math.random() * 50),
        c3: Math.floor(Math.random() * 50),
        c4: Math.floor(Math.random() * 50)
    }]
};

// 使用 CellBindingSource 包装
var dataSource1 = new spreadNS.Bindings.CellBindingSource(dataSource);

// 将包装后的数据源绑定到工作表
sheet.setDataSource(dataSource1);
```

`CellBindingSource` 会监听数据对象的变化，当数据被修改时自动触发表格更新。

### 3.2 配置表格列绑定和公式

创建表格时需要手动配置列绑定关系，并设置计算公式：

```javascript
// 创建表格
var table2 = sheet.tables.add("tableRecords_2", 6, 1, 1, 5, 
    spreadNS.Tables.TableThemes.light6);
table2.showFooter(true);
table2.autoGenerateColumns(false);

// 定义列并绑定数据字段
var c1 = new spreadNS.Tables.TableColumn(1);
c1.name("列1");
c1.dataField("c1");
// ... 其他列配置

// 绑定列到表格
table2.bindColumns([c1, c2, c3, c4, c5]);

// 设置绑定路径（对应数据源中的属性名）
table2.bindingPath("bindPath_table2");

// 设置数据行公式（每行的合计列）
table2.setColumnDataFormula(4, "=[@列1]+[@列2]+[@列3]+[@列4]");

// 设置汇总行公式（页脚的合计）
table2.setColumnFormula(4, "=SUBTOTAL(109,[合计])");
```

关键点：

* `autoGenerateColumns(false)` 禁用自动生成列，改为手动配置
* `bindingPath` 指定数据源中的属性路径
* `setColumnDataFormula` 为数据行设置公式
* `setColumnFormula` 为汇总行（Footer）设置公式

### 3.3 实现数据源替换

通过修改原始数据对象的属性，然后重新调用 `bindingPath` 方法触发更新：

```javascript
$("#bind").click(function () {
    // 直接替换数据源对象的属性
    dataSource.bindPath_table2 = bindPath_table;
    
    // 重新绑定路径，触发表格刷新
    table2.bindingPath("bindPath_table2");
});
```

这种方式会完全替换表格的数据内容，表格行数会根据新数据源的长度自动调整。

### 3.4 实现数据追加

通过向数据源数组添加新元素，然后重新绑定路径：

```javascript
$("#add").click(function () {
    // 向数据源数组追加新记录
    dataSource.bindPath_table2.push({
        c1: Math.floor(Math.random() * 100),
        c2: Math.floor(Math.random() * 10),
        c3: Math.floor(Math.random() * 20),
        c4: Math.floor(Math.random() * 50)
    });
    
    // 重新绑定路径，触发表格刷新
    table2.bindingPath("bindPath_table2");
});
```

追加数据后，表格会自动增加新行，并对新行应用已配置的公式。

### 3.5 技术栈

* **SpreadJS**: 15.0.0（核心表格组件）
* **jQuery**: 3.6.1（事件处理）
* **SystemJS**: 0.19.22（模块加载器）
* **TypeScript**: 4.1.2（开发语言支持）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，会看到一个已绑定数据的表格，包含 4 列数据和 1 列合计列
2. 点击"替换 table 数据源"按钮，表格数据会被完全替换为新的数据集
3. 点击"追加 table 数据源"按钮，表格会在末尾追加一行新的随机数据
4. 观察合计列和汇总行的自动计算结果

## 五、功能特点

### 5.1 优点

* **数据绑定机制**：通过 CellBindingSource 实现数据与 UI 的自动同步，无需手动操作单元格
* **灵活的数据更新**：支持整体替换和增量追加两种更新模式，适应不同业务场景
* **公式自动计算**：数据变化时，表格公式自动重新计算，保证数据一致性
* **代码简洁**：通过绑定路径机制，只需修改数据对象即可更新表格，代码逻辑清晰

### 5.2 局限性与扩展建议

* **性能考虑**：大数据量追加时，频繁调用 `bindingPath` 可能影响性能，建议批量追加后统一刷新
* **数据验证**：当前示例未对追加的数据进行验证，实际应用中应添加数据格式校验
* **扩展方向**：可以结合后端 API，实现从服务器动态加载数据并更新表格

## 六、关键代码片段

### 数据源结构设计

```javascript
var dataSource = {
    // 使用嵌套属性作为绑定路径
    bindPath_table2: [
        { c1: 1, c2: 2, c3: 3, c4: 4 },
        { c1: 10, c2: 20, c3: 30, c4: 40 }
    ]
};
```

数据源采用对象嵌套数组的结构，`bindPath_table2` 作为表格的绑定路径，数组中的每个对象对应表格的一行数据。

### 表格公式配置

```javascript
// 数据行公式：每行的合计列 = 列1 + 列2 + 列3 + 列4
table2.setColumnDataFormula(4, "=[@列1]+[@列2]+[@列3]+[@列4]");

// 汇总行公式：使用 SUBTOTAL 函数计算合计列的总和
table2.setColumnFormula(4, "=SUBTOTAL(109,[合计])");
```

* `[@列名]` 语法引用当前行的指定列
* `SUBTOTAL(109, ...)` 是求和函数，109 表示忽略隐藏行

## 七、总结

本示例展示了 SpreadJS 表格数据绑定的核心用法，开发者可以学到：

1. 如何使用 `CellBindingSource` 实现数据双向绑定
2. 表格列的手动配置和数据字段映射方法
3. 通过修改数据对象和重新绑定路径实现数据更新
4. 表格公式的配置和自动计算机制

该方案适用于需要动态数据管理的场景，如数据监控面板、实时报表、数据录入系统等。通过数据绑定机制，可以大幅简化数据更新逻辑，提高开发效率。在实际应用中，可以结合 RESTful API 或 WebSocket 实现更复杂的数据交互功能。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
