import * as GC from "@grapecity-software/spread-sheets";
GC.Spread.Common.CultureManager.culture('zh-cn');

var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));

var oldCopy = GC.Spread.Sheets.Commands.copy.execute;
GC.Spread.Sheets.Commands.copy.execute = function(event, options) {
    oldCopy.apply(this, arguments);
}

$("#btnCopy").click(function() {
    var activeSheet = spread.getActiveSheet();
    spread.commandManager().execute({
        cmd: "copy",
        sheetName: activeSheet.name(),
        ignoreClipboard: true
    })
})

$("#btnPaste").click(function() {
    var activeSheet = spread.getActiveSheet();
    spread.commandManager().execute({
        cmd: "paste",
        sheetName: activeSheet.name(),
        ignoreClipboard: false
    })
})