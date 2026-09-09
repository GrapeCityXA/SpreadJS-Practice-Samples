import * as GC from "@grapecity-software/spread-sheets";

let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
spread.fromJSON(JSON.parse('{"version":"16.1.4","sheetCount":1,"customList":[],"sheets":{"Sheet1":{"name":"Sheet1","isSelected":true,"activeRow":6,"activeCol":12,"visible":1,"frozenTrailingRowStickToEdge":true,"frozenTrailingColumnStickToEdge":true,"theme":"Office","data":{"dataTable":{"2":{"1":{"value":"姓名："},"2":{"style":{"hAlign":1},"bindingPath":"name"}},"5":{"1":{"value":"头像："},"2":{"style":{"hAlign":1},"bindingPath":"avatar"}}},"defaultDataNode":{"style":{"themeFont":"Body"}}},"rowHeaderData":{"defaultDataNode":{"style":{"themeFont":"Body"}}},"colHeaderData":{"defaultDataNode":{"style":{"themeFont":"Body"}}},"columns":[null,null,{"size":57.19999998807907}],"leftCellIndex":0,"topCellIndex":0,"spans":[{"row":5,"col":2,"rowCount":5,"colCount":2},{"row":2,"col":2,"rowCount":1,"colCount":2}],"selections":{"0":{"row":6,"col":12,"rowCount":1,"colCount":1},"length":1},"rowOutlines":{"items":[]},"columnOutlines":{"items":[]},"cellStates":{},"states":{},"outlineColumnOptions":{},"autoMergeRangeInfos":[],"shapeCollectionOption":{"snapMode":0},"printInfo":{"paperSize":{"width":850,"height":1100,"kind":1}},"index":0,"order":0}},"sheetTabCount":0,"namedPatterns":{}}'))
let sheet = spread.getActiveSheet()

document.getElementById("cancel").addEventListener("click", function () {
    document.getElementById("selectFileModal").style.display = "none"
})

document.getElementById("print").addEventListener("click", function() {
    console.log(spread.getActiveSheet().getDataSource().getSource())
    alert("打印成功，请在按下F12 在控制台查看")
})

// 5, 2
sheet.bind(GC.Spread.Sheets.Events.CellClick, function (e, info) {
    if (info.row != 5 || info.col != 2) {
        return
    }
    document.getElementById("selectFileModal").style.display = "block"
})


document.getElementById("save").addEventListener("click", function () {
    let file = document.getElementById("file").files[0]
    if (!file) {
        alert("请先选择文件")
        return
    }
    let fileReader = new FileReader()
    fileReader.onload = function () {
        let base64 = this.result
        sheet.setValue(5, 2, base64)
        setTimeout(function () {
            sheet.repaint()
        }, 0)
        document.getElementById("selectFileModal").style.display = "none"
    }
    fileReader.readAsDataURL(file)
})

function imageCellType() { }
imageCellType.prototype = new GC.Spread.Sheets.CellTypes.Text()
let oldPaint = GC.Spread.Sheets.CellTypes.Text.prototype.paint
imageCellType.prototype.paint = function (context, value, x, y, w, h, style, options) {
    if (!context) {
        return;
    }
    let img = document.createElement("img")
    img.src = value
    context.drawImage(img, x, y, w, h)
}

sheet.setCellType(5, 2, new imageCellType())
sheet.setDataSource(new GC.Spread.Sheets.Bindings.CellBindingSource({
    name: "张三",
    avatar: ""
}))
