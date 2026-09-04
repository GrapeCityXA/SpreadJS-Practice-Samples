import * as GC from "@grapecity-software/spread-sheets";
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


document.getElementById("screenshot").onclick = async function () {
    document.getElementById("screenshot").disabled = true;
    setTimeout(async function(){
    try {
        spread.suspendCalcService(true);
        const makeImagePromise = async () => {
            return await getScreenshotBlbo()
        }
        // 为了支持Safari，write必须在事件中，当前的content不能因为异步改变
        await navigator.clipboard.write(
            [new ClipboardItem({ ["image/png"]: makeImagePromise() })]
        )
        spread.resumeCalcService(false)
        console.log('success')
        alert("截图成功，已放置在系统剪切板！")
        document.getElementById("screenshot").disabled = false;
    } catch (err) {
        console.log(`${err.name}:  ${err.message}`)
        spread.resumeCalcService(false)
        document.getElementById("screenshot").disabled = false;
    }
    }, 50);
}

function getScreenshotBlbo() {
    return new Promise(function (resolve, reject) {
        let sheet = spread.getActiveSheet()
        let oldPrintInfo = sheet.printInfo();
        let printInfo = new GC.Spread.Sheets.Print.PrintInfo()
        //打印质量大于4时才会生成图片
        printInfo.qualityFactor(5)
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
        printInfo.showBorder(false)
        let selection = sheet.getSelections()[0]
        printInfo.rowStart(selection.row);
        printInfo.rowEnd(selection.row + selection.rowCount - 1);
        printInfo.columnStart(selection.col);
        printInfo.columnEnd(selection.col + selection.colCount - 1);
        printInfo.fitPagesTall(1);
        printInfo.fitPagesWide(1);

        sheet.printInfo(printInfo)
        spread.bind(GC.Spread.Sheets.Events.BeforePrint + ".screenshot", (s, e) => {
            let iframe = e.iframe
            let imgs = iframe.contentWindow.document.getElementsByTagName("img")
            if (imgs && imgs.length) {
                let img = imgs[0]
                console.log(img)
                let canvas = document.createElement("canvas")
                canvas.height = img.naturalHeight
                canvas.width = img.naturalWidth
                let ctx = canvas.getContext('2d')
                ctx.fillStyle = '#fff'
                ctx.fillRect(0, 0, canvas.width, canvas.height)
                ctx.drawImage(img, 0, 0)
                canvas.toBlob((blob) => {
                    resolve(blob)
                    // navigator.clipboard.write([
                    //         new ClipboardItem({
                    //         [blob.type]: blob
                    //         })
                    //     ]);
                })
                e.cancel = true
                spread.unbind(GC.Spread.Sheets.Events.BeforePrint + ".screenshot")
                sheet.printInfo(oldPrintInfo)
            }
        })
        spread.print(spread.getActiveSheetIndex());
    });
}

