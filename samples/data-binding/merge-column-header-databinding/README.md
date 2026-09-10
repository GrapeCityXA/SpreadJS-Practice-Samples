## 一、Demo 概述

本示例演示了如何在 SpreadJS 中实现包含合并单元格的列头数据绑定功能。通过设置多行列头并使用 `addSpan` 方法合并列头单元格，结合 `bindColumn` 方法实现数据源与列的绑定，展示了复杂列头结构下的数据绑定能力。

该示例适用于需要展示层级化列头结构的业务场景，例如人员信息表、财务报表等需要对列进行分组或分类展示的应用。 

## 二、解决的问题

在实际业务中，表格的列头往往不是简单的单行结构，而是需要通过合并单元格来表达列的分组关系或层级结构。本示例解决了以下问题：

* 如何在 SpreadJS 中创建多行列头结构
* 如何在列头区域合并单元格以实现复杂的列头布局
* 如何在合并列头的情况下正确绑定数据源到各个列
* 如何在合并列头中设置不同行的列头文本

## 三、实现思路

### 3.1 设置多行列头

通过 `setRowCount` 方法设置列头区域的行数，为合并列头创建基础结构：

```javascript
sheet.setRowCount(3, GC.Spread.Sheets.SheetArea.colHeader);
```

此代码将列头区域设置为 3 行，为后续的列头合并和数据绑定提供空间。

### 3.2 合并列头单元格

使用 `addSpan` 方法在列头区域创建合并单元格：

```javascript
sheet.addSpan(0, 0, 3, 1, GC.Spread.Sheets.SheetArea.colHeader);
sheet.addSpan(0, 1, 3, 1, GC.Spread.Sheets.SheetArea.colHeader);
```

`addSpan` 方法的参数分别为：起始行、起始列、行数、列数、区域类型。这里将第 0 列和第 1 列从第 0 行开始纵向合并 3 行。

### 3.3 配置数据绑定

定义数据源和列绑定配置，通过 `bindColumn` 方法将数据字段与列关联：

```javascript
var datasource = [{
    name: 'Alice',
    age: 27,
    birthday: '1985/08/31',
    position: 'PM'
}];

var nameColInfo = {
    name: 'name',
    displayName: 'Display Name',
    size: 70
};

sheet.autoGenerateColumns = false;
sheet.setDataSource(datasource);
sheet.bindColumn(0, nameColInfo);
sheet.bindColumn(1, birthdayColInfo);
sheet.bindColumn(2, ageColInfo);
sheet.bindColumn(3, positionColInfo);
```

关键点：

* `autoGenerateColumns = false` 禁用自动生成列，手动控制列的绑定
* `bindColumn` 方法将数据源字段与指定列索引绑定
* 列配置对象可以包含 `name`（字段名）、`displayName`（显示名称）、`size`（列宽）、`formatter`（格式化）等属性

### 3.4 设置列头文本

在合并后的列头单元格中设置显示文本：

```javascript
sheet.setValue(0, 0, "name", GC.Spread.Sheets.SheetArea.colHeader);
sheet.setValue(0, 1, "birthday", GC.Spread.Sheets.SheetArea.colHeader);
sheet.setValue(2, 2, "age", GC.Spread.Sheets.SheetArea.colHeader);
sheet.setValue(2, 3, "position", GC.Spread.Sheets.SheetArea.colHeader);
```

通过 `setValue` 方法在列头区域的指定位置设置文本，第三个参数指定为 `SheetArea.colHeader` 表示操作列头区域。

### 3.5 技术栈

* @grapecity/spread-sheets: 15.0.0（核心表格组件）
* SystemJS: 0.19.22（模块加载器）
* TypeScript: 4.1.2（开发语言支持）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开 `index.html` 文件，页面会自动加载并初始化 SpreadJS 工作簿
2. 观察列头区域的合并单元格结构，第 0 列和第 1 列为纵向合并的 3 行列头
3. 查看数据行中绑定的数据内容，验证数据绑定是否正确
4. 可以尝试修改数据源内容，观察数据绑定的动态更新效果

## 五、功能特点

### 5.1 优点

* 支持灵活的列头合并配置，可以创建复杂的多行列头结构
* 数据绑定与列头合并相互独立，互不影响
* 通过列配置对象可以精确控制每列的显示属性（宽度、格式化、是否可调整大小等）
* 代码结构清晰，易于理解和扩展

### 5.2 扩展建议

* 可以扩展为支持横向合并列头的场景，实现更复杂的列头分组
* 可以添加动态数据源更新功能，演示数据变化时的绑定效果
* 可以结合样式设置，为合并的列头添加背景色或边框，增强视觉效果

## 六、关键代码片段

完整的列头合并与数据绑定实现：

```javascript
// 1. 设置列头为 3 行
sheet.setRowCount(3, GC.Spread.Sheets.SheetArea.colHeader);

// 2. 合并列头单元格（纵向合并）
sheet.addSpan(0, 0, 3, 1, GC.Spread.Sheets.SheetArea.colHeader);
sheet.addSpan(0, 1, 3, 1, GC.Spread.Sheets.SheetArea.colHeader);

// 3. 禁用自动生成列，手动绑定
sheet.autoGenerateColumns = false;
sheet.setDataSource(datasource);

// 4. 逐列绑定数据
sheet.bindColumn(0, nameColInfo);
sheet.bindColumn(1, birthdayColInfo);
sheet.bindColumn(2, ageColInfo);
sheet.bindColumn(3, positionColInfo);

// 5. 设置列头文本
sheet.setValue(0, 0, "name", GC.Spread.Sheets.SheetArea.colHeader);
sheet.setValue(0, 1, "birthday", GC.Spread.Sheets.SheetArea.colHeader);
sheet.setValue(2, 2, "age", GC.Spread.Sheets.SheetArea.colHeader);
sheet.setValue(2, 3, "position", GC.Spread.Sheets.SheetArea.colHeader);
```

## 七、总结

本示例展示了 SpreadJS 在处理复杂列头结构时的灵活性和强大能力。开发者可以从中学到：

* 如何使用 `setRowCount` 和 `addSpan` 创建多行合并列头
* 如何通过 `autoGenerateColumns` 和 `bindColumn` 实现精确的数据绑定控制
* 如何在列头区域使用 `setValue` 设置自定义文本
* 列配置对象的使用方式，包括字段映射、格式化、列宽等属性设置

该方案适用于需要展示层级化或分组化列头的业务场景，具有良好的扩展性，可以根据实际需求调整合并范围和绑定逻辑。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
