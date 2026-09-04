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

spread.setSheetCount(5)

let sheet = spread.getActiveSheet()

sheet.setValue(0, 0, 'grapecity')

spread.bind(GC.Spread.Sheets.Events.ClipboardChanged, function (sender, args) {
    let ci = new ClipboardItem({
        "text/plain": new Blob([args.copyData.text], { type: "text/plain" }),
        "text/html": new Blob([args.copyData.html], { type: "text/html" })
    })
    setTimeout(() => {
        // 请注意，如果您部署到线上的ip或者域名没有https证书，浏览器会因为安全策略而禁用clipboard，导致写入失败
        navigator.clipboard.write([ci])
    }, 0);
});

document.getElementById("copyBtn").addEventListener("click", function () {
    var activeSheet = spread.getActiveSheet();
    activeSheet.clearSelection()
    activeSheet.addSelection(0, 0, activeSheet.getRowCount(), activeSheet.getColumnCount())
    spread.commandManager().execute({
        cmd: "copy",
        sheetName: activeSheet.name(),
        ignoreClipboard: true
    })
})
