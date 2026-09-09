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
import "@grapecity-software/spread-sheets-designer-resources-en"
import "@grapecity-software/spread-sheets-designer"



let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()
let style = new GC.Spread.Sheets.Style();
style.locked = true;
style.cellButtons = [
    {
            useButtonStyle: false,
            imageType: GC.Spread.Sheets.ButtonImageType.custom,
            imageSrc: "https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/spread/source/SPJS.svg",
            imageSize: {
                    height: 15,
                    width: 30
            },
            enabled: false
    }
];
let defaultStyle = new GC.Spread.Sheets.Style();
defaultStyle.locked = false;
sheet.setDefaultStyle(defaultStyle, GC.Spread.Sheets.SheetArea.viewport);
sheet.setStyle(1,1,style);
sheet.options.isProtected = true;
