import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-shapes";
import "@grapecity-software/spread-sheets-io";
import "file-saver";

function _getElementById(id) {
    //封装以下方法方便使用
    return document.getElementById(id);
}


// 工作簿
var spread = new GC.Spread.Sheets.Workbook(_getElementById("ss")); // 初始化工作簿
spread.setSheetCount(2);
var sheet = spread.getActiveSheet();
sheet.setRowCount(6)
sheet.setColumnCount(10)

// 初始化数据
let c1 = new GC.Spread.Sheets.CellTypes.CheckBox()
c1.caption("王源");
sheet.setCellType(0, 3, c1)

let c2 = new GC.Spread.Sheets.CellTypes.CheckBox()
c2.caption("王俊凯");
sheet.setCellType(1, 3, c2)

let c3 = new GC.Spread.Sheets.CellTypes.CheckBox()
c3.caption("易烊千玺");
sheet.setCellType(2, 3, c3)

let c4 = new GC.Spread.Sheets.CellTypes.CheckBox()
c4.isThreeState(true)
c4.textTrue('是')
c4.textFalse('否')
c4.textIndeterminate('钝角')
sheet.setCellType(1, 5, c4)
sheet.setValue(1, 5, true)

_getElementById('export').onclick = () => {
    toExelFile((spread));
}

function toExcel(spread) {
    var x = 0;
    var y = 0;
    // 影子对象，方便差异化导出
    let spread_copy = new GC.Spread.Sheets.Workbook()
    spread_copy.fromJSON(spread.toJSON())
    let sheet = spread_copy.getActiveSheet()
    let row = sheet.getRowCount()
    let col = sheet.getColumnCount()

    for (let i = 0; i < row; i++) {
        var hangArr = [];
        for (let j = 0; j < col; j++) {
            // 当前单元格信息
            var cellWidth = sheet.getCell(-1, j).width();
            var cellHeight = sheet.getCell(i, -1).height();

            if (sheet.getCellType(i, j) instanceof GC.Spread.Sheets.CellTypes.CheckBox) {
                cellTypeToShape(sheet, x, y, cellWidth, cellHeight, i, j);
            }

            x += cellWidth;
            if (j == col - 1) {
                x = 0;
                y += cellHeight;
            }
        }

    }
    return spread_copy
}

// 传入参数，sheet页，单元格的行索引、列索引
function cellTypeToShape(sheet, x, y, width, height, row, col) {
    // 这里的cellRect的内容并不是在工作簿中的，只是相对于视图而言的，因此获取到的是个错误的答案
    // var cellRect = sheet_ori.getCellRect(row, col);// 没有渲染出来就拿不到这个东西
    var checkBox = sheet.shapes.addFormControl("check box", GC.Spread.Sheets.Shapes.FormControlType.checkBox, x, y, width, height);
    var options = checkBox.options();

    // 如果想要保证导出的复选框保持和之前一样的样式，可以在这里进行相应的设置
    // var style = checkBox.style();
    // style.fill.type = GC.Spread.Sheets.Shapes.ShapeFillType.solid;
    // style.fill.color = "green";
    // style.fill.transparency = 0.5;
    // style.line.color = "red";
    // style.line.transparency = 0.5;
    // style.line.width = 2;
    // checkBox.style(style);

    let text = ''
    let checkbox = sheet.getCellType(row, col)

    // 如果是三选类型
    if (sheet.getCellType(row, col).isThreeState()) {
        text = sheet.getValue(row, col) ? checkbox.textTrue() : (
            sheet.getValue(row, col) == null ? checkbox.textIndeterminate()
                :
                checkbox.textFalse()
        )
    } else {
        var cellType = sheet.getCellType(row, col);
        text = cellType.caption();
    }

    sheet.setCellType(row, col, null)
    checkBox.text(text);
    var checkBoxValue = false;
    sheet.getValue(row, col) ? checkBoxValue = sheet.getValue(row, col) : checkBoxValue = false;
    checkBox.value(checkBoxValue);
    sheet.setValue(row, col, null)
}

function toExelFile(spread) {
    let spread_copy = toExcel(spread)
    spread_copy.export(function (blob) {
        saveAs(blob, 'test.xlsx')
    })
}