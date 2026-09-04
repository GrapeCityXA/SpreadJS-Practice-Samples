import * as GC from "@grapecity-software/spread-sheets";
GC.Spread.Common.CultureManager.culture('zh-cn');
var spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'))
var sheet = spread.sheets[0]
sheet.setValue(0,2,{richText:[{style:{font:'bold 12px Arial'},text:'SpreadJS'}]}, GC.Spread.Sheets.SheetArea.viewport);
    sheet.setValue(1,2,{richText:[{style:{font:'bold 12px Arial'},text:'javascript'}]}, GC.Spread.Sheets.SheetArea.viewport);
    sheet.setValue(2,2,{richText:[{style:{font:'bold 12px Arial'},text:'css'}]}, GC.Spread.Sheets.SheetArea.viewport);
    sheet.setValue(3,2,'hello')

sheet.bind(GC.Spread.Sheets.Events.CellDoubleClick, function(sender, args) {
    var col = args.col;
    var row = args.row;
    var rich = sheet.getValue(row,col,GC.Spread.Sheets.SheetArea.viewport, GC.Spread.Sheets.ValueType.richText);
    if (rich.richText) {
        if (rich.richText.length > 0) {
            alert('富文本')
        }
        return
    }else{
        alert('非富文本')
    }
})