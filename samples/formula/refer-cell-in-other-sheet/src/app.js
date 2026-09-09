import * as GC from "@grapecity-software/spread-sheets";


let spread = new GC.Spread.Sheets.Workbook(document.getElementById("designer-container"));


// 允许无效公式，否则点击按钮无效(15.2.4以上)
spread.options.allowInvalidFormula = true

spread.setSheetCount(2)
let sheet1 = spread.getActiveSheet()
sheet1.setValue(0, 0, 1)
sheet1.setValue(1, 0, 2)
sheet1.setValue(2, 0, 3)
sheet1.setValue(3, 0, 4)

// 用于判断当前是否是按钮出发的选择区域
let selectFlag = false
// 用于记录选择区域之前的公式值
let formula
// 记录sheetName
let sheet1Name
let prevSheetName
// 记录点击之前在哪个sheet页
let prevSheet
// 记录点击前的单元格
let prevCellRange

// 监听单元格编辑，编辑完成后修改宽度
sheet1.bind(GC.Spread.Sheets.Events.SelectionChanged, function (sender, args) {
    if (selectFlag) {
        // 这里可以操作的地方比较多
        // 1. 区域选择是可以设置多选的，如果有需求，可以把多个区域连起来
        // 2. rangeToFormula可以设置是相对引用还是绝对引用，我这里是默认用了绝对引用
        // 3. rangeToFormula也可以设置是否是R1C1的引用方式，具体看文档吧
        let selectedRange = GC.Spread.Sheets.CalcEngine.rangeToFormula(args.newSelections[0])
        selectFlag = false
        spread.setActiveSheet(prevSheetName)
        prevSheet.setFormula(prevCellRange.row, prevCellRange.col, formula + sheet1Name + '!' + selectedRange + ')')
    }
});



document.getElementById('select').addEventListener('click', function () {
    let sheet2 = spread.getActiveSheet()
    let range = sheet2.getSelections()[0]
    let f = sheet2.getValue(range.row, range.col)
    formula = f

    // 这里选择哪个sheet去复制需要根据你的业务灵活调整
    spread.setActiveSheetIndex(0)

    sheet1Name = spread.getActiveSheet().name()
    prevSheetName = sheet2.name()
    selectFlag = true
    prevSheet = sheet2
    prevCellRange = range
})