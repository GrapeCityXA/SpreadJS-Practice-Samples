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
spread.options.allowCopyPasteExcelStyle = false

window.addEventListener(
  "paste",
  function (e) {
    let clipboardData = e.clipboardData;
    let blob = void 0
    let items = clipboardData.items;
    let text = clipboardData.getData("text/plain");
    if (text) {
      return;
    }
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") === 0) {
        blob = items[i].getAsFile();
        if (blob) {
          break;
        }
      }
    }
    if (blob) {
      let reader = new FileReader();
      reader.onload = function (event) {
        let img = new Image();
        img.src = event.target.result;
        img.onload = function () {
          let sheet = spread.getActiveSheet();
          let imgName = "image" + new Date().valueOf();
          sheet.shapes.addPictureShape(
            imgName,
            img.src,
            0,
            0,
            img.width,
            img.height
          );
          let pic = sheet.shapes.get(imgName);
          pic.startRow(sheet.getActiveRowIndex());
          pic.startColumn(sheet.getActiveColumnIndex());
        };
      };
      reader.readAsDataURL(blob);
    }
  },
  true
);

