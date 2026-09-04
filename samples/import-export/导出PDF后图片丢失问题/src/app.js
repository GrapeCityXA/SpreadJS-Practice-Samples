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

let src = window.location.href.replace("index.html", "image.png")
sheet.shapes.addPictureShape("Picture 1", src, 100, 50, 100, 100);

document.getElementById("btn1").addEventListener("click", function() {
    spread.savePDF(blob => {
        saveAs(blob, "result.pdf")
    })
})

document.getElementById("btn2").addEventListener("click", function() {
    let xhr = new XMLHttpRequest();
    xhr.onload = function () {
        let reader = new FileReader();
        reader.onloadend = function () {
            console.log(reader.result);
            let shape = sheet.shapes.get("Picture 1")
            shape.src(reader.result)
            spread.savePDF(blob => {
                saveAs(blob, "result.pdf")
            })
        }
        reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', src);
    xhr.responseType = 'blob';
    xhr.send(); 
})