import * as GC from "@grapecity-software/spread-sheets";
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

sheet.setValue(0,0,'grapecity')

document.getElementById('changeDisplay').onclick = function(){
    document.getElementsByClassName('gc-ribbon-bar')[0].style.display = 
    document.getElementsByClassName('gc-ribbon-bar')[0].style.display=='none' ? 'block' : 'none'
    // 该变之后要重新refresh
    designer.refresh()
}





