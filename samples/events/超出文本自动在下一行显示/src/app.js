import * as GC from "@grapecity-software/spread-sheets";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();
sheet.setColumnWidth(1, 100)

sheet.setValue(1, 1, "君不见，黄河之水天上流，奔流到海不复回。君不见，高堂明镜悲白发，朝如青丝暮成雪")

document.getElementById("btn").addEventListener("click", function () {
    processCell(1, 1)
})

function processCell(row, col) {
    spread.suspendPaint()
    let strArr = '';
    let currentColWidth = sheet.getColumnWidth(col)
    console.log('第2列列宽', currentColWidth)
    let originalStr = sheet.getValue(row, col)
    let characters = originalStr.split("");
    for (let i = 0; i < characters.length; i++) {
        let str = characters[i];
        let currentStr = strArr + str;

        // 设置单元格的值
        sheet.setValue(row, col, currentStr);

        // 创建文本单元格类型实例
        var instance = new GC.Spread.Sheets.CellTypes.Text();


        // 获取当前字符串的自动适应宽度
        var returnValue = instance.getAutoFitWidth(
            sheet.getValue(row, col),
            sheet.getText(row, col),
            sheet.getActualStyle(row, col),
            sheet.zoom(),
            {
                "sheet": sheet,
                "row": row,
                "col": col,
                "sheetArea": GC.Spread.Sheets.SheetArea.viewport
            }
        );

        // 计算当前宽度
        console.log(currentStr, returnValue)
        if (returnValue > currentColWidth) {
            console.log(`在字符 "${str}" 后超出列宽，当前宽度: ${returnValue}，列宽: ${currentColWidth}`);
            sheet.setValue(row, col, strArr)
            strArr = ""
            row++
            i--
        } else {
            strArr += str;
        }
    }
    spread.resumePaint()
}