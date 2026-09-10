## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现一个常见的交互需求：当用户点击单元格时，自动选中该单元格所在的整行，而不是仅选中单个单元格。这种交互方式在数据浏览、记录查看等场景中非常实用，能够帮助用户更清晰地识别当前操作的数据行。

## 二、解决的问题

* **提升数据可读性**：在包含多列数据的表格中，整行高亮能够帮助用户快速定位和查看同一记录的所有字段
* **改善用户体验**：模拟类似 Excel 或数据库管理工具中的行选择行为，符合用户的操作习惯
* **简化数据操作**：为后续的行级操作（如删除、编辑、导出）提供直观的视觉反馈

## 三、实现思路

### 3.1 核心技术点

#### 监听单元格点击事件

通过 SpreadJS 的事件系统监听 `CellClick` 事件，捕获用户的点击操作：

```javascript
spread.bind(GC.Spread.Sheets.Events.CellClick,
    function (e, args) {
        var sheet = args.sheet,
            row = args.row,
            col = args.col;
        // 处理逻辑
    });
```

事件参数 `args` 包含了点击的工作表对象、行索引和列索引，为后续操作提供必要的上下文信息。

#### 清除现有选区并设置整行选择

在事件处理函数中，先清除当前选区，然后设置活动单元格，最后添加整行选区：

```javascript
sheet.clearSelection();           // 清除现有选区
sheet.setActiveCell(row, col);    // 设置活动单元格
sheet.addSelection(row, -1, 1, -1); // 选中整行
```

`addSelection(row, col, rowCount, colCount)` 方法的关键参数：

* `row`：起始行索引
* `-1`：列索引为 -1 表示从第一列开始
* `1`：选择 1 行
* `-1`：列数为 -1 表示选择到最后一列

### 3.2 技术栈

* **@grapecity/spread-sheets**: 15.0.0 - SpreadJS 核心库
* **TypeScript**: ^4.1.2 - 类型支持
* **SystemJS**: ^0.19.22 - 模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 在浏览器中打开示例页面
2. 点击表格中的任意单元格
3. 观察整行被自动选中并高亮显示
4. 点击不同单元格，选区会自动切换到对应的行

## 五、功能特点

### 5.1 优点

* **实现简洁**：仅需 10 行左右的核心代码即可实现功能
* **性能优秀**：事件驱动机制，响应迅速，无性能损耗
* **用户友好**：符合常见表格软件的交互习惯，无学习成本

### 5.2 扩展建议

* 可以添加 Ctrl/Shift 键支持，实现多行选择
* 可以结合右键菜单，提供行级操作选项（复制行、删除行等）
* 可以添加配置开关，允许用户在"选中单元格"和"选中整行"两种模式间切换

## 六、关键代码片段

完整的事件绑定和选区处理逻辑：

```javascript
spread.bind(GC.Spread.Sheets.Events.CellClick,
    function (e, args) {
        var sheet = args.sheet,
            row = args.row,
            col = args.col;
        sheet.clearSelection();           // 清除旧选区
        sheet.setActiveCell(row, col);    // 保持活动单元格
        sheet.addSelection(row, -1, 1, -1); // 添加整行选区
    });
```

## 七、总结

本示例展示了 SpreadJS 事件系统和选区 API 的基础用法，通过简单的代码实现了实用的整行选择功能。开发者可以从中学到：

* SpreadJS 事件绑定机制的使用方法
* 选区操作 API（`clearSelection`、`setActiveCell`、`addSelection`）的应用
* 如何通过参数 `-1` 实现整行或整列的选择

该方案适用于需要行级操作的数据管理场景，代码简洁易维护，可作为更复杂交互功能的基础进行扩展。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
