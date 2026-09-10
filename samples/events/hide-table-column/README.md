## 一、Demo 概述

本示例演示了如何在 SpreadJS 表格中实现动态隐藏和恢复列的功能。通过按钮交互，用户可以选择性地隐藏表格中的特定列（如"订单日期"列），并支持一键恢复到初始状态。该功能通过重建 Table 对象并动态调整列绑定来实现，适用于需要根据用户需求灵活展示数据的场景。

## 二、解决的问题

在实际业务中，用户可能需要根据不同的查看需求动态调整表格的显示内容。例如：

* 在数据分析时，临时隐藏不需要关注的列以聚焦核心数据
* 根据用户权限或偏好设置，动态控制列的可见性
* 在有限的屏幕空间内，通过隐藏次要列来优化显示效果

本示例提供了一种通过重建 Table 对象来实现列隐藏的解决方案，确保表格结构的完整性和数据的正确绑定。

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 使用按钮单元格类型触发操作

通过 SpreadJS 的 `CellTypes.Button` 创建可交互的按钮单元格，用户点击按钮时触发列隐藏或恢复操作：

```javascript
// 定义隐藏列按钮
let button = new GC.Spread.Sheets.CellTypes.Button()
button.text('隐藏订单日期')
sheet.getCell(0,0).cellType(button).value('orderDate')

// 定义重置按钮
let resetButton = new GC.Spread.Sheets.CellTypes.Button()
resetButton.text('重置表格')
sheet.getCell(0,1).cellType(resetButton).value('reset')
```

按钮的 `value` 属性存储了操作标识（如 `'orderDate'` 或 `'reset'`），用于在事件处理函数中判断执行哪种操作。

#### 3.1.2 动态构建表格列定义

使用 `TableColumn` 对象定义表格的列结构，包括列名、数据字段、显示格式和单元格类型：

```javascript
function generateCol(empCol){
    let column1 = new GC.Spread.Sheets.Tables.TableColumn(1,'orderDate','订单日期')
    empCol.push(column1)

    let column2 = new GC.Spread.Sheets.Tables.TableColumn(2,'item','明细',)
    empCol.push(column2)
   
    let column3 = new GC.Spread.Sheets.Tables.TableColumn(3,'cost','金额','$#,##0.00')
    empCol.push(column3)
 
    let checkBox = new GC.Spread.Sheets.CellTypes.CheckBox()
    checkBox.textTrue('是')
    checkBox.textFalse('否')
    let column4 = new GC.Spread.Sheets.Tables.TableColumn(4,'isCash','是否现金',null,checkBox,'isCash')
    empCol.push(column4)
    return empCol
}
```

该函数返回一个包含所有列定义的数组，支持复用以生成初始列配置和临时列配置。

#### 3.1.3 通过重建 Table 实现列隐藏

隐藏列的核心逻辑是：从列定义数组中移除目标列，然后删除旧 Table 并创建新 Table：

```javascript
spread.bind(GC.Spread.Sheets.Events.ButtonClicked,function(s,e){
    let {row,col,sheet} = e
    let deleteCol = sheet.getCell(row,col).value()
    sheet.suspendPaint()
    
    if(deleteCol!=='reset'){
        let index = findColIndex(deleteCol)
        if(index > -1){
            // 从临时列数组中移除目标列
            tempInfo.splice(index,1)
            let table = sheet.tables.findByName('table01')
            let range = table.range()
            // 删除旧 Table
            sheet.tables.remove(table);
            // 创建新 Table，列数减少
            let newTable = sheet.tables.add('table01',range.row,range.col,range.rowCount,tempInfo.length,GC.Spread.Sheets.Tables.TableThemes.light1)
            newTable.bindColumns(tempInfo)
        }
    }
    sheet.resumePaint()
})
```

关键点：

* 使用 `suspendPaint()` 和 `resumePaint()` 暂停和恢复绘制，避免闪烁
* 通过 `table.range()` 保留原 Table 的位置信息
* 新 Table 的列数由 `tempInfo.length` 决定

#### 3.1.4 恢复初始状态

重置操作通过重新绑定初始列配置来恢复表格：

```javascript
if(deleteCol === 'reset'){
    let table = sheet.tables.findByName('table01')
    let range = table.range()
    sheet.tables.remove(table);
    let newTable = sheet.tables.add('table01',range.row,range.col,range.rowCount,colsInfo.length,GC.Spread.Sheets.Tables.TableThemes.light1)
    newTable.bindColumns(colsInfo)
    // 重新生成临时列数组，用于下次隐藏操作
    tempInfo = generateCol([])
}
```

### 3.2 技术栈

* **@grapecity/spread-sheets**: 15.0.0（核心表格组件）
* **SystemJS**: 0.19.22（模块加载器）
* **TypeScript**: 4.1.2（开发语言支持）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，可以看到一个包含 4 列的表格（订单日期、明细、金额、是否现金）
2. 点击"隐藏订单日期"按钮，"订单日期"列将从表格中移除
3. 点击"重置表格"按钮，表格恢复到初始状态，所有列重新显示

## 五、功能特点

### 5.1 优点

* **交互直观**：通过按钮单元格实现操作，用户体验友好
* **结构完整**：通过重建 Table 而非简单隐藏列，确保表格结构的一致性
* **可扩展**：可以轻松扩展为支持隐藏多列或动态选择隐藏列的功能

### 5.2 局限性与扩展建议

* **数据丢失风险**：重建 Table 时如果表格中有用户输入的数据，需要先保存数据再恢复
* **扩展建议**：
    * 可以添加数据持久化逻辑，在重建 Table 前保存数据
    * 支持通过下拉菜单或复选框选择要隐藏的列
    * 使用 `sheet.setColumnVisible()` 方法实现更轻量的列隐藏（适用于非 Table 场景）

## 六、关键代码片段

### 查找目标列索引

```javascript
function findColIndex(deleteCol){
    let index = -1
    for(let i = 0;i<tempInfo.length;i++){
        if(tempInfo[i].dataField()==deleteCol){
            return i
        }
    }
    return index
}
```

该函数通过遍历列定义数组，根据 `dataField` 查找目标列的索引位置。

## 七、总结

本示例展示了如何通过重建 Table 对象来实现表格列的动态隐藏与恢复。开发者可以从中学到：

1. SpreadJS 中 `CellTypes.Button` 的使用方法
2. `TableColumn` 的定义和绑定机制
3. 通过删除和重建 Table 来动态调整表格结构
4. 使用 `suspendPaint()` 和 `resumePaint()` 优化渲染性能

该方案适用于需要动态调整表格显示内容的场景，特别是在数据分析、报表展示等领域具有实用价值。如果需要保留表格数据或实现更复杂的列管理功能，建议结合数据持久化和状态管理机制进行扩展。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
