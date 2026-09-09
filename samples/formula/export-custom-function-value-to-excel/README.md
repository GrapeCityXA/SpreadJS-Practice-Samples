## 一、Demo 概述

本示例演示了如何在 SpreadJS 中处理自定义公式导出到 Excel 时的特殊需求。由于 Excel 无法识别 SpreadJS 的自定义公式，直接导出会导致公式失效。该示例通过在导出前将自定义公式替换为其计算结果值，确保导出的 Excel 文件能够正确显示数据。

## 二、解决的问题

在使用 SpreadJS 开发电子表格应用时，开发者经常需要创建自定义公式来实现特定的业务逻辑。然而，当用户需要将包含自定义公式的工作簿导出为 Excel 文件时，会遇到以下问题：

- Excel 无法识别 SpreadJS 的自定义公式，导出后公式单元格显示错误或空白
- 用户无法在导出的 Excel 文件中看到正确的计算结果
- 需要一种机制在导出时自动将自定义公式转换为静态值，同时保持原工作簿不受影响

## 三、实现思路

### 3.1 自定义公式定义

示例中定义了一个名为 `customSum` 的自定义公式，用于对指定单元格上方的所有单元格进行求和：

```javascript
function customSum() {
    this.name = "customSum"
    this.maxArgs = 1
    this.minArgs = 1
}

customSum.prototype = new GC.Spread.CalcEngine.Functions.Function("customSum")
customSum.prototype.evaluate = function (range) {
    let sum = 0
    let row = range.getRow() - 1
    let col = range.getColumn()
    while (row >= 0) {
        sum = sum + sheet.getValue(row, col)
        row--
    }
    return sum
}
customSum.prototype.acceptsReference = function () {
    return true
}

// 注册到全局
GC.Spread.CalcEngine.Functions.defineGlobalCustomFunction("customSum", new customSum());
```

该公式接受一个单元格引用作为参数，从该单元格向上遍历所有行，累加同列的所有单元格值。

### 3.2 临时工作簿克隆

导出时的核心策略是创建一个临时工作簿副本，在副本上进行公式替换操作，避免影响原始工作簿：

```javascript
let tempSpread = new GC.Spread.Sheets.Workbook()
tempSpread.fromJSON(spread.toJSON({
    includeBindingSource: true
}))
```

通过 `toJSON()` 和 `fromJSON()` 方法实现深度克隆，确保所有数据、样式、公式都被完整复制。

### 3.3 搜索并替换自定义公式

使用 SpreadJS 的搜索 API 定位所有包含自定义公式的单元格，并将其替换为计算结果值：

```javascript
tempSpread.sheets.forEach((tempSheet, sheetIndex) => {
    let customNames = ["customSum"]
    customNames.forEach(name => {
        let searchCondition = new GC.Spread.Sheets.Search.SearchCondition()
        searchCondition.searchString = name
        searchCondition.startSheetIndex = sheetIndex
        searchCondition.endSheetIndex = sheetIndex
        searchCondition.searchTarget = GC.Spread.Sheets.Search.SearchFoundFlags.cellFormula
        searchCondition.searchFlags = GC.Spread.Sheets.Search.SearchFlags.ignoreCase
        
        let result = tempSheet.search(searchCondition)
        while (result.searchFoundFlag != GC.Spread.Sheets.Search.SearchFoundFlags.none) {
            let value = tempSheet.getValue(result.foundRowIndex, result.foundColumnIndex)
            // 清除公式
            tempSheet.setFormula(result.foundRowIndex, result.foundColumnIndex, null)
            // 设置值为公式计算的结果
            tempSheet.setValue(result.foundRowIndex, result.foundColumnIndex, value)
            
            searchCondition.columnStart = result.foundColumnIndex + 1
            result = tempSheet.search(searchCondition)
        }
    })
})
```

关键步骤：
1. 配置搜索条件，指定搜索目标为单元格公式（`cellFormula`）
2. 使用 `while` 循环遍历所有匹配结果（每次搜索只返回一个结果）
3. 获取公式的计算结果值
4. 清除公式并设置为静态值
5. 更新搜索起始位置继续查找

### 3.4 导出 Excel

完成公式替换后，使用标准的导出 API 生成 Excel 文件：

```javascript
tempSpread.export(function (blob) {
    saveAs(blob, "temp.xlsx");
}, function () { }, {
    fileType: GC.Spread.Sheets.FileType.excel,
    includeBindingSource: true
})
```

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件。

### 4.2 操作步骤

1. 页面加载后，会自动创建一个包含自定义公式的工作表
2. 工作表中有两组数据，每组最后一行使用 `customSum` 公式计算上方所有单元格的和
3. 点击"导出 Excel"按钮
4. 下载生成的 `temp.xlsx` 文件
5. 在 Excel 中打开文件，验证原本包含自定义公式的单元格已显示为静态值

## 五、功能特点

### 5.1 优点

- 无损导出：原始工作簿不受影响，所有操作在临时副本上进行
- 自动化处理：无需手动查找和替换公式，通过搜索 API 自动定位
- 可扩展性：支持多个自定义公式，只需在 `customNames` 数组中添加公式名称
- 完整性保证：使用 `includeBindingSource` 确保数据源绑定信息也被正确处理

### 5.2 局限性与扩展建议

- 当前实现需要手动维护 `customNames` 数组，如果自定义公式较多，可以考虑自动收集所有已注册的自定义公式名称
- 搜索操作是逐个单元格进行的，对于大型工作簿可能存在性能问题，可以考虑批量处理优化
- 如果需要保留部分自定义公式（例如某些公式在 Excel 中有等效实现），可以在 `customNames` 中选择性添加

## 六、关键代码片段

### 搜索条件配置

```javascript
let searchCondition = new GC.Spread.Sheets.Search.SearchCondition()
searchCondition.searchString = name  // 自定义公式名称
searchCondition.searchTarget = GC.Spread.Sheets.Search.SearchFoundFlags.cellFormula  // 搜索目标为公式
searchCondition.searchFlags = GC.Spread.Sheets.Search.SearchFlags.ignoreCase  // 忽略大小写
```

### 公式替换逻辑

```javascript
let value = tempSheet.getValue(result.foundRowIndex, result.foundColumnIndex)
tempSheet.setFormula(result.foundRowIndex, result.foundColumnIndex, null)
tempSheet.setValue(result.foundRowIndex, result.foundColumnIndex, value)
```

先获取公式的计算结果，清除公式后再设置为静态值，确保数据不丢失。

## 七、总结

本示例提供了一个实用的解决方案，用于处理 SpreadJS 自定义公式导出到 Excel 的兼容性问题。开发者可以从中学到：

- 如何定义和注册 SpreadJS 自定义公式
- 使用搜索 API 定位特定类型的单元格内容
- 通过临时工作簿副本实现无损数据转换
- 导出前的数据预处理技巧

该方案适用于任何需要将 SpreadJS 特有功能转换为 Excel 兼容格式的场景，具有良好的可扩展性和实用价值。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/nP7imZ7zz0Ck6aG90UCcNg/)）
