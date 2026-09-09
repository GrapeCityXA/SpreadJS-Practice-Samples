import * as GC from "@grapecity-software/spread-sheets";


let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let sheet = spread.getActiveSheet()
for(let i=0;i<30;i++){
    for(let j=0;j<5;j++){
        sheet.setValue(i,j,Math.ceil(Math.random()*100))
    }
}
initSpread(spread)

function initSpread(spread) {
    var command = {
        canUndo: true,
        execute: function(spread, options, isUndo) {
            document.getElementById("loadingModal").style.display = "block"
            spread.execute({
                cmd: "paste",
                sheetName: options.sheetName
            })
        }
    };
    var commandManager = spread.commandManager();
    //mac系统粘贴快捷键为command+c其余为ctrl+c
    isMac() ?
    commandManager.register('myPasteCommand', command, GC.Spread.Commands.Key.v, false, false, false, true)
    :
    commandManager.register('myPasteCommand', command, GC.Spread.Commands.Key.v, true, false, false, false)
    spread.bind(GC.Spread.Sheets.Events.ClipboardPasting, function(){
        console.log("ClipboardPasting")
    })		
    spread.bind(GC.Spread.Sheets.Events.ClipboardPasted, function(e,info){
        console.log("ClipboardPasted")
        commandManager.execute({
            cmd: "myPasteCommand",
            sheetName: info.sheet.name()
        })
        setTimeout(function() {
            document.getElementById("loadingModal").style.display = "none"
        }, 1000)
    })
}
	
function isMac(){
    // 判断客户是否为MAC平台
    var agent = navigator.userAgent.toLowerCase();
    var isMac = /macintosh|mac os x/i.test(agent);
    return isMac ? true : false
}