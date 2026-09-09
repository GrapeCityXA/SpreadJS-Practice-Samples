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
let sjsiframe




spread.bind(GC.Spread.Sheets.Events.BeforePrint,function(e,data){
    sjsiframe = data.iframe
    sjsiframe.style.width = '800px'
    sjsiframe.style.height = '600px'
    sjsiframe.style.position = 'fixed'
    sjsiframe.style.top = '50px'
    sjsiframe.style.left = '200px'
    sjsiframe.style.background = '#ffffff'
    data.cancel = true
})


document.getElementById('preview').onclick = function(){
    let sheet = spread.getActiveSheet()
    let printInfo = new GC.Spread.Sheets.Print.PrintInfo()
    printInfo.showColumnHeader(GC.Spread.Sheets.Print.PrintVisibilityType.hide)
    printInfo.showRowHeader(GC.Spread.Sheets.Print.PrintVisibilityType.hide)
    sheet.printInfo(printInfo)
    spread.print()
}

document.getElementById('cancel').onclick = function(){
    sjsiframe.style.width = 0
    sjsiframe.style.height = 0
}




