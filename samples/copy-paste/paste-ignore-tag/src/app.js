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


let designer = new GC.Spread.Sheets.Designer.Designer("ss")
let spread = designer.getWorkbook()

let sheet = spread.getActiveSheet()

sheet.setValue(0,0,'grapecity')
sheet.setTag(0,0,'grapecity')

sheet.setValue(0,5,'pastearea')
sheet.setTag(0,5,'pastearea')
let pastTags = []
spread.bind(GC.Spread.Sheets.Events.ClipboardPasting,function(sender,args){
    pastTags=[]
    let {row,rowCount,col,colCount} = args.cellRange
    for(let i=row;i<row+rowCount;i++){
        for(let j=col;j<col+colCount;j++){
            pastTags.push({
                row: i,
                col:j,
                tagInfo: sheet.getTag(i,j)
            })
        }
    }
})

spread.bind(GC.Spread.Sheets.Events.ClipboardPasted,function(sender,args){
    spread.suspendPaint()
    for(let pastTag of pastTags){
        console.log(pastTag)
        sheet.setTag(pastTag.row,pastTag.col,pastTag.tagInfo)
    }
    spread.resumePaint()
    pastTags = []
})





