import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
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


var designerConfig = JSON.parse(
    JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig)
);
// designerConfig.contextMenu.splice(9, 0, "transposePaste");
designerConfig.contextMenu.push("transposePaste");

designerConfig.commandMap = {
    "transposePaste": {
        text: "粘贴转置",
        commandName: "transposePaste",
        iconClass: "gc-spread-transposePaste",
        group: "contextMenuPaste",
        enableContext: "AllowTransposePaste",
        execute: function(context){
            let spread = context.getWorkbook(), sheet = spread.getActiveSheet();
            spread.commandManager().execute({
                cmd: "transposePasteCommand",
                sheetName: sheet.name(),
                activeRow: sheet.getActiveRowIndex(),
                activeCol: sheet.getActiveColumnIndex(),
                copiedRanges: clipboardHelper.copiedRanges,
                copiedSheet: clipboardHelper.copiedSheet 
            })
        }
    }
}
let undoList = GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.UndoList)
let redoList = GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.RedoList)
undoList.commandMap["transposePaste"] = "粘贴转置"
redoList.commandMap["transposePaste"] = "粘贴转置"
designerConfig.commandMap[GC.Spread.Sheets.Designer.CommandNames.UndoList] = undoList;
designerConfig.commandMap[GC.Spread.Sheets.Designer.CommandNames.RedoList] = redoList;


let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", designerConfig)

let spread = designer.getWorkbook()

spread.setSheetCount(5)

let sheet = spread.getActiveSheet()

sheet.setArray(0, 0, [['value1','value2','value3','value4'], ['value5','value6','value7','value8']]);


let clipboardHelper = {}
spread.bind(GC.Spread.Sheets.Events.ClipboardChanging, function (s, e) {
    console.log(s, e);
    clipboardHelper = {}
    if(e.action === GC.Spread.Sheets.ClipboardActionType.reset){
        updateClipboardState(designer, clipboardHelper);
        return;
    }
    clipboardHelper.action = e.action;
    clipboardHelper.copyData = e.copyData;
    clipboardHelper.copiedSheet = e.sheet;
    clipboardHelper.copiedRanges = e.ranges;
    clipboardHelper.copiedObjects = e.objects;
    updateClipboardState(designer, clipboardHelper);
});

// 根据是否复制内容决定选项是否可用
function updateClipboardState(designer, clipboardHelper){
    debugger;
    if(clipboardHelper.action === GC.Spread.Sheets.ClipboardActionType.reset){
        designer.setData("AllowTransposePaste", false);
    }
    if(!clipboardHelper.copiedSheet || !clipboardHelper.copiedRanges){
        designer.setData("AllowTransposePaste", false);
    }
    else{
        designer.setData("AllowTransposePaste", true);
    }
}

//检查是否可以粘贴
function checkCanTransposePaste(sheet, options){
    if(!options.copiedSheet || !options.copiedRanges){
        alert("无法粘贴")
        return false;
    }
    //还需要考虑区域是否够，是否保护

    return true;
}

let commandManager = spread.commandManager();
var transposePasteCommand = {
    canUndo: true,
    execute: function (spread, options, isUndo) {
        var Commands = GC.Spread.Sheets.Commands;
        if (isUndo) {
            Commands.undoTransaction(spread, options);
            return true;
        } else {
            let sheet = spread.getSheetFromName(options.sheetName);
            if(!checkCanTransposePaste(sheet, options)){
                return false;
            }
                        
            Commands.startTransaction(spread, options);
            debugger
            spread.suspendPaint();
            spread.suspendCalcService();
            let row = options.activeRow, col = options.activeCol;
            let copiedSheet = options.copiedSheet, copiedRange= options.copiedRanges[0];
            for(let i = 0; i < copiedRange.rowCount; i++){
                for(let j = 0; j < copiedRange.colCount; j++){
                    sheet.setValue(row + j, col + i, copiedSheet.getValue(copiedRange.row + i, copiedRange.col + j));
                }
            }

            spread.resumeCalcService();
            spread.resumePaint();
            Commands.endTransaction(spread, options);
            return true;
        }
    }
};
commandManager.register("transposePasteCommand", transposePasteCommand, null, false, false, false, false);

