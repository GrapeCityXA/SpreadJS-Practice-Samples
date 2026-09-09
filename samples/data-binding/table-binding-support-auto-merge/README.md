## 一、Demo 概述

本示例演示了如何在 SpreadJS 中实现表格数据绑定时保持合并单元格的格式。当使用 `CellBindingSource` 绑定数据源到表格后，示例通过自定义逻辑将表格首行的合并单元格格式复制到所有数据行，并监听表格行变化事件，确保新插入的行也能自动应用合并单元格格式。

该示例适用于需要在数据绑定场景下保持复杂单元格格式（特别是合并单元格）的业务需求，例如报表系统、数据展示表格等。

## 二、解决的问题

在 SpreadJS 的数据绑定场景中，直接使用 `setDataSource` 绑定数据源后，表格的合并单元格格式通常不会自动应用到数据行。本示例解决了以下问题：

- 数据绑定后如何保持表格模板中的合并单元格格式
- 动态插入新行时如何自动应用合并单元格
- 如何在表格数据变化时同步样式和合并单元格状态

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 加载预定义的表格模板

示例通过 XMLHttpRequest 加载包含表格结构和合并单元格定义的 `.ssjson` 文件：

```javascript
let xhr = new XMLHttpRequest()
xhr.open("get", "t.ssjson")
xhr.responseType = "blob"
xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
        spread.import(this.response, function () {
            sheet = spread.getActiveSheet()
            bindEvent()
        }, function () { }, {
            fileType: GC.Spread.Sheets.FileType.ssjson
        })
    }
}
xhr.send()
```

`t.ssjson` 文件中定义了表格的初始结构，包括 6 列的表格和 3 组合并单元格（每组占 2 列）。

#### 3.1.2 数据绑定与样式复制

使用 `CellBindingSource` 绑定数据源，并遍历表格的所有行，将首行的样式和合并单元格格式复制到每一行：

```javascript
function bindData() {
    let initialData = {
        table: [{
            name: "张三",
            age: 33,
            gender: "男"
        }, {
            name: "李四",
            age: 34,
            gender: "男"
        }, {
            name: "王五",
            age: 35,
            gender: "男"
        }]
    }

    let source = new GC.Spread.Sheets.Bindings.CellBindingSource(initialData)
    sheet.setDataSource(source)
    
    sheet.tables.all().forEach(table => {
        let dr = table.range()
        let path = table.bindingPath()
        if (path && !initialData[path]) {
            initialData[path] = [{}]
        }
        
        // 复制首行样式到所有数据行
        for (let curRow = dr.row + 1; curRow < dr.row + dr.rowCount; curRow++) {
            sheet.copyTo(dr.row, dr.col, curRow, dr.col, 1, dr.colCount, GC.Spread.Sheets.CopyToOptions.style)
        }

        // 复制合并单元格
        for (let col = dr.col; col < dr.col + dr.colCount;) {
            let span = sheet.getSpan(dr.row, col)
            if (span) {
                for (let rc = dr.row + 1; rc < dr.row + dr.rowCount; rc++) {
                    sheet.addSpan(rc, col, span.rowCount, span.colCount)
                }
                col = col + span.colCount
            } else {
                col++
            }
        }
    })
}
```

关键逻辑：
- 使用 `copyTo` 方法复制首行样式到所有数据行
- 使用 `getSpan` 检测首行的合并单元格
- 使用 `addSpan` 为每一行添加相同的合并单元格格式

#### 3.1.3 监听表格行变化事件

通过监听 `TableRowsChanged` 事件，在用户插入新行时自动应用样式和合并单元格：

```javascript
function bindEvent() {
    spread.bind(GC.Spread.Sheets.Events.TableRowsChanged, function (e, data) {
        let table = data.table
        let dr = table.range()
        
        // 复制样式到新插入的行
        data.sheet.copyTo(dr.row, dr.col, dr.row + data.row + 1, dr.col, data.count, dr.colCount, GC.Spread.Sheets.CopyToOptions.style)
        
        // 为新行添加合并单元格
        for (let col = dr.col; col < dr.col + dr.colCount;) {
            let span = data.sheet.getSpan(dr.row, col)
            if (span) {
                for (let rc = 1; rc <= data.count + 1; rc++) {
                    data.sheet.addSpan(dr.row + data.row + rc, col, span.rowCount, span.colCount)
                }
                col = col + span.colCount
            } else {
                col++
            }
        }
    });
}
```

该事件处理函数确保每次表格行数变化时，新增的行都能继承首行的样式和合并单元格格式。

### 3.2 技术栈

- SpreadJS 16.0.1：核心表格控件
- SpreadJS IO 16.0.1：用于导入 `.ssjson` 文件
- SystemJS 0.19.22：模块加载器
- TypeScript 4.1.2：开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件。

### 4.2 操作步骤

1. 打开页面后，表格会自动加载预定义的模板（包含 3 组合并单元格）
2. 点击"绑定数据"按钮，数据源会绑定到表格，并自动应用合并单元格格式
3. 在表格中插入新行（右键菜单或快捷键），新行会自动继承合并单元格格式
4. 观察控制台输出，可以看到合并单元格的详细信息

## 五、功能特点

### 5.1 优点

- 自动化格式同步：无需手动为每一行设置合并单元格，减少重复操作
- 动态响应：支持运行时插入新行并自动应用格式
- 灵活性：可以处理任意数量和位置的合并单元格
- 数据绑定兼容：与 SpreadJS 的数据绑定机制无缝集成

### 5.2 局限性与扩展建议

当前实现假设所有数据行使用相同的合并单元格格式。如果需要支持不同行使用不同的合并格式，可以考虑：

- 在数据源中添加格式元数据字段
- 根据数据内容动态决定合并单元格的范围
- 支持条件格式化的合并单元格逻辑

## 六、总结

本示例展示了如何在 SpreadJS 数据绑定场景下保持合并单元格格式的完整解决方案。开发者可以从中学到：

- SpreadJS 表格数据绑定的基本用法
- 使用 `copyTo` 和 `addSpan` API 实现样式和格式复制
- 通过 `TableRowsChanged` 事件监听表格结构变化
- 如何处理复杂的单元格格式同步问题

该方案适用于需要在数据驱动的表格中保持复杂格式的场景，具有良好的可扩展性和实用性。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/oLJPc-KKik2gP3alrC9_9w/)）
