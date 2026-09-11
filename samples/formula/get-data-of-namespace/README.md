## 一、Demo 概述

本示例演示了如何在 SpreadJS 中创建和使用命名空间（Named Range）功能。通过为工作表中的特定区域定义名称，可以方便地引用和操作该区域的数据。示例展示了如何添加自定义命名空间、获取命名空间对象、解析命名区域的位置信息，以及提取命名区域内的数据内容。

该功能在需要频繁引用固定区域数据、构建动态公式或进行数据验证时非常实用，可以提高代码的可读性和可维护性。

## 二、解决的问题

* **区域引用简化**：通过命名空间可以用有意义的名称代替复杂的单元格引用（如 `$C$6:$E$12`），使代码更易理解
* **数据区域管理**：为特定数据区域定义名称后，可以方便地获取该区域的位置、大小和内容信息
* **动态数据提取**：通过命名空间对象可以动态计算区域范围，实现灵活的数据读取操作

## 三、实现思路

### 3.1 初始化工作表并填充数据

首先创建 SpreadJS 工作簿实例，并在工作表中填充示例数据，包括表头和多行记录：

```javascript
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let sheet = spread.getActiveSheet();
sheet.setArray(0, 0, [
    ['ID', 'Phone Number', 'Address'],
    [1, '021-432378', 'Marbury Road'],
    [2, '021-432668', 'Chester Road'],
    [3, '021-432238', 'Gertt Road'],
    [4, '021-432533', 'Jnyliner Road'],
    [5, '021-432125', 'Approach Road'],
    [6, '021-432789', 'Jones Road']
]);
sheet.autoFitColumn(0);
sheet.autoFitColumn(1);
sheet.autoFitColumn(2);
```

### 3.2 为区域添加边框样式

为了在视觉上突出命名区域，使用蓝色虚线边框标记目标区域：

```javascript
let border = new GC.Spread.Sheets.LineBorder("blue", GC.Spread.Sheets.LineStyle.mediumDashed);
let style = new GC.Spread.Sheets.Style();
style.borderBottom = border;
style.borderTop = border;
style.borderLeft = border;
style.borderRight = border;
let range = sheet.getRange(5, 2, 7, 3);
range.setStyle(style);
```

### 3.3 创建命名空间

使用 `addCustomName` 方法在当前工作表上定义命名空间，指定名称、引用区域和描述信息：

```javascript
// 在当前工作表sheet上定义名称为name1的命名空间
sheet.addCustomName("name1", "$C$6:$E$12", sheet.getActiveRowIndex(), sheet.getActiveColumnIndex(), "test1");
```

参数说明：

* 第一个参数：命名空间的名称（`name1`）
* 第二个参数：引用的单元格区域（`$C$6:$E$12`）
* 第三、四个参数：基准行列索引
* 第五个参数：命名空间的注释描述（`test1`）

### 3.4 获取命名空间信息并解析区域范围

通过 `getCustomName` 方法获取命名空间对象，然后从表达式中提取区域的起始位置和大小：

```javascript
// 获取名称为name1的命名空间对象
let nameInfo = sheet.getCustomName("name1");
sheet.setValue(0, 4, "nameInfo:");

// 根据nameinfo计算命名区域，并获取命名区域的内容
let row = nameInfo.getExpression().row;
sheet.setValue(1, 4, "row:" + row);

let col = nameInfo.getExpression().column;
sheet.setValue(2, 4, "col:" + col);

let rowCount = nameInfo.getExpression().endRow - nameInfo.getExpression().row + 1;
sheet.setValue(3, 4, "rowCount:" + rowCount);

let colCount = nameInfo.getExpression().endColumn - nameInfo.getExpression().column + 1;
sheet.setValue(4, 4, "colCount:" + rowCount);
```

### 3.5 提取命名区域的数据内容

使用解析出的位置和大小信息，通过 `getArray` 方法获取命名区域内的所有数据（二维数组格式）：

```javascript
// 获取区域内容（二维数组）
let nameData = sheet.getArray(row, col, rowCount, colCount);
sheet.setValue(14, 2, "nameData:" + JSON.stringify(nameData));
sheet.addSpan(14, 2, 6, 4);
sheet.getCell(14, 2).wordWrap(true);
```

### 3.6 技术栈

* SpreadJS v15.2.5：核心电子表格组件库
* SystemJS v0.19.22：模块加载器
* TypeScript v4.1.2：开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开示例页面后，工作表会自动加载并显示初始数据
2. 观察 C6:E12 区域的蓝色虚线边框，这是被命名为 `name1` 的区域
3. 在 E 列可以看到命名空间的详细信息：
    * 起始行号（row）
    * 起始列号（col）
    * 行数（rowCount）
    * 列数（colCount）
4. 在第 15 行可以看到命名区域内的完整数据内容（JSON 格式）

## 五、功能特点

### 5.1 优点

* **代码可读性强**：使用有意义的名称代替单元格引用，代码更易理解和维护
* **灵活的数据访问**：通过命名空间对象可以动态获取区域的位置和大小信息
* **便于数据管理**：为重要数据区域命名后，可以在公式、验证规则等场景中直接引用

### 5.2 扩展建议

* 可以扩展为工作簿级别的命名空间（使用 `spread.addCustomName`），实现跨工作表引用
* 可以结合公式功能，在公式中直接使用命名空间名称进行计算
* 可以实现命名空间的动态更新，当数据区域变化时自动调整命名范围

## 六、关键代码片段

### 添加和获取命名空间

```javascript
// 添加命名空间
sheet.addCustomName("name1", "$C$6:$E$12", sheet.getActiveRowIndex(), sheet.getActiveColumnIndex(), "test1");

// 获取命名空间对象
let nameInfo = sheet.getCustomName("name1");

// 解析区域信息
let row = nameInfo.getExpression().row;
let col = nameInfo.getExpression().column;
let rowCount = nameInfo.getExpression().endRow - nameInfo.getExpression().row + 1;
let colCount = nameInfo.getExpression().endColumn - nameInfo.getExpression().column + 1;

// 获取区域数据
let nameData = sheet.getArray(row, col, rowCount, colCount);
```

## 七、总结

本示例展示了 SpreadJS 命名空间功能的基本使用方法，开发者可以从中学到：

1. 如何使用 `addCustomName` 方法为工作表区域定义命名空间
2. 如何通过 `getCustomName` 获取命名空间对象并解析其表达式
3. 如何从命名空间表达式中提取区域的位置和大小信息
4. 如何使用 `getArray` 方法批量读取命名区域的数据内容

该方案适用于需要频繁引用固定数据区域的场景，特别是在构建复杂公式、数据验证规则或动态报表时，可以显著提高代码的可维护性和可读性。命名空间功能也为后续的数据管理和自动化操作提供了良好的扩展基础。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
