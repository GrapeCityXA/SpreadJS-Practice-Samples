import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-excelio"
import "@grapecity-software/spread-sheets-charts"
import "@grapecity-software/spread-sheets-print"
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

sheet.setArray(1, 1, [[1,2,3],[4,5,6],[7,8,9]])

sheet.shapes.addCameraShape("camera shape 1", 'Sheet1!B2:D4', 300, 50, 150, 60)

function base64ToBlob(code) {
    let parts = code.split(";base64,");
    let contentType = parts[0].split(":")[1];
    let raw = window.atob(parts[1]);
    let rawLength = raw.length;
    let uint8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; i++) {
        uint8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uint8Array], { type: contentType });
}

function downloadImg(imgUrl) {
    let aLink = document.createElement("a"); // 创建一个a标签
    let blob = base64ToBlob(imgUrl);
    let event = document.createEvent("HTMLEvents");
    event.initEvent("click", true, true);
    let date = new Date()
    aLink.download = date.getTime() + "." + blob.type.split("/")[1]; // 使用时间戳给文件命名
    aLink.href = URL.createObjectURL(blob);
    aLink.click();
}

document.getElementById("btn").addEventListener("click", function() {
    let imgUrl = sheet.cameraShapes[0].cameraShapeBuffer.toDataURL('image/png')
    downloadImg(imgUrl)
    // 以下代码请在新版本使用，老版本请使用上方代码
    // let shape = sheet.shapes.get("camera shape 1")
    // let imgUrl = shape.toImageSrc()
    // downloadImg(imgUrl)
})