import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-io"

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));

fetch("./template.sjs").then(res => {
    return res.blob()
}).then(template => {
    spread.open(template, function () {
        // handleHyperLink()
    })
})


function handleHyperLink() {
    spread.sheets.forEach(_sheet => {
        let usedRange = _sheet.getUsedRange(GC.Spread.Sheets.UsedRangeType.all)
        // 遍历每个sheet的usedRange
        let totalRow = usedRange.rowCount == -1 ? _sheet.getRowCount() : usedRange.row + usedRange.rowCount
        let totalCol = usedRange.colCount == -1 ? _sheet.getColumnCount() : usedRange.col + usedRange.colCount
        for (let row = usedRange.row; row < totalRow; row++) {
            for (let col = usedRange.col; col < totalCol; col++) {
                let hyperLink = _sheet.getHyperlink(row, col)
                if (hyperLink) {
                    // 获取到hyperlink之后，设置它的command
                    // context是当前的sheet，row和col分别是被点击的单元格的坐标
                    hyperLink.command = function (context, row, col) {
                        let link = context.getHyperlink(row, col)
                        window.open(link.url, "_blank")
                        console.log(context)
                        // do something
                    }
                    // 将hyperlink写回去
                    _sheet.setHyperlink(row, col, hyperLink)
                }
            }
        }
    })
}