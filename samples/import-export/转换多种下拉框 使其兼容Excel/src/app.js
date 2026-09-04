import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-excelio"
import "@grapecity-software/spread-sheets-charts"
import "@grapecity-software/spread-sheets-print"
import "@grapecity-software/spread-sheets-pdf"
import "@grapecity-software/spread-sheets-barcode"
import "@grapecity-software/spread-sheets-languagepackages"
import "@grapecity-software/spread-sheets-shapes"
import "@grapecity-software/spread-sheets-pivot-addon"
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"



let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()

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

let style = new GC.Spread.Sheets.Style()
style.cellButtons = [{
    command: "openList",
    hoverBackColor: "#d3d3d3",
    imageType: GC.Spread.Sheets.ButtonImageType.dropdown,
    position: GC.Spread.Sheets.ButtonPosition.right,
    useButtonStyle: true
}]
style.dropDowns = [{
    type: GC.Spread.Sheets.DropDownType.list,
    option: {
        items: [{
            text: "g1",
            items: [{
                text: "g1-1",
                value: "g1-1"
            }, {
                text: "g1-2",
                value: "g1-2"
            }]
        }, {
            text: "g2",
            items: [{
                text: "g2-1",
                value: "g2-1"
            }, {
                text: "g2-2",
                value: "g2-2"
            }]
        }]
    }
}]
sheet.setStyle(0, 1, style)

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

function convertDropDown2Validator(sheet) {
    sheet.suspendPaint()
    let usedRange = sheet.getUsedRange(GC.Spread.Sheets.UsedRangeType.all)
    console.log(usedRange)
    for (let r = usedRange.row; r < usedRange.row + usedRange.rowCount; r++) {
        for (let c = usedRange.col; c < usedRange.col + usedRange.colCount; c++) {
            let cellType = sheet.getCellType(r, c)
            if (cellType instanceof GC.Spread.Sheets.CellTypes.ComboBox) {
                // 将combobox的items转换为list validator
                let items = cellType.items()
                let str = items.map(v => {
                    return v.value
                })
                let dv = GC.Spread.Sheets.DataValidation.createListValidator(str.join(","))
                sheet.setDataValidator(r, c, dv)
                sheet.setCellType(r, c, new GC.Spread.Sheets.CellTypes.Text())
            }
            // 将下拉按钮转换为list validator
            let style = sheet.getStyle(r, c)
            if (!style.cellButtons || !style.cellButtons[0].command == "openList") {
                continue
            }
            if (!style.dropDowns || !style.dropDowns[0] || !style.dropDowns[0].option.items) {
                continue
            }
            let result = []
            getItemsText(result, style.dropDowns[0].option.items)
            let dv = GC.Spread.Sheets.DataValidation.createListValidator(result.join(","))
            sheet.setDataValidator(r, c, dv)
            style.cellButtons = []
            style.dropDowns = null
            sheet.setStyle(r, c, style)
        }
    }
    sheet.resumePaint()
}

// 递归获取items中的text，可以根据业务灵活改变为取value
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


