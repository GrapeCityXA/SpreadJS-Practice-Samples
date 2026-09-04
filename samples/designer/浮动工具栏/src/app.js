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

document.getElementsByClassName('top-panels')[0].onmouseover = function(){
   document.getElementsByClassName('gc-ribbon-bar')[0].style.visibility = 'visible'
}

document.getElementsByClassName('gc-ribbon-bar')[0].onmouseout = function(){
   document.getElementsByClassName('gc-ribbon-bar')[0].style.visibility = 'hidden'
}





