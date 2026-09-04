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
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"





let designerConfig = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig));
// 重写工具栏筛选命令
let newFilterDataCommand = GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.SetFilterData);
if (newFilterDataCommand) {
    let oldExecute = newFilterDataCommand.execute;
    newFilterDataCommand.execute = function (context, propertyName, args) {
        // 通过修改selection扩展筛选区域为选中单元格以下所有row
        let activeSheet = context.getWorkbook().getActiveSheet();
        let selection = activeSheet.getSelections()[0];
        activeSheet.setSelection(selection.row, selection.col, activeSheet.getRowCount() - selection.row, 1);
        oldExecute.call(this, context, propertyName, args);
        activeSheet.setSelection(selection.row, selection.col, selection.rowCount, selection.colCount);
    }
}
// 替换右键菜单筛选命令
let newFilterCommand = GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.Filter);
newFilterCommand.commandName = "customFilter";
// 更新command
designerConfig.commandMap = {};
designerConfig.commandMap[GC.Spread.Sheets.Designer.CommandNames.SetFilterData] = newFilterDataCommand;
designerConfig.commandMap[GC.Spread.Sheets.Designer.CommandNames.Filter] = newFilterCommand;

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", designerConfig)
let spread = designer.getWorkbook()

let commandManager = spread.commandManager();
let customFilter = {
    canUndo: true,
    execute: function (spread, options, isUndo) {
        let Commands = GC.Spread.Sheets.Commands;
        if (isUndo) {
            Commands.undoTransaction(spread, options);
            return true;
        } else {
            Commands.startTransaction(spread, options);
            let activeSheet = spread.getActiveSheet();
            let selection = activeSheet.getSelections()[0];
            // 选中单元格以下所有row为筛选区域
            let range = new GC.Spread.Sheets.Range(selection.row, selection.col, activeSheet.getRowCount() - selection.row, 1);
            let rowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(range);
            activeSheet.rowFilter(rowFilter);
            Commands.endTransaction(spread, options);
            return true;
        }
    }
}
//注册自定义筛选命令
commandManager.register("customFilter", customFilter);

let sheet = spread.getActiveSheet()
sheet.setValue(1, 1, 1)
sheet.setValue(2, 1, 2)
sheet.setValue(4, 1, 3)
sheet.setValue(5, 1, 4)
sheet.setValue(7, 1, 5)
sheet.setValue(8, 1, 6)



