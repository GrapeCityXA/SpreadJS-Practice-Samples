import * as GC from "@grapecity-software/spread-sheets";


let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let sheet = spread.getSheet(0);
sheet.setValue(3, 3, '123')
sheet.setValue(5, 5, '123')
let containerPosition = {
    left: spread.getHost().getBoundingClientRect().left,
    top: spread.getHost().getBoundingClientRect().top
}
let contoller
function TipCellType() {
}

TipCellType.prototype = new GC.Spread.Sheets.CellTypes.Text();

TipCellType.prototype.getHitInfo = function (x, y, cellStyle, cellRect, context) {
    let cellRect = context.sheet.getCellRect(context.row, context.col);
    return {
        x: cellRect.x + containerPosition.left,
        y: cellRect.y + containerPosition.top,
        row: context.row,
        col: context.col,
        cellStyle: cellStyle,
        cellRect: cellRect,
        sheetArea: context.sheetArea,
        sheet: context.sheet,
        value: context.sheet.getValue(context.row, context.col)
    };
}
TipCellType.prototype.paint = function (ctx, value, x, y, w, h, style, context) {
    if (typeof (value) == "string" && /^[0-9]+\.?[0-9]*$/.test(value)) {
        style.decoration = {
            cornerFold: {
                size: 8,
                position: GC.Spread.Sheets.CornerPosition.leftTop,
                color: "green"
            }
        }
    }
    GC.Spread.Sheets.CellTypes.Base.prototype.paint.apply(this, [ctx, value, x, y, w, h, style, context]);
}
TipCellType.prototype.processMouseDown = function (hitinfo) {
    const { x, y, value, sheet, row, col } = hitinfo
    if (typeof (value) == "string" && /^[0-9]+\.?[0-9]*$/.test(value)) {
        if (!this._imgElement && !this._menuElement) {
            let imgElement = document.createElement("div")
            imgElement.id = 'imgContainer'
            imgElement.innerHTML = "<svg t=\"1700214000636\" className=\"icon\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" p-id=\"787\" width=\"15\" height=\"15\"><path d=\"M548.355 100.749l455 731C1021.598 861.058 1000.523 899 966 899H56c-34.523 0-55.598-37.942-37.355-67.251l455-731c17.22-27.665 57.49-27.665 74.71 0zM544 361.804C544 344.24 529.897 330 512.5 330S481 344.24 481 361.804v245.392C481 624.76 495.103 639 512.5 639s31.5-14.24 31.5-31.804V361.804zM512 671c-25.405 0-46 20.819-46 46.5s20.595 46.5 46 46.5 46-20.819 46-46.5-20.595-46.5-46-46.5z\" fill=\"#000000\" p-id=\"788\"></path></svg>\n"
            let menuElement = document.createElement("div")
            menuElement.id = 'menuList'
            menuElement.innerHTML = "<ul><li id='changeNum'>转换为数字</li></ul>"

            console.log('x=', x, 'y=', y)

            imgElement.style.top = y + "px"
            imgElement.style.left = (x - 20) + "px"
            imgElement.style.position = "absolute"
            imgElement.style.background = "#cccccc"
            imgElement.style.padding = " 2px 2px 0 2px"
            imgElement.style.cursor = "pointer"

            menuElement.style.top = (y + 20) + "px"
            menuElement.style.left = (x - 100) + "px"
            menuElement.style.position = "absolute"
            menuElement.style.border = "1px #C0C0C0 solid"
            menuElement.style.boxShadow = "1px 2px 5px rgba(0, 0, 0, 0.4)"
            menuElement.style.background = "white"
            menuElement.style.padding = "5px 15px"
            menuElement.style.fontSize = "12px"
            menuElement.style.cursor = "pointer"

            document.body.append(imgElement)
            document.body.append(menuElement)

            this._imgElement = document.getElementById('imgContainer');
            this._menuElement = document.getElementById('menuList');

            menuElement.style.display = "none"
            imgElement.addEventListener("click", function () {
                menuElement.style.display = "block"
            })
            if (AbortController) {
                contoller = new AbortController()
            }
            document.getElementById("changeNum").addEventListener("click", function () {
                console.log('changeNumClick')
                sheet.setValue(row, col, parseInt(hitinfo.value))
                imgElement.style.display = "none"
                menuElement.style.display = "none"
            }, contoller)


        } else {
            let imgElement = this._imgElement
            let menuElement = this._menuElement
            imgElement.style.top = y + "px"
            imgElement.style.left = (x - 20) + "px"
            menuElement.style.top = (y + 20) + "px"
            menuElement.style.left = (x - 100) + "px"
            imgElement.style.display = "block"
            menuElement.style.display = "none"
            if (AbortController) {
                contoller = new AbortController()
            }
            document.getElementById("changeNum").addEventListener("click", function () {
                console.log('changeNumClick')
                sheet.setValue(row, col, parseInt(hitinfo.value))
                imgElement.style.display = "none"
                menuElement.style.display = "none"
            }, contoller)
        }
    } else {
        if (this._imgElement) {
            this._imgElement.style.display = "none"
        }
        if (this._menuElement) {
            this._menuElement.style.display = "none"
        }
        GC.Spread.Sheets.CellTypes.Base.prototype.processMouseDown.apply(this, hitinfo);
    }
};
let defaultStyle = sheet.getDefaultStyle();
defaultStyle.cellType = new TipCellType();
sheet.setDefaultStyle(defaultStyle);