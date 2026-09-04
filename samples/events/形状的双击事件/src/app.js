import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-shapes";


let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let sheet = spread.getActiveSheet()

sheet.shapes.addPictureShape("Picture 1", "1.png", 200, 200, 100, 100);
sheet.shapes.addPictureShape("Picture 2", "1.png", 1000, 300, 100, 100);
sheet.shapes.addPictureShape("Picture 3", "1.png", 500, 500, 100, 100);
sheet.shapes.add('autoShape', GC.Spread.Sheets.Shapes.AutoShapeType.heart, 100, 250, 100, 150);
sheet.frozenRowCount(4);
sheet.frozenColumnCount(3);
sheet.frozenTrailingRowCount(3);
sheet.frozenTrailingColumnCount(3);

sheet.setRowVisible(0, false)
sheet.setColumnVisible(0, false)

document.getElementById('ss').addEventListener('dblclick', function (e) {
    let _x = e.pageX - this.offsetLeft
    let _y = e.pageY - this.offsetTop
    alert("e.pageX", e.pageX, ",this.offsetTop", this.offsetTop)
    let result = spread.hitTest(_x, _y)
    var { row, col } = getHitAreaName(result);

    for (let i = 0; i < sheet.shapes.all().length; i++) {
        if (sheet.shapes.all()[i] instanceof GC.Spread.Sheets.Shapes.PictureShape) {
            let pic = sheet.shapes.all()[i]
            let startRow = pic.startRow()
            let endRow = pic.endRow()
            let startColumn = pic.startColumn()
            let endColumn = pic.endColumn()
            if (row >= startRow && row <= endRow && col >= startColumn && col <= endColumn) {
                console.log("当前图片双击", pic.name())
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