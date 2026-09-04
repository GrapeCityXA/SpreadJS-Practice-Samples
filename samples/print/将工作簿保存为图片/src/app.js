import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-print"
import "@grapecity-software/spread-sheets-pdf"


let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let sheet = spread.getActiveSheet()
sheet.setValue(0, 0, "测试文本")
sheet.setValue(1, 1, "测试文本")
sheet.setValue(2, 2, "测试文本")
sheet.setValue(3, 3, "测试文本")
sheet.setValue(4, 4, "测试文本")

let isPrinting = false
document.getElementById("save").addEventListener("click", function () {
    if (isPrinting) {
        return;
    }
    spread.bind(GC.Spread.Sheets.Events.BeforePrint, function (s, e) {
        var iframe = e.iframe;
        var images = iframe.contentWindow.document.getElementsByTagName("img");
        for (var i = 0; i < images.length; i++) {
            var img = images[i];
            let width = img.style.width.split("px")[0]
            let height = img.style.height.split("px")[0]
            if(parseFloat(width) / parseFloat(height) > 10) {
                continue
            }
            var canvas = document.createElement("canvas");
            canvas.height = img.naturalHeight;
            canvas.width = img.naturalWidth;
            var ctx = canvas.getContext('2d');
            ctx.fillStyle = "#FFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0) //, img.width, img.height);
            canvas.toBlob(function (blob) {
                saveAs(blob, "print.jpeg");
            }, "image/jpeg", 1);
        }
        e.cancel = true;
        setTimeout(function () {
            isPrinting = false;
            spread.unbind(GC.Spread.Sheets.Events.BeforePrint)
        }, 10)
    });
    isPrinting = true;
    let sheet = spread.getActiveSheet()
    let printInfo = sheet.printInfo()
    // 质量大于4才会生成图片
    printInfo.qualityFactor(6)
    //打印时隐藏列头          
    printInfo.showColumnHeader(GC.Spread.Sheets.Print.PrintVisibilityType.hide)
    // 打印时隐藏行头         
    printInfo.showRowHeader(GC.Spread.Sheets.Print.PrintVisibilityType.hide)
    //设置打印纸张，大一点导出的图片会在一张
    printInfo.paperSize(new GC.Spread.Sheets.Print.PaperSize(GC.Spread.Sheets.Print.PaperKind.a3))
    spread.print();
})