import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-sheets-io"
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"



let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()

// 自定义公式：
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
customSum.prototype.description = function () {
    return {
        description: "对指定单元格上方的所有单元格求和",
        parameters: [{
            name: "cell",
            repeatable: false,
            optional: false
        }]
    }
}

// 将此自定义函数注册到全局
GC.Spread.CalcEngine.Functions.defineGlobalCustomFunction("customSum", new customSum());

sheet.setValue(0, 1, 1)
sheet.setValue(1, 1, 2)
sheet.setValue(2, 1, 3)
sheet.setValue(3, 1, 4)
sheet.setValue(4, 1, 5)
sheet.setFormula(5, 1, "=customSum(B6)")

sheet.setColumnWidth(0, 100)
sheet.setValue(5, 0, "自定义公式：")
let style = new GC.Spread.Sheets.Style()
style.font = "bold 11pt Calibri"
sheet.setStyle(5, 1, style)
sheet.setStyle(5, 0, style)

sheet.setValue(0, 4, 11)
sheet.setValue(1, 4, 22)
sheet.setValue(2, 4, 33)
sheet.setValue(3, 4, 44)
sheet.setValue(4, 4, 55)
sheet.setFormula(5, 4, "=customSum(E6)")

sheet.setColumnWidth(3, 100)
sheet.setValue(5, 3, "自定义公式：")
sheet.setStyle(5, 3, style)
sheet.setStyle(5, 4, style)



document.getElementById("btn").addEventListener("click", function () {
    // 创建临时Spread对象
    let tempSpread = new GC.Spread.Sheets.Workbook()
    tempSpread.fromJSON(spread.toJSON({
        // 如果包含绑定数据源，需要加这一行代码
        includeBindingSource: true
    }))
    // 搜索需要遍历所有sheet
    tempSpread.sheets.forEach((tempSheet, sheetIndex) => {
        // 这里写你所有需要导出为值的自定义公式名称，搜索的时候要用
        let customNames = ["customSum"]
        customNames.forEach(name => {
            let searchCondition = new GC.Spread.Sheets.Search.SearchCondition()
            // 搜索条件，搜索的字符串为自定义公式名
            searchCondition.searchString = name
            searchCondition.startSheetIndex = sheetIndex
            searchCondition.endSheetIndex = sheetIndex
            searchCondition.searchTarget = GC.Spread.Sheets.Search.SearchFoundFlags.cellFormula
            searchCondition.searchFlags = GC.Spread.Sheets.Search.SearchFlags.ignoreCase
            searchCondition.rowStart = 0
            searchCondition.columnStart = 0
            let result = tempSheet.search(searchCondition)
            // 由于每次搜索只能搜一个结果，要搜索全部只能用while循环，直到搜索结果为空结束
            while (result.searchFoundFlag != GC.Spread.Sheets.Search.SearchFoundFlags.none) {
                let value = tempSheet.getValue(result.foundRowIndex, result.foundColumnIndex)
                // 清除公式
                tempSheet.setFormula(result.foundRowIndex, result.foundColumnIndex, null)
                // 设置值为公式计算的结果
                tempSheet.setValue(result.foundRowIndex, result.foundColumnIndex, value)

                searchCondition.rowStart = result.foundRowIndex
                // 从当前搜索结果下一列继续搜索
                searchCondition.columnStart = result.foundColumnIndex + 1
                result = tempSheet.search(searchCondition)
            }
        })
    })
    // 导出excel
    tempSpread.export(function (blob) {
        saveAs(blob, "temp.xlsx");
    }, function () { }, {
        fileType: GC.Spread.Sheets.FileType.excel,
        // 如果包含绑定数据源，需要加这一行代码
        includeBindingSource: true
    })
})








