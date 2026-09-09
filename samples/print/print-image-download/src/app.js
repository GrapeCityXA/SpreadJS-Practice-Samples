import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-print";
import "@grapecity-software/spread-sheets-pdf";
import "@grapecity-software/spread-sheets-charts";
/**
 * 导出图片格式的文件
 */
let spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'));
let sheet = spread.getActiveSheet();
//打印质量大于4时才会生成图片 设置打印信息
let printInfo = sheet.printInfo() || new GC.Spread.Sheets.Print.PrintInfo()
printInfo.qualityFactor(9)
printInfo.margin({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    header: 0,
    footer: 0
});
printInfo.showColumnHeader(GC.Spread.Sheets.Print.PrintVisibilityType.hide)
printInfo.showRowHeader(GC.Spread.Sheets.Print.PrintVisibilityType.hide)
printInfo.paperSize(new GC.Spread.Sheets.Print.PaperSize(GC.Spread.Sheets.Print.PaperKind.a3))

//给工作薄下的所有sheet设置打印信息
let count = spread.getSheetCount()
for (let i = 0; i < count; i++) {
    let currentSheet = spread.getSheet(i)
    currentSheet.printInfo(printInfo)
    currentSheet.setRowCount(10)
    currentSheet.setColumnCount(6)
}
sheet.setArray(0, 0, [
    [0, 1, 2, 3],
    [0, 1, 2, 3],
    [0, 1, 2, 3],
    [0, 1, 2, 3],
])
//将事件绑定到工作薄 在打印之前
spread.bind(GC.Spread.Sheets.Events.BeforePrint, (s, e) => {
    let iframe = e.iframe
    let imgs = iframe.contentWindow.document.getElementsByTagName("img")
    debugger;
    for (let i = 0; i < imgs.length; i++) {
        let img = imgs[i]
        let canvas = document.createElement("canvas")
        canvas.height = img.naturalHeight
        canvas.width = img.naturalWidth
        let ctx = canvas.getContext('2d')
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
        canvas.toBlob((blob) => {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download ="test" + i + ".png";
            link.click();
            link.remove();
        })
        e.cancel = true
    }
})

document.getElementById('exportImgs').onclick = () => {
    spread.print()
}