import * as GC from "@grapecity-software/spread-sheets";


let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"), {sheetCount: 5});
spread.bind(GC.Spread.Sheets.Events.SheetChanging, function(s, e){
    console.log(s, e);
    if(e.newValue && e.propertyName === "isSelected"){
        if(spread.getSheet(spread.getActiveSheetIndex()).isSelected()){
            e.cancel = true;
        }
    }
});