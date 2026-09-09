import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-excelio"
import "@grapecity-software/spread-sheets-charts"
import "@grapecity-software/spread-sheets-print"
import "@grapecity-software/spread-sheets-pdf"
import "@grapecity-software/spread-sheets-barcode"
import "@grapecity-software/spread-sheets-languagepackages"
import "@grapecity-software/spread-sheets-shapes"
import "@grapecity-software/spread-sheets-pivot-addon"
import "@grapecity-software/spread-sheets-designer-resources-en"
import "@grapecity-software/spread-sheets-designer"



let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))
config.commandMap = {
    insertRowBelow: {
        text: "向下插入行",
        commandName: "insertRowBelow",
        visibleContext: "ClickRowHeader",
        execute: async (context, propertyName, fontItalicChecked) => {
            let spread = context.getWorkbook();
            debugger
            spread.commandManager().execute({
                cmd: "insertRowBelowCmd"
            })
        }
    }
}
config.contextMenu.unshift("insertRowBelow");
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", config)
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()
sheet.setValue(0,0,1)
sheet.setValue(1,0,2)
sheet.setValue(2,0,"⬅️请在行头右键点击，查看新增的菜单")
sheet.setValue(3,0,3)
sheet.setValue(4,0,4)



spread.commandManager().register("insertRowBelowCmd", {
    canUndo: true,
    execute: function (context, options, isUndo) {
        let Commands = GC.Spread.Sheets.Commands;
        // 在此加cmd
        options.cmd = "insertRowBelowCmd";
        if (isUndo) {
            Commands.undoTransaction(context, options);
            return true;
        } else {
            let sheet = spread.getActiveSheet();
            // 注意：需要在options中定义sheetName，否则撤销行为可能无效。
            options.sheetName = sheet.name();
            Commands.startTransaction(context, options);
            let sels = sheet.getSelections();
            debugger
            if (sels && sels.length > 0) {
                for (let i = 0; i < sels.length; i++) {
                    let sel = sels[i];
                    let row = sel.row;
                    let rowCount = sel.rowCount;
                    sheet.addRows(row + 1, rowCount);
                }
            }
            Commands.endTransaction(context, options);
            return true;
        }
    }
});


