import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-excelio"
import "@grapecity-software/spread-sheets-charts"
import "@grapecity-software/spread-sheets-print"
import "@grapecity-software/spread-sheets-resources-zh"
import "@grapecity-software/spread-sheets-pdf"
import "@grapecity-software/spread-sheets-barcode"
import "@grapecity-software/spread-sheets-languagepackages"
import "@grapecity-software/spread-sheets-shapes"
import "@grapecity-software/spread-sheets-pivot-addon"
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"



let designer = new GC.Spread.Sheets.Designer.Designer("ss")
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()

function customCell() { }
customCell.prototype = new GC.Spread.Sheets.CellTypes.Text()
let oldPaint = GC.Spread.Sheets.CellTypes.Text.prototype.paint
customCell.prototype.paint = function (context, value) {
    if (value && typeof value == "object") {
        let text = `我是${value.name}，性别${value.gender}，今年${value.age}岁`
        let arg = arguments
        arg[1] = text
        oldPaint.apply(this, arg)
    } else {
        oldPaint.apply(this, arguments)
    }
}

let cellInfo
sheet.bind(GC.Spread.Sheets.Events.CellClick, function (e, info) {
    if (info.row == 0 && info.col == 1) {
        document.querySelector(".popup").style.display = "block"
        cellInfo = {
            sheet: info.sheet,
            row: info.row,
            col: info.col
        }
        let value = info.sheet.getValue(info.row, info.col)
        document.querySelector("#name").value = value?.name || ""
        document.querySelector("#age").value = value?.age || ""
        document.querySelector("#gender").value = value?.gender || ""
    }
})

document.querySelector(".save").addEventListener("click", function () {
    cellInfo.sheet.setValue(cellInfo.row, cellInfo.col, {
        name: document.querySelector("#name").value,
        age: document.querySelector("#age").value,
        gender: document.querySelector("#gender").value,
    })
    document.querySelector("#name").value = ""
    document.querySelector("#age").value = ""
    document.querySelector("#gender").value = ""
    document.querySelector(".popup").style.display = "none"
})
document.querySelector(".cancel").addEventListener("click", function () {
    document.querySelector("#name").value = ""
    document.querySelector("#age").value = ""
    document.querySelector("#gender").value = ""
    document.querySelector(".popup").style.display = "none"
})

sheet.setCellType(0, 1, new customCell())

let style = sheet.getStyle(0, 1)
style.backColor = "#65A854"
style.showEllipsis = true
sheet.setStyle(0, 1, style)

sheet.setColumnWidth(0, 200)
sheet.setColumnWidth(1, 200)

sheet.setBindingPath(0, 1, "info")
sheet.setBindingPath(2, 1, "info.name")
sheet.setBindingPath(3, 1, "info.gender")
sheet.setBindingPath(4, 1, "info.age")

sheet.setValue(0, 0, "请点击B1并修改信息")
sheet.setValue(1, 0, "对象字段单独显示")
sheet.setValue(2, 0, "姓名")
sheet.setValue(3, 0, "性别")
sheet.setValue(4, 0, "年龄")

sheet.setDataSource(new GC.Spread.Sheets.Bindings.CellBindingSource({
    info: {
        name: "小王",
        gender: "男",
        age: "25"
    }
}))