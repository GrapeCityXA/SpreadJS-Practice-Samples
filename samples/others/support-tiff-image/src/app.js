import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-shapes"


let spread = new GC.Spread.Sheets.Workbook("ss");
let sheet = spread.getActiveSheet();
document.getElementById('upload').addEventListener('click', function () {
    let blob = document.querySelector('#selectedFile').files[0];
    if (!blob) {
        return;
    }
    let fileReader = new FileReader();
    if (blob.type == 'image/tiff') {
        fileReader.onload = function (e) {
            let file = e.target.result
            let tiff = new Tiff({ buffer: file });
            sheet.shapes.addPictureShape('pic2', tiff.toDataURL(), 80, 80, 150, 150);
        };
        fileReader.readAsArrayBuffer(blob)
    } else {
        fileReader.onload = function (e) {
            let file = e.target.result
            sheet.shapes.addPictureShape('pic1', file, 80, 80, 150, 150);
        };
        fileReader.readAsDataURL(blob)
    }
})