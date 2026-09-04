import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-excelio"
import "@grapecity-software/spread-sheets-resources-zh"
import "@grapecity-software/spread-sheets-charts"
import "@grapecity-software/spread-sheets-print"
import "@grapecity-software/spread-sheets-pdf"
import "@grapecity-software/spread-sheets-barcode"
import "@grapecity-software/spread-sheets-languagepackages"
import "@grapecity-software/spread-sheets-shapes"
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"

GC.Spread.Common.CultureManager.culture("zh-cn")

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
let spread = designer.getWorkbook()

fetch("src/shape.sjs").then(res => {
    return res.blob()
}).then(blob => {
    spread.open(blob)
})

document.getElementById('designer-container').addEventListener('dblclick', function (e) {
    let canvas = document.querySelector('canvas[gcuielement="gcWorksheetCanvas"]')
    let xx = e.pageX - this.offsetLeft
    let yy = e.pageY - this.offsetTop - canvas.getBoundingClientRect().top
    let result = spread.hitTest(xx, yy)
    var { row, col } = getHitAreaName(result);
    let shapes = spread.getActiveSheet().shapes.all()
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i] instanceof GC.Spread.Sheets.Shapes.PictureShape) {
            let pic = shapes[i]
            let startRow = pic.startRow()
            let endRow = pic.endRow()
            let startColumn = pic.startColumn()
            let endColumn = pic.endColumn()
            if (row >= startRow && row <= endRow && col >= startColumn && col <= endColumn) {
                let command = GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.FormatPane);
                command.execute(designer)
            }

        }
    }
});

function getHitAreaName(result) {

    if (!result) return;
    var str = '';
    if (result.worksheetHitInfo) {
        let type = result.worksheetHitInfo.hitTestType
        switch (type) {
            case 0:
                str = 'corner';
            case 1:
                str = 'colHeader';
            case 2:
                str = 'rowHeader';
            case 3:
                return { row: result.worksheetHitInfo.row, col: result.worksheetHitInfo.col }
        }
    }
}
