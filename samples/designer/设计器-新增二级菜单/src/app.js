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



var config = GC.Spread.Sheets.Designer.DefaultConfig;
config.commandMap = {
    Welcome: {
        title: "Welcome",
        text: "Welcome China",
        iconClass: "ribbon-button-welcome",
        bigButton: "true",
        commandName: "Welcome",
        execute: function (context, propertyName, fontItalicChecked) {
            var spread = context.getWorkbook(), sheet = spread.getActiveSheet();
            var selections = sheet.getSelections();
            var commandManager = spread.commandManager();
            commandManager.execute({
                cmd: 'changeBackColor',
                sheetName: sheet.name(),
                selections: selections,
                backColor: 'rgb(130, 188, 0)'
            });
        }
    }
}

let undoList = GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.UndoList)
let redoList = GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.RedoList)
undoList.commandMap["changeBackColor"] = "改变颜色"
redoList.commandMap["changeBackColor"] = "改变颜色"
config.commandMap[GC.Spread.Sheets.Designer.CommandNames.UndoList] = undoList;
config.commandMap[GC.Spread.Sheets.Designer.CommandNames.RedoList] = redoList;

config.ribbon[0].buttonGroups.unshift({
    "label": "NewDesigner",
    "thumbnailClass": "welcome",
    "commandGroup": {
        "children": [
            {
                "direction": "vertical",
                "commands": [
                    "Welcome"
                ]
            }
        ]
    }
});


let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", config)

let spread = designer.getWorkbook()


var command = {
    canUndo: true,
    execute: function(spread, options, isUndo) {
        var Commands = GC.Spread.Sheets.Commands;
        if (isUndo) {
            Commands.undoTransaction(spread, options);
            return true;
        } else {
            Commands.startTransaction(spread, options);
            spread.suspendPaint();
            var selections = options.selections;
            var value = options.backColor;
            selections.forEach(function(sel) {
                sheet.getRange(sel.row, sel.col, sel.rowCount, sel.colCount).backColor(value);
            });
            spread.resumePaint();
            Commands.endTransaction(spread, options);
            return true;
        }
    }
};
var commandManager = spread.commandManager();
commandManager.register('changeBackColor', command);



spread.setSheetCount(5)

let sheet = spread.getActiveSheet()

sheet.setValue(0,0,'grapecity')

