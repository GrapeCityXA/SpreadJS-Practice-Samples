## 一、Demo 概述

本示例展示了如何将 SpreadJS 中的多种下拉框类型（ComboBox 单元格类型和 CellButton + DropDown 样式）转换为 Excel 兼容的数据验证列表。由于 Excel 不支持 SpreadJS 特有的下拉框实现方式，在导出 Excel 文件前需要将这些下拉框转换为标准的 List Validator，确保导出后的文件在 Excel 中能够正常显示和使用下拉列表功能。 

该示例适用于需要将包含复杂下拉框的 SpreadJS 工作簿导出为 Excel 文件的场景，特别是在企业级应用中需要保证数据验证功能在不同平台间的兼容性。

## 二、解决的问题

* SpreadJS 的 ComboBox 单元格类型在导出到 Excel 后无法正常显示为下拉列表
* 通过 CellButton 和 DropDown 样式实现的下拉框在 Excel 中不被识别
* 需要在导出前将这些 SpreadJS 特有的下拉框实现转换为 Excel 标准的数据验证列表
* 支持嵌套分组的下拉框数据结构转换为扁平化的验证列表

## 三、实现思路

### 3.1 创建两种类型的下拉框

示例中创建了两种不同的下拉框实现方式：

**ComboBox 单元格类型**（A1 单元格）：

```javascript
let comboBox = new GC.Spread.Sheets.CellTypes.ComboBox();
comboBox.items([{
    text: "A",
    value: 1
}, {
    text: "B",
    value: 2
}, {
    text: "C",
    value: 3
}]);
sheet.getCell(0, 0).cellType(comboBox);
```

**CellButton + DropDown 样式**（B1 单元格）：

```javascript
let style = new GC.Spread.Sheets.Style()
style.cellButtons = [{
    command: "openList",
    imageType: GC.Spread.Sheets.ButtonImageType.dropdown,
    position: GC.Spread.Sheets.ButtonPosition.right
}]
style.dropDowns = [{
    type: GC.Spread.Sheets.DropDownType.list,
    option: {
        items: [{
            text: "g1",
            items: [{text: "g1-1", value: "g1-1"}, {text: "g1-2", value: "g1-2"}]
        }, {
            text: "g2",
            items: [{text: "g2-1", value: "g2-1"}, {text: "g2-2", value: "g2-2"}]
        }]
    }
}]
sheet.setStyle(0, 1, style)
```

### 3.2 转换核心逻辑

转换函数 `convertDropDown2Validator` 遍历工作表的所有使用区域，识别并转换两种下拉框：

```javascript
function convertDropDown2Validator(sheet) {
    sheet.suspendPaint()
    let usedRange = sheet.getUsedRange(GC.Spread.Sheets.UsedRangeType.all)
    
    for (let r = usedRange.row; r < usedRange.row + usedRange.rowCount; r++) {
        for (let c = usedRange.col; c < usedRange.col + usedRange.colCount; c++) {
            let cellType = sheet.getCellType(r, c)
            
            // 转换 ComboBox 类型
            if (cellType instanceof GC.Spread.Sheets.CellTypes.ComboBox) {
                let items = cellType.items()
                let str = items.map(v => v.value)
                let dv = GC.Spread.Sheets.DataValidation.createListValidator(str.join(","))
                sheet.setDataValidator(r, c, dv)
                sheet.setCellType(r, c, new GC.Spread.Sheets.CellTypes.Text())
            }
            
            // 转换 CellButton + DropDown 样式
            let style = sheet.getStyle(r, c)
            if (style.cellButtons && style.cellButtons[0].command == "openList") {
                if (style.dropDowns && style.dropDowns[0] && style.dropDowns[0].option.items) {
                    let result = []
                    getItemsText(result, style.dropDowns[0].option.items)
                    let dv = GC.Spread.Sheets.DataValidation.createListValidator(result.join(","))
                    sheet.setDataValidator(r, c, dv)
                    style.cellButtons = []
                    style.dropDowns = null
                    sheet.setStyle(r, c, style)
                }
            }
        }
    }
    sheet.resumePaint()
}
```

### 3.3 递归处理嵌套数据

对于分组下拉框，使用递归函数提取所有选项文本：

```javascript
function getItemsText(result = [], items) {
    items.forEach(item => {
        if (item.text) {
            result.push(item.text)
        }
        if (item.items) {
            getItemsText(result, item.items)
        }
    })
    return result
}
```

### 3.4 导出流程

点击"转换并下载"按钮时，创建工作簿副本进行转换，避免影响原始数据：

```javascript
document.getElementById("btn").addEventListener("click", function () {
    let _spread = new GC.Spread.Sheets.Workbook()
    _spread.fromJSON(JSON.parse(JSON.stringify(spread.toJSON())))
    _spread.sheets.forEach(s => {
        convertDropDown2Validator(s)
        _spread.export(function (blob) {
            saveAs(blob, "转换后文件.xlsx");
        }, function (e) {
            console.log(e);
        }, {
            fileType: GC.Spread.Sheets.FileType.excel
        });
    })
})
```

### 3.5 技术栈

* SpreadJS 17.0.8（核心表格引擎）
* SpreadJS Designer（可视化设计器）
* SpreadJS ExcelIO（Excel 导入导出）
* FileSaver.js 2.0.5（文件下载）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 使用本地服务器打开 index.html（如 Live Server）
```

### 4.2 操作步骤

1. 打开页面后，可以看到 A1 单元格有一个 ComboBox 下拉框（选项：A、B、C）
2. B1 单元格有一个带分组的下拉框（选项：g1-1、g1-2、g2-1、g2-2）
3. 点击"转换并下载"按钮
4. 系统会自动将下拉框转换为 Excel 兼容的数据验证列表并下载文件
5. 在 Excel 中打开下载的文件，验证下拉列表功能是否正常

## 五、功能特点

### 5.1 优点

* 支持多种下拉框类型的自动识别和转换
* 使用工作簿副本进行转换，不影响原始数据
* 支持嵌套分组数据的扁平化处理
* 转换后的文件在 Excel 中完全兼容

### 5.2 局限性与扩展建议

* 当前实现提取的是 `text` 字段，可根据业务需求修改为提取 `value` 字段
* 对于复杂的分组结构，扁平化后会丢失层级关系
* 可以扩展支持其他类型的单元格类型转换
* 建议在转换前进行数据备份或提示用户

## 六、关键代码片段

### 判断和转换 ComboBox

```javascript
if (cellType instanceof GC.Spread.Sheets.CellTypes.ComboBox) {
    let items = cellType.items()
    let str = items.map(v => v.value)
    let dv = GC.Spread.Sheets.DataValidation.createListValidator(str.join(","))
    sheet.setDataValidator(r, c, dv)
    sheet.setCellType(r, c, new GC.Spread.Sheets.CellTypes.Text())
}
```

### 判断和转换 CellButton 下拉框

```javascript
let style = sheet.getStyle(r, c)
if (style.cellButtons && style.cellButtons[0].command == "openList") {
    if (style.dropDowns && style.dropDowns[0] && style.dropDowns[0].option.items) {
        let result = []
        getItemsText(result, style.dropDowns[0].option.items)
        let dv = GC.Spread.Sheets.DataValidation.createListValidator(result.join(","))
        sheet.setDataValidator(r, c, dv)
        style.cellButtons = []
        style.dropDowns = null
        sheet.setStyle(r, c, style)
    }
}
```

## 七、总结

本示例提供了一个实用的解决方案，用于将 SpreadJS 特有的下拉框实现转换为 Excel 标准的数据验证列表。开发者可以从中学到：

* 如何识别和处理不同类型的 SpreadJS 下拉框
* 使用 DataValidation API 创建 Excel 兼容的列表验证器
* 递归处理嵌套数据结构的技巧
* 在导出前对工作簿进行预处理的最佳实践

该方案适用于需要在 SpreadJS 和 Excel 之间进行数据交换的场景，确保下拉列表功能在不同平台间的一致性和兼容性。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
