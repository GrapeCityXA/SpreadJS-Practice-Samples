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

sheet.setValue(0, 0, 1)
sheet.setValue(1, 0, 2)
sheet.setValue(2, 0, 3)

sheet.setFormula(1,2,"=55+66")



let formulaArray;
spread.bind(GC.Spread.Sheets.Events.ClipboardPasting, (sender, args) => {
    console.log(args);
    let { cellRange } = args;
    formulaArray = traverseCellRangeIfFormula(
        args.sheet,
        cellRange.row,
        cellRange.col,
        cellRange.rowCount,
        cellRange.colCount
    );
});

spread.bind(GC.Spread.Sheets.Events.ClipboardPasted, (sender, args) => {
    console.log(formulaArray);
    for (const key in formulaArray) {
        args.sheet.setFormula(
            formulaArray[key].row,
            formulaArray[key].col,
            formulaArray[key].formula
        );
    }
});

function traverseCellRangeIfFormula(sheet, row, col, rowCount, colCount) {
    let result = {};
    for (let i = row; i < row + rowCount; i++) {
        for (let j = col; j < col + colCount; j++) {
            let cell = sheet.getCell(i, j);
            if (cell.formula()) {
                let key = `${i},${j}`;
                if (result[key]) {
                    result[key].formula = cell.formula();
                } else {
                    result[key] = {
                        row: i,
                        col: j,
                        formula: cell.formula(),
                    };
                }
            }
        }
    }
    return result;
}


