## 一、Demo 概述

本示例演示了如何在 SpreadJS 中正确获取合并单元格的值。在 SpreadJS 中，合并单元格区域只有左上角单元格存储实际值，其他单元格的值为 null。该示例提供了一个通用方法，可以使用合并区域内任意单元格的行列索引来获取左上角单元格的值，解决了直接访问合并区域非左上角单元格时无法获取值的问题。

## 二、解决的问题

在使用 SpreadJS 处理合并单元格时，开发者经常遇到以下问题：

* 合并单元格区域中，只有左上角单元格存储值，直接使用 `getValue()` 访问其他位置会返回 null
* 在不确定单元格是否为合并区域的情况下，需要额外的逻辑判断才能正确获取值
* 在数据处理或导出场景中，需要统一的方法来获取任意单元格的实际显示值

该示例提供了一个封装方法，自动检测目标单元格是否在合并区域内，并返回正确的值。

## 三、实现思路

### 3.1 核心技术点

#### 创建合并单元格

使用 `addSpan()` 方法创建合并单元格区域：

```javascript
// 创建一个从 (0,0) 开始，跨越 5 行 5 列的合并区域
sheet.addSpan(0, 0, 5, 5);
sheet.setText(0, 0, 'grapecity');
sheet.getCell(0, 0).backColor('lightblue');

// 创建第二个合并区域
sheet.addSpan(7, 7, 2, 2);
sheet.setText(7, 7, 'spreadjs');
sheet.getCell(7, 7).backColor('#cccc66');
```

`addSpan(row, col, rowCount, colCount)` 参数说明：

* `row`: 起始行索引
* `col`: 起始列索引
* `rowCount`: 合并的行数
* `colCount`: 合并的列数

#### 获取合并单元格信息

使用 `getSpan()` 方法检测指定单元格是否在合并区域内：

```javascript
function myGetValue(sheet, row, col) {
    let spanInfo = sheet.getSpan(row, col);
    if (spanInfo) {
        // 如果是合并区域，返回左上角单元格的值
        return sheet.getValue(spanInfo.row, spanInfo.col);
    } else {
        // 如果不是合并区域，直接返回该单元格的值
        return sheet.getValue(row, col);
    }
}
```

`getSpan()` 方法返回值：

* 如果单元格在合并区域内，返回包含 `row`、`col`、`rowCount`、`colCount` 的对象
* 如果单元格不在合并区域内，返回 `null`

#### UI 交互实现

通过输入框和按钮实现用户交互：

```javascript
document.getElementById('get_value').onclick = () => {
    let row = document.getElementById('row').value;
    let col = document.getElementById('col').value;
    if (row.length > 0 && col.length > 0) {
        alert(myGetValue(sheet, row, col));
    } else {
        alert('please input row index and column index');
    }
}
```

### 3.2 技术栈

* SpreadJS v15.0.0：核心表格控件
* SystemJS v0.19.22：模块加载器
* TypeScript v4.1.2：类型支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，可以看到两个合并单元格区域：
    * 区域 1：(0,0) 到 (4,4)，显示 "grapecity"，浅蓝色背景
    * 区域 2：(7,7) 到 (8,8)，显示 "spreadjs"，黄色背景
2. 在"目标行索引"输入框中输入行号（例如：2）
3. 在"目标列索引"输入框中输入列号（例如：3）
4. 点击"获取值"按钮，弹窗显示该位置的实际值
5. 测试建议：
    * 输入合并区域内的任意坐标（如 2,3），应返回 "grapecity"
    * 输入合并区域外的坐标（如 10,10），应返回该单元格的实际值或 undefined
    * 输入第二个合并区域的坐标（如 7,8），应返回 "spreadjs"

## 五、功能特点

### 5.1 优点

* 封装简洁：`myGetValue()` 方法仅 7 行代码，易于理解和维护
* 通用性强：适用于任意单元格，自动处理合并和非合并情况
* 零侵入性：不修改 SpreadJS 原生 API，可直接集成到现有项目
* 性能高效：使用原生 `getSpan()` 方法，无额外遍历开销

### 5.2 扩展建议

* 可以扩展为批量获取多个单元格值的方法
* 可以添加对公式单元格的处理（使用 `getFormula()` 和 `getValue()` 结合）
* 可以封装为 SpreadJS 的自定义工具类，提供更多合并单元格相关的辅助方法

## 六、关键代码片段

核心方法实现：

```javascript
/**
 * 获取指定位置单元格的内容
 * @param {Worksheet} sheet - 工作表对象
 * @param {number} row - 目标行索引
 * @param {number} col - 目标列索引
 * @returns {*} 单元格的值
 */
function myGetValue(sheet, row, col) {
    // 检查目标单元格是否在合并区域内
    let spanInfo = sheet.getSpan(row, col);
    
    if (spanInfo) {
        // 如果在合并区域内，返回合并区域左上角单元格的值
        return sheet.getValue(spanInfo.row, spanInfo.col);
    } else {
        // 如果不在合并区域内，直接返回该单元格的值
        return sheet.getValue(row, col);
    }
}
```

## 七、总结

本示例展示了 SpreadJS 中处理合并单元格值获取的标准方法。通过 `getSpan()` API 自动检测合并区域，开发者可以编写更健壮的数据处理逻辑，无需手动判断单元格是否被合并。

开发者可以从中学到：

* SpreadJS 合并单元格的数据存储机制（只有左上角存储值）
* `addSpan()` 和 `getSpan()` API 的使用方法
* 如何封装通用的单元格值获取方法
* 合并单元格的样式设置和 UI 交互实现

该方案适用于所有需要处理合并单元格的场景，如数据导出、单元格编辑、数据验证等，具有很强的实用性和可扩展性。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
