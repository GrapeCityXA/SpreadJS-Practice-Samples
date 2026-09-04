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



let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")

let spread = designer.getWorkbook()

let sheet = spread.getActiveSheet()

sheet.setValue(1, 1, 1)
sheet.setTag(1, 1, "tag1")

sheet.setValue(1, 2, 2)
sheet.setTag(1, 2, "tag2")

sheet.setValue(2, 1, 3)
sheet.setTag(2, 1, "tag3")

sheet.setValue(2, 2, 4)
sheet.setTag(2, 2, "tag4")

spread.bind(GC.Spread.Sheets.Events.ClipboardChanged, function (sender, args) {
    let tags = [];
    let selectedRange = args.sheet.getSelections()[0]
    for (let r = selectedRange.row; r < selectedRange.row + selectedRange.rowCount; r++) {
        tags[`${r - selectedRange.row}`] = []
        for (let c = selectedRange.col; c < selectedRange.col + selectedRange.colCount; c++) {
            tags[`${r - selectedRange.row}`][`${c - selectedRange.col}`] = { tag: args.sheet.getTag(r, c) }
        }
    }
    let html = args.copyData.html.split("</html>")[0] + `<tagcontent>${JSON.stringify(tags)}</tagcontent></html>`
    let ci = new ClipboardItem({
        "text/plain": new Blob([args.copyData.text], { type: "text/plain" }),
        "text/html": new Blob([html], { type: "text/html" })
    })
    setTimeout(() => {
        // 请注意，如果您部署到线上的ip或者域名没有https证书，浏览器会因为安全策略而禁用clipboard，导致写入失败
        navigator.clipboard.write([ci])
    }, 0);
});

spread.bind(GC.Spread.Sheets.Events.ClipboardPasting, function (sender, args) {

    if (args.pasteData.html.indexOf("<tagcontent") == -1) {
        return
    }
    let dom = document.createElement("div")
    dom.innerHTML = args.pasteData.html
    let tags = dom.querySelector("tagcontent").innerText
    if (!tags) {
        return
    }
    tags = JSON.parse(tags)
    setTimeout(() => {
        let selectedRange = args.sheet.getSelections()[0]
        for (let r = selectedRange.row; r < selectedRange.row + selectedRange.rowCount; r++) {
            for (let c = selectedRange.col; c < selectedRange.col + selectedRange.colCount; c++) {
                let tag = tags[`${r - selectedRange.row}`][`${c - selectedRange.col}`].tag
                if (tag) {
                    args.sheet.setTag(r, c, tag)
                }
            }
        }
    }, 0);

});


